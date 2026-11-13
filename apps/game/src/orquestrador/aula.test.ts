import { conteudo } from "@delegacia/content";
import { describe, expect, it } from "vitest";
import { baloesDaAula, perguntasDeFixacao } from "./aula";

const tema = (id: string) => {
  const achado = conteudo.teoria.find((t) => t.id === id);
  if (!achado) throw new Error(id);
  return achado;
};

describe("aula em balões", () => {
  it("cada tema vira abertura, um balão por ponto, o desenho e o exemplo", () => {
    const direito = tema("o-direito-penal");
    const baloes = baloesDaAula([direito]);
    expect(baloes.map((b) => b.tipo)).toEqual([
      "abertura",
      ...direito.pontos.map(() => "ponto"),
      "esquema",
      "exemplo",
    ]);
    expect(baloes.find((b) => b.tipo === "esquema")?.esquema).toEqual(direito.esquema);
    expect(baloes[0]?.texto).toBe(direito.resumo);
    expect(baloes.at(-1)?.texto).toBe(direito.exemplo);
  });

  it("só o último balão de cada tema o dá como visto, e a fonte vem com o exemplo", () => {
    const baloes = baloesDaAula([tema("o-direito-penal"), tema("legalidade")]);
    expect(baloes.filter((b) => b.fechaOTema).map((b) => b.tema)).toEqual([
      "o-direito-penal",
      "legalidade",
    ]);
    for (const balao of baloes) {
      expect(balao.fechaOTema).toBe(balao.tipo === "exemplo");
      if (balao.tipo !== "exemplo") expect(balao.fonte).toBeNull();
    }
    expect(baloes.at(-1)?.fonte).toBe(tema("legalidade").fonte);
  });

  it("nenhum balão é texto corrido: no máximo 260 caracteres", () => {
    for (const balao of baloesDaAula(conteudo.teoria)) {
      expect(balao.texto.length, `${balao.tema}: ${balao.texto}`).toBeLessThanOrEqual(260);
    }
  });

  it("as perguntas saem da aula e vão para a fixação, na ordem dos temas", () => {
    const temas = [tema("o-direito-penal"), tema("legalidade")];
    expect(perguntasDeFixacao(temas)).toEqual(temas.flatMap((t) => t.perguntas));
    expect(perguntasDeFixacao([tema("furto")])).toEqual([]);
  });

  it("o exemplo de um tema não repete o caso da missão em que ele é lembrado", () => {
    for (const missao of conteudo.missoes) {
      if (!missao.caso) continue;
      for (const id of missao.aulas) {
        // Frases inteiras do fato não podem reaparecer no exemplo.
        for (const linha of missao.caso.linhas) {
          expect(tema(id).exemplo.includes(linha), `${missao.id} × ${id}`).toBe(false);
        }
      }
    }
  });
});
