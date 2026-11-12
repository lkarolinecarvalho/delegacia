# Fluxo de afirmativas (Certo/Errado)

O estudo ativo acontece respondendo afirmativas no estilo de banca. O desafio é
**dosar**: a afirmativa reforça o que o jogador acabou de decidir, sem transformar o
jogo numa prova. O fluxo é o mesmo do cidade-contabil.

## 1. Princípios

1. **O caso vem primeiro.** Ouvir → analisar e decidir → então a afirmativa, ligada ao
   caso concreto.
2. **Limite por caso.** No máximo **2 afirmativas** num caso comum.
3. **Repetição espaçada decide o que aparece.** O que o jogador domina aparece menos; o
   que ele erra volta depois, em outro caso e com outra redação.
4. **Volume é opcional.** Baterias longas só na Biblioteca → Revisão.
5. **Toda resposta explica** e cita a regra de `regras-penais.md`, com a fonte.

## 2. Momentos de disparo

| Momento | Quantidade |
|---|---|
| Após um caso | 0–2 |
| Fim de capítulo (ainda não implementado) | 2–4 |
| Revisão (opcional) | sob demanda |

Quando nenhum conceito do caso está "vencido" no espaçamento, o caso pode terminar
**sem afirmativa**. Isso é desejável.

## 3. Seleção

1. Liste os conceitos do caso (cada afirmativa tem `conceitoId`).
2. Filtre pelas afirmativas com `nivelMin ≤ nível da missão`.
3. Priorize os conceitos vencidos (caixa mais baixa, revisão mais atrasada).
4. Dentro do conceito, escolha a variante menos vista.
5. Respeite o limite do momento.

## 4. Repetição espaçada (Leitner simplificado)

- Cada conceito fica numa **caixa de 1 a 5**. Conceito novo começa na caixa 1.
- Acerto → sobe uma caixa. Erro → volta para a caixa 1.
- Intervalo até a próxima cobrança, em **plantões**: caixa 1 = 0, 2 = 1, 3 = 3, 4 = 7,
  5 = 15. São parâmetros de balanceamento.
- A tela de Progresso mostra a força de cada conceito.

## 5. Modo banca (opcional)

Chave em Configurações, desligada por padrão.

- **Desligado:** acerto dá pontos; erro mostra a explicação; sem penalidade.
- **Ligado (estilo CEBRASPE):** acerto +1, erro −1, branco 0. Aparece a opção "Deixar em
  branco".
- O modo banca não muda a repetição espaçada (branco conta como "não sabe").

## 6. Redação

- Afirmativas curtas, uma ideia por afirmativa.
- Pegadinhas clássicas: "sempre/nunca", troca de requisitos, "não há crime" × "isento de
  pena", excludente de ilicitude × de culpabilidade, lei × súmula.
- Cada conceito tem **pelo menos 3 variantes**, certas e erradas.
- A explicação diz **por que**, em até duas frases.
- **Diga a base.** Quando a resposta depende de súmula, tese ou doutrina, o enunciado
  diz ("segundo o STJ…", "para a doutrina majoritária…") e a regra citada traz a
  marcação ⚖️ (ADR-0004).
