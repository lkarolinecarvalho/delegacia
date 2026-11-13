import {
  analisarFato,
  analisarProcedimento,
  ErroDeFato,
  esperadoNoCampo,
  existeRegra,
  type Procedimento,
} from "@delegacia/motor";
import { z } from "zod";
import {
  type Afirmativa,
  afirmativaSchema,
  type Capitulo,
  type Conceito,
  capituloSchema,
  conceitoSchema,
  type Missao,
  missaoSchema,
  type Npc,
  npcSchema,
  type Sala,
  salaSchema,
  type Tema,
  temaSchema,
} from "./schemas";

/** Mínimo de afirmativas por conceito usado em missão (docs/fluxo-afirmativas.md, seção 6). */
export const VARIANTES_MINIMAS = 3;

export interface ConteudoBruto {
  readonly salas: unknown;
  readonly npcs: unknown;
  readonly capitulos: unknown;
  readonly conceitos: unknown;
  readonly teoria: unknown;
  readonly missoes: unknown;
  readonly afirmativas: unknown;
}

export interface Conteudo {
  readonly salas: readonly Sala[];
  readonly npcs: readonly Npc[];
  readonly capitulos: readonly Capitulo[];
  readonly conceitos: readonly Conceito[];
  readonly teoria: readonly Tema[];
  /** Na ordem da campanha. */
  readonly missoes: readonly Missao[];
  readonly afirmativas: readonly Afirmativa[];
}

export class ErroDeConteudo extends Error {
  readonly problemas: readonly string[];

  constructor(problemas: readonly string[]) {
    super(`Conteúdo inválido:\n- ${problemas.join("\n- ")}`);
    this.name = "ErroDeConteudo";
    this.problemas = problemas;
  }
}

function ler<T>(nome: string, schema: z.ZodType<T>, dados: unknown, problemas: string[]): T[] {
  const resultado = z.array(schema).safeParse(dados);
  if (resultado.success) return resultado.data;
  for (const issue of resultado.error.issues) {
    problemas.push(`${nome}[${issue.path.join(".")}]: ${issue.message}`);
  }
  return [];
}

function repetidos(ids: readonly string[]): string[] {
  return [...new Set(ids.filter((item, i) => ids.indexOf(item) !== i))];
}

/** Confere o caso da missão contra o motor: o fato é coberto e a ficha faz sentido. */
function conferirCaso(missao: Missao, problemas: string[]): void {
  const caso = missao.caso;
  if (!caso) return;
  const onde = `missão ${missao.id}`;
  let analise: ReturnType<typeof analisarFato>;
  try {
    analise = analisarFato(caso.fato);
  } catch (erro) {
    if (!(erro instanceof ErroDeFato)) throw erro;
    problemas.push(`${onde}: o motor recusa o fato (${erro.codigo}: ${erro.message})`);
    return;
  }
  let procedimento: Procedimento | null = null;
  if (caso.contexto) {
    if (analise.conclusao !== "crime") {
      problemas.push(`${onde}: tem contexto da fase policial, mas a conclusão não é crime`);
      return;
    }
    procedimento = analisarProcedimento(analise, caso.contexto);
  }
  for (const campo of [...caso.pede, ...caso.informa]) {
    if (esperadoNoCampo(analise, campo, procedimento) === null) {
      problemas.push(`${onde}: a etapa "${campo}" não chega a ser analisada neste fato`);
    }
  }
  for (const campo of caso.pede) {
    if (caso.informa.includes(campo)) {
      problemas.push(`${onde}: a etapa "${campo}" está em pede e em informa`);
    }
  }
  for (const campo of Object.keys(caso.comentarios)) {
    if (!(caso.pede as readonly string[]).includes(campo)) {
      problemas.push(`${onde}: comentário para a etapa "${campo}", que o jogador não responde`);
    }
  }
  const pedeTipo = caso.pede.includes("tipo");
  if (pedeTipo && caso.tipoInformado) {
    problemas.push(`${onde}: pede o tipo penal e também o informa`);
  }
  if (!pedeTipo && caso.opcoesDeTipo.length > 0) {
    problemas.push(`${onde}: opcoesDeTipo só faz sentido com "tipo" em pede`);
  }
  if (caso.tipoInformado && !analise.tipo) {
    problemas.push(`${onde}: tipoInformado, mas o fato não se ajusta a nenhum tipo`);
  }
  if (pedeTipo && caso.opcoesDeTipo.length > 0) {
    if (caso.opcoesDeTipo.length < 2) problemas.push(`${onde}: sugira pelo menos 2 tipos`);
    if (analise.tipico && analise.tipo && !caso.opcoesDeTipo.includes(analise.tipo)) {
      problemas.push(`${onde}: o tipo correto (${analise.tipo}) não está entre as opções`);
    }
  }
}

/**
 * Valida o conteúdo: os schemas e as referências entre os arquivos. Lança
 * `ErroDeConteudo` com todos os problemas encontrados.
 */
