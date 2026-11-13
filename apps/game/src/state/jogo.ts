import type { Afirmativa, Conteudo, Missao } from "@delegacia/content";
import { type Analise, diasDoPrazo, type Procedimento } from "@delegacia/motor";
import { atualizarEstudo, type Estudo, type Resultado } from "./estudo";

/** Pontos por afirmativa certa fora do modo banca (parâmetro de balanceamento). */
export const PONTOS_POR_AFIRMATIVA = 10;
/** Pontos por inquérito relatado dentro do prazo. */
export const PONTOS_POR_RELATORIO = 20;
/** Pontos por caso do plantão livre. */
export const PONTOS_DO_PLANTAO_LIVRE = 40;
/** Plantões que o preso em flagrante passa na carceragem, até a audiência de custódia. */
const PLANTOES_NA_CARCERAGEM = 1;

/** O que fica gravado de um caso concluído: sempre a análise do motor (ADR-0002). */
export interface RegistroDoCaso {
  readonly missao: string;
  /** Plantão em que o caso foi concluído. */
  readonly dia: number;
  readonly analise: Analise;
  /** A fase policial, nos casos que a têm. */
  readonly procedimento: Procedimento | null;
  /** Quantas vezes o jogador conferiu a ficha com erro antes de acertar. */
  readonly tentativasErradas: number;
}

export interface EstadoDoJogo {
  /** Plantão atual; começa em 1. */
  readonly dia: number;
  readonly pontos: number;
  readonly concluidas: readonly string[];
  readonly registro: readonly RegistroDoCaso[];
  /** A missão em curso e quantas cenas dela já foram feitas (missões com várias salas). */
  readonly andamento: { readonly missao: string; readonly cena: number } | null;
  /** Missões cujo inquérito já foi relatado e remetido. */
  readonly relatados: readonly string[];
  /** Casos resolvidos no plantão livre. */
  readonly plantoesLivres: number;
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
    andamento: null,
    relatados: [],
    plantoesLivres: 0,
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

/** Fecha uma cena da missão em curso: a próxima acontece em outra sala. */
export function avancarCena(estado: EstadoDoJogo, missao: Missao): EstadoDoJogo {
  if (!missaoDisponivel(estado, missao)) {
    throw new Error(`A missão ${missao.id} não está disponível.`);
  }
  const feitas = estado.andamento?.missao === missao.id ? estado.andamento.cena : 0;
  if (feitas >= missao.antes.length) {
    throw new Error(`A missão ${missao.id} já está na última cena.`);
  }
  return { ...estado, andamento: { missao: missao.id, cena: feitas + 1 } };
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
  procedimento: Procedimento | null = null,
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
    andamento: null,
    // O que a conversa da missão ensinou fica guardado na Biblioteca.
    temasVistos: [...new Set([...estado.temasVistos, ...missao.revela])],
    registro: analise
      ? [
          ...estado.registro,
          { missao: missao.id, dia: estado.dia, analise, procedimento, tentativasErradas },
        ]
      : estado.registro,
    // Parâmetro provisório: cada caso concluído encerra o plantão (GDD, seção 10).
    dia: analise ? estado.dia + 1 : estado.dia,
  };
}

/** Um caso do plantão livre: dá pontos e encerra o plantão, sem mexer na campanha. */
export function concluirPlantaoLivre(estado: EstadoDoJogo): EstadoDoJogo {
  return {
    ...estado,
    pontos: estado.pontos + PONTOS_DO_PLANTAO_LIVRE,
    plantoesLivres: estado.plantoesLivres + 1,
    dia: estado.dia + 1,
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

/** Quem está na carceragem hoje: presos em flagrante à espera da audiência de custódia. */
export function presosHoje(estado: EstadoDoJogo): readonly RegistroDoCaso[] {
  return estado.registro.filter(
    (r) => r.procedimento?.preso && estado.dia - r.dia <= PLANTOES_NA_CARCERAGEM,
  );
}

export interface InqueritoNoQuadro {
  readonly missao: string;
  /** Plantão em que o inquérito foi instaurado. */
  readonly aberto: number;
  /** Último plantão do prazo (CPP, art. 10). */
  readonly vence: number;
  /** Plantões que faltam; negativo quando o prazo já passou. */
  readonly restam: number;
  readonly indiciadoPreso: boolean;
  readonly relatado: boolean;
}

/** Os inquéritos da delegacia, com o prazo de cada um. Os mais urgentes vêm primeiro. */
export function inqueritos(estado: EstadoDoJogo): InqueritoNoQuadro[] {
  return estado.registro
    .flatMap((r) => {
      const dias = r.procedimento ? diasDoPrazo(r.procedimento.prazo) : null;
      if (!r.procedimento || dias === null) return [];
      const vence = r.dia + dias;
      return [
        {
          missao: r.missao,
          aberto: r.dia,
          vence,
          restam: vence - estado.dia,
          indiciadoPreso: r.procedimento.preso,
          relatado: estado.relatados.includes(r.missao),
        },
      ];
    })
    .sort((a, b) => Number(a.relatado) - Number(b.relatado) || a.vence - b.vence);
}

/** Relata e remete o inquérito. Dentro do prazo, vale pontos. */
export function relatarInquerito(estado: EstadoDoJogo, missao: string): EstadoDoJogo {
  const inquerito = inqueritos(estado).find((i) => i.missao === missao);
  if (!inquerito || inquerito.relatado) {
    throw new Error(`Não há inquérito em andamento para ${missao}.`);
  }
  return {
    ...estado,
    relatados: [...estado.relatados, missao],
    pontos: estado.pontos + (inquerito.restam >= 0 ? PONTOS_POR_RELATORIO : 0),
  };
}
