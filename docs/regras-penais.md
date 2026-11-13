# Regras penais — v0.1

**Fonte da verdade** do motor (`packages/motor`). Cada regra tem um ID, citado no
código, nos testes e nas afirmativas. Caso não coberto aqui = perguntar antes de
implementar; no motor, vira `ErroDeFato`.

Marcações (ADR-0004):

- ⚠️ **VALIDAR** — precisa de revisão por profissional da área antes do lançamento.
- 📘 **SIMPLIFICAÇÃO** — simplificação didática deliberada; o jogo a mostra como "nota
  didática".
- ⚖️ **DIVERGÊNCIA** — há posições diferentes na doutrina ou nos tribunais; a regra diz
  qual o jogo adota e a afirmativa precisa dizer em que base está certa.

Siglas: CP = Código Penal (Decreto-Lei 2.848/1940); CPP = Código de Processo Penal
(Decreto-Lei 3.689/1941); CF = Constituição Federal; ECA = Lei 8.069/1990.

> **Validação.** Toda esta versão foi redigida a partir do texto das leis e ainda **não
> passou por revisão técnica**. Todas as regras estão, na prática, em ⚠️ VALIDAR.

## 1. Premissas gerais

- **R-GER-01** — 📘 O fato chega ao motor como **apurado**: o que está na missão é o que
  aconteceu. O motor não valora prova nem credibilidade de relato.
- **R-GER-02** — 📘 O motor classifica pelo **tipo básico**. Qualificadoras, privilégios,
  causas de aumento e de diminuição entram na Parte II da campanha.
- **R-GER-03** — A análise segue a ordem: fato típico → ilicitude → culpabilidade. Uma
  etapa só é analisada se a anterior foi superada.

## 2. Legalidade e conceito de crime

- **R-LEG-01** — Não há crime sem lei anterior que o defina, nem pena sem prévia
  cominação legal (CP, art. 1º; CF, art. 5º, XXXIX). Fato que não se ajusta a nenhum
  tipo penal é **atípico**, por mais reprovável que pareça.
- **R-LEG-02** — O descumprimento de obrigação civil (dívida, contrato) não é crime por
  si só: é ilícito civil. Não há prisão civil por dívida, salvo a do devedor de
  alimentos (CF, art. 5º, LXVII).
- **R-LEG-03** — **Infração penal** é o gênero; **crime** (ou delito) e **contravenção
  penal** são as espécies. Crime: a lei comina reclusão ou detenção. Contravenção: prisão
  simples ou multa (LICP, art. 1º). A tentativa de contravenção não é punível (LCP,
  art. 4º). 📘 O motor só analisa crimes; a contravenção aparece na teoria e numa
  conversa do capítulo 1.
- **R-CRIME-01** — ⚖️ Conceito analítico: crime é o fato **típico, ilícito e culpável**
  (teoria tripartida, majoritária). Há quem adote a bipartida (fato típico e ilícito, com
  a culpabilidade como pressuposto da pena). O jogo adota a tripartida.
- **R-PJ-01** — Às polícias civis, dirigidas por delegados de polícia de carreira,
  cabem as funções de polícia judiciária e a apuração das infrações penais, exceto as
  militares (CF, art. 144, § 4º). A polícia judiciária apura as infrações penais e a sua
  autoria (CPP, art. 4º).
- **R-PJ-02** — O inquérito policial é o procedimento em que a autoridade policial reúne
  os elementos sobre o fato e a autoria. A autoridade policial não pode mandar arquivar
  autos de inquérito (CPP, art. 17).

## 3. Fato típico

- **R-TIP-01** — O fato é típico quando a conduta se ajusta a todos os elementos de um
  tipo penal. Elementos do fato típico: conduta, resultado, nexo causal e tipicidade.
- **R-TIP-02** — Quando a conduta se ajusta a mais de um tipo, prevalece o **mais
  específico** (princípio da especialidade): quem subtrai com violência ou grave ameaça
  comete roubo, não furto.
- **R-DOLO-01** — Crime doloso: o agente quis o resultado ou assumiu o risco de
  produzi-lo (CP, art. 18, I).
