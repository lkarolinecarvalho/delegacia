import {
  CAMPOS_DA_FICHA,
  CIRCUNSTANCIAS,
  type Contexto,
  ELEMENTOS,
  type Fato,
  TIPOS_PENAIS_IDS,
} from "@delegacia/motor";
import { z } from "zod";

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id em minúsculas, com hífens");
const texto = z.string().trim().min(1);
const gabarito = z.enum(["C", "E"]);

export const salaSchema = z.strictObject({
  id,
  nome: texto,
  /** Nome curto, para a placa no mapa. */
  placa: texto,
  descricao: texto,
});

export const npcSchema = z.strictObject({ id, nome: texto, papel: texto });

export const capituloSchema = z.strictObject({
  numero: z.int().positive(),
  parte: texto,
  /** Como o capítulo é chamado: "Capítulo" na Parte I, "Ronda" na Parte II. */
  rotulo: texto,
  titulo: texto,
  resumo: texto,
});

export const conceitoSchema = z.strictObject({
  id,
  nome: texto,
  nivel: z.int().min(1),
  definicao: texto,
});

const perguntaSchema = z.strictObject({ enunciado: texto, gabarito, explicacao: texto });

export const temaSchema = z.strictObject({
  id,
  titulo: texto,
  resumo: texto,
  pontos: z.array(texto).min(2).max(5),
  exemplo: texto,
  /** Fonte legal do tema, mostrada no rodapé da aula. */
  fonte: texto.optional(),
  perguntas: z.array(perguntaSchema).max(3),
});

export const afirmativaSchema = z.strictObject({
  id,
  conceitoId: id,
  nivelMin: z.int().min(1),
  enunciado: texto,
  gabarito,
  explicacao: texto,
  regras: z.array(z.string().regex(/^R-[A-Z]+-\d+$/)).min(1),
});

const legitimaDefesaSchema = z.strictObject({
  tipo: z.literal("legitima_defesa"),
  agressaoInjusta: z.boolean(),
  atualOuIminente: z.boolean(),
  direitoProprioOuAlheio: z.boolean(),
  meiosNecessarios: z.boolean(),
  usoModerado: z.boolean(),
});

const estadoDeNecessidadeSchema = z.strictObject({
  tipo: z.literal("estado_de_necessidade"),
  perigoAtual: z.boolean(),
  naoProvocadoPorVontade: z.boolean(),
  inevitavelDeOutroModo: z.boolean(),
  direitoProprioOuAlheio: z.boolean(),
  sacrificioInexigivel: z.boolean(),
  deverLegalDeEnfrentar: z.boolean(),
});

/** O fato apurado, como o motor o recebe (docs/modelo-de-conteudo.md). */
export const fatoSchema = z.strictObject({
  elementos: z.array(z.enum(ELEMENTOS)),
  elementoSubjetivo: z.enum(["dolo", "culpa", "nenhum"]),
  execucao: z.strictObject({
    iniciada: z.boolean(),
    interrompidaPor: z.enum(["circunstancias_alheias", "vontade_propria"]).optional(),
  }),
  justificante: z
    .discriminatedUnion("tipo", [legitimaDefesaSchema, estadoDeNecessidadeSchema])
    .nullable(),
  agente: z.strictObject({
    idade: z.int().min(0).max(120),
    embriaguez: z.enum(["nenhuma", "voluntaria", "culposa", "fortuita_completa"]),
  }),
  circunstancias: z.array(z.enum(CIRCUNSTANCIAS)).optional(),
  erroDeTipo: z.enum(["inevitavel", "evitavel"]).optional(),
});

/** O que ficou apurado sobre a fase policial do caso (capítulos 6 em diante). */
export const contextoSchema = z.strictObject({
  situacao: z.enum([
    "cometendo",
    "acabou_de_cometer",
    "perseguido_logo_apos",
    "encontrado_logo_depois",
    "nenhuma",
  ]),
  vitimaManifestou: z.boolean(),
  mesesDesdeAAutoria: z.int().min(0),
});

const campo = z.enum(CAMPOS_DA_FICHA);

export const casoSchema = z.strictObject({
  titulo: texto,
  /** O que ficou apurado, em frases curtas. */
  linhas: z.array(texto).min(1).max(6),
  fato: fatoSchema,
  /** A fase policial do caso. Sem ele, a ficha só tem as etapas da teoria do crime. */
  contexto: contextoSchema.nullable().default(null),
  /** Etapas da ficha que o jogador responde. */
  pede: z.array(campo).min(1),
  /** Etapas que o mentor entrega preenchidas. */
  informa: z.array(campo),
  /** O mentor diz qual é o tipo penal em análise. */
  tipoInformado: z.boolean(),
  /** Com "tipo" em `pede`: os tipos sugeridos. Vazio = Código inteiro (livre). */
  opcoesDeTipo: z.array(z.enum(TIPOS_PENAIS_IDS)),
  /** Fala do mentor quando a etapa sai errada. */
  comentarios: z.partialRecord(campo, texto),
  desfecho: texto,
});

const falaSchema = z.strictObject({ npc: id, texto: texto.max(240) });

/** Uma parada da missão em outra sala, antes da cena final: só conversa. */
export const cenaSchema = z.strictObject({
  sala: id,
  falas: z.array(falaSchema).min(1).max(8),
});

export const missaoSchema = z.strictObject({
  id,
  titulo: texto,
  capitulo: z.int().positive(),
  nivel: z.int().min(1),
  sala: id,
  npc: id,
  requisitos: z.array(id),
  /** Temas dados como aula, em balões, antes do caso. */
  aulas: z.array(id),
  /** Temas que a conversa da missão ensina: entram na fixação e na Biblioteca. */
  revela: z.array(id).default([]),
  /** Paradas em outras salas, na ordem, antes da cena final em `sala`. */
  antes: z.array(cenaSchema).default([]),
  /** A conversa da cena final. Frases curtas; o negrito marca os termos que importam. */
  dialogo: z.array(falaSchema).min(1).max(8),
  caso: casoSchema.nullable(),
  conceitos: z.array(id),
  recompensa: z.strictObject({ pontos: z.int().positive() }),
});

export type Sala = z.infer<typeof salaSchema>;
export type Npc = z.infer<typeof npcSchema>;
export type Capitulo = z.infer<typeof capituloSchema>;
export type Conceito = z.infer<typeof conceitoSchema>;
export type Tema = z.infer<typeof temaSchema>;
export type Pergunta = z.infer<typeof perguntaSchema>;
export type Afirmativa = z.infer<typeof afirmativaSchema>;
export type Caso = z.infer<typeof casoSchema>;
export type Missao = z.infer<typeof missaoSchema>;
export type Cena = z.infer<typeof cenaSchema>;

// O fato validado pelo schema precisa servir de entrada para o motor.
const _fatoDoSchemaServeAoMotor = (fato: z.infer<typeof fatoSchema>): Fato => fato;
void _fatoDoSchemaServeAoMotor;
const _contextoDoSchemaServeAoMotor = (contexto: z.infer<typeof contextoSchema>): Contexto =>
  contexto;
void _contextoDoSchemaServeAoMotor;
