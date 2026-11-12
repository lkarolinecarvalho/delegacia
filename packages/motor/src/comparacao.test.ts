import { describe, expect, it } from "vitest";
import { analisarFato } from "./analise";
import { DANO, FURTO_CONSUMADO, fato, LEGITIMA_DEFESA, LESAO } from "./apoio";
import { compararFicha } from "./comparacao";

describe("compararFicha", () => {
  const furto = analisarFato(fato(FURTO_CONSUMADO));

  it("aceita a ficha que bate com a análise", () => {
    const r = compararFicha(furto, {
      tipico: true,
      tipo: "furto",
      forma: "consumado",
      excludente: "nenhuma",
      culpabilidade: "culpavel",
      conclusao: "crime",
    });
    expect(r.correta).toBe(true);
    expect(r.campos).toHaveLength(6);
  });

  it("confere só as etapas preenchidas", () => {
    const r = compararFicha(furto, { forma: "consumado" });
    expect(r.campos.map((c) => c.campo)).toEqual(["forma"]);
    expect(r.correta).toBe(true);
  });

  it("aponta a etapa errada, com as regras que sustentam a resposta", () => {
    const r = compararFicha(furto, { forma: "tentado", conclusao: "crime" });
    expect(r.correta).toBe(false);
    const forma = r.campos.find((c) => c.campo === "forma");
    expect(forma?.correto).toBe(false);
    expect(forma?.regras).toEqual(expect.arrayContaining(["R-ITER-01", "R-ITER-05"]));
    expect(r.campos.find((c) => c.campo === "conclusao")?.correto).toBe(true);
  });

  it("no fato atípico, a resposta para o tipo penal é nenhum", () => {
    const culposo = analisarFato(fato(DANO, { elementoSubjetivo: "culpa" }));
    expect(compararFicha(culposo, { tipo: "nenhum", tipico: false }).correta).toBe(true);
    const errada = compararFicha(culposo, { tipo: "dano" });
    expect(errada.correta).toBe(false);
    expect(errada.campos[0]?.regras).toContain("R-CULPA-02");
  });

  it("etapa não analisada nunca é dada como certa", () => {
    const licito = analisarFato(fato(LESAO, { justificante: LEGITIMA_DEFESA }));
    expect(compararFicha(licito, { culpabilidade: "culpavel" }).correta).toBe(false);
  });

  it("excludente que o motor não reconhece no fato conta como erro", () => {
    const licito = analisarFato(fato(LESAO, { justificante: LEGITIMA_DEFESA }));
    expect(compararFicha(licito, { excludente: "exercicio_regular_de_direito" }).correta).toBe(
      false,
    );
    expect(compararFicha(licito, { excludente: "legitima_defesa" }).correta).toBe(true);
  });
});
