import fc from "fast-check";
import { expect, it } from "vitest";
import { analisarFato } from "./analise";
import { TIPOS_PENAIS } from "./catalogo";
import { compararFicha, esperadoNoCampo } from "./comparacao";
import { ErroDeFato } from "./erros";
import { existeRegra } from "./regras";
import { type Analise, CAMPOS_DA_FICHA, ELEMENTOS, type Fato } from "./tipos";

const justificante = fc.oneof(
  fc.constant(null),
  fc.record({
    tipo: fc.constant("legitima_defesa" as const),
    agressaoInjusta: fc.boolean(),
    atualOuIminente: fc.boolean(),
    direitoProprioOuAlheio: fc.boolean(),
    meiosNecessarios: fc.boolean(),
    usoModerado: fc.boolean(),
  }),
  fc.record({
    tipo: fc.constant("estado_de_necessidade" as const),
    perigoAtual: fc.boolean(),
    naoProvocadoPorVontade: fc.boolean(),
    inevitavelDeOutroModo: fc.boolean(),
    direitoProprioOuAlheio: fc.boolean(),
    sacrificioInexigivel: fc.boolean(),
    deverLegalDeEnfrentar: fc.boolean(),
  }),
);

const fatoQualquer: fc.Arbitrary<Fato> = fc.record({
  elementos: fc.uniqueArray(fc.constantFrom(...ELEMENTOS)),
  elementoSubjetivo: fc.constantFrom("dolo" as const, "culpa" as const, "nenhum" as const),
  execucao: fc.record({
    iniciada: fc.boolean(),
    interrompidaPor: fc.constantFrom("circunstancias_alheias" as const, "vontade_propria" as const),
  }),
  justificante,
  agente: fc.record({
    idade: fc.integer({ min: 0, max: 99 }),
    embriaguez: fc.constantFrom(
      "nenhuma" as const,
      "voluntaria" as const,
      "culposa" as const,
      "fortuita_completa" as const,
    ),
  }),
});

/** Analisa, deixando de lado os fatos que o motor recusa (casos não cobertos). */
function analisar(fato: Fato): Analise | null {
  try {
    return analisarFato(fato);
  } catch (erro) {
    if (erro instanceof ErroDeFato) return null;
    throw erro;
  }
}

function paraTodaAnalise(verificar: (analise: Analise, fato: Fato) => void): void {
  fc.assert(
    fc.property(fatoQualquer, (fato) => {
      const analise = analisar(fato);
      if (analise) verificar(analise, fato);
    }),
    { numRuns: 500 },
  );
}

it("só há crime quando o fato é típico, ilícito e o agente é culpável", () => {
  paraTodaAnalise((a) => {
    const completo = a.tipico && a.excludente === "nenhuma" && a.culpabilidade === "culpavel";
    expect(a.conclusao === "crime").toBe(completo);
  });
});

it("menor de 18 anos nunca responde por crime", () => {
  paraTodaAnalise((a, fato) => {
    if (fato.agente.idade < 18) expect(a.conclusao).not.toBe("crime");
  });
});

it("fato sem tipo penal correspondente é sempre atípico", () => {
  paraTodaAnalise((a, fato) => {
    const temTipo = TIPOS_PENAIS.some((t) => t.exige.every((e) => fato.elementos.includes(e)));
    if (!temTipo) expect(a.conclusao).toBe("fato_atipico");
  });
});

it("fato atípico não tem forma, excludente nem culpabilidade analisadas", () => {
  paraTodaAnalise((a) => {
    if (a.tipico) return;
    expect([a.forma, a.excludente, a.culpabilidade]).toEqual([null, null, null]);
    expect(a.conclusao).toBe("fato_atipico");
  });
});

it("toda regra citada na análise existe no índice", () => {
  paraTodaAnalise((a) => {
    for (const id of a.regras) expect(existeRegra(id), id).toBe(true);
  });
});

it("a ficha montada a partir da própria análise é sempre correta", () => {
  paraTodaAnalise((a) => {
    const ficha: Record<string, unknown> = {};
    for (const campo of CAMPOS_DA_FICHA) {
      const esperado = esperadoNoCampo(a, campo);
      if (esperado !== null) ficha[campo] = esperado;
    }
    expect(compararFicha(a, ficha).correta).toBe(true);
  });
});

it("a análise é determinística", () => {
  paraTodaAnalise((a, fato) => {
    expect(analisarFato(fato)).toEqual(a);
  });
});
