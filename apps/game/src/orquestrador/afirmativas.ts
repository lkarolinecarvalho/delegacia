import type { Afirmativa, Missao } from "@delegacia/content";
import { compararPrioridade, conceitoVencido } from "../state/estudo";
import type { EstadoDoJogo } from "../state/jogo";

/** Máximo de afirmativas num caso comum (docs/fluxo-afirmativas.md, seção 1). */
export const LIMITE_POR_CASO = 2;
/** Tamanho de uma bateria de Revisão na Biblioteca (parâmetro de balanceamento). */
export const LIMITE_NA_REVISAO = 10;

type EstadoDoEstudo = Pick<EstadoDoJogo, "afirmativasVistas" | "estudo" | "dia">;

/**
 * Seleção de docs/fluxo-afirmativas.md, seção 3: dos conceitos informados, ficam os
 * vencidos no espaçamento, em ordem de prioridade (caixa mais baixa, revisão mais
 * atrasada); de cada um, a variante liberada para o nível que foi menos vista.
 */
function selecionar(
  conceitos: readonly string[],
  afirmativas: readonly Afirmativa[],
  estado: EstadoDoEstudo,
  filtro: { readonly nivel: number; readonly limite: number },
): Afirmativa[] {
  const vencidos = [...new Set(conceitos)]
    .filter((conceito) => conceitoVencido(estado.estudo[conceito], estado.dia))
    // sort é estável: no empate, vale a ordem em que os conceitos foram informados.
    .sort((a, b) => compararPrioridade(estado.estudo[a], estado.estudo[b]));

  const escolhidas: Afirmativa[] = [];
  for (const conceito of vencidos) {
    if (escolhidas.length >= filtro.limite) break;
    const [menosVista] = afirmativas
      .filter((a) => a.conceitoId === conceito && a.nivelMin <= filtro.nivel)
      .sort(
        (a, b) => (estado.afirmativasVistas[a.id] ?? 0) - (estado.afirmativasVistas[b.id] ?? 0),
      );
    if (menosVista) escolhidas.push(menosVista);
  }
  return escolhidas;
}

/**
 * Afirmativas de um caso. Pode voltar vazio: quando nenhum conceito do caso está
 * vencido, o caso termina sem afirmativa, e isso é desejável.
 */
export function selecionarAfirmativas(
  missao: Missao,
  afirmativas: readonly Afirmativa[],
  estado: EstadoDoEstudo,
): Afirmativa[] {
  return selecionar(missao.conceitos, afirmativas, estado, {
    nivel: missao.nivel,
    limite: LIMITE_POR_CASO,
  });
}

/**
 * Bateria de Revisão: os conceitos que o jogador já encontrou e que estão vencidos.
 * Conceito ainda não apresentado pela campanha não entra.
 */
export function selecionarParaRevisao(
  afirmativas: readonly Afirmativa[],
  estado: EstadoDoEstudo,
  nivel: number,
  limite = LIMITE_NA_REVISAO,
): Afirmativa[] {
  return selecionar(Object.keys(estado.estudo), afirmativas, estado, { nivel, limite });
}
