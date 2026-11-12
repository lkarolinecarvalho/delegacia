import { describe, expect, it } from "vitest";
import { carregarConteudo, ErroDeConteudo } from "./carregar";
import { dadosBrutos } from "./dados";
import { conteudo } from "./index";
import type { Missao } from "./schemas";

/** Copia os dados e troca a missão indicada, para testar a validação. */
function comMissao(id: string, mudar: (missao: Missao) => unknown) {
  const missoes = (dadosBrutos.missoes as Missao[]).map((m) =>
    m.id === id ? mudar(structuredClone(m)) : m,
  );
  return { ...dadosBrutos, missoes };
}

function problemasDe(bruto: Parameters<typeof carregarConteudo>[0]): readonly string[] {
  try {
    carregarConteudo(bruto);
  } catch (erro) {
    if (erro instanceof ErroDeConteudo) return erro.problemas;
    throw erro;
  }
  return [];
}

describe("conteúdo do jogo", () => {
  it("todo o conteúdo valida", () => {
    expect(conteudo.missoes.length).toBe(44);
    expect(conteudo.afirmativas.length).toBeGreaterThanOrEqual(110);
    expect(conteudo.salas).toHaveLength(6);
  });

  it("toda missão tem todos os requisitos antes dela e a campanha é uma fila única", () => {
    conteudo.missoes.forEach((missao, i) => {
      const anterior = conteudo.missoes[i - 1];
      expect(missao.requisitos).toEqual(anterior ? [anterior.id] : []);
    });
  });

  it("toda aula é dada uma única vez na campanha", () => {
    const aulas = conteudo.missoes.flatMap((m) => m.aulas);
    expect(new Set(aulas).size).toBe(aulas.length);
    // E todo tema de teoria é usado por alguma missão.
    expect(conteudo.teoria.map((t) => t.id).filter((id) => !aulas.includes(id))).toEqual([]);
  });

  it("nenhum conceito é cobrado antes do nível da missão que o usa", () => {
    for (const missao of conteudo.missoes) {
      for (const id of missao.conceitos) {
        const conceito = conteudo.conceitos.find((c) => c.id === id);
        expect(conceito?.nivel, `${missao.id}: ${id}`).toBeLessThanOrEqual(missao.nivel);
        const disponiveis = conteudo.afirmativas.filter(
          (a) => a.conceitoId === id && a.nivelMin <= missao.nivel,
        );
        expect(disponiveis.length, `${missao.id}: ${id}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("nos capítulos 1 a 4 o jogador nunca precisa dizer qual é o crime (ADR-0003)", () => {
    for (const missao of conteudo.missoes) {
      if (missao.capitulo < 5) expect(missao.caso?.pede ?? []).not.toContain("tipo");
    }
  });
});

describe("validação", () => {
  it("recusa referência a sala que não existe", () => {
    const problemas = problemasDe(comMissao("m201-bicicleta", (m) => ({ ...m, sala: "porao" })));
    expect(problemas.join("\n")).toContain('sala desconhecida "porao"');
  });

  it("recusa campo fora do schema", () => {
    const problemas = problemasDe(comMissao("m201-bicicleta", (m) => ({ ...m, gabarito: "C" })));
    expect(problemas.length).toBeGreaterThan(0);
  });

  it("recusa fato que o motor não cobre", () => {
    const problemas = problemasDe(
      comMissao("m202-mao-na-bolsa", (m) => {
        if (m.caso) m.caso.fato.execucao.interrompidaPor = "vontade_propria";
        return m;
      }),
    );
    expect(problemas.join("\n")).toContain("o motor recusa o fato");
  });

  it("recusa pedir uma etapa que o fato não chega a analisar", () => {
    const problemas = problemasDe(
      comMissao("m104-divida-do-vizinho", (m) => {
        m.caso?.pede.push("forma");
        return m;
      }),
    );
    expect(problemas.join("\n")).toContain('a etapa "forma" não chega a ser analisada');
  });

  it("recusa sugestão de tipos sem o tipo correto", () => {
    const problemas = problemasDe(
      comMissao("m502-bilhete-premiado", (m) => {
        if (m.caso) m.caso.opcoesDeTipo = ["furto", "roubo"];
        return m;
      }),
    );
    expect(problemas.join("\n")).toContain("o tipo correto (estelionato) não está entre as opções");
  });

  it("recusa conceito com menos de três afirmativas", () => {
    const afirmativas = (dadosBrutos.afirmativas as { conceitoId: string }[]).filter(
      (a, i, lista) =>
        a.conceitoId !== "estelionato" ||
        lista.findIndex((b) => b.conceitoId === "estelionato") === i,
    );
    const problemas = problemasDe({ ...dadosBrutos, afirmativas });
    expect(problemas.join("\n")).toContain("conceito estelionato: 1 afirmativas");
  });
});
