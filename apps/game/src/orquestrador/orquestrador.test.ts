import { conteudo } from "@delegacia/content";
import { analisarFato, compararFicha, esperadoNoCampo } from "@delegacia/motor";
import { describe, expect, it } from "vitest";
import { estadoInicial, responderAfirmativa } from "../state/jogo";
import { LIMITE_POR_CASO, selecionarAfirmativas, selecionarParaRevisao } from "./afirmativas";
import { fichaDasRespostas, montarFicha, trilhaDaAnalise, type ValorDaFicha } from "./ficha";

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
      const etapas = montarFicha(caso, analise, m.capitulo);
      expect(etapas.map((e) => e.campo).sort()).toEqual([...caso.pede, ...caso.informa].sort());

      const respostas: Partial<Record<string, ValorDaFicha>> = {};
      for (const etapa of etapas) {
        const esperado = esperadoNoCampo(analise, etapa.campo);
        const opcao = etapa.opcoes.find((o) => o.valor === esperado);
        expect(opcao, `${m.id}: ${etapa.campo}`).toBeDefined();
        if (etapa.modo === "informada") expect(etapa.informado).toBe(opcao);
        else if (opcao) respostas[etapa.campo] = opcao.valor;
      }
      expect(Object.keys(respostas).sort()).toEqual([...caso.pede].sort());
      expect(compararFicha(analise, fichaDasRespostas(respostas)).correta).toBe(true);
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
