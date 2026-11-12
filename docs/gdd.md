# GDD — Delegacia (v0.1)

## 1. Visão

Um jogo de delegacia em que cada caso que chega vira estudo ativo de Direito Penal. O
jogador decide como um(a) delegado(a) decide: olha o fato, aplica a teoria do crime e a
lei, e vê a consequência jurídica da decisão.

## 2. Público e tom

- **Principal:** concurseiros de carreiras policiais (Delegado, Escrivão, Agente e
  Investigador das polícias civis; Polícia Federal; PRF).
- **Secundário:** estudantes de Direito e concurseiros com Penal no edital.
- Terminologia do Código Penal, do CPP e das leis especiais. Afirmativas no estilo de
  banca, com as pegadinhas clássicas, sempre com explicação e fonte.
- Tom sóbrio e respeitoso (ADR-0005).

## 3. Plataforma

- Celular, **tela em retrato**. A delegacia é um prédio térreo, visto de cima e em
  corte, no meio do terreno, com o pátio das viaturas e a rua. Tocar numa sala faz o
  avatar andar até lá, pelo saguão e pelas portas, e então o painel abre.
- Roda no navegador durante o desenvolvimento; será empacotado com Capacitor.
- Offline, com progresso local (persistência fica para o marco final).

## 4. Pilares

1. **O Direito Penal é a mecânica.** Toda decisão do jogador é uma decisão jurídica, com
   resposta certa calculada pelo motor a partir da lei.
2. **Decidir antes de responder.** O caso vem primeiro; a afirmativa vem depois, sobre o
   que o jogador acabou de decidir.
3. **Do zero, um conceito por vez.** Nada é cobrado antes de ser apresentado
   (ADR-0003). Dar nome ao crime é a última habilidade, não a primeira.
4. **Rigor técnico.** Nada que o concurseiro aprenda aqui pode estar errado na prova.
   Lei, jurisprudência e doutrina são identificadas como tais (ADR-0004).
5. **O erro tem consequência.** Decisão errada mostra o que aconteceria: prisão
   relaxada, inquérito trancado, fato impune.

## 5. O jogador e os personagens

- **Avatar:** delegado(a) de polícia recém-empossado(a), no primeiro mês de exercício
  na Delegacia de Vila Serena (cidade fictícia).
- **Dra. Helena**, delegada titular: a mentora da teoria. Apresenta cada conceito novo.
- **Seu Bento**, escrivão veterano: o mentor do procedimento. Traz os casos do plantão
  e comenta os erros.
- **Agente Rocha:** chega com a viatura e os conduzidos.
- **Dona Cida**, da recepção: atende quem vem registrar ocorrência.
- Vítimas, testemunhas e conduzidos mudam a cada caso; alguns voltam.

## 6. A delegacia

| Sala | Onde fica | Função no jogo |
|---|---|---|
| Recepção | Saguão, logo na entrada | Registro de ocorrência; quem chega pelo balcão |
| Sala de oitiva | Ao lado do saguão | Ouvir vítima, testemunha e conduzido |
| Gabinete | Fundo | Dra. Helena; conversas de teoria e decisões |
| Cartório | Fundo | Seu Bento; casos do plantão e o quadro de presos e de prazos |

São só essas quatro salas no mapa. A Biblioteca é um atalho da barra de baixo, e não há
carceragem: os presos do dia aparecem no quadro do cartório.

O avatar chega pelo **pátio**, onde ficam as viaturas. Do outro lado da rua está o
**Fórum**, por enquanto só cenário (Parte IV). O IML e o Ministério Público aparecem só
na narrativa.

**De dentro da sala.** Ao chegar a uma sala, a tela se aproxima dela e mostra o cartão
da sala, com a missão que espera ali (se houver) e o botão para voltar ao mapa.

## 7. Ciclo de um caso

1. **Ir até a sala** indicada pelo aviso de próximo destino. A tela mostra a sala por
   dentro, e o cartão dela traz o botão para começar.
2. **Aula** (só na primeira vez de um conceito): a Dra. Helena fala em balões, uma ideia
   por vez, e o jogador vai passando. Sem texto corrido.
   Em seguida vem a **fixação**: as perguntas de Certo ou Errado da aula, uma por vez.
