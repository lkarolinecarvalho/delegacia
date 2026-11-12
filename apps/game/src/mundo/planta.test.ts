import { conteudo } from "@delegacia/content";
import { describe, expect, it } from "vitest";
import { CENA, desenharCena, lugarDaSala, naTela } from "../arte/delegacia";
import {
  avancar,
  type NaGrade,
  NO_INICIAL,
  NOS,
  noDaSala,
  PAREDES,
  PREDIO,
  rota,
  SALAS,
  salaNoPonto,
  TRECHOS_NA_GRADE,
} from "./planta";

const salas = [
  ...new Set([...conteudo.salas.map((s) => s.id), ...conteudo.missoes.map((m) => m.sala)]),
];

/** O trecho de `a` a `b` cruza a parede? Os dois seguem a grade. */
function cruza(a: NaGrade, b: NaGrade, parede: (typeof PAREDES)[number]): boolean {
  // Na parede sobre gx = em, só um trecho ao longo de gx (gy constante) pode cruzá-la.
  const [a1, b1, a2, b2] =
    parede.eixo === "x" ? [a[0], b[0], a[1], b[1]] : [a[1], b[1], a[0], b[0]];
  if (a2 !== b2) return false;
  const [de, ate] = [Math.min(a1, b1), Math.max(a1, b1)];
  return de < parede.em && ate > parede.em && a2 > parede.de && a2 < parede.ate;
}

describe("planta da delegacia", () => {
  it("toda sala do conteúdo e de toda missão está na planta, dentro do prédio", () => {
    for (const id of salas) {
      const sala = SALAS[id];
      expect(sala, id).toBeDefined();
      if (!sala) continue;
      expect(sala.x0).toBeGreaterThanOrEqual(0);
      expect(sala.y0).toBeGreaterThanOrEqual(0);
      expect(sala.x1).toBeLessThanOrEqual(PREDIO.x);
      expect(sala.y1).toBeLessThanOrEqual(PREDIO.y);
      expect(NOS[sala.no], id).toBeDefined();
    }
  });

  it("as salas não se sobrepõem", () => {
    const lista = Object.entries(SALAS);
    for (const [a, sa] of lista) {
      for (const [b, sb] of lista) {
        if (a >= b) continue;
        const separadas = sa.x1 <= sb.x0 || sb.x1 <= sa.x0 || sa.y1 <= sb.y0 || sb.y1 <= sa.y0;
        expect(separadas, `${a} × ${b}`).toBe(true);
      }
    }
  });

  it("todo trecho de caminho segue a grade e nenhum atravessa parede", () => {
    for (const [a, b] of TRECHOS_NA_GRADE) {
      expect(a[0] === b[0] || a[1] === b[1], `${a} → ${b}`).toBe(true);
      for (const parede of PAREDES) {
        expect(cruza(a, b, parede), `${a} → ${b} cruza a parede em ${parede.em}`).toBe(false);
      }
    }
  });

  it("o avatar para dentro da sala (a carceragem é vista de fora da grade)", () => {
    for (const id of salas) {
      const no = NOS[noDaSala(id)];
      if (!no) throw new Error(id);
      expect(salaNoPonto(no)).toBe(id === "carceragem" ? null : id);
    }
  });
});

describe("rotas", () => {
  it("há caminho do pátio a toda sala e de toda sala a toda sala", () => {
    for (const de of [null, ...salas]) {
      for (const para of salas) {
        const caminho = rota(noDaSala(de), noDaSala(para));
        if (de === para) expect(caminho).toEqual([]);
        else expect(caminho.at(-1)).toEqual(NOS[noDaSala(para)]);
      }
    }
  });

  it("do pátio ao gabinete, entra pela porta e passa pelo saguão e pelo corredor", () => {
    expect(rota(NO_INICIAL, "gabinete")).toEqual([
      NOS.entrada,
      NOS.balcao,
      NOS.saguao,
      NOS["frente-do-cartorio"],
      NOS.corredor,
      NOS["frente-do-gabinete"],
      NOS.gabinete,
    ]);
  });

  it("recusa nó que não existe", () => {
    expect(() => rota(NO_INICIAL, "telhado")).toThrow(/fora da planta/);
    expect(() => noDaSala("porao")).toThrow(/fora da planta/);
  });

  it("avança pela rota sem passar do último ponto", () => {
    const caminho = rota(NO_INICIAL, "recepcao");
    const meio = avancar(NOS.patio ?? [0, 0], caminho, 3);
    expect(meio.posicao).toEqual([21, 17.5]);
    expect(meio.rota).toHaveLength(caminho.length);
    const fim = avancar(meio.posicao, meio.rota, 1000);
    expect(fim.posicao).toEqual(NOS.recepcao);
    expect(fim.rota).toEqual([]);
  });
});

describe("cena", () => {
  it("desenha sem valores inválidos, com os objetos em ordem de profundidade", () => {
    const cena = desenharCena();
    expect(cena.fundo).toContain("<polygon");
    expect(cena.fundo).not.toContain("NaN");
    const profundidades = cena.objetos.map((o) => o.p);
    expect(profundidades).toEqual([...profundidades].sort((a, b) => a - b));
    for (const objeto of cena.objetos) expect(objeto.svg).not.toContain("NaN");
  });

  it("o prédio, as placas e os caminhos cabem na tela", () => {
    const pontos = [
      ...salas.flatMap((id) => [lugarDaSala(id).placa, ...lugarDaSala(id).area]),
      ...Object.values(NOS).map((no) => naTela(no)),
    ];
    for (const p of pontos) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(CENA.largura);
      expect(p.y).toBeGreaterThan(140);
      expect(p.y).toBeLessThan(CENA.altura - 90);
    }
  });
});
