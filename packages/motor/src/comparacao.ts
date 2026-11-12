import type {
  Analise,
  CampoDaFicha,
  Etapa,
  Ficha,
  ResultadoDaFicha,
  ResultadoDoCampo,
} from "./tipos";
import { CAMPOS_DA_FICHA } from "./tipos";

const ETAPA_DO_CAMPO: Readonly<Record<CampoDaFicha, Etapa>> = {
  tipico: "tipicidade",
  tipo: "tipicidade",
  forma: "forma",
  excludente: "ilicitude",
  culpabilidade: "culpabilidade",
  conclusao: "conclusao",
};

/** O que a análise do motor diz para cada etapa da ficha. `null`: etapa não analisada. */
export function esperadoNoCampo(analise: Analise, campo: CampoDaFicha): unknown {
  switch (campo) {
    case "tipico":
      return analise.tipico;
    case "tipo":
      // Fato atípico: a resposta certa para "qual é o crime?" é "nenhum".
      return analise.tipico ? analise.tipo : "nenhum";
    case "forma":
      return analise.forma;
    case "excludente":
      return analise.excludente;
    case "culpabilidade":
      return analise.culpabilidade;
    case "conclusao":
      return analise.conclusao;
  }
}

function regrasDoCampo(analise: Analise, campo: CampoDaFicha): readonly string[] {
  const etapa = ETAPA_DO_CAMPO[campo];
  const doPasso = analise.passos.filter((p) => p.etapa === etapa).flatMap((p) => p.regras);
  // A conclusão se apoia na etapa que decidiu o caso; sem regra própria, cita todas.
  return doPasso.length > 0 ? doPasso : analise.regras;
}

/**
 * Compara a ficha do jogador com a análise do motor, etapa por etapa. Só as etapas
 * preenchidas na ficha são conferidas. A ficha nunca é gravada (ADR-0002).
 */
export function compararFicha(analise: Analise, ficha: Ficha): ResultadoDaFicha {
  const campos: ResultadoDoCampo[] = [];
  for (const campo of CAMPOS_DA_FICHA) {
    const informado = ficha[campo];
    if (informado === undefined) continue;
    campos.push({
      campo,
      correto: informado === esperadoNoCampo(analise, campo),
      regras: regrasDoCampo(analise, campo),
    });
  }
  return { correta: campos.every((c) => c.correto), campos };
}
