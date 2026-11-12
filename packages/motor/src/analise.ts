import { TIPOS_PENAIS, tipoPenal } from "./catalogo";
import { ErroDeFato } from "./erros";
import type {
  Analise,
  Conclusao,
  Culpabilidade,
  Excludente,
  Fato,
  Forma,
  Justificante,
  MotivoDaAtipicidade,
  Passo,
  TipoPenal,
} from "./tipos";

const MAIORIDADE_PENAL = 18;

/**
 * Tipo a que a conduta se ajusta: todos os elementos exigidos estão no fato (R-TIP-01).
 * Entre vários, vale o mais específico (R-TIP-02).
 */
function tipificar(fato: Fato): { tipo: TipoPenal | null; porEspecialidade: boolean } {
  const candidatos = TIPOS_PENAIS.filter((t) => t.exige.every((e) => fato.elementos.includes(e)));
  if (candidatos.length === 0) return { tipo: null, porEspecialidade: false };
  const maior = Math.max(...candidatos.map((t) => t.exige.length));
  const maisEspecificos = candidatos.filter((t) => t.exige.length === maior);
  const [tipo] = maisEspecificos;
  if (!tipo || maisEspecificos.length > 1) {
    throw new ErroDeFato(
      "TIPIFICACAO_AMBIGUA",
      `O fato se ajusta igualmente a: ${maisEspecificos.map((t) => t.id).join(", ")}. Concurso de crimes ainda não é coberto.`,
    );
  }
  return { tipo, porEspecialidade: candidatos.length > 1 };
}

/** Requisitos da justificante que não ficaram demonstrados (R-LD-01, R-EN-01, R-EN-02). */
function requisitosAusentes(j: Justificante): string[] {
  const requisitos: readonly (readonly [string, boolean])[] =
    j.tipo === "legitima_defesa"
      ? [
          ["agressaoInjusta", j.agressaoInjusta],
          ["atualOuIminente", j.atualOuIminente],
          ["direitoProprioOuAlheio", j.direitoProprioOuAlheio],
          ["meiosNecessarios", j.meiosNecessarios],
          ["usoModerado", j.usoModerado],
        ]
      : [
          ["perigoAtual", j.perigoAtual],
          ["naoProvocadoPorVontade", j.naoProvocadoPorVontade],
          ["inevitavelDeOutroModo", j.inevitavelDeOutroModo],
          ["direitoProprioOuAlheio", j.direitoProprioOuAlheio],
          ["sacrificioInexigivel", j.sacrificioInexigivel],
          ["semDeverLegalDeEnfrentar", !j.deverLegalDeEnfrentar],
        ];
  return requisitos.filter(([, presente]) => !presente).map(([nome]) => nome);
}

function regrasDaJustificanteAfastada(j: Justificante, ausentes: readonly string[]): string[] {
  if (j.tipo === "legitima_defesa") {
    // R-LD-02: agressão que já cessou. R-ILI-02: excesso nos meios ou na moderação.
    const regras = ["R-LD-01"];
    if (ausentes.includes("atualOuIminente")) regras.push("R-LD-02");
    if (ausentes.includes("meiosNecessarios") || ausentes.includes("usoModerado")) {
      regras.push("R-ILI-02");
    }
    return regras;
  }
  const regras = ["R-EN-01"];
  if (ausentes.includes("semDeverLegalDeEnfrentar")) regras.push("R-EN-02");
  return regras;
}

function montar(
  parcial: Omit<Analise, "regras" | "passos" | "requisitosAusentes"> & {
    readonly requisitosAusentes?: readonly string[];
  },
  passos: readonly Passo[],
): Analise {
  return {
    ...parcial,
    requisitosAusentes: parcial.requisitosAusentes ?? [],
    passos,
    regras: [...new Set(passos.flatMap((p) => p.regras))],
  };
}

function atipico(
  motivo: MotivoDaAtipicidade,
  tipo: TipoPenal | null,
  regras: readonly string[],
): Analise {
  const passos: Passo[] = [
    { etapa: "tipicidade", resultado: motivo, regras },
    { etapa: "conclusao", resultado: "fato_atipico", regras: ["R-LEG-01"] },
  ];
  return montar(
    {
      tipico: false,
      tipo: tipo?.id ?? null,
      motivoDaAtipicidade: motivo,
      forma: null,
      excludente: null,
      culpabilidade: null,
      conclusao: "fato_atipico",
    },
    passos,
  );
}

/**
 * Analisa o fato na ordem da teoria do crime (R-GER-03): fato típico, ilicitude e
 * culpabilidade. Determinística e sem efeitos: não grava nada.
 *
 * Lança `ErroDeFato` quando o caso não é coberto por docs/regras-penais.md.
 */
