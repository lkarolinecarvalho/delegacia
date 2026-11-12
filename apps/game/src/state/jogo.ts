import type { Afirmativa, Conteudo, Missao } from "@delegacia/content";
import type { Analise } from "@delegacia/motor";
import { atualizarEstudo, type Estudo, type Resultado } from "./estudo";

/** Pontos por afirmativa certa fora do modo banca (parâmetro de balanceamento). */
export const PONTOS_POR_AFIRMATIVA = 10;

/** O que fica gravado de um caso concluído: sempre a análise do motor (ADR-0002). */
export interface RegistroDoCaso {
  readonly missao: string;
  /** Plantão em que o caso foi concluído. */
  readonly dia: number;
  readonly analise: Analise;
  /** Quantas vezes o jogador conferiu a ficha com erro antes de acertar. */
  readonly tentativasErradas: number;
}

export interface EstadoDoJogo {
  /** Plantão atual; começa em 1. */
  readonly dia: number;
  readonly pontos: number;
  readonly concluidas: readonly string[];
  readonly registro: readonly RegistroDoCaso[];
  readonly estudo: Estudo;
  /** Quantas vezes cada afirmativa já apareceu. */
  readonly afirmativasVistas: Readonly<Record<string, number>>;
  readonly temasVistos: readonly string[];
  readonly modoBanca: boolean;
  /** Placar líquido do modo banca. */
  readonly saldoBanca: number;
}

export function estadoInicial(): EstadoDoJogo {
  return {
    dia: 1,
    pontos: 0,
    concluidas: [],
    registro: [],
    estudo: {},
    afirmativasVistas: {},
    temasVistos: [],
    modoBanca: false,
    saldoBanca: 0,
  };
}

export function missaoDisponivel(estado: EstadoDoJogo, missao: Missao): boolean {
  return (
    !estado.concluidas.includes(missao.id) &&
    missao.requisitos.every((id) => estado.concluidas.includes(id))
  );
}

/** A próxima missão da campanha, ou `null` quando tudo o que existe foi concluído. */
export function proximaMissao(estado: EstadoDoJogo, conteudo: Conteudo): Missao | null {
  return conteudo.missoes.find((missao) => missaoDisponivel(estado, missao)) ?? null;
}

/** Aulas da missão que o jogador ainda não viu. */
export function aulasPendentes(estado: EstadoDoJogo, missao: Missao): readonly string[] {
  return missao.aulas.filter((id) => !estado.temasVistos.includes(id));
}

export function marcarTemaVisto(estado: EstadoDoJogo, tema: string): EstadoDoJogo {
  if (estado.temasVistos.includes(tema)) return estado;
  return { ...estado, temasVistos: [...estado.temasVistos, tema] };
}

/**
 * Conclui a missão. Caso com fato grava a análise do motor e encerra o plantão;
 * conversa só dá os pontos.
 */
export function concluirMissao(
  estado: EstadoDoJogo,
  missao: Missao,
  analise: Analise | null,
  tentativasErradas = 0,
): EstadoDoJogo {
  if (!missaoDisponivel(estado, missao)) {
    throw new Error(`A missão ${missao.id} não está disponível.`);
  }
  if (Boolean(missao.caso) !== Boolean(analise)) {
    throw new Error(`A missão ${missao.id} precisa da análise do motor se, e só se, tem caso.`);
  }
  return {
    ...estado,
    pontos: estado.pontos + missao.recompensa.pontos,
    concluidas: [...estado.concluidas, missao.id],
    registro: analise
      ? [...estado.registro, { missao: missao.id, dia: estado.dia, analise, tentativasErradas }]
      : estado.registro,
    // Parâmetro provisório: cada caso concluído encerra o plantão (GDD, seção 10).
    dia: analise ? estado.dia + 1 : estado.dia,
  };
}

export function resultadoDaResposta(
  afirmativa: Afirmativa,
  resposta: "C" | "E" | "branco",
): Resultado {
  if (resposta === "branco") return "branco";
  return resposta === afirmativa.gabarito ? "acerto" : "erro";
}

/** Registra a resposta a uma afirmativa: repetição espaçada, placar e pontos. */
export function responderAfirmativa(
  estado: EstadoDoJogo,
  afirmativa: Afirmativa,
  resposta: "C" | "E" | "branco",
): EstadoDoJogo {
  const resultado = resultadoDaResposta(afirmativa, resposta);
  const estudo = atualizarEstudo(
    estado.estudo[afirmativa.conceitoId],
    resultado,
    estado.dia,
    estado.modoBanca,
  );
  const naBanca = resultado === "acerto" ? 1 : resultado === "erro" ? -1 : 0;
  return {
    ...estado,
    estudo: { ...estado.estudo, [afirmativa.conceitoId]: estudo },
    afirmativasVistas: {
      ...estado.afirmativasVistas,
      [afirmativa.id]: (estado.afirmativasVistas[afirmativa.id] ?? 0) + 1,
    },
    pontos: estado.pontos + (resultado === "acerto" ? PONTOS_POR_AFIRMATIVA : 0),
    saldoBanca: estado.saldoBanca + (estado.modoBanca ? naBanca : 0),
  };
}

/** Capítulo em que o jogador está: o da próxima missão ou, no fim, o último jogado. */
export function capituloAtual(estado: EstadoDoJogo, conteudo: Conteudo): number {
  const proxima = proximaMissao(estado, conteudo);
  if (proxima) return proxima.capitulo;
  return Math.max(1, ...conteudo.missoes.map((m) => m.capitulo));
}