- **R-CULPA-01** — Crime culposo: o agente deu causa ao resultado por imprudência,
  negligência ou imperícia (CP, art. 18, II).
- **R-CULPA-02** — Salvo os casos expressos em lei, ninguém pode ser punido por fato
  previsto como crime senão quando o pratica dolosamente (CP, art. 18, parágrafo
  único). Conduta culposa sem previsão de forma culposa é **atípica**.
- **R-CULPA-03** — Sem dolo e sem culpa não há conduta penalmente relevante: o fato é
  atípico.

## 4. Consumação e tentativa

- **R-ITER-01** — O crime é consumado quando nele se reúnem todos os elementos de sua
  definição legal (CP, art. 14, I).
- **R-ITER-02** — O crime é tentado quando, iniciada a execução, não se consuma por
  circunstâncias alheias à vontade do agente (CP, art. 14, II). Salvo disposição em
  contrário, pune-se a tentativa com a pena do crime consumado, diminuída de um a dois
  terços (art. 14, parágrafo único).
- **R-ITER-03** — Sem início de execução não há tentativa: cogitação e atos
  preparatórios, em regra, não são puníveis. 📘 O jogo não trata dos atos preparatórios
  punidos como crime autônomo.
- **R-ITER-04** — Crime culposo não admite tentativa: na culpa o agente não quer o
  resultado (doutrina).
- **R-ITER-05** — ⚖️ Furto e roubo consumam-se com a **inversão da posse** do bem, ainda
  que por breve tempo e seguida de perseguição imediata e recuperação da coisa; não é
  preciso posse mansa, pacífica ou desvigiada (Súmula 582 do STJ, para o roubo; STJ,
  Tema Repetitivo 934, para o furto). É a posição do STJ e do STF; parte da doutrina
  exigia a posse tranquila.
- **R-ITER-06** — Desistência voluntária e arrependimento eficaz (CP, art. 15): **fora
  do escopo desta versão**. O motor recusa o fato.

## 5. Ilicitude

- **R-ILI-01** — Não há crime quando o agente pratica o fato em estado de necessidade,
  em legítima defesa, em estrito cumprimento de dever legal ou no exercício regular de
  direito (CP, art. 23). O fato continua típico, mas é lícito.
- **R-ILI-02** — O agente responde pelo excesso doloso ou culposo (CP, art. 23,
  parágrafo único). 📘 Nesta versão, a falta de qualquer requisito afasta a excludente
  por inteiro; o excesso como figura própria fica para depois.
- **R-LD-01** — Legítima defesa: quem, usando **moderadamente** dos **meios
  necessários**, repele **injusta agressão**, **atual ou iminente**, a **direito seu ou
  de outrem** (CP, art. 25). Todos os requisitos precisam estar presentes.
- **R-LD-02** — Agressão que já cessou não autoriza legítima defesa: a reação posterior
  é vingança, e o fato é ilícito.
- **R-EN-01** — Estado de necessidade: quem pratica o fato para salvar de **perigo
  atual**, que **não provocou por sua vontade** nem **podia de outro modo evitar**,
  **direito próprio ou alheio**, cujo sacrifício, nas circunstâncias, **não era razoável
  exigir-se** (CP, art. 24).
- **R-EN-02** — Não pode alegar estado de necessidade quem tinha o dever legal de
  enfrentar o perigo (CP, art. 24, § 1º).
- **R-ILI-03** — Estrito cumprimento de dever legal e exercício regular de direito:
  citados na teoria; **o motor ainda não os analisa**.

## 6. Culpabilidade

- **R-CULP-01** — Os menores de 18 anos são penalmente inimputáveis e ficam sujeitos às
  normas da legislação especial (CP, art. 27; CF, art. 228; ECA, art. 104). Vale a
  idade na data do fato (ECA, art. 104, parágrafo único).
- **R-CULP-02** — Ato infracional é a conduta descrita como crime ou contravenção penal
  praticada por criança ou adolescente (ECA, art. 103). O adolescente não comete crime
  nem recebe pena: responde por ato infracional.
- **R-CULP-03** — A embriaguez voluntária ou culposa, pelo álcool ou substância de
  efeitos análogos, **não exclui** a imputabilidade (CP, art. 28, II). A emoção e a
  paixão também não (art. 28, I).
