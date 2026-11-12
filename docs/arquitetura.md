# Arquitetura

## Camadas

```
apps/game
  React: delegacia em SVG, HUD, painéis e telas
  store do jogo (Zustand): missões concluídas, registro dos casos,
                           plantão (dia), estudo, pontos
  orquestrador de missão e de estudo
        |                         |
  packages/motor            packages/content
  (motor penal puro)        (schemas + dados)
```

- **motor:** catálogo de tipos penais, análise do fato (tipicidade, forma, ilicitude,
  culpabilidade, conclusão), comparação da ficha do jogador e o índice das regras. Sem
  dependências de UI.
- **content:** schemas zod, carregamento e validação de missões, afirmativas, teoria,
  conceitos, personagens e salas.
- **game:** React desenha tudo. A planta da delegacia (`mundo/planta.ts`: salas,
  paredes, caminhos e rotas) é pura; `arte/delegacia.ts` a desenha em SVG com as
  primitivas isométricas herdadas do cidade-contabil. Cada objeto tem uma profundidade,
  e o avatar entra na ordem de desenho por ela. Não há Phaser (ADR-0001).

## Fluxo de um caso

1. O jogador toca na sala do próximo destino; o avatar anda até lá pelos caminhos da
   planta e, ao chegar, o painel abre.
2. Aulas (na primeira vez) e conversa.
3. O orquestrador entrega o **fato** da missão a `motor.analisarFato(fato)`, que devolve
   a análise esperada, **sem gravar nada**.
4. O jogador preenche a ficha com as etapas que a missão pede.
   `motor.compararFicha(analise, ficha)` devolve acerto ou erro por etapa, com as regras.
5. Com a ficha certa, vêm as afirmativas selecionadas pela repetição espaçada.
6. Ao concluir, a store grava **a análise do motor** no registro dos casos. A ficha do
   jogador nunca é gravada (ADR-0002).

## API pública do motor

```ts
analisarFato(fato): Analise              // lança ErroDeFato se o caso não é coberto
compararFicha(analise, ficha): ResultadoDaFicha
TIPOS_PENAIS, tipoPenal(id)              // catálogo (regras-penais.md, seção 7)
REGRAS, regra(id)                        // índice das regras, para citar na UI
```

- `Fato` traz os elementos apurados da conduta, o elemento subjetivo, a execução
  (iniciada; interrompida por quê), a justificante alegada com os seus requisitos e os
  dados do agente (idade, embriaguez).
- `Analise` traz `tipico`, `tipo`, `forma`, `excludente`, `culpabilidade`, `conclusao`,
  os `passos` (um por etapa, com as regras aplicadas) e a lista de `regras`.
- `Ficha` tem as mesmas etapas, todas opcionais: a missão diz quais o jogador responde.

## Estado

- Serializável em JSON. Persistência local fica para o último marco.
- O calendário é um contador de plantões (dias), usado pela repetição espaçada.

## Testes

- `motor`: Vitest, um teste por regra (ID no nome), casos de borda de
  `casos-dourados.md`, testes de propriedade (fast-check) para os invariantes e um teste
  que confere se toda regra de `regras-penais.md` existe no índice do motor.
- `content`: validação de todos os dados e a tabela dourada da campanha.
- `game`: testes do estado e do orquestrador; verificação manual no navegador em
  viewport retrato (390×844).
