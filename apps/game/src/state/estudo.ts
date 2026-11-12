/**
 * Repetição espaçada por conceito: Leitner simplificado (docs/fluxo-afirmativas.md, seção 4).
 * O tempo é o plantão (dia) do jogo, um número inteiro.
 */

export const CAIXA_MAXIMA = 5;
/** Plantões até a próxima cobrança, por caixa (1 a 5). Parâmetro de balanceamento. */
export const INTERVALOS_EM_DIAS: readonly number[] = [0, 1, 3, 7, 15];

export type Resultado = "acerto" | "erro" | "branco";

export interface EstudoDoConceito {
  /** Caixa de 1 a 5. Quanto maior, mais dominado e mais espaçado. */
  readonly caixa: number;
  readonly proximaRevisao: number;
  readonly acertos: number;
  readonly erros: number;
  readonly brancos: number;
  /** Placar líquido do conceito no modo banca: +1 por acerto, −1 por erro. */
  readonly saldoBanca: number;
}

export type Estudo = Readonly<Record<string, EstudoDoConceito>>;

/**
 * Acerto sobe uma caixa; erro volta para a caixa 1. Branco conta como "não sabe" e
 * também volta para a caixa 1. O modo banca não muda o espaçamento, só o placar.
 */
export function atualizarEstudo(
  atual: EstudoDoConceito | undefined,
  resultado: Resultado,
  hoje: number,
  modoBanca: boolean,
): EstudoDoConceito {
  const anterior = atual ?? {
    caixa: 1,
    proximaRevisao: hoje,
    acertos: 0,
    erros: 0,
    brancos: 0,
    saldoBanca: 0,
  };
  const caixa = resultado === "acerto" ? Math.min(anterior.caixa + 1, CAIXA_MAXIMA) : 1;
  const variacaoNaBanca = resultado === "acerto" ? 1 : resultado === "erro" ? -1 : 0;
  return {
    caixa,
    proximaRevisao: hoje + (INTERVALOS_EM_DIAS[caixa - 1] ?? 0),
    acertos: anterior.acertos + (resultado === "acerto" ? 1 : 0),
    erros: anterior.erros + (resultado === "erro" ? 1 : 0),
    brancos: anterior.brancos + (resultado === "branco" ? 1 : 0),
    saldoBanca: anterior.saldoBanca + (modoBanca ? variacaoNaBanca : 0),
  };
}

/** Conceito novo (nunca cobrado) ou com a data de revisão alcançada. */
export function conceitoVencido(estudo: EstudoDoConceito | undefined, hoje: number): boolean {
  return !estudo || estudo.proximaRevisao <= hoje;
}

/** Plantões que faltam para a próxima cobrança; zero se já está vencido. */
export function diasAteARevisao(estudo: EstudoDoConceito, hoje: number): number {
  return Math.max(estudo.proximaRevisao - hoje, 0);
}

/**
 * Ordem de prioridade entre conceitos vencidos: caixa mais baixa primeiro e, na mesma
 * caixa, a revisão mais atrasada. Conceito novo entra como caixa 1.
 */
export function compararPrioridade(
  a: EstudoDoConceito | undefined,
  b: EstudoDoConceito | undefined,
): number {
  const porCaixa = (a?.caixa ?? 1) - (b?.caixa ?? 1);
  if (porCaixa !== 0 || !a || !b) return porCaixa;
  return a.proximaRevisao - b.proximaRevisao;
}
