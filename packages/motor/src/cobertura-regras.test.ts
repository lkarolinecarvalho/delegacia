import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { TIPOS_PENAIS } from "./catalogo";
import { existeRegra, REGRAS } from "./regras";

const documento = readFileSync(new URL("../../../docs/regras-penais.md", import.meta.url), "utf8");
/** IDs definidos no documento: aparecem em negrito, como `**R-LEG-01**`. */
const idsDoDocumento = [...documento.matchAll(/\*\*(R-[A-Z]+-\d+)\*\*/g)].map((m) => m[1] ?? "");

it("o documento define regras, sem repetir ID", () => {
  expect(idsDoDocumento.length).toBeGreaterThan(30);
  expect(new Set(idsDoDocumento).size).toBe(idsDoDocumento.length);
});

it("toda regra de regras-penais.md está no índice do motor", () => {
  expect(idsDoDocumento.filter((id) => !existeRegra(id))).toEqual([]);
});

it("toda regra do índice está em regras-penais.md", () => {
  expect(REGRAS.map((r) => r.id).filter((id) => !idsDoDocumento.includes(id))).toEqual([]);
});

it("todo tipo penal aponta para regras que existem", () => {
  for (const tipo of TIPOS_PENAIS) {
    for (const id of [tipo.regra, ...tipo.regrasDaConsumacao]) {
      expect(existeRegra(id), `${tipo.id}: ${id}`).toBe(true);
    }
  }
});
