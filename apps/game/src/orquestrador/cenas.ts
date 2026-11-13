import type { Missao } from "@delegacia/content";
import type { EstadoDoJogo } from "../state/jogo";

/** Uma parada da missão: a sala e a conversa que acontece nela. */
export interface CenaDaMissao {
  readonly sala: string;
  readonly falas: Missao["dialogo"];
  /** A última cena: é nela que vêm a fixação, o caso e o desfecho. */
  readonly final: boolean;
}

/**
 * As cenas de uma missão, na ordem: as paradas de `antes` e, por fim, a cena da sala
 * em que a missão se resolve. Um caso anda pela delegacia antes de chegar à decisão.
 */
export function cenasDaMissao(missao: Missao): CenaDaMissao[] {
  return [
    ...missao.antes.map((cena) => ({ sala: cena.sala, falas: cena.falas, final: false })),
    { sala: missao.sala, falas: missao.dialogo, final: true },
  ];
}

/** Em que cena da missão o jogador está. Começa na primeira. */
export function cenaDaVez(estado: EstadoDoJogo, missao: Missao): number {
  const ultima = cenasDaMissao(missao).length - 1;
  const feitas = estado.andamento?.missao === missao.id ? estado.andamento.cena : 0;
  return Math.min(feitas, ultima);
}

/** A sala para onde o jogador precisa ir agora, para seguir com a missão. */
export function salaDaVez(estado: EstadoDoJogo, missao: Missao): string {
  return cenasDaMissao(missao)[cenaDaVez(estado, missao)]?.sala ?? missao.sala;
}
