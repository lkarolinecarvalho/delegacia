import { conteudo } from "@delegacia/content";
import { analisarFato, analisarProcedimento } from "@delegacia/motor";
import { describe, expect, it } from "vitest";
import { atualizarEstudo, conceitoVencido } from "./estudo";
import {
  aulasPendentes,
  capituloAtual,
  concluirMissao,
  concluirPlantaoLivre,
  type EstadoDoJogo,
  estadoInicial,
  inqueritos,
  marcarTemaVisto,
  PONTOS_DO_PLANTAO_LIVRE,
  PONTOS_POR_AFIRMATIVA,
  PONTOS_POR_RELATORIO,
  presosHoje,
  proximaMissao,
  relatarInquerito,
  responderAfirmativa,
} from "./jogo";

function afirmativa(id: string) {
  const encontrada = conteudo.afirmativas.find((a) => a.id === id);
  if (!encontrada) throw new Error(`Afirmativa ${id} não encontrada`);
  return encontrada;
}

/** Conclui a próxima missão com a análise do motor, como o fluxo do jogo faz. */
function jogarProxima(estado: EstadoDoJogo): EstadoDoJogo {
  const missao = proximaMissao(estado, conteudo);
  if (!missao) throw new Error("Não há próxima missão");
  const analise = missao.caso ? analisarFato(missao.caso.fato) : null;
  const procedimento =
    analise && missao.caso?.contexto ? analisarProcedimento(analise, missao.caso.contexto) : null;
  return concluirMissao(estado, missao, analise, 0, procedimento);
}

describe("campanha", () => {
  it("começa pela primeira conversa, no plantão 1", () => {
    const estado = estadoInicial();
    expect(proximaMissao(estado, conteudo)?.id).toBe("m101-bem-vindo");
    expect(estado.dia).toBe(1);
    expect(capituloAtual(estado, conteudo)).toBe(1);
  });

  it("pode ser jogada de ponta a ponta, na ordem do conteúdo", () => {
    let estado = estadoInicial();
    const ordem: string[] = [];
    for (let missao = proximaMissao(estado, conteudo); missao; ) {
      ordem.push(missao.id);
      estado = jogarProxima(estado);
      missao = proximaMissao(estado, conteudo);
    }
    expect(ordem).toEqual(conteudo.missoes.map((m) => m.id));
    expect(estado.concluidas).toHaveLength(conteudo.missoes.length);
    const casos = conteudo.missoes.filter((m) => m.caso);
    expect(estado.registro).toHaveLength(casos.length);
    // Cada caso encerra um plantão; conversa não.
    expect(estado.dia).toBe(1 + casos.length);
    expect(estado.pontos).toBe(conteudo.missoes.reduce((t, m) => t + m.recompensa.pontos, 0));
    expect(capituloAtual(estado, conteudo)).toBe(13);
  });

  it("o registro guarda a análise do motor, nunca a ficha do jogador (ADR-0002)", () => {
    let estado = estadoInicial();
    while (estado.registro.length === 0) estado = jogarProxima(estado);
    expect(estado.registro[0]).toMatchObject({
      missao: "m104-divida-do-vizinho",
      dia: 1,
      analise: { conclusao: "fato_atipico" },
    });
  });

  it("não conclui missão fora de hora nem caso sem análise", () => {
    const estado = estadoInicial();
    const [primeira, segunda] = conteudo.missoes;
    const caso = conteudo.missoes.find((m) => m.caso);
    if (!primeira || !segunda || !caso) throw new Error("conteúdo incompleto");
    expect(() => concluirMissao(estado, segunda, null)).toThrow(/não está disponível/);
    const depois = concluirMissao(estado, primeira, null);
    expect(() => concluirMissao(depois, primeira, null)).toThrow(/não está disponível/);
    let noCaso = estado;
    while (proximaMissao(noCaso, conteudo)?.id !== caso.id) noCaso = jogarProxima(noCaso);
    expect(() => concluirMissao(noCaso, caso, null)).toThrow(/análise do motor/);
  });

  it("as aulas pendentes somem depois de vistas", () => {
    const [primeira] = conteudo.missoes;
    if (!primeira) throw new Error("conteúdo incompleto");
    let estado = estadoInicial();
    expect(aulasPendentes(estado, primeira)).toEqual(primeira.aulas);
    for (const aula of primeira.aulas) estado = marcarTemaVisto(estado, aula);
    expect(aulasPendentes(estado, primeira)).toEqual([]);
    expect(marcarTemaVisto(estado, primeira.aulas[0] ?? "")).toBe(estado);
  });
});

