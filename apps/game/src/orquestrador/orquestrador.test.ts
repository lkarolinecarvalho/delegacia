import { conteudo } from "@delegacia/content";
import {
  analisarFato,
  analisarProcedimento,
  compararFicha,
  esperadoNoCampo,
} from "@delegacia/motor";
import { describe, expect, it } from "vitest";
import { concluirMissao, estadoInicial, responderAfirmativa } from "../state/jogo";
import { LIMITE_POR_CASO, selecionarAfirmativas, selecionarParaRevisao } from "./afirmativas";
import {
  fichaDasRespostas,
  montarFicha,
  previaDoErro,
  trilhaDaAnalise,
  type ValorDaFicha,
} from "./ficha";
import { casosDoArquivo, missaoDoPlantaoLivre } from "./plantaoLivre";

const casos = conteudo.missoes.flatMap((m) => (m.caso ? [{ missao: m, caso: m.caso }] : []));

function missao(id: string) {
  const encontrada = conteudo.missoes.find((m) => m.id === id);
  if (!encontrada?.caso) throw new Error(`Caso ${id} não encontrado`);
  return { missao: encontrada, caso: encontrada.caso };
}

describe("ficha de análise", () => {
  it.each(casos.map((c) => [c.missao.id, c] as const))(
    "%s: a resposta certa está entre as opções e a ficha certa confere",
    (_, { missao: m, caso }) => {
      const analise = analisarFato(caso.fato);
      const procedimento = caso.contexto ? analisarProcedimento(analise, caso.contexto) : null;
      const etapas = montarFicha(caso, analise, m.capitulo, procedimento);
      expect(etapas.map((e) => e.campo).sort()).toEqual([...caso.pede, ...caso.informa].sort());

      const respostas: Partial<Record<string, ValorDaFicha>> = {};
      for (const etapa of etapas) {
        const esperado = esperadoNoCampo(analise, etapa.campo, procedimento);
        const opcao = etapa.opcoes.find((o) => o.valor === esperado);
        expect(opcao, `${m.id}: ${etapa.campo}`).toBeDefined();
        if (etapa.modo === "informada") expect(etapa.informado).toBe(opcao);
        else if (opcao) respostas[etapa.campo] = opcao.valor;
      }
      expect(Object.keys(respostas).sort()).toEqual([...caso.pede].sort());
      expect(compararFicha(analise, fichaDasRespostas(respostas), procedimento).correta).toBe(true);
      // No Código aberto, a ficha traz busca e todos os tipos, por título.
      const tipo = etapas.find((e) => e.campo === "tipo" && e.modo === "pergunta");
      if (tipo) expect(tipo.comBusca).toBe(m.capitulo >= 11);
    },
  );

  it("só oferece as conclusões já ensinadas (ADR-0003)", () => {
    const rotulos = (id: string) => {
      const { missao: m, caso } = missao(id);
      const etapas = montarFicha(caso, analisarFato(caso.fato), m.capitulo);
      return etapas.find((e) => e.campo === "conclusao")?.opcoes.map((o) => o.valor);
    };
    expect(rotulos("m104-divida-do-vizinho")).toEqual(["crime", "fato_atipico"]);
    expect(rotulos("m301-briga-na-feira")).toEqual(["crime", "fato_atipico", "fato_licito"]);
    expect(rotulos("m401-garoto-do-mercado")).toHaveLength(5);
  });

  it("no tipo sugerido, oferece os tipos da missão e a saída 'nenhum'", () => {
    const { missao: m, caso } = missao("m502-bilhete-premiado");
    const etapas = montarFicha(caso, analisarFato(caso.fato), m.capitulo);
    const tipo = etapas.find((e) => e.campo === "tipo");
    expect(tipo?.modo).toBe("pergunta");
    expect(tipo?.opcoes.map((o) => o.valor)).toEqual([
      "furto",
      "apropriacao_indebita",
      "estelionato",
      "nenhum",
    ]);
  });

  it("a ficha errada aponta a etapa e a regra", () => {
    const { caso } = missao("m204-bolsa-na-praca");
    const analise = analisarFato(caso.fato);
    const resultado = compararFicha(
      analise,
      fichaDasRespostas({ forma: "tentado", conclusao: "crime" }),
    );
    expect(resultado.correta).toBe(false);
    expect(resultado.campos.find((c) => c.campo === "forma")?.regras).toContain("R-ITER-05");
  });

  it("a trilha conta a análise na ordem da teoria do crime", () => {
    const { caso } = missao("m401-garoto-do-mercado");
    expect(trilhaDaAnalise(analisarFato(caso.fato)).map((l) => l.texto)).toEqual([
      "Típico: Furto (CP, art. 155)",
      "Consumado",
      "Sem excludente: fato ilícito",
      "Menor de 18 anos: inimputável",
      "Ato infracional",
    ]);
  });
});

