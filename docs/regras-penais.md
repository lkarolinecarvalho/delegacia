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

## 8. O que ainda não está aqui

Ação penal, representação e decadência; Lei 9.099/95; flagrante, fiança e audiência de
custódia; inquérito (prazos, indiciamento, relatório); concurso de pessoas e de crimes;
erro de tipo e de proibição; penas, dosimetria e prescrição; o restante da Parte
Especial; leis especiais. Entram com os capítulos correspondentes de
[campanha.md](campanha.md).