3. **Ouvir:** até três falas curtas.
4. **O fato apurado:** o cartão do caso, com o que ficou provado.
5. **A ficha de análise:** o jogador responde só as etapas já ensinadas; as demais vêm
   preenchidas pelo mentor (seção 9).
6. **Afirmativas:** de 0 a 2, sobre os conceitos do caso.
7. **Desfecho:** o que aconteceu com o caso, pontos e avanço do plantão.

## 8. A ficha de análise

É o "lançamento" deste jogo. Segue a ordem da teoria do crime:

| Etapa | Pergunta | Entra em |
|---|---|---|
| Fato típico | O fato se ajusta a algum tipo penal? | Cap. 1 |
| Forma | Consumado ou tentado? | Cap. 2 |
| Ilicitude | Há excludente de ilicitude? | Cap. 3 |
| Culpabilidade | O agente é culpável? | Cap. 4 |
| Tipo penal | Qual é o crime? | Cap. 5 |
| Conclusão | Crime, fato atípico, fato lícito, ato infracional, isenção de pena | desde o cap. 1 |
| Ação penal | Incondicionada, condicionada ou privada? | Cap. 6 |
| Instauração | A delegacia pode agir agora? | Cap. 6 |
| Rito | Termo circunstanciado ou inquérito? | Cap. 6 |
| Flagrante | Há flagrante? De que espécie? | Cap. 7 |
| Fiança | Quem pode conceder? | Cap. 7 |
| Prazo | Dez ou trinta dias para concluir o inquérito? | Cap. 10 |
| Figura | Simples ou qualificado? | Ronda 1 |

A ficha do jogador é comparada com a análise do motor e nunca é gravada (ADR-0002).
Ao errar, o jogador vê a etapa errada, a regra e o comentário do mentor, e tenta de novo.
Nas etapas da fase policial aparece também a **prévia do erro**: o que aconteceria se a
decisão errada fosse tomada (prisão ilegal relaxada, inquérito nulo, fiança inválida).

## 9. Progressão e níveis de ajuda

O campo **tipo penal** tem três níveis de ajuda, como o lançamento no cidade-contabil:

| Nível | Como aparece | Onde |
|---|---|---|
| Informado | O mentor diz qual é o crime e por quê | Parte I, cap. 1–4 |
| Sugerido | O jogador escolhe entre poucos tipos já estudados | Parte I, cap. 5 em diante |
| Livre | O jogador busca no Código inteiro já desbloqueado | Parte II em diante |

As partes da campanha estão em [campanha.md](campanha.md). O jogo é longo, mas finito:
a Parte Especial do Código Penal e as leis especiais entram como **rondas temáticas**
(um título do Código por ronda) e, depois, no **plantão livre**.

## 10. Tempo de jogo

- Calendário em **plantões** (dias). Nesta versão, cada caso concluído encerra o
  plantão (parâmetro provisório de balanceamento).
- A repetição espaçada usa esse calendário.
- O **cartório** guarda o quadro da delegacia: os presos do dia (que ficam até a
  audiência de custódia, no plantão seguinte) e os inquéritos, com o prazo de dez ou de
  trinta dias correndo. Relatar no prazo vale pontos; a placa do cartório avisa quando
  um prazo está no fim.
- Depois do primeiro caso, o **plantão livre** (em Casos) sorteia um caso do arquivo
  para ser refeito sem ajuda.

## 11. Estudo

Igual ao cidade-contabil ([fluxo-afirmativas.md](fluxo-afirmativas.md)): afirmativas
Certo/Errado dosadas, repetição espaçada por conceito (Leitner) e modo banca opcional.
A Biblioteca reúne Teoria (temas já vistos), Código (tipos e regras já apresentados),
Revisão (bateria dos conceitos vencidos) e Progresso.

## 12. HUD (retrato)

- Topo: retrato, cargo, pontos e plantão; engrenagem (som e modo banca).
- Abaixo, o aviso do próximo destino ("Vá ao Gabinete").
- A delegacia e o terreno ocupam a tela inteira, por baixo do HUD; a sala do próximo
  passo tem um indicador.
- Atalhos inferiores: Casos (a campanha por capítulo), Biblioteca e Progresso.

## 13. Ainda fora desta versão

Persistência, empacotamento mobile, conta online, arte final, narração, prazos correndo,
carceragem funcional, desafios da Biblioteca e a prévia do erro com desfecho no Fórum.
