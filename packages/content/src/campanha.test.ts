import { type Analise, analisarFato } from "@delegacia/motor";
import { expect, it } from "vitest";
import { conteudo } from "./index";

type Esperado = Pick<
  Analise,
  "tipico" | "tipo" | "forma" | "excludente" | "culpabilidade" | "conclusao"
>;

const caso = (
  tipico: boolean,
  tipo: Analise["tipo"],
  forma: Analise["forma"],
  excludente: Analise["excludente"],
  culpabilidade: Analise["culpabilidade"],
  conclusao: Analise["conclusao"],
): Esperado => ({ tipico, tipo, forma, excludente, culpabilidade, conclusao });

/** A tabela de docs/casos-dourados.md. Mudou aqui, muda lá. */
const DOURADOS: Readonly<Record<string, Esperado>> = {
  "m104-divida-do-vizinho": caso(false, null, null, null, null, "fato_atipico"),
  "m201-bicicleta": caso(true, "furto", "consumado", "nenhuma", "culpavel", "crime"),
  "m202-mao-na-bolsa": caso(true, "furto", "tentado", "nenhuma", "culpavel", "crime"),
  "m203-vaso-da-vizinha": caso(false, "dano", null, null, null, "fato_atipico"),
  "m204-bolsa-na-praca": caso(true, "roubo", "consumado", "nenhuma", "culpavel", "crime"),
  "m301-briga-na-feira": caso(
    true,
    "lesao_corporal",
    "consumado",
    "legitima_defesa",
    null,
    "fato_licito",
  ),
  "m302-carro-no-sol": caso(
    true,
    "dano",
    "consumado",
    "estado_de_necessidade",
    null,
    "fato_licito",
  ),
  "m303-revanche": caso(true, "lesao_corporal", "consumado", "nenhuma", "culpavel", "crime"),
  "m401-garoto-do-mercado": caso(
    true,
    "furto",
    "consumado",
    "nenhuma",
    "menoridade",
    "ato_infracional",
  ),
  "m402-noite-do-bar": caso(true, "lesao_corporal", "consumado", "nenhuma", "culpavel", "crime"),
  "m501-celular-emprestado": caso(
    true,
    "apropriacao_indebita",
    "consumado",
    "nenhuma",
    "culpavel",
    "crime",
  ),
  "m502-bilhete-premiado": caso(true, "estelionato", "consumado", "nenhuma", "culpavel", "crime"),
  "m503-saida-do-mercado": caso(true, "roubo", "consumado", "nenhuma", "culpavel", "crime"),
};

// Parte I, capítulos 1 a 5. Os demais casos estão em fase-policial.test.ts.
const casos = conteudo.missoes.filter((m) => m.caso && m.capitulo <= 5);

it("todo caso da campanha está na tabela dourada, e só eles", () => {
  expect(casos.map((m) => m.id).sort()).toEqual(Object.keys(DOURADOS).sort());
});

it.each(Object.entries(DOURADOS))("caso dourado %s", (id, esperado) => {
  const missao = casos.find((m) => m.id === id);
  if (!missao?.caso) throw new Error(`Missão ${id} não encontrada`);
  expect(analisarFato(missao.caso.fato)).toMatchObject(esperado);
});

it("a tabela de docs/casos-dourados.md lista todos os casos", async () => {
  const { readFileSync } = await import("node:fs");
  const documento = readFileSync(
    new URL("../../../docs/casos-dourados.md", import.meta.url),
    "utf8",
  );
  for (const id of Object.keys(DOURADOS)) expect(documento).toContain(`| ${id} |`);
});