describe("seleção de afirmativas", () => {
  const { missao: bicicleta } = missao("m201-bicicleta");

  it("respeita o limite por caso e só usa conceitos do caso", () => {
    const escolhidas = selecionarAfirmativas(bicicleta, conteudo.afirmativas, estadoInicial());
    expect(escolhidas).toHaveLength(LIMITE_POR_CASO);
    for (const a of escolhidas) {
      expect(bicicleta.conceitos).toContain(a.conceitoId);
      expect(a.nivelMin).toBeLessThanOrEqual(bicicleta.nivel);
    }
    expect(new Set(escolhidas.map((a) => a.conceitoId)).size).toBe(escolhidas.length);
  });

  it("conceito acertado some até vencer de novo; o caso pode ficar sem afirmativa", () => {
    let estado = estadoInicial();
    for (const conceito of bicicleta.conceitos) {
      const a = conteudo.afirmativas.find((x) => x.conceitoId === conceito);
      if (!a) throw new Error(conceito);
      estado = responderAfirmativa(estado, a, a.gabarito);
    }
    expect(selecionarAfirmativas(bicicleta, conteudo.afirmativas, estado)).toEqual([]);
    const amanha = { ...estado, dia: estado.dia + 1 };
    expect(selecionarAfirmativas(bicicleta, conteudo.afirmativas, amanha)).toHaveLength(2);
  });

  it("conceito errado volta na hora, com outra variante", () => {
    const primeira = conteudo.afirmativas.find((a) => a.conceitoId === "fato-tipico");
    if (!primeira) throw new Error("sem afirmativa");
    const errada = primeira.gabarito === "C" ? "E" : "C";
    const estado = responderAfirmativa(estadoInicial(), primeira, errada);
    const [proxima] = selecionarAfirmativas(bicicleta, conteudo.afirmativas, estado);
    expect(proxima?.conceitoId).toBe("fato-tipico");
    expect(proxima?.id).not.toBe(primeira.id);
  });

  it("a revisão só cobra conceitos já encontrados", () => {
    expect(selecionarParaRevisao(conteudo.afirmativas, estadoInicial(), 5)).toEqual([]);
    const a = conteudo.afirmativas.find((x) => x.conceitoId === "legalidade");
    if (!a) throw new Error("sem afirmativa");
    const estado = responderAfirmativa(estadoInicial(), a, a.gabarito === "C" ? "E" : "C");
    const revisao = selecionarParaRevisao(conteudo.afirmativas, estado, 5);
    expect(revisao.map((x) => x.conceitoId)).toEqual(["legalidade"]);
  });
});

describe("fase policial na ficha", () => {
  const caso = (id: string) => {
    const { missao: m, caso: c } = missao(id);
    const analise = analisarFato(c.fato);
    const procedimento = c.contexto ? analisarProcedimento(analise, c.contexto) : null;
    return { m, c, analise, procedimento };
  };

  it("a prévia do erro diz o que aconteceria com a decisão errada", () => {
    const { procedimento } = caso("m703-dois-dias-depois");
    expect(previaDoErro("flagrante", "proprio", procedimento)).toMatch(/prisão seria ilegal/);
    expect(previaDoErro("fianca", "juiz", procedimento)).toMatch(/auto de prisão em flagrante/);
    const penha = caso("m801-a-vizinha-ligou").procedimento;
    expect(previaDoErro("rito", "termo_circunstanciado", penha)).toMatch(
      /Lei 9\.099 não se aplica/,
    );
    expect(previaDoErro("fianca", "delegado", penha)).toMatch(/ato nulo/);
    // Só há prévia para a fase policial.
    expect(previaDoErro("forma", "tentado", penha)).toBeNull();
    expect(previaDoErro("flagrante", "proprio", null)).toBeNull();
  });

  it("a trilha registra a fase policial depois da conclusão", () => {
    const { analise, procedimento } = caso("r1101-a-fechada");
    const linhas = trilhaDaAnalise(analise, procedimento).map((l) => `${l.etapa}: ${l.texto}`);
    expect(linhas).toEqual([
      "Fato típico: Típico: Homicídio qualificado (CP, art. 121, § 2º)",
      "Forma: Consumado",
      "Ilicitude: Sem excludente: fato ilícito",
      "Culpabilidade: Agente culpável",
      "Conclusão: Crime",
      "Ação penal: Pública incondicionada",
      "Rito: Inquérito policial",
      "Flagrante: Próprio",
      "Fiança: Ninguém: é inafiançável — fica preso",
      "Prazo: Inquérito em 10 dias",
    ]);
  });
});

describe("plantão livre", () => {
  it("não sorteia nada antes do primeiro caso concluído", () => {
    expect(casosDoArquivo(estadoInicial(), conteudo)).toEqual([]);
    expect(missaoDoPlantaoLivre(estadoInicial(), conteudo, 0.5)).toBeNull();
  });

  it("devolve um caso do arquivo com a ficha inteira e o Código aberto", () => {
    let estado = estadoInicial();
    for (const m of conteudo.missoes) {
      const analise = m.caso ? analisarFato(m.caso.fato) : null;
      estado = concluirMissao(estado, m, analise);
    }
    const arquivo = casosDoArquivo(estado, conteudo);
    expect(arquivo).toHaveLength(conteudo.missoes.filter((m) => m.caso).length);
    for (let i = 0; i < arquivo.length; i += 1) {
      const livre = missaoDoPlantaoLivre(estado, conteudo, i / arquivo.length);
      const original = arquivo[i];
      if (!livre?.caso || !original?.caso) throw new Error("caso do plantão livre");
      expect(livre.id).toBe(`livre-${original.id}`);
      expect(livre.caso).toMatchObject({ informa: [], tipoInformado: false, opcoesDeTipo: [] });
      expect(livre.caso.pede).toContain("tipo");
      expect(livre.caso.pede).toContain("conclusao");
      // A ficha do plantão livre é sempre respondível: toda etapa pedida tem resposta.
      const analise = analisarFato(livre.caso.fato);
      const procedimento = livre.caso.contexto
        ? analisarProcedimento(analise, livre.caso.contexto)
        : null;
      for (const etapa of montarFicha(livre.caso, analise, livre.capitulo, procedimento)) {
        expect(etapa.modo).toBe("pergunta");
        const esperado = esperadoNoCampo(analise, etapa.campo, procedimento);
        expect(
          etapa.opcoes.some((o) => o.valor === esperado),
          `${livre.id}: ${etapa.campo}`,
        ).toBe(true);
      }
    }
  });
});
