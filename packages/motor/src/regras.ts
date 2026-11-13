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
    "R-LEG-03",
    "Crime e contravenção penal",
    "LICP, art. 1º; LCP, art. 4º",
    "Infração penal é o gênero; crime e contravenção são as espécies. Crime: reclusão ou detenção. Contravenção: prisão simples ou multa, e a tentativa não é punível.",
    { simplificacao: true },
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
  r(
    "R-ERRO-01",
    "Erro de tipo inevitável",
    "CP, art. 20; doutrina",
    "O erro sobre elemento do tipo, quando inevitável, exclui o dolo e a culpa: o fato é atípico.",
  ),
  r(
    "R-ERRO-02",
    "Erro de tipo evitável",
    "CP, art. 20",
    "O erro sobre elemento do tipo exclui o dolo, mas permite a punição por crime culposo, se previsto em lei.",
  ),
  r(
    "R-CONC-01",
    "Concurso de pessoas",
    "CP, art. 29",
    "Quem, de qualquer modo, concorre para o crime incide nas penas a este cominadas, na medida de sua culpabilidade. No jogo, por enquanto, só na teoria.",
    { simplificacao: true },
  ),
  r(
    "R-QUAL-01",
    "Qualificadoras",
    "Doutrina",
    "A qualificadora muda os limites da pena do crime. Basta uma circunstância qualificadora para o crime ser qualificado.",
  ),
  r(
    "R-ACAO-01",
    "Ação penal pública incondicionada",
    "CP, art. 100",
    "A ação penal é pública, salvo quando a lei a declara privativa do ofendido; e é incondicionada, salvo quando a lei exige representação.",
  ),
  r(
    "R-ACAO-02",
    "Ação pública condicionada à representação",
    "CPP, art. 5º, § 4º",
    "Nos crimes em que a ação pública depende de representação, o inquérito não pode ser iniciado sem ela.",
  ),
  r(
    "R-ACAO-03",
    "Ação penal privada",
    "CPP, art. 5º, § 5º",
    "Nos crimes de ação privada, a autoridade policial só pode instaurar inquérito a requerimento de quem tenha qualidade para intentá-la.",
  ),
  r(
    "R-ACAO-04",
    "Decadência",
    "CPP, art. 38; CP, arts. 103 e 107, IV",
    "O ofendido decai do direito de queixa ou de representação se não o exerce em seis meses, contados do dia em que soube quem é o autor. A decadência extingue a punibilidade.",
  ),
  r(
    "R-JECRIM-01",
    "Infração de menor potencial ofensivo",
    "Lei 9.099/95, art. 61",
    "São as contravenções penais e os crimes a que a lei comine pena máxima não superior a dois anos, cumulada ou não com multa. O jogo usa a pena máxima do tipo, sem causas de aumento ou de diminuição.",
    { simplificacao: true },
  ),
  r(
    "R-JECRIM-02",
    "Termo circunstanciado",
    "Lei 9.099/95, art. 69",
    "A autoridade policial lavra termo circunstanciado e o encaminha ao Juizado. Ao autor que assume o compromisso de comparecer não se impõe prisão em flagrante nem se exige fiança. O jogo presume esse compromisso.",
    { simplificacao: true },
  ),
  r(
    "R-FLAG-01",
    "Flagrante próprio",
    "CPP, art. 302, I e II",
    "Está em flagrante quem está cometendo a infração penal ou acaba de cometê-la.",
  ),
  r(
    "R-FLAG-02",
    "Flagrante impróprio",
    "CPP, art. 302, III",
    "Está em flagrante quem é perseguido, logo após, em situação que faça presumir ser o autor da infração.",
  ),
  r(
    "R-FLAG-03",
    "Flagrante presumido",
    "CPP, art. 302, IV",
    "Está em flagrante quem é encontrado, logo depois, com instrumentos, armas, objetos ou papéis que façam presumir ser ele o autor da infração.",
  ),
  r(
    "R-FLAG-04",
    "Sem flagrante, a prisão é ilegal",
    "CF, art. 5º, LXI e LXV; CPP, art. 310, I",
    "Ninguém será preso senão em flagrante delito ou por ordem escrita e fundamentada da autoridade judiciária. A prisão ilegal é relaxada pelo juiz.",
  ),
  r(
    "R-FLAG-05",
    "Flagrante preparado",
    "Súmula 145 do STF",
    "Não há crime quando a preparação do flagrante pela polícia torna impossível a sua consumação. Por enquanto, só na teoria.",
  ),
  r(
    "R-FLAG-06",
    "Depois da prisão em flagrante",
    "CPP, arts. 306 e 310",
    "A prisão é comunicada imediatamente ao juiz, ao Ministério Público e à família do preso. Em até 24 horas, o auto vai ao juiz e o preso recebe a nota de culpa; a audiência de custódia também é feita em até 24 horas.",
  ),
  r(
    "R-FIANCA-01",
    "Fiança concedida pelo delegado",
    "CPP, art. 322",
    "A autoridade policial só pode conceder fiança nas infrações cuja pena privativa de liberdade máxima não seja superior a quatro anos. O jogo presume que a fiança arbitrada é paga.",
    { simplificacao: true },
  ),
  r(
    "R-FIANCA-02",
    "Fiança concedida pelo juiz",
    "CPP, art. 322, parágrafo único",
    "Nos demais casos, a fiança é requerida ao juiz, que decide em 48 horas.",
  ),
  r(
    "R-FIANCA-03",
    "Crimes inafiançáveis",
    "CF, art. 5º, XLII a XLIV; CPP, art. 323",
    "Não se concede fiança no racismo, na tortura, no tráfico de drogas, no terrorismo, nos crimes hediondos e na ação de grupos armados contra a ordem constitucional.",
  ),
  r(
    "R-IP-01",
    "Prazo do inquérito",
    "CPP, art. 10",
    "O inquérito termina em dez dias se o indiciado está preso e em trinta dias se está solto. Leis especiais têm prazos próprios, ainda fora do jogo.",
    { simplificacao: true },
  ),
  r(
    "R-IP-02",
    "Indiciamento",
    "Lei 12.830/2013, art. 2º, § 6º",
    "O indiciamento é ato privativo do delegado de polícia e se dá por ato fundamentado, com análise técnico-jurídica do fato.",
  ),
  r(
    "R-IP-03",
    "Relatório",
    "CPP, art. 10, § 1º",
    "A autoridade faz minucioso relatório do que foi apurado e envia os autos ao juiz competente.",
  ),
  r(
    "R-MP-01",
    "Maria da Penha afasta a Lei 9.099",
    "Lei 11.340/06, art. 41",
    "Aos crimes praticados com violência doméstica e familiar contra a mulher, independentemente da pena prevista, não se aplica a Lei 9.099/95: não há termo circunstanciado.",
  ),
  r(
    "R-MP-02",
    "Lesão em violência doméstica: ação incondicionada",
    "Súmula 542 do STJ",
    "A ação penal relativa ao crime de lesão corporal resultante de violência doméstica contra a mulher é pública incondicionada.",
  ),
  r(
    "R-MP-03",
    "Lesão corporal contra a mulher",
    "CP, art. 129, § 13 (redação da Lei 14.994/2024)",
    "Lesão praticada contra a mulher, por razões da condição do sexo feminino: reclusão de dois a cinco anos. Conferir a redação vigente.",
  ),
  r(
    "R-MP-04",
    "Medidas protetivas de urgência",
    "Lei 11.340/06, arts. 12, III, e 18 a 24",
    "A autoridade policial remete ao juiz, em 48 horas, o pedido da ofendida de medidas protetivas de urgência. Por enquanto, só na teoria.",
  ),
  r(
    "R-PES-03",
    "Ameaça",
    "CP, art. 147",
    "Ameaçar alguém de causar-lhe mal injusto e grave. Em regra, a ação depende de representação.",
    { simplificacao: true },
  ),
  r(
    "R-PES-04",
    "Calúnia",
    "CP, art. 138",
    "Imputar a alguém, falsamente, fato definido como crime.",
  ),
  r(
    "R-PES-05",
    "Difamação",
    "CP, art. 139",
    "Imputar a alguém fato ofensivo à sua reputação, verdadeiro ou não.",
  ),
  r(
    "R-PES-06",
    "Injúria",
    "CP, art. 140",
    "Ofender a dignidade ou o decoro de alguém. Não há imputação de fato: há xingamento ou qualidade negativa.",
  ),
  r("R-PES-07", "Homicídio", "CP, art. 121", "Matar alguém. Há forma culposa (§ 3º)."),
  r(
    "R-PES-08",
    "Homicídio qualificado",
    "CP, art. 121, § 2º; Lei 8.072/90, art. 1º, I",
    "O homicídio é qualificado, entre outras hipóteses, pelo motivo torpe ou fútil, pelo meio cruel e pelo recurso que dificulte a defesa da vítima. É crime hediondo.",
    { simplificacao: true },
  ),
  r(
    "R-PES-09",
    "Calúnia × difamação × injúria",
    "CP, arts. 138 a 140 e 145",
    "Calúnia: fato falso definido como crime. Difamação: fato ofensivo à reputação. Injúria: ofensa à dignidade, sem fato. Calúnia e difamação atingem a honra objetiva e consumam-se quando terceiro toma conhecimento; a injúria, quando a vítima toma. Em regra, a ação é privada.",
    { simplificacao: true },
  ),
  r(
    "R-PAT-08",
    "Furto qualificado",
    "CP, art. 155, § 4º",
    "O furto é qualificado se cometido com destruição ou rompimento de obstáculo, com abuso de confiança, mediante fraude, escalada ou destreza, com emprego de chave falsa ou mediante concurso de duas ou mais pessoas.",
    { simplificacao: true },
  ),
  r(
    "R-PAT-09",
    "Extorsão",
    "CP, art. 158; Súmula 96 do STJ",
    "Constranger alguém, mediante violência ou grave ameaça, com o intuito de obter indevida vantagem econômica, a fazer, tolerar ou deixar de fazer algo. Consuma-se independentemente da obtenção da vantagem.",
  ),
  r(
    "R-PAT-10",
    "Receptação",
    "CP, art. 180",
    "Adquirir, receber, transportar, conduzir ou ocultar coisa que sabe ser produto de crime.",
  ),
  r(
    "R-PAT-11",
    "Roubo × extorsão",
    "Doutrina",
    "No roubo o agente subtrai a coisa; na extorsão ele depende de um comportamento da vítima, que é constrangida a fazer, tolerar ou deixar de fazer algo.",
  ),
  r(
    "R-ADM-01",
    "Funcionário público",
    "CP, art. 327",
    "Para os efeitos penais, é quem exerce cargo, emprego ou função pública, ainda que transitoriamente ou sem remuneração.",
  ),
  r(
    "R-ADM-02",
    "Peculato",
    "CP, art. 312",
    "Apropriar-se o funcionário público de bem de que tem a posse em razão do cargo, ou desviá-lo.",
  ),
  r(
    "R-ADM-03",
    "Concussão",
    "CP, art. 316",
    "Exigir o funcionário público vantagem indevida, em razão da função. Consuma-se com a exigência.",
  ),
  r(
    "R-ADM-04",
    "Corrupção passiva",
    "CP, art. 317",
    "Solicitar ou receber o funcionário público vantagem indevida, ou aceitar promessa dela, em razão da função.",
  ),
  r(
    "R-ADM-05",
    "Corrupção ativa",
    "CP, art. 333",
    "Oferecer ou prometer vantagem indevida a funcionário público, para determiná-lo a praticar, omitir ou retardar ato de ofício. É crime do particular.",
  ),
  r(
    "R-ADM-06",
    "Prevaricação",
    "CP, art. 319",
    "Retardar ou deixar de praticar ato de ofício, ou praticá-lo contra a lei, para satisfazer interesse ou sentimento pessoal.",
  ),
  r(
    "R-ADM-07",
    "Resistência",
    "CP, art. 329",
    "Opor-se à execução de ato legal, mediante violência ou ameaça a funcionário competente.",
  ),
  r(
    "R-ADM-08",
    "Desobediência",
    "CP, art. 330",
    "Desobedecer a ordem legal de funcionário público.",
  ),
  r(
    "R-ADM-09",
    "Desacato",
    "CP, art. 331",
    "Desacatar funcionário público no exercício da função ou em razão dela.",
  ),
  r(
    "R-ADM-10",
    "Concussão × corrupção passiva",
    "CP, arts. 316 e 317",
    "Na concussão o funcionário exige; na corrupção passiva ele solicita, recebe ou aceita promessa.",
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
