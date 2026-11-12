# ADRs

| Nº | Decisão |
|---|---|
| 0001 | **Stack: a do cidade-contabil, sem Phaser** |
| 0002 | **A missão declara o fato; a ficha do jogador nunca é gravada** |
| 0003 | **Do zero, uma etapa por capítulo; dar nome ao crime vem por último** |
| 0004 | **Lei, jurisprudência e doutrina: fontes e marcações** |
| 0005 | **Tom e conteúdo sensível** |
| 0006 | **Repositório separado do cidade-contabil** |
| 0007 | **Sem MVP: o jogo é a campanha inteira, em fatias** |

## ADR-0001 — Stack: a do cidade-contabil, sem Phaser

**Contexto.** O cidade-contabil usa Phaser para um mapa de cidade com câmera e
caminhada livre. Aqui o cenário é um prédio térreo com seis salas, o pátio e a rua, e
cabe inteiro na tela.

**Decisão.**
- TypeScript em monorepo pnpm; Vite + React; Zustand; zod; Vitest (+ fast-check); Biome.
- **Sem Phaser.** A delegacia é um SVG gerado em código com as primitivas isométricas do
  cidade-contabil (`arte/iso.ts`). Como lá, o mundo é contínuo: o avatar anda pelos
  caminhos da planta, passa pelas portas e fica atrás do que está à frente dele.
- Uma primeira versão em corte, com dois andares separados e o avatar deslizando de um
  para o outro, foi descartada: não parecia um lugar de verdade.
- Capacitor e persistência ficam para o último marco.

**Consequências.** Uma só árvore de UI, sem event bus. Se o jogo ganhar cenas com
movimento livre (rondas na rua), a decisão é revista.

## ADR-0002 — A missão declara o fato; a ficha do jogador nunca é gravada

Equivale ao ADR-0005 do cidade-contabil.

**Decisão.**
- A missão traz o **fato apurado**, em dados estruturados. Não traz a resposta.
- O motor calcula a análise esperada a partir do fato.
- A ficha do jogador é **comparada** com a análise, etapa por etapa.
- O registro dos casos guarda sempre a análise do motor.
- O motor não valora prova. Fato fora das regras gera `ErroDeFato`.

**Consequências.** Conteúdo novo não escreve gabarito à mão, e uma mudança de regra
corrige todos os casos de uma vez. Os casos precisam ser escritos de modo que o fato
seja inequívoco: a dúvida de prova não é mecânica do jogo.

## ADR-0003 — Do zero, uma etapa por capítulo; dar nome ao crime vem por último

**Contexto.** Pedir ao iniciante "qual é o crime?" logo no começo exige conhecer a
Parte Especial antes da Parte Geral. Mas a Parte Especial precisa estar no jogo, com o
jogador tipificando.

**Decisão.**
1. O jogador não sabe nada. Todo conceito tem aula antes do caso que o usa.
2. A ficha de análise ganha **uma etapa por capítulo** na Parte I: fato típico →
   consumação e tentativa → ilicitude → culpabilidade.
3. O **tipo penal** tem três níveis de ajuda: informado (cap. 1–4), sugerido (a partir
   do cap. 5) e livre (Parte II).
4. A Parte Especial entra como **rondas**, um título do Código por vez, e as leis
   especiais como **operações**. O plantão livre mistura tudo o que já foi desbloqueado.

**Consequências.** Nos capítulos 2 a 4 o jogo usa poucos crimes (furto, roubo, dano,
lesão), apresentados pelo mentor, para o jogador se concentrar na etapa nova. O motor
tipifica desde o começo; o que muda é o que a ficha pergunta.

## ADR-0004 — Lei, jurisprudência e doutrina: fontes e marcações

**Contexto.** A resposta certa pode depender da fonte: a lei seca, uma súmula ou a
doutrina majoritária. As bancas cobram as três, e a lei muda com frequência.

**Decisão.**
- Toda regra de `regras-penais.md` cita a fonte.
- Marcações: ⚠️ VALIDAR, 📘 SIMPLIFICAÇÃO e ⚖️ DIVERGÊNCIA (a regra diz que posição o jogo
  adota).
- Afirmativa baseada em súmula, tese ou doutrina diz isso no enunciado.
- Antes de alterar uma regra, confere-se o texto vigente e registra-se a lei que deu a
  redação atual.

**Consequências.** A UI mostra a fonte ao citar a regra. Nada é publicado com ⚠️ pendente.

## ADR-0005 — Tom e conteúdo sensível

**Decisão.**
- O foco é o raciocínio jurídico e o procedimento, não a violência. Sem detalhe gráfico.
- Vítimas são tratadas com respeito; violência doméstica e crimes sexuais são narrados
  de forma sóbria e indireta.
- Cidade, pessoas e casos são fictícios.
- O jogo não glamouriza o crime nem o abuso de autoridade: os limites do poder de polícia
  fazem parte do conteúdo.

## ADR-0006 — Repositório separado do cidade-contabil

**Decisão.**
- Repositório próprio, com a mesma estrutura (monorepo, docs, ADRs, marcos).
- O código genérico foi **copiado**: primitivas isométricas, bonecos, sons, repetição
  espaçada e seleção de afirmativas.
- Extrair um pacote comum só quando os dois jogos estiverem estáveis.

**Consequências.** Os dois projetos evoluem sem travar um ao outro; correções em código
copiado precisam ser levadas à mão para o outro lado.

## ADR-0007 — Sem MVP: o jogo é a campanha inteira, em fatias

**Decisão.**
- O escopo é Direito Penal (Parte Geral e Especial), Processo Penal e legislação penal
  especial. É longo, mas finito.
- A entrega é em fatias jogáveis ([roadmap.md](../roadmap.md)), não num MVP reduzido.
- Persistência e publicação ficam por último.