- **R-CULP-04** — É isento de pena o agente que, por embriaguez **completa**,
  proveniente de **caso fortuito ou força maior**, era, ao tempo da ação ou da omissão,
  inteiramente incapaz de entender o caráter ilícito do fato ou de determinar-se de
  acordo com esse entendimento (CP, art. 28, § 1º).
- **R-CULP-05** — Doença mental (CP, art. 26), erro de proibição (art. 21), coação moral
  irresistível e obediência hierárquica (art. 22): **fora do escopo desta versão**.

## 7. Tipos penais desta versão

Só o tipo básico (R-GER-02). "Elementos" são as marcas do fato que o motor exige;
"consuma-se" é a marca que separa o consumado do tentado.

| ID | Tipo | Fonte | Elementos | Consuma-se com | Culposo? |
|---|---|---|---|---|---|
| **R-PAT-01** | Furto | CP, art. 155: subtrair, para si ou para outrem, coisa alheia móvel | subtração; coisa alheia móvel | inversão da posse (R-ITER-05) | não |
| **R-PAT-02** | Roubo | CP, art. 157: subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa | subtração; coisa alheia móvel; violência ou grave ameaça à pessoa | inversão da posse (R-ITER-05) | não |
| **R-PAT-03** | Dano | CP, art. 163: destruir, inutilizar ou deteriorar coisa alheia | dano a coisa alheia | coisa danificada | não |
| **R-PAT-04** | Apropriação indébita | CP, art. 168: apropriar-se de coisa alheia móvel, de que tem a posse ou a detenção | coisa alheia móvel; posse ou detenção prévia e lícita; apropriação | apropriação (o agente passa a agir como dono) | não |
| **R-PAT-05** | Estelionato | CP, art. 171: obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil ou qualquer outro meio fraudulento | fraude; busca de vantagem ilícita em prejuízo alheio | vítima em erro e vantagem obtida | não |
| **R-PES-01** | Lesão corporal | CP, art. 129: ofender a integridade corporal ou a saúde de outrem | ofensa à integridade corporal ou à saúde | lesão produzida | sim (art. 129, § 6º) |

Distinções cobradas:

- **R-PAT-06** — Furto × apropriação indébita: no furto o agente **tira** a coisa de
  quem a tem; na apropriação indébita ele **já tinha** a posse ou a detenção de forma
  lícita e depois passa a agir como dono. 📘 Se a intenção de ficar com a coisa já
  existia quando a recebeu, a discussão é outra (estelionato); os casos do jogo dizem
  quando a intenção surgiu.
- **R-PAT-07** — Furto × estelionato: no estelionato a própria vítima, **enganada**,
  entrega a vantagem; no furto a coisa é tirada sem que a vítima a entregue.

## 8. Erro de tipo, concurso de pessoas e qualificadoras

- **R-ERRO-01** — Erro de tipo inevitável. O erro sobre elemento do tipo, quando inevitável, exclui o dolo e a culpa: o fato é atípico. (CP, art. 20; doutrina)
- **R-ERRO-02** — Erro de tipo evitável. O erro sobre elemento do tipo exclui o dolo, mas permite a punição por crime culposo, se previsto em lei. (CP, art. 20)
- **R-CONC-01** — 📘 Concurso de pessoas. Quem, de qualquer modo, concorre para o crime incide nas penas a este cominadas, na medida de sua culpabilidade. No jogo, por enquanto, só na teoria. (CP, art. 29)
- **R-QUAL-01** — Qualificadoras. A qualificadora muda os limites da pena do crime. Basta uma circunstância qualificadora para o crime ser qualificado. (Doutrina)

## 9. Tipos penais da Parte Especial (rondas)

O motor conhece 22 tipos, em três títulos do Código Penal. A tabela completa, com os
elementos, a pena máxima e a ação penal de cada um, é `packages/motor/src/catalogo.ts`.
As formas qualificadas cobertas são o furto qualificado e o homicídio qualificado.

### Crimes contra a pessoa