describe("afirmativas", () => {
  const certa = afirmativa("af-legalidade-01");

  it("acerto dá pontos e sobe o conceito de caixa", () => {
    const estado = responderAfirmativa(estadoInicial(), certa, "C");
    expect(estado.pontos).toBe(PONTOS_POR_AFIRMATIVA);
    expect(estado.estudo.legalidade).toMatchObject({ caixa: 2, acertos: 1, proximaRevisao: 2 });
    expect(estado.afirmativasVistas[certa.id]).toBe(1);
    expect(estado.saldoBanca).toBe(0);
  });

  it("erro não dá pontos e devolve o conceito à caixa 1", () => {
    let estado = responderAfirmativa(estadoInicial(), certa, "C");
    estado = responderAfirmativa(estado, certa, "E");
    expect(estado.pontos).toBe(PONTOS_POR_AFIRMATIVA);
    expect(estado.estudo.legalidade).toMatchObject({ caixa: 1, erros: 1 });
  });

  it("modo banca pontua +1, −1 e 0", () => {
    let estado: EstadoDoJogo = { ...estadoInicial(), modoBanca: true };
    estado = responderAfirmativa(estado, certa, "C");
    expect(estado.saldoBanca).toBe(1);
    estado = responderAfirmativa(estado, certa, "E");
    estado = responderAfirmativa(estado, certa, "E");
    expect(estado.saldoBanca).toBe(-1);
    estado = responderAfirmativa(estado, certa, "branco");
    expect(estado.saldoBanca).toBe(-1);
    // Branco conta como "não sabe" no espaçamento.
    expect(estado.estudo.legalidade).toMatchObject({ caixa: 1, brancos: 1 });
  });
});

describe("repetição espaçada", () => {
  it("acertos espaçam o conceito: 0, 1, 3, 7 e 15 plantões", () => {
    let estudo = atualizarEstudo(undefined, "erro", 10, false);
    expect(estudo).toMatchObject({ caixa: 1, proximaRevisao: 10 });
    const esperados = [11, 13, 17, 25, 25];
    for (const proxima of esperados) {
      estudo = atualizarEstudo(estudo, "acerto", 10, false);
      expect(estudo.proximaRevisao).toBe(proxima);
    }
    expect(estudo.caixa).toBe(5);
  });

  it("conceito novo ou com a data alcançada está vencido", () => {
    expect(conceitoVencido(undefined, 1)).toBe(true);
    const estudo = atualizarEstudo(undefined, "acerto", 3, false);
    expect(conceitoVencido(estudo, 3)).toBe(false);
    expect(conceitoVencido(estudo, 4)).toBe(true);
  });
});

describe("quadro da delegacia", () => {
  /** Joga a campanha até concluir a missão indicada. */
  function jogarAte(id: string): EstadoDoJogo {
    let estado = estadoInicial();
    while (!estado.concluidas.includes(id)) estado = jogarProxima(estado);
    return estado;
  }

  it("o preso em flagrante sem fiança fica na carceragem até o plantão seguinte", () => {
    const estado = jogarAte("m702-a-perseguicao");
    expect(presosHoje(estado).map((p) => p.missao)).toEqual(["m702-a-perseguicao"]);
    // Quem pagou a fiança arbitrada pelo delegado não fica preso.
    expect(presosHoje(jogarAte("m701-pego-na-porta"))).toEqual([]);
    // Dois plantões depois, o preso já foi apresentado ao juiz.
    const depois = jogarProxima(jogarProxima(estado));
    expect(presosHoje(depois).map((p) => p.missao)).not.toContain("m702-a-perseguicao");
  });

  it("os inquéritos entram no quadro com o prazo de dez ou de trinta dias", () => {
    const estado = jogarAte("m702-a-perseguicao");
    const quadro = inqueritos(estado);
    const preso = quadro.find((i) => i.missao === "m702-a-perseguicao");
    const solto = quadro.find((i) => i.missao === "m701-pego-na-porta");
    expect(preso).toMatchObject({ indiciadoPreso: true, restam: 9, relatado: false });
    expect(solto).toMatchObject({ indiciadoPreso: false, restam: 28 });
    expect(preso && solto && preso.vence - preso.aberto).toBe(10);
    // Termo circunstanciado e casos sem crime não geram inquérito.
    expect(quadro.map((i) => i.missao)).not.toContain("m601-ameaca-do-ex-socio");
    // O mais urgente vem primeiro.
    expect(quadro[0]?.missao).toBe("m702-a-perseguicao");
  });

  it("relatar no prazo dá pontos; fora do prazo, não; e só se relata uma vez", () => {
    const estado = jogarAte("m702-a-perseguicao");
    const relatado = relatarInquerito(estado, "m702-a-perseguicao");
    expect(relatado.pontos).toBe(estado.pontos + PONTOS_POR_RELATORIO);
    expect(inqueritos(relatado).find((i) => i.missao === "m702-a-perseguicao")?.relatado).toBe(
      true,
    );
    expect(() => relatarInquerito(relatado, "m702-a-perseguicao")).toThrow(/Não há inquérito/);
    expect(() => relatarInquerito(estado, "m601-ameaca-do-ex-socio")).toThrow(/Não há inquérito/);
    const atrasado = { ...estado, dia: estado.dia + 30 };
    expect(inqueritos(atrasado)[0]?.restam).toBeLessThan(0);
    expect(relatarInquerito(atrasado, "m702-a-perseguicao").pontos).toBe(estado.pontos);
  });

  it("o plantão livre dá pontos e encerra o plantão, sem avançar a campanha", () => {
    const estado = jogarAte("m104-divida-do-vizinho");
    const depois = concluirPlantaoLivre(estado);
    expect(depois).toMatchObject({
      pontos: estado.pontos + PONTOS_DO_PLANTAO_LIVRE,
      dia: estado.dia + 1,
      plantoesLivres: 1,
    });
    expect(depois.concluidas).toEqual(estado.concluidas);
  });
});
