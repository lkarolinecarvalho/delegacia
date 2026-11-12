import type { Conteudo, Missao } from "@delegacia/content";
import {
  analisarFato,
  analisarProcedimento,
  CAMPOS_DA_FICHA,
  esperadoNoCampo,
} from "@delegacia/motor";
import { type EstadoDoJogo, PONTOS_DO_PLANTAO_LIVRE } from "../state/jogo";

/** Quem apresenta os casos do plantão livre. */
const ESCRIVAO = "bento-escrivao";

/** Casos da campanha já concluídos: é deles que o plantão livre sorteia. */
export function casosDoArquivo(estado: EstadoDoJogo, conteudo: Conteudo): Missao[] {
  return conteudo.missoes.filter((m) => m.caso && estado.concluidas.includes(m.id));
}

/**
 * Um caso do plantão livre: um caso já concluído, de volta sem ajuda. O jogador
 * responde a ficha inteira, e o tipo penal é escolhido no Código todo (ADR-0003).
 * `sorteio` vai de 0 (inclusive) a 1 (exclusive).
 */
export function missaoDoPlantaoLivre(
  estado: EstadoDoJogo,
  conteudo: Conteudo,
  sorteio: number,
): Missao | null {
  const arquivo = casosDoArquivo(estado, conteudo);
  const original = arquivo[Math.floor(sorteio * arquivo.length)];
  if (!original?.caso) return null;
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
    npc: ESCRIVAO,
    requisitos: [],
    aulas: [],
    dialogo: [
      {
        npc: ESCRIVAO,
        texto:
          "Plantão livre, doutor(a): tirei um caso do arquivo. Desta vez não adianto nada, a ficha inteira é com o(a) senhor(a).",
      },
    ],
    caso: {
      ...original.caso,
      pede,
      informa: [],
      tipoInformado: false,
      opcoesDeTipo: [],
      comentarios: {},
    },
    recompensa: { pontos: PONTOS_DO_PLANTAO_LIVRE },
  };
}