- **R-PES-03** — 📘 Ameaça. Ameaçar alguém de causar-lhe mal injusto e grave. Em regra, a ação depende de representação. (CP, art. 147)
- **R-PES-04** — Calúnia. Imputar a alguém, falsamente, fato definido como crime. (CP, art. 138)
- **R-PES-05** — Difamação. Imputar a alguém fato ofensivo à sua reputação, verdadeiro ou não. (CP, art. 139)
- **R-PES-06** — Injúria. Ofender a dignidade ou o decoro de alguém. Não há imputação de fato: há xingamento ou qualidade negativa. (CP, art. 140)
- **R-PES-07** — Homicídio. Matar alguém. Há forma culposa (§ 3º). (CP, art. 121)
- **R-PES-08** — 📘 Homicídio qualificado. O homicídio é qualificado, entre outras hipóteses, pelo motivo torpe ou fútil, pelo meio cruel e pelo recurso que dificulte a defesa da vítima. É crime hediondo. (CP, art. 121, § 2º; Lei 8.072/90, art. 1º, I)
- **R-PES-09** — 📘 Calúnia × difamação × injúria. Calúnia: fato falso definido como crime. Difamação: fato ofensivo à reputação. Injúria: ofensa à dignidade, sem fato. Calúnia e difamação atingem a honra objetiva e consumam-se quando terceiro toma conhecimento; a injúria, quando a vítima toma. Em regra, a ação é privada. (CP, arts. 138 a 140 e 145)

### Crimes contra o patrimônio

- **R-PAT-08** — 📘 Furto qualificado. O furto é qualificado se cometido com destruição ou rompimento de obstáculo, com abuso de confiança, mediante fraude, escalada ou destreza, com emprego de chave falsa ou mediante concurso de duas ou mais pessoas. (CP, art. 155, § 4º)
- **R-PAT-09** — Extorsão. Constranger alguém, mediante violência ou grave ameaça, com o intuito de obter indevida vantagem econômica, a fazer, tolerar ou deixar de fazer algo. Consuma-se independentemente da obtenção da vantagem. (CP, art. 158; Súmula 96 do STJ)
- **R-PAT-10** — Receptação. Adquirir, receber, transportar, conduzir ou ocultar coisa que sabe ser produto de crime. (CP, art. 180)
- **R-PAT-11** — Roubo × extorsão. No roubo o agente subtrai a coisa; na extorsão ele depende de um comportamento da vítima, que é constrangida a fazer, tolerar ou deixar de fazer algo. (Doutrina)

### Crimes contra a administração pública

- **R-ADM-01** — Funcionário público. Para os efeitos penais, é quem exerce cargo, emprego ou função pública, ainda que transitoriamente ou sem remuneração. (CP, art. 327)
- **R-ADM-02** — Peculato. Apropriar-se o funcionário público de bem de que tem a posse em razão do cargo, ou desviá-lo. (CP, art. 312)
- **R-ADM-03** — Concussão. Exigir o funcionário público vantagem indevida, em razão da função. Consuma-se com a exigência. (CP, art. 316)
- **R-ADM-04** — Corrupção passiva. Solicitar ou receber o funcionário público vantagem indevida, ou aceitar promessa dela, em razão da função. (CP, art. 317)
- **R-ADM-05** — Corrupção ativa. Oferecer ou prometer vantagem indevida a funcionário público, para determiná-lo a praticar, omitir ou retardar ato de ofício. É crime do particular. (CP, art. 333)
- **R-ADM-06** — Prevaricação. Retardar ou deixar de praticar ato de ofício, ou praticá-lo contra a lei, para satisfazer interesse ou sentimento pessoal. (CP, art. 319)
- **R-ADM-07** — Resistência. Opor-se à execução de ato legal, mediante violência ou ameaça a funcionário competente. (CP, art. 329)
- **R-ADM-08** — Desobediência. Desobedecer a ordem legal de funcionário público. (CP, art. 330)
- **R-ADM-09** — Desacato. Desacatar funcionário público no exercício da função ou em razão dela. (CP, art. 331)
- **R-ADM-10** — Concussão × corrupção passiva. Na concussão o funcionário exige; na corrupção passiva ele solicita, recebe ou aceita promessa. (CP, arts. 316 e 317)

