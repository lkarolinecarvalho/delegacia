/**
 * Tipos do domínio penal. O fato chega ao motor como apurado (R-GER-01): o motor não
 * valora prova.
 */

/** Marcas da conduta e do resultado que os tipos penais exigem (regras-penais.md, seção 7). */
export const ELEMENTOS = [
  "subtracao",
  "coisa_alheia_movel",
  "violencia_ou_grave_ameaca",
  "inversao_da_posse",
  "dano_a_coisa_alheia",
  "coisa_danificada",
  "ofensa_a_integridade_corporal",
  "lesao_produzida",
  "posse_previa_licita",
  "apropriacao",
  "fraude",
  "busca_de_vantagem_ilicita",
  "vitima_em_erro",
  "vantagem_obtida",
] as const;
export type Elemento = (typeof ELEMENTOS)[number];

export const TIPOS_PENAIS_IDS = [
  "furto",
  "roubo",
  "dano",
  "apropriacao_indebita",
  "estelionato",
  "lesao_corporal",
] as const;
export type TipoPenalId = (typeof TIPOS_PENAIS_IDS)[number];

export type ElementoSubjetivo = "dolo" | "culpa" | "nenhum";

/** Por que a execução, já iniciada, não chegou à consumação. */
export type Interrupcao = "circunstancias_alheias" | "vontade_propria";

export interface Execucao {
  /** Houve início de execução? Sem ele, só há cogitação ou atos preparatórios. */
  readonly iniciada: boolean;
  /** Só importa quando o crime não se consumou. */
  readonly interrompidaPor?: Interrupcao | undefined;
}

/** Requisitos da legítima defesa (CP, art. 25), um a um, como apurados. */
export interface LegitimaDefesaAlegada {
  readonly tipo: "legitima_defesa";
  readonly agressaoInjusta: boolean;
  readonly atualOuIminente: boolean;
  readonly direitoProprioOuAlheio: boolean;
  readonly meiosNecessarios: boolean;
  readonly usoModerado: boolean;
}

/** Requisitos do estado de necessidade (CP, art. 24), um a um, como apurados. */
export interface EstadoDeNecessidadeAlegado {
  readonly tipo: "estado_de_necessidade";
  readonly perigoAtual: boolean;
  readonly naoProvocadoPorVontade: boolean;
  readonly inevitavelDeOutroModo: boolean;
  readonly direitoProprioOuAlheio: boolean;
  readonly sacrificioInexigivel: boolean;
  /** O agente tinha o dever legal de enfrentar o perigo (art. 24, § 1º)? */
  readonly deverLegalDeEnfrentar: boolean;
}

export type Justificante = LegitimaDefesaAlegada | EstadoDeNecessidadeAlegado;

export type Embriaguez = "nenhuma" | "voluntaria" | "culposa" | "fortuita_completa";

export interface Agente {
  /** Idade na data do fato, em anos completos. */
  readonly idade: number;
  readonly embriaguez: Embriaguez;
}

export interface Fato {
  readonly elementos: readonly Elemento[];
  readonly elementoSubjetivo: ElementoSubjetivo;
  readonly execucao: Execucao;
  /** Excludente de ilicitude alegada, com os requisitos apurados. `null` se não há. */
  readonly justificante: Justificante | null;
  readonly agente: Agente;
}

export interface TipoPenal {
  readonly id: TipoPenalId;
  readonly nome: string;
  /** Ex.: "CP, art. 155". */
  readonly artigo: string;
  /** O texto do tipo básico. */
  readonly texto: string;
  /** Regra de regras-penais.md que descreve o tipo. */
  readonly regra: string;
  /** Marcas que o fato precisa ter para se ajustar ao tipo. */
  readonly exige: readonly Elemento[];
  /** Marcas que separam o consumado do tentado. */
  readonly consumaCom: readonly Elemento[];
  /** Existe forma culposa prevista em lei? */
  readonly admiteCulpa: boolean;
  /** Regras extras aplicadas à consumação (ex.: R-ITER-05). */
  readonly regrasDaConsumacao: readonly string[];
}

export type Forma = "consumado" | "tentado";
export type Excludente = "nenhuma" | "legitima_defesa" | "estado_de_necessidade";
export type Culpabilidade = "culpavel" | "menoridade" | "embriaguez_fortuita";
export type Conclusao =
  | "crime"
  | "fato_atipico"
  | "fato_licito"
  | "ato_infracional"
  | "isento_de_pena";

export type MotivoDaAtipicidade =
  | "sem_tipo"
  | "sem_dolo_nem_culpa"
  | "culpa_sem_previsao"
  | "atos_preparatorios"
  | "culposo_sem_resultado";

export type Etapa = "tipicidade" | "forma" | "ilicitude" | "culpabilidade" | "conclusao";

export interface Passo {
  readonly etapa: Etapa;
  /** Chave curta do que foi decidido na etapa, para a UI traduzir. */
  readonly resultado: string;
  readonly regras: readonly string[];
}

export interface Analise {
  readonly tipico: boolean;
  /**
   * Tipo a que a conduta se ajusta. Fica preenchido mesmo quando o fato acaba atípico
   * por falta de dolo ou de forma culposa, para a UI dizer "seria dano, mas…".
   */
  readonly tipo: TipoPenalId | null;
  readonly motivoDaAtipicidade: MotivoDaAtipicidade | null;
  /** `null` quando a etapa não chega a ser analisada (R-GER-03). */
  readonly forma: Forma | null;
  readonly excludente: Excludente | null;
  /** Requisitos da justificante alegada que não ficaram demonstrados. */
  readonly requisitosAusentes: readonly string[];
  readonly culpabilidade: Culpabilidade | null;
  readonly conclusao: Conclusao;
  readonly passos: readonly Passo[];
  /** Todas as regras aplicadas, sem repetição, na ordem da análise. */
  readonly regras: readonly string[];
}

/** Etapas que o jogador pode responder. A missão diz quais. */
export const CAMPOS_DA_FICHA = [
  "tipico",
  "tipo",
  "forma",
  "excludente",
  "culpabilidade",
  "conclusao",
] as const;
export type CampoDaFicha = (typeof CAMPOS_DA_FICHA)[number];

/** Excludentes que o jogador pode marcar; o motor só reconhece as de `Excludente`. */
export type ExcludenteNaFicha =
  | Excludente
  | "estrito_cumprimento_do_dever_legal"
  | "exercicio_regular_de_direito";

export interface Ficha {
  readonly tipico?: boolean;
  readonly tipo?: TipoPenalId | "nenhum";
  readonly forma?: Forma;
  readonly excludente?: ExcludenteNaFicha;
  readonly culpabilidade?: Culpabilidade;
  readonly conclusao?: Conclusao;
}

export interface ResultadoDoCampo {
  readonly campo: CampoDaFicha;
  readonly correto: boolean;
  /** Regras que sustentam a resposta esperada. */
  readonly regras: readonly string[];
}

export interface ResultadoDaFicha {
  readonly correta: boolean;
  readonly campos: readonly ResultadoDoCampo[];
}
