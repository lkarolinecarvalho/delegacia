import { conteudo } from "@delegacia/content";
import { analisarFato } from "@delegacia/motor";
import { describe, expect, it } from "vitest";
import { atualizarEstudo, conceitoVencido } from "./estudo";
import {
  aulasPendentes,
  capituloAtual,
  concluirMissao,
  type EstadoDoJogo,
  estadoInicial,
  marcarTemaVisto,
  PONTOS_POR_AFIRMATIVA,
  proximaMissao,
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
  return concluirMissao(estado, missao, missao.caso ? analisarFato(missao.caso.fato) : null);
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
    expect(capituloAtual(estado, conteudo)).toBe(5);
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
