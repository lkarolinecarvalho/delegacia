import type { Elemento, Fato } from "./tipos";

/** Fato de base para os testes: adulto, sóbrio, doloso, execução iniciada. */
export function fato(elementos: readonly Elemento[], mudancas: Partial<Fato> = {}): Fato {
  return {
    elementos,
    elementoSubjetivo: "dolo",
    execucao: { iniciada: true, interrompidaPor: "circunstancias_alheias" },
    justificante: null,
    agente: { idade: 30, embriaguez: "nenhuma" },
    ...mudancas,
  };
}

export const FURTO_CONSUMADO: readonly Elemento[] = [
  "subtracao",
  "coisa_alheia_movel",
  "inversao_da_posse",
];
export const ROUBO_CONSUMADO: readonly Elemento[] = [
  ...FURTO_CONSUMADO,
  "violencia_ou_grave_ameaca",
];
export const LESAO: readonly Elemento[] = ["ofensa_a_integridade_corporal", "lesao_produzida"];
export const DANO: readonly Elemento[] = ["dano_a_coisa_alheia", "coisa_danificada"];

export const LEGITIMA_DEFESA = {
  tipo: "legitima_defesa",
  agressaoInjusta: true,
  atualOuIminente: true,
  direitoProprioOuAlheio: true,
  meiosNecessarios: true,
  usoModerado: true,
} as const;

export const ESTADO_DE_NECESSIDADE = {
  tipo: "estado_de_necessidade",
  perigoAtual: true,
  naoProvocadoPorVontade: true,
  inevitavelDeOutroModo: true,
  direitoProprioOuAlheio: true,
  sacrificioInexigivel: true,
  deverLegalDeEnfrentar: false,
} as const;