Penas máximas e ação penal usadas pelo motor (⚠️ conferir todas na lei vigente):

| Tipo | Pena máxima | Ação penal |
|---|---|---|
| Furto (155) / qualificado (§ 4º) | 4 anos / 8 anos | pública incondicionada |
| Roubo (157); extorsão (158) | 10 anos | pública incondicionada |
| Dano (163) | 6 meses | privada (art. 167) |
| Apropriação indébita (168); receptação (180) | 4 anos | pública incondicionada |
| Estelionato (171) | 5 anos | 📘 condicionada à representação (§ 5º), sem as exceções |
| Homicídio (121) / qualificado (§ 2º) | 20 anos / 30 anos | pública incondicionada |
| Lesão corporal leve ou culposa (129) | 1 ano | condicionada à representação (Lei 9.099/95, art. 88) |
| Lesão contra a mulher (129, § 13) | 5 anos | pública incondicionada (R-MP-02) |
| Calúnia (138); difamação (139); injúria (140) | 2 anos; 1 ano; 6 meses | 📘 privada (art. 145), sem as exceções |
| Ameaça (147) | 6 meses | 📘 condicionada à representação, sem a exceção da ameaça contra a mulher |
| Peculato, concussão, corrupção passiva e ativa | 12 anos | pública incondicionada |
| Prevaricação (319) | 1 ano | pública incondicionada |
| Resistência (329); desacato (331) | 2 anos | pública incondicionada |
| Desobediência (330) | 6 meses | pública incondicionada |

## 10. A fase policial

A fase policial só é analisada quando há crime (`analisarProcedimento`).

### Ação penal e instauração

- **R-ACAO-01** — Ação penal pública incondicionada. A ação penal é pública, salvo quando a lei a declara privativa do ofendido; e é incondicionada, salvo quando a lei exige representação. (CP, art. 100)
- **R-ACAO-02** — Ação pública condicionada à representação. Nos crimes em que a ação pública depende de representação, o inquérito não pode ser iniciado sem ela. (CPP, art. 5º, § 4º)
- **R-ACAO-03** — Ação penal privada. Nos crimes de ação privada, a autoridade policial só pode instaurar inquérito a requerimento de quem tenha qualidade para intentá-la. (CPP, art. 5º, § 5º)
- **R-ACAO-04** — Decadência. O ofendido decai do direito de queixa ou de representação se não o exerce em seis meses, contados do dia em que soube quem é o autor. A decadência extingue a punibilidade. (CPP, art. 38; CP, arts. 103 e 107, IV)

### Menor potencial ofensivo

- **R-JECRIM-01** — 📘 Infração de menor potencial ofensivo. São as contravenções penais e os crimes a que a lei comine pena máxima não superior a dois anos, cumulada ou não com multa. O jogo usa a pena máxima do tipo, sem causas de aumento ou de diminuição. (Lei 9.099/95, art. 61)
- **R-JECRIM-02** — 📘 Termo circunstanciado. A autoridade policial lavra termo circunstanciado e o encaminha ao Juizado. Ao autor que assume o compromisso de comparecer não se impõe prisão em flagrante nem se exige fiança. O jogo presume esse compromisso. (Lei 9.099/95, art. 69)

### Flagrante

- **R-FLAG-01** — Flagrante próprio. Está em flagrante quem está cometendo a infração penal ou acaba de cometê-la. (CPP, art. 302, I e II)
- **R-FLAG-02** — Flagrante impróprio. Está em flagrante quem é perseguido, logo após, em situação que faça presumir ser o autor da infração. (CPP, art. 302, III)
- **R-FLAG-03** — Flagrante presumido. Está em flagrante quem é encontrado, logo depois, com instrumentos, armas, objetos ou papéis que façam presumir ser ele o autor da infração. (CPP, art. 302, IV)
- **R-FLAG-04** — Sem flagrante, a prisão é ilegal. Ninguém será preso senão em flagrante delito ou por ordem escrita e fundamentada da autoridade judiciária. A prisão ilegal é relaxada pelo juiz. (CF, art. 5º, LXI e LXV; CPP, art. 310, I)
- **R-FLAG-05** — Flagrante preparado. Não há crime quando a preparação do flagrante pela polícia torna impossível a sua consumação. Por enquanto, só na teoria. (Súmula 145 do STF)
- **R-FLAG-06** — Depois da prisão em flagrante. A prisão é comunicada imediatamente ao juiz, ao Ministério Público e à família do preso. Em até 24 horas, o auto vai ao juiz e o preso recebe a nota de culpa; a audiência de custódia também é feita em até 24 horas. (CPP, arts. 306 e 310)