export function analisarFato(fato: Fato): Analise {
  if (!Number.isInteger(fato.agente.idade) || fato.agente.idade < 0) {
    throw new ErroDeFato("FATO_INVALIDO", "A idade do agente precisa ser um inteiro não negativo.");
  }

  // 1. Fato típico -----------------------------------------------------------------
  const { tipo, porEspecialidade } = tipificar(fato);
  // R-LEG-01: sem tipo penal correspondente, o fato é atípico.
  if (!tipo) return atipico("sem_tipo", null, ["R-LEG-01", "R-TIP-01"]);

  // R-CULPA-03: sem dolo e sem culpa não há conduta penalmente relevante.
  if (fato.elementoSubjetivo === "nenhum") {
    return atipico("sem_dolo_nem_culpa", tipo, ["R-CULPA-03"]);
  }
  const culposo = fato.elementoSubjetivo === "culpa";
  // R-CULPA-02: forma culposa só quando a lei prevê.
  if (culposo && !tipo.admiteCulpa) {
    return atipico("culpa_sem_previsao", tipo, ["R-CULPA-01", "R-CULPA-02", tipo.regra]);
  }

  // R-ITER-03: sem início de execução, só há cogitação ou atos preparatórios.
  if (!fato.execucao.iniciada) return atipico("atos_preparatorios", tipo, ["R-ITER-03"]);

  const regrasDaTipicidade = [
    "R-TIP-01",
    tipo.regra,
    ...(porEspecialidade ? ["R-TIP-02"] : []),
    culposo ? "R-CULPA-01" : "R-DOLO-01",
  ];

  // 2. Consumação ou tentativa ------------------------------------------------------
  const consumado = tipo.consumaCom.every((e) => fato.elementos.includes(e));
  let forma: Forma;
  let regrasDaForma: string[];
  if (consumado) {
    // R-ITER-01, e R-ITER-05 para furto e roubo.
    forma = "consumado";
    regrasDaForma = ["R-ITER-01", ...tipo.regrasDaConsumacao];
  } else {
    // R-ITER-04: crime culposo não admite tentativa.
    if (culposo) return atipico("culposo_sem_resultado", tipo, ["R-ITER-04"]);
    // R-ITER-06: desistência voluntária e arrependimento eficaz estão fora do escopo.
    if (fato.execucao.interrompidaPor !== "circunstancias_alheias") {
      throw new ErroDeFato(
        "CASO_NAO_COBERTO",
        "Execução iniciada e não consumada sem circunstância alheia à vontade do agente: desistência voluntária (CP, art. 15) ainda não é coberta.",
        "R-ITER-06",
      );
    }
    // R-ITER-02
    forma = "tentado";
    regrasDaForma = ["R-ITER-02"];
  }

  const passos: Passo[] = [
    { etapa: "tipicidade", resultado: tipo.id, regras: regrasDaTipicidade },
    { etapa: "forma", resultado: forma, regras: regrasDaForma },
  ];
  const base = { tipico: true, tipo: tipo.id, motivoDaAtipicidade: null, forma } as const;

  // 3. Ilicitude --------------------------------------------------------------------
  let excludente: Excludente = "nenhuma";
  let ausentes: string[] = [];
  if (fato.justificante) {
    ausentes = requisitosAusentes(fato.justificante);
    if (ausentes.length === 0) {
      // R-ILI-01 com R-LD-01 ou R-EN-01: o fato é típico, mas lícito.
      excludente = fato.justificante.tipo;
      const regraDaExcludente = excludente === "legitima_defesa" ? "R-LD-01" : "R-EN-01";
      passos.push(
        { etapa: "ilicitude", resultado: excludente, regras: ["R-ILI-01", regraDaExcludente] },
        { etapa: "conclusao", resultado: "fato_licito", regras: ["R-ILI-01"] },
      );
      return montar({ ...base, excludente, culpabilidade: null, conclusao: "fato_licito" }, passos);
    }
    passos.push({
      etapa: "ilicitude",
      resultado: "excludente_afastada",
      regras: regrasDaJustificanteAfastada(fato.justificante, ausentes),
    });
  } else {
    passos.push({ etapa: "ilicitude", resultado: "nenhuma", regras: ["R-ILI-01"] });
  }

  // 4. Culpabilidade ----------------------------------------------------------------
  let culpabilidade: Culpabilidade;
  let conclusao: Conclusao;
  if (fato.agente.idade < MAIORIDADE_PENAL) {
    // R-CULP-01 e R-CULP-02: menor de 18 anos responde por ato infracional.
    culpabilidade = "menoridade";
    conclusao = "ato_infracional";
    passos.push(
      { etapa: "culpabilidade", resultado: culpabilidade, regras: ["R-CULP-01"] },
      { etapa: "conclusao", resultado: conclusao, regras: ["R-CULP-02"] },
    );
  } else if (fato.agente.embriaguez === "fortuita_completa") {
    // R-CULP-04
    culpabilidade = "embriaguez_fortuita";
    conclusao = "isento_de_pena";
    passos.push(
      { etapa: "culpabilidade", resultado: culpabilidade, regras: ["R-CULP-04"] },
      { etapa: "conclusao", resultado: conclusao, regras: ["R-CULP-04"] },
    );
  } else {
    // R-CULP-03: embriaguez voluntária ou culposa não exclui a imputabilidade.
    culpabilidade = "culpavel";
    conclusao = "crime";
    const embriagado = fato.agente.embriaguez !== "nenhuma";
    passos.push(
      { etapa: "culpabilidade", resultado: culpabilidade, regras: embriagado ? ["R-CULP-03"] : [] },
      { etapa: "conclusao", resultado: conclusao, regras: ["R-CRIME-01"] },
    );
  }

  return montar(
    { ...base, excludente, requisitosAusentes: ausentes, culpabilidade, conclusao },
    passos,
  );
}

/** Atalho para a UI: o tipo penal da análise, com nome e artigo. */
export function tipoDaAnalise(analise: Analise): TipoPenal | null {
  return analise.tipo ? tipoPenal(analise.tipo) : null;
}
