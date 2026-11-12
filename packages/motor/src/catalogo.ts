import type { TipoPenal, TipoPenalId } from "./tipos";

/**
 * Tipos penais desta versão: só o tipo básico (R-GER-02). Espelha a tabela da seção 7
 * de docs/regras-penais.md.
 */
export const TIPOS_PENAIS: readonly TipoPenal[] = [
  {
    // R-PAT-01
    id: "furto",
    nome: "Furto",
    artigo: "CP, art. 155",
    texto: "Subtrair, para si ou para outrem, coisa alheia móvel.",
    regra: "R-PAT-01",
    exige: ["subtracao", "coisa_alheia_movel"],
    consumaCom: ["inversao_da_posse"],
    admiteCulpa: false,
    regrasDaConsumacao: ["R-ITER-05"],
  },
  {
    // R-PAT-02
    id: "roubo",
    nome: "Roubo",
    artigo: "CP, art. 157",
    texto:
      "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa.",
    regra: "R-PAT-02",
    exige: ["subtracao", "coisa_alheia_movel", "violencia_ou_grave_ameaca"],
    consumaCom: ["inversao_da_posse"],
    admiteCulpa: false,
    regrasDaConsumacao: ["R-ITER-05"],
  },
  {
    // R-PAT-03
    id: "dano",
    nome: "Dano",
    artigo: "CP, art. 163",
    texto: "Destruir, inutilizar ou deteriorar coisa alheia.",
    regra: "R-PAT-03",
    exige: ["dano_a_coisa_alheia"],
    consumaCom: ["coisa_danificada"],
    admiteCulpa: false,
    regrasDaConsumacao: [],
  },
  {
    // R-PAT-04
    id: "apropriacao_indebita",
    nome: "Apropriação indébita",
    artigo: "CP, art. 168",
    texto: "Apropriar-se de coisa alheia móvel, de que tem a posse ou a detenção.",
    regra: "R-PAT-04",
    exige: ["coisa_alheia_movel", "posse_previa_licita", "apropriacao"],
    consumaCom: ["apropriacao"],
    admiteCulpa: false,
    regrasDaConsumacao: [],
  },
  {
    // R-PAT-05
    id: "estelionato",
    nome: "Estelionato",
    artigo: "CP, art. 171",
    texto:
      "Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil ou qualquer outro meio fraudulento.",
    regra: "R-PAT-05",
    exige: ["fraude", "busca_de_vantagem_ilicita"],
    consumaCom: ["vitima_em_erro", "vantagem_obtida"],
    admiteCulpa: false,
    regrasDaConsumacao: [],
  },
  {
    // R-PES-01
    id: "lesao_corporal",
    nome: "Lesão corporal",
    artigo: "CP, art. 129",
    texto: "Ofender a integridade corporal ou a saúde de outrem.",
    regra: "R-PES-01",
    exige: ["ofensa_a_integridade_corporal"],
    consumaCom: ["lesao_produzida"],
    admiteCulpa: true,
    regrasDaConsumacao: [],
  },
];

export function tipoPenal(id: TipoPenalId): TipoPenal {
  const tipo = TIPOS_PENAIS.find((t) => t.id === id);
  if (!tipo) throw new Error(`Tipo penal desconhecido: ${id}`);
  return tipo;
}