### Fiança

- **R-FIANCA-01** — 📘 Fiança concedida pelo delegado. A autoridade policial só pode conceder fiança nas infrações cuja pena privativa de liberdade máxima não seja superior a quatro anos. O jogo presume que a fiança arbitrada é paga. (CPP, art. 322)
- **R-FIANCA-02** — Fiança concedida pelo juiz. Nos demais casos, a fiança é requerida ao juiz, que decide em 48 horas. (CPP, art. 322, parágrafo único)
- **R-FIANCA-03** — Crimes inafiançáveis. Não se concede fiança no racismo, na tortura, no tráfico de drogas, no terrorismo, nos crimes hediondos e na ação de grupos armados contra a ordem constitucional. (CF, art. 5º, XLII a XLIV; CPP, art. 323)

### Inquérito

- **R-IP-01** — 📘 Prazo do inquérito. O inquérito termina em dez dias se o indiciado está preso e em trinta dias se está solto. Leis especiais têm prazos próprios, ainda fora do jogo. (CPP, art. 10)
- **R-IP-02** — Indiciamento. O indiciamento é ato privativo do delegado de polícia e se dá por ato fundamentado, com análise técnico-jurídica do fato. (Lei 12.830/2013, art. 2º, § 6º)
- **R-IP-03** — Relatório. A autoridade faz minucioso relatório do que foi apurado e envia os autos ao juiz competente. (CPP, art. 10, § 1º)

### Lei Maria da Penha

- **R-MP-01** — Maria da Penha afasta a Lei 9.099. Aos crimes praticados com violência doméstica e familiar contra a mulher, independentemente da pena prevista, não se aplica a Lei 9.099/95: não há termo circunstanciado. (Lei 11.340/06, art. 41)
- **R-MP-02** — Lesão em violência doméstica: ação incondicionada. A ação penal relativa ao crime de lesão corporal resultante de violência doméstica contra a mulher é pública incondicionada. (Súmula 542 do STJ)
- **R-MP-03** — Lesão corporal contra a mulher. Lesão praticada contra a mulher, por razões da condição do sexo feminino: reclusão de dois a cinco anos. Conferir a redação vigente. (CP, art. 129, § 13 (redação da Lei 14.994/2024))
- **R-MP-04** — Medidas protetivas de urgência. A autoridade policial remete ao juiz, em 48 horas, o pedido da ofendida de medidas protetivas de urgência. Por enquanto, só na teoria. (Lei 11.340/06, arts. 12, III, e 18 a 24)

Como o motor decide:

1. **Ação penal:** a do tipo (tabela da seção 9).
2. **Instauração:** na ação incondicionada, o delegado age de ofício. Nas outras, age se a
   vítima já se manifestou; se não, aguarda; passados seis meses do conhecimento da
   autoria sem manifestação, há decadência.
3. **Rito:** termo circunstanciado se a pena máxima não passa de dois anos e a Lei
   9.099 não está afastada; inquérito nos demais casos.
4. **Flagrante:** pela situação em que o autor foi encontrado (art. 302).
5. **Fiança:** só se discute quando há auto de prisão em flagrante (há flagrante, o
   delegado pode agir e não é caso de termo circunstanciado). Inafiançável; delegado, se
   a pena máxima não passa de quatro anos; juiz, nos demais.
6. **Prazo do inquérito:** dez dias se o autor fica preso, trinta se fica solto.

## 11. O que ainda não está aqui

Concurso de crimes; erro de proibição; desistência voluntária; causas de aumento e de
diminuição; penas, dosimetria e prescrição; os demais títulos da Parte Especial; leis
especiais; prisão preventiva e temporária; medidas protetivas como mecânica.
