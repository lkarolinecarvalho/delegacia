/**
 * Índice das regras de docs/regras-penais.md, para a UI citar a regra e a fonte. O teste
 * `cobertura-regras.test.ts` confere se o índice e o documento têm os mesmos IDs.
 */
export interface Regra {
  readonly id: string;
  readonly titulo: string;
  /** Lei, súmula ou tese. "Doutrina" quando não há texto legal. */
  readonly fonte: string;
  readonly resumo: string;
  /** Há posições diferentes; o resumo diz a que o jogo adota (ADR-0004). */
  readonly divergencia?: true;
  /** Simplificação didática: a UI mostra como nota didática. */
  readonly simplificacao?: true;
}

const r = (
  id: string,
  titulo: string,
  fonte: string,
  resumo: string,
  marcas: { divergencia?: true; simplificacao?: true } = {},
): Regra => ({ id, titulo, fonte, resumo, ...marcas });

export const REGRAS: readonly Regra[] = [
  r(
    "R-GER-01",
    "O fato chega apurado",
    "Regra do jogo",
    "O que está no cartão do caso é o que aconteceu. Na vida real, apurar o fato é o trabalho do inquérito.",
    { simplificacao: true },
  ),
  r(
    "R-GER-02",
    "Só o tipo básico",
    "Regra do jogo",
    "Por enquanto o jogo classifica pelo tipo básico. Qualificadoras, privilégios e causas de aumento vêm depois.",
    { simplificacao: true },
  ),
  r(
    "R-GER-03",
    "A ordem da análise",
    "Doutrina",
    "Primeiro o fato típico, depois a ilicitude, depois a culpabilidade. Uma etapa só é analisada se a anterior foi superada.",
  ),
  r(
    "R-LEG-01",
    "Princípio da legalidade",
    "CP, art. 1º; CF, art. 5º, XXXIX",
    "Não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal. Fato que não se ajusta a nenhum tipo penal é atípico.",
  ),
  r(
    "R-LEG-02",
    "Ilícito civil não é crime",
    "CF, art. 5º, LXVII",
    "Não pagar uma dívida é ilícito civil, não crime. Não há prisão civil por dívida, salvo a do devedor de alimentos.",
  ),
  r(
    "R-CRIME-01",
    "Conceito analítico de crime",
    "Doutrina majoritária",
    "Crime é o fato típico, ilícito e culpável (teoria tripartida). Há quem adote a bipartida; o jogo segue a tripartida.",
    { divergencia: true },
  ),
  r(
    "R-PJ-01",
    "Polícia judiciária",
    "CF, art. 144, § 4º; CPP, art. 4º",
    "Às polícias civis, dirigidas por delegados de carreira, cabem a polícia judiciária e a apuração das infrações penais, exceto as militares.",
  ),
  r(
    "R-PJ-02",
    "Inquérito policial",
    "CPP, arts. 4º e 17",
    "No inquérito a autoridade policial reúne os elementos sobre o fato e a autoria. Ela não pode mandar arquivar os autos.",
  ),
  r(
    "R-TIP-01",
    "Fato típico",
    "Doutrina",
    "O fato é típico quando a conduta se ajusta a todos os elementos de um tipo penal. Elementos: conduta, resultado, nexo causal e tipicidade.",
  ),
  r(
    "R-TIP-02",
    "Especialidade",
    "Doutrina",
    "Se a conduta se ajusta a mais de um tipo, prevalece o mais específico: subtrair com violência ou grave ameaça é roubo, não furto.",
  ),
  r(
    "R-DOLO-01",
    "Crime doloso",
    "CP, art. 18, I",
    "O agente quis o resultado ou assumiu o risco de produzi-lo.",
  ),
  r(
    "R-CULPA-01",
    "Crime culposo",
    "CP, art. 18, II",
    "O agente deu causa ao resultado por imprudência, negligência ou imperícia.",
  ),
  r(
    "R-CULPA-02",
    "A culpa é exceção",
    "CP, art. 18, parágrafo único",
    "Só se pune a forma culposa quando a lei a prevê expressamente. Sem essa previsão, a conduta culposa é atípica.",
  ),
  r(
    "R-CULPA-03",
    "Sem dolo e sem culpa",
    "Doutrina",
    "Sem dolo e sem culpa não há conduta penalmente relevante: o fato é atípico.",
  ),
  r(
    "R-ITER-01",
    "Crime consumado",
    "CP, art. 14, I",
    "O crime está consumado quando nele se reúnem todos os elementos de sua definição legal.",
  ),
  r(
    "R-ITER-02",
    "Tentativa",
    "CP, art. 14, II e parágrafo único",
    "Iniciada a execução, o crime não se consuma por circunstâncias alheias à vontade do agente. Em regra, a pena é a do consumado, diminuída de um a dois terços.",
  ),
  r(
    "R-ITER-03",
    "Atos preparatórios",
    "CP, art. 14, II (a contrario)",
    "Sem início de execução não há tentativa. Cogitação e atos preparatórios, em regra, não são puníveis.",
    { simplificacao: true },
  ),
  r(
    "R-ITER-04",
    "Culposo não admite tentativa",
    "Doutrina",
    "Na culpa o agente não quer o resultado; por isso não se fala em tentativa de crime culposo.",
  ),
  r(
    "R-ITER-05",
    "Consumação do furto e do roubo",
    "Súmula 582 do STJ; STJ, Tema 934",
    "Furto e roubo consumam-se com a inversão da posse, ainda que por pouco tempo e com perseguição imediata. Não é preciso posse mansa e pacífica.",
    { divergencia: true },
  ),
  r(
    "R-ITER-06",
    "Desistência voluntária e arrependimento eficaz",
    "CP, art. 15",
    "Ainda fora do jogo.",
  ),
  r(
    "R-ILI-01",
    "Excludentes de ilicitude",
    "CP, art. 23",
    "Não há crime quando o fato é praticado em estado de necessidade, em legítima defesa, em estrito cumprimento de dever legal ou no exercício regular de direito.",
  ),
  r(
    "R-ILI-02",
    "Excesso punível",
    "CP, art. 23, parágrafo único",
    "O agente responde pelo excesso doloso ou culposo. No jogo, por enquanto, a falta de um requisito afasta a excludente por inteiro.",
    { simplificacao: true },
  ),
  r(
    "R-ILI-03",
    "Dever legal e exercício regular de direito",
    "CP, art. 23, III",
    "Aparecem na teoria; o motor ainda não os analisa.",
  ),
  r(
    "R-LD-01",
    "Legítima defesa",
    "CP, art. 25",
    "Quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.",
  ),
  r(
    "R-LD-02",
    "Agressão que já cessou",
    "CP, art. 25",
    "A agressão precisa ser atual ou iminente. Reagir depois que ela acabou é vingança, não defesa.",
  ),
  r(
    "R-EN-01",
    "Estado de necessidade",
    "CP, art. 24",
    "Quem pratica o fato para salvar de perigo atual, que não provocou por sua vontade nem podia de outro modo evitar, direito próprio ou alheio, cujo sacrifício não era razoável exigir.",
  ),
  r(
    "R-EN-02",
    "Dever legal de enfrentar o perigo",
    "CP, art. 24, § 1º",
    "Não pode alegar estado de necessidade quem tinha o dever legal de enfrentar o perigo.",
  ),
  r(
    "R-CULP-01",
    "Menoridade penal",
    "CP, art. 27; CF, art. 228; ECA, art. 104",
    "Os menores de 18 anos são penalmente inimputáveis e ficam sujeitos à legislação especial. Vale a idade na data do fato.",
  ),
  r(
    "R-CULP-02",
    "Ato infracional",
    "ECA, art. 103",
    "É a conduta descrita como crime ou contravenção penal, praticada por criança ou adolescente.",
  ),
  r(
    "R-CULP-03",
    "Embriaguez voluntária ou culposa",
    "CP, art. 28, I e II",
    "A embriaguez voluntária ou culposa não exclui a imputabilidade. A emoção e a paixão também não.",
  ),
  r(
    "R-CULP-04",
    "Embriaguez completa e fortuita",
    "CP, art. 28, § 1º",
    "É isento de pena quem, por embriaguez completa vinda de caso fortuito ou força maior, era inteiramente incapaz de entender o caráter ilícito do fato.",
  ),
  r(
    "R-CULP-05",
    "Outras causas de exclusão da culpabilidade",
    "CP, arts. 21, 22 e 26",
    "Ainda fora do jogo.",
  ),
  r("R-PAT-01", "Furto", "CP, art. 155", "Subtrair, para si ou para outrem, coisa alheia móvel."),
  r(
    "R-PAT-02",
    "Roubo",
    "CP, art. 157",
    "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa.",
  ),
  r(
    "R-PAT-03",
    "Dano",
    "CP, art. 163",
    "Destruir, inutilizar ou deteriorar coisa alheia. Não há forma culposa.",
  ),
  r(
    "R-PAT-04",
    "Apropriação indébita",
    "CP, art. 168",
    "Apropriar-se de coisa alheia móvel, de que tem a posse ou a detenção.",
  ),
  r(
    "R-PAT-05",
    "Estelionato",
    "CP, art. 171",
    "Obter vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante meio fraudulento.",
  ),
  r(
    "R-PAT-06",
    "Furto × apropriação indébita",
    "CP, arts. 155 e 168",
    "No furto o agente tira a coisa de quem a tem. Na apropriação indébita ele já tinha a posse lícita e depois passa a agir como dono.",
    { simplificacao: true },
  ),
  r(
    "R-PAT-07",
    "Furto × estelionato",
    "CP, arts. 155 e 171",
    "No estelionato a própria vítima, enganada, entrega a vantagem. No furto a coisa é tirada sem que ela a entregue.",
  ),
  r(
    "R-PES-01",
    "Lesão corporal",
    "CP, art. 129",
    "Ofender a integridade corporal ou a saúde de outrem. Há forma culposa (§ 6º).",
  ),
];

export function regra(id: string): Regra {
  const encontrada = REGRAS.find((x) => x.id === id);
  if (!encontrada) throw new Error(`Regra desconhecida: ${id}`);
  return encontrada;
}

export function existeRegra(id: string): boolean {
  return REGRAS.some((x) => x.id === id);
}