export function carregarConteudo(bruto: ConteudoBruto): Conteudo {
  const problemas: string[] = [];
  const conteudo: Conteudo = {
    salas: ler("salas", salaSchema, bruto.salas, problemas),
    npcs: ler("npcs", npcSchema, bruto.npcs, problemas),
    capitulos: ler("capitulos", capituloSchema, bruto.capitulos, problemas),
    conceitos: ler("conceitos", conceitoSchema, bruto.conceitos, problemas),
    teoria: ler("teoria", temaSchema, bruto.teoria, problemas),
    missoes: ler("missoes", missaoSchema, bruto.missoes, problemas),
    afirmativas: ler("afirmativas", afirmativaSchema, bruto.afirmativas, problemas),
  };

  const ids = (itens: readonly { readonly id: string }[]) => itens.map((item) => item.id);
  const grupos: readonly (readonly [string, readonly string[]])[] = [
    ["salas", ids(conteudo.salas)],
    ["npcs", ids(conteudo.npcs)],
    ["conceitos", ids(conteudo.conceitos)],
    ["teoria", ids(conteudo.teoria)],
    ["missoes", ids(conteudo.missoes)],
    ["afirmativas", ids(conteudo.afirmativas)],
    ["capitulos", conteudo.capitulos.map((c) => String(c.numero))],
  ];
  for (const [nome, lista] of grupos) {
    for (const repetido of repetidos(lista)) problemas.push(`${nome}: id repetido "${repetido}"`);
  }

  const salas = new Set(ids(conteudo.salas));
  const npcs = new Set(ids(conteudo.npcs));
  const conceitos = new Set(ids(conteudo.conceitos));
  const temas = new Set(ids(conteudo.teoria));
  const capitulos = new Set(conteudo.capitulos.map((c) => c.numero));

  const jaVistas = new Set<string>();
  let capituloAnterior = 0;
  for (const missao of conteudo.missoes) {
    const onde = `missão ${missao.id}`;
    if (!salas.has(missao.sala)) problemas.push(`${onde}: sala desconhecida "${missao.sala}"`);
    if (!npcs.has(missao.npc)) problemas.push(`${onde}: npc desconhecido "${missao.npc}"`);
    if (!capitulos.has(missao.capitulo)) problemas.push(`${onde}: capítulo ${missao.capitulo}?`);
    if (missao.capitulo < capituloAnterior) problemas.push(`${onde}: fora da ordem dos capítulos`);
    capituloAnterior = missao.capitulo;
    for (const cena of missao.antes) {
      if (!salas.has(cena.sala)) problemas.push(`${onde}: sala desconhecida "${cena.sala}"`);
    }
    for (const tema of missao.revela) {
      if (!temas.has(tema)) problemas.push(`${onde}: tema desconhecido "${tema}"`);
    }
    for (const fala of [...missao.antes.flatMap((c) => c.falas), ...missao.dialogo]) {
      if (!npcs.has(fala.npc)) problemas.push(`${onde}: fala de npc desconhecido "${fala.npc}"`);
    }
    for (const aula of missao.aulas) {
      if (!temas.has(aula)) problemas.push(`${onde}: aula desconhecida "${aula}"`);
    }
    for (const requisito of missao.requisitos) {
      // Requisito precisa vir antes na campanha: garante que a ordem é jogável.
      if (!jaVistas.has(requisito)) {
        problemas.push(`${onde}: requisito "${requisito}" não vem antes na campanha`);
      }
    }
    for (const conceito of missao.conceitos) {
      if (!conceitos.has(conceito)) problemas.push(`${onde}: conceito desconhecido "${conceito}"`);
    }
    if (!missao.caso) {
      // Missão de conversa: ensina algum tema e não cobra conceito.
      if (missao.aulas.length + missao.revela.length === 0) {
        problemas.push(`${onde}: conversa sem aulas`);
      }
      if (missao.conceitos.length > 0) problemas.push(`${onde}: conversa não cobra conceitos`);
    }
    conferirCaso(missao, problemas);
    jaVistas.add(missao.id);
  }

  for (const afirmativa of conteudo.afirmativas) {
    const onde = `afirmativa ${afirmativa.id}`;
    if (!conceitos.has(afirmativa.conceitoId)) {
      problemas.push(`${onde}: conceito desconhecido "${afirmativa.conceitoId}"`);
    }
    for (const regra of afirmativa.regras) {
      if (!existeRegra(regra)) problemas.push(`${onde}: regra desconhecida "${regra}"`);
    }
  }

  // Todo conceito cobrado em missão tem variantes suficientes, certas e erradas.
  for (const conceito of new Set(conteudo.missoes.flatMap((m) => m.conceitos))) {
    const variantes = conteudo.afirmativas.filter((a) => a.conceitoId === conceito);
    if (variantes.length < VARIANTES_MINIMAS) {
      problemas.push(
        `conceito ${conceito}: ${variantes.length} afirmativas (mínimo ${VARIANTES_MINIMAS})`,
      );
    }
    if (new Set(variantes.map((a) => a.gabarito)).size < 2) {
      problemas.push(`conceito ${conceito}: precisa de afirmativas certas e erradas`);
    }
  }

  if (problemas.length > 0) throw new ErroDeConteudo(problemas);
  return conteudo;
}
