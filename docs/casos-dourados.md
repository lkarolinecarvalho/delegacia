# Casos dourados — Parte I (capítulos 1 a 5)

Os casos da campanha e a análise que o motor **precisa** devolver para cada um. O teste
`packages/content/src/campanha.test.ts` confere esta tabela contra as missões.

Colunas: *tipo* é o tipo penal a que o fato se ajusta (mesmo quando a análise para
antes); *forma*, *excludente* e *culpabilidade* ficam em branco quando a etapa não chega
a ser analisada (R-GER-03).

| Missão | Fato apurado (resumo) | Típico | Tipo | Forma | Excludente | Culpabilidade | Conclusão | Regras principais |
|---|---|---|---|---|---|---|---|---|
| m104-divida-do-vizinho | Vizinho pegou R$ 800 emprestados e não pagou no prazo | não | — | — | — | — | fato atípico | R-LEG-01, R-LEG-02 |
| m201-bicicleta | Adulto levou a bicicleta alheia da calçada e foi para casa com ela | sim | furto | consumado | nenhuma | culpável | crime | R-PAT-01, R-ITER-01 |
| m202-mao-na-bolsa | Adulto enfiou a mão na bolsa da vítima no ponto de ônibus e foi segurado antes de tirar a carteira | sim | furto | tentado | nenhuma | culpável | crime | R-ITER-02 |
| m203-vaso-da-vizinha | Ao manobrar o carro, por descuido, derrubou e quebrou o vaso da vizinha | não | (dano) | — | — | — | fato atípico | R-CULPA-02, R-PAT-03 |
| m204-bolsa-na-praca | Com ameaça de faca, tomou a bolsa; correu com ela e foi preso duas quadras depois | sim | roubo | consumado | nenhuma | culpável | crime | R-PAT-02, R-TIP-02, R-ITER-05 |
| m301-briga-na-feira | Feirante, atacado a socos, empurrou o agressor, que caiu e se feriu | sim | lesão corporal | consumado | legítima defesa | — | fato lícito | R-LD-01, R-ILI-01 |
| m302-carro-no-sol | Quebrou o vidro do carro para tirar um bebê trancado sob sol forte | sim | dano | consumado | estado de necessidade | — | fato lícito | R-EN-01, R-ILI-01 |
| m303-revanche | Uma hora depois de apanhar, voltou e feriu o agressor, que já estava em casa | sim | lesão corporal | consumado | nenhuma | culpável | crime | R-LD-02 |
| m401-garoto-do-mercado | Adolescente de 17 anos saiu do mercado com um fone de ouvido sem pagar | sim | furto | consumado | nenhuma | menoridade | ato infracional | R-CULP-01, R-CULP-02 |
| m402-noite-do-bar | Adulto que bebeu por vontade própria feriu outro freguês com uma garrafa | sim | lesão corporal | consumado | nenhuma | culpável | crime | R-CULP-03 |
| m501-celular-emprestado | Recebeu o celular emprestado por uma semana; depois resolveu ficar com ele e o vendeu | sim | apropriação indébita | consumado | nenhuma | culpável | crime | R-PAT-04, R-PAT-06 |
| m502-bilhete-premiado | Com a história do bilhete premiado, convenceu a vítima a entregar R$ 2.000 | sim | estelionato | consumado | nenhuma | culpável | crime | R-PAT-05, R-PAT-07 |
| m503-saida-do-mercado | Na saída do mercado, exigiu o celular mostrando uma faca e fugiu com ele | sim | roubo | consumado | nenhuma | culpável | crime | R-PAT-02, R-TIP-02 |

## Casos de borda do motor (fora da campanha)

Cobertos em `packages/motor/src/analise.test.ts`:

| Fato | Resultado esperado | Regra |
|---|---|---|
| Subtração planejada, sem início de execução | fato atípico (atos preparatórios) | R-ITER-03 |
| Lesão corporal culposa | típico, consumado, crime | R-CULPA-01, R-PES-01 |
| Lesão culposa "tentada" (sem lesão produzida) | fato atípico | R-ITER-04 |
| Sem dolo e sem culpa | fato atípico | R-CULPA-03 |
| Legítima defesa com meio imoderado | excludente afastada, crime | R-LD-01, R-ILI-02 |
| Estado de necessidade de quem tinha o dever legal de enfrentar o perigo | excludente afastada, crime | R-EN-02 |
| Embriaguez completa por caso fortuito | isento de pena | R-CULP-04 |
| Execução interrompida por vontade própria | `ErroDeFato` (fora do escopo) | R-ITER-06 |
