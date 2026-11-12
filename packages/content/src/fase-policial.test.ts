import { analisarFato, analisarProcedimento } from "@delegacia/motor";
import { expect, it } from "vitest";
import dourados from "./dourados-da-fase-policial.json";
import { conteudo } from "./index";

/**
 * Casos dourados dos capítulos 6 a 10 e das rondas: o crime, a forma e, quando o caso
 * tem contexto, a fase policial inteira. A tabela foi escrita à mão, a partir da lei, e
 * o motor precisa bater com ela (docs/casos-dourados.md).
 */
const tabela = Object.entries(dourados);

it("todo caso do capítulo 6 em diante está na tabela, e só eles", () => {
  const casos = conteudo.missoes.filter((m) => m.caso && m.capitulo >= 6).map((m) => m.id);
  expect(casos.sort()).toEqual(tabela.map(([id]) => id).sort());
});

it.each(tabela)("caso dourado %s", (id, esperado) => {
  const caso = conteudo.missoes.find((m) => m.id === id)?.caso;
  if (!caso) throw new Error(`Missão ${id} não encontrada`);
  const analise = analisarFato(caso.fato);
  expect(analise).toMatchObject({
    tipo: esperado.tipo,
    figura: esperado.figura,
    forma: esperado.forma,
    conclusao: esperado.conclusao,
  });
  // O contexto da missão existe se, e só se, a tabela traz a fase policial.
  expect(caso.contexto !== null).toBe(esperado.procedimento !== null);
  if (caso.contexto && esperado.procedimento) {
    expect(analisarProcedimento(analise, caso.contexto)).toMatchObject(esperado.procedimento);
  }
});

it("na Parte I o tipo penal é informado ou sugerido; nas rondas, é livre (ADR-0003)", () => {
  for (const missao of conteudo.missoes) {
    if (!missao.caso?.pede.includes("tipo")) continue;
    const livre = missao.caso.opcoesDeTipo.length === 0;
    expect(livre, missao.id).toBe(missao.capitulo >= 11);
  }
});

it("toda etapa da fase policial pedida ao jogador já foi ensinada", () => {
  const desde: Record<string, number> = {
    acao: 6,
    instauracao: 6,
    rito: 6,
    flagrante: 7,
    fianca: 7,
    prazo: 10,
    figura: 11,
  };
  for (const missao of conteudo.missoes) {
    for (const campo of missao.caso?.pede ?? []) {
      expect(missao.capitulo, `${missao.id}: ${campo}`).toBeGreaterThanOrEqual(desde[campo] ?? 1);
    }
  }
});
