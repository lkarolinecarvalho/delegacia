import type { Conteudo, Missao } from "@delegacia/content";
import {
  analisarFato,
  analisarProcedimento,
  CAMPOS_DA_FICHA,
  esperadoNoCampo,
} from "@delegacia/motor";
import { type EstadoDoJogo, PONTOS_DO_PLANTAO_LIVRE } from "../state/jogo";

/** Quem entrega os casos tirados do arquivo. */
const ESCRIVAO = "bento-escrivao";

/** Casos da campanha já concluídos: são os que estão no arquivo. */
export function casosDoArquivo(estado: EstadoDoJogo, conteudo: Conteudo): Missao[] {
  return conteudo.missoes.filter((m) => m.caso && estado.concluidas.includes(m.id));
}

/**
 * Um caso do arquivo, de volta sem ajuda: o jogador responde a ficha inteira, e o tipo
 * penal é escolhido no Código todo (ADR-0003). As explicações continuam valendo: elas
 * só aparecem depois da conferência.
 */
export function reverCaso(original: Missao): Missao | null {
  if (!original.caso) return null;
  const analise = analisarFato(original.caso.fato);
  const procedimento = original.caso.contexto
    ? analisarProcedimento(analise, original.caso.contexto)
    : null;
  // Todas as etapas que a análise alcança; "há fato típico?" já está em "qual é o crime?".
  const pede = CAMPOS_DA_FICHA.filter(
    (campo) => campo !== "tipico" && esperadoNoCampo(analise, campo, procedimento) !== null,
  );
  return {
    ...original,
    id: `livre-${original.id}`,
    sala: "cartorio",
    npc: ESCRIVAO,
    requisitos: [],
    aulas: [],
    revela: [],
    antes: [],
    dialogo: [
      {
        npc: ESCRIVAO,
        texto:
          "Tirei este caso do **arquivo**, doutor(a). Desta vez não adianto nada: a ficha inteira é com o(a) senhor(a).",
      },
    ],
    caso: {
      ...original.caso,
      pede,
      informa: [],
      tipoInformado: false,
      opcoesDeTipo: [],
      // As perguntas escritas para a campanha podem adiantar o tipo penal.
      perguntas: {},
    },
    recompensa: { pontos: PONTOS_DO_PLANTAO_LIVRE },
  };
}

/** Plantão livre: um caso sorteado do arquivo. `sorteio` vai de 0 (inclusive) a 1. */
export function missaoDoPlantaoLivre(
  estado: EstadoDoJogo,
  conteudo: Conteudo,
  sorteio: number,
): Missao | null {
  const arquivo = casosDoArquivo(estado, conteudo);
  const original = arquivo[Math.floor(sorteio * arquivo.length)];
  return original ? reverCaso(original) : null;
}
