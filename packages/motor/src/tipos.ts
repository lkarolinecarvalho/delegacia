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
  // Parte Especial (rondas) e capítulos 6 a 10.
  "ameaca_de_mal_injusto_e_grave",
  "ofensa_a_dignidade",
  "imputacao_falsa_de_crime",
  "imputacao_de_fato_desonroso",
  "vitima_tomou_conhecimento",
  "terceiro_tomou_conhecimento",
  "contexto_domestico_contra_mulher",
  "matar_alguem",
  "morte",
  "constrangimento_mediante_violencia_ou_ameaca",
  "busca_de_vantagem_economica",
  "vitima_cedeu",
  "recebe_coisa_produto_de_crime",
  "sabe_da_origem_criminosa",
  "funcionario_publico",
  "apropria_bem_em_razao_do_cargo",
  "exige_vantagem_indevida",
  "solicita_ou_recebe_vantagem_indevida",
  "oferece_vantagem_indevida_a_funcionario",
  "retarda_ato_de_oficio_por_interesse_pessoal",
  "desacata_funcionario_no_exercicio_da_funcao",
  "opoe_se_a_ato_legal_com_violencia_ou_ameaca",
  "desobedece_ordem_legal_de_funcionario",
] as const;
export type Elemento = (typeof ELEMENTOS)[number];

export const TIPOS_PENAIS_IDS = [
  "furto",
  "roubo",
  "dano",
  "apropriacao_indebita",
  "estelionato",
  "lesao_corporal",
  "lesao_domestica",
  "ameaca",
  "calunia",
  "difamacao",
  "injuria",
  "homicidio",
  "extorsao",
  "receptacao",
  "peculato",
  "concussao",
  "corrupcao_passiva",
  "corrupcao_ativa",
  "prevaricacao",
  "resistencia",
  "desobediencia",
  "desacato",
] as const;
export type TipoPenalId = (typeof TIPOS_PENAIS_IDS)[number];

/** Circunstâncias do fato que qualificam o crime (regras-penais.md, seção 9). */
export const CIRCUNSTANCIAS = [
  "rompimento_de_obstaculo",
  "abuso_de_confianca",
  "escalada",
  "destreza",
  "chave_falsa",
  "concurso_de_pessoas",
  "motivo_torpe",
  "motivo_futil",
  "meio_cruel",
  "recurso_que_dificultou_a_defesa",
] as const;
export type Circunstancia = (typeof CIRCUNSTANCIAS)[number];

export const TITULOS = ["pessoa", "patrimonio", "administracao_publica"] as const;
export type Titulo = (typeof TITULOS)[number];

export type AcaoPenal = "publica_incondicionada" | "publica_condicionada" | "privada";

/** O agente se enganou sobre um elemento do tipo, e o engano podia ou não ser evitado. */
export type ErroDeTipo = "inevitavel" | "evitavel";

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
  /** Circunstâncias que podem qualificar o crime. */
  readonly circunstancias?: readonly Circunstancia[] | undefined;
  /** Erro sobre elemento do tipo (CP, art. 20), se houve. */
  readonly erroDeTipo?: ErroDeTipo | undefined;
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
  /** Título da Parte Especial do Código Penal. */
  readonly titulo: Titulo;
  /** Pena privativa de liberdade máxima do tipo básico, em meses. */
  readonly penaMaximaMeses: number;
  readonly acao: AcaoPenal;
  /** Crime inafiançável (CF, art. 5º, XLII a XLIV). */
  readonly inafiancavel: boolean;
  /** A Lei 9.099/95 não se aplica, qualquer que seja a pena (Lei 11.340/06, art. 41). */
  readonly afastaALei9099: boolean;
  /** Forma qualificada, quando o jogo a cobre. */
  readonly qualificado: FormaQualificada | null;
}

export interface FormaQualificada {
  readonly nome: string;
  readonly artigo: string;
  readonly regra: string;
  /** Basta uma destas circunstâncias para qualificar. */
  readonly circunstancias: readonly Circunstancia[];
  readonly penaMaximaMeses: number;
  readonly inafiancavel: boolean;
}

export type Figura = "simples" | "qualificado";

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
  | "culposo_sem_resultado"
  | "erro_de_tipo";

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
  /** Simples ou qualificado. Fica `null` no fato atípico. */
  readonly figura: Figura | null;
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
  "figura",
  "forma",
  "excludente",
  "culpabilidade",
  "conclusao",
  // Fase policial: só quando há crime e a missão traz o contexto do caso.
  "acao",
  "instauracao",
  "rito",
  "flagrante",
  "fianca",
  "prazo",
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
  readonly figura?: Figura;
  readonly forma?: Forma;
  readonly excludente?: ExcludenteNaFicha;
  readonly culpabilidade?: Culpabilidade;
  readonly conclusao?: Conclusao;
  readonly acao?: AcaoPenal;
  readonly instauracao?: Instauracao;
  readonly rito?: Rito;
  readonly flagrante?: Flagrante;
  readonly fianca?: Fianca;
  readonly prazo?: PrazoDoInquerito;
}

/** Em que situação o autor foi encontrado (CPP, art. 302). */
export type SituacaoDeFlagrante =
  | "cometendo"
  | "acabou_de_cometer"
  | "perseguido_logo_apos"
  | "encontrado_logo_depois"
  | "nenhuma";

/** O que ficou apurado sobre a fase policial do caso. */
export interface Contexto {
  readonly situacao: SituacaoDeFlagrante;
  /** A vítima representou (ação condicionada) ou requereu (ação privada). */
  readonly vitimaManifestou: boolean;
  /** Meses completos desde que a vítima soube quem é o autor. */
  readonly mesesDesdeAAutoria: number;
}

export type Instauracao = "pode_instaurar" | "aguarda_a_vitima" | "decadencia";
export type Rito = "termo_circunstanciado" | "inquerito";
export type Flagrante = "proprio" | "improprio" | "presumido" | "nao_ha";
export type Fianca = "delegado" | "juiz" | "inafiancavel" | "nao_se_aplica";
export type PrazoDoInquerito = "10_dias" | "30_dias" | "nao_se_aplica";

export type CampoDoProcedimento =
  | "acao"
  | "instauracao"
  | "rito"
  | "flagrante"
  | "fianca"
  | "prazo";

/** A fase policial de um caso em que há crime (regras-penais.md, seção 10). */
export interface Procedimento {
  readonly acao: AcaoPenal;
  readonly menorPotencialOfensivo: boolean;
  readonly instauracao: Instauracao;
  readonly rito: Rito;
  readonly flagrante: Flagrante;
  readonly fianca: Fianca;
  /** O autor fica preso depois do auto de prisão em flagrante. */
  readonly preso: boolean;
  readonly prazo: PrazoDoInquerito;
  /** Regras que sustentam cada resposta. */
  readonly regras: Readonly<Record<CampoDoProcedimento, readonly string[]>>;
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
