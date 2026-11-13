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
    // Um tema é ensinado como aula ou dentro da conversa da missão, nunca duas vezes.
    const aulas = conteudo.missoes.flatMap((m) => [...m.aulas, ...m.revela]);
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
      comMissao("m202-golpe-de-faca", (m) => {
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

describe("missões em várias salas", () => {
  it("o jogo começa pela recepção, e a chegada termina no gabinete", () => {
    const [chegada] = conteudo.missoes;
    if (!chegada) throw new Error("sem missões");
    expect(chegada.antes[0]?.sala).toBe("recepcao");
    expect(chegada.sala).toBe("gabinete");
  });

  it("o primeiro caso chega pela recepção e é registrado no cartório", () => {
    const caso = conteudo.missoes.find((m) => m.id === "m104-divida-do-vizinho");
    expect(caso?.antes.map((c) => c.sala)).toEqual(["recepcao"]);
    expect(caso?.sala).toBe("cartorio");
  });

  it("em cada sala só fala quem trabalha nela ou quem está de passagem", () => {
    const problemas = problemasDe(
      comMissao("m104-divida-do-vizinho", (m) => {
        m.dialogo[0] = { npc: "helena-delegada", texto: "Eu não deveria estar no cartório." };
        return m;
      }),
    );
    expect(problemas.join("\n")).toContain('"helena-delegada" fala em "cartorio"');
  });

  it("todo caso tem pergunta e explicação próprias em cada etapa que o jogador responde", () => {
    for (const missao of conteudo.missoes) {
      if (!missao.caso) continue;
      for (const campo of missao.caso.pede) {
        expect(missao.caso.perguntas[campo], `${missao.id}: pergunta de ${campo}`).toBeTruthy();
        expect(missao.caso.comentarios[campo], `${missao.id}: explicação de ${campo}`).toBeTruthy();
      }
    }
  });

  it("as falas são curtas e o negrito está bem formado", () => {
    for (const missao of conteudo.missoes) {
      for (const fala of [...missao.antes.flatMap((c) => c.falas), ...missao.dialogo]) {
        expect(fala.texto.length, `${missao.id}: ${fala.texto}`).toBeLessThanOrEqual(240);
        // Marcadores de negrito sempre em pares.
        expect((fala.texto.split("**").length - 1) % 2, fala.texto).toBe(0);
      }
    }
  });

  it("recusa parada em sala que não existe", () => {
    const problemas = problemasDe(
      comMissao("m104-divida-do-vizinho", (m) => {
        m.antes[0] = { sala: "porao", falas: m.dialogo };
        return m;
      }),
    );
    expect(problemas.join("\n")).toContain('sala desconhecida "porao"');
  });
});
