# CLAUDE.md — Delegacia

Jogo mobile (tela em **retrato**) para aprender Direito Penal, Processo Penal e
legislação penal especial dentro de uma delegacia. Público: **concurseiros de carreiras
policiais** (principal) e estudantes de Direito. O jogador é um(a) delegado(a) recém-empossado(a):
recebe os casos, analisa o fato pela teoria do crime, decide e responde afirmativas
Certo/Errado no estilo de banca. O Direito Penal é a própria mecânica do jogo.

Projeto irmão do `cidade-contabil` (mesma estrutura de ensino; ver ADR-0006).

## Leia antes de qualquer tarefa

1. `docs/roadmap.md` — marcos e critérios de aceite. Trabalhe um marco por vez.
2. `docs/regras-penais.md` — **fonte da verdade jurídica.**
3. `docs/arquitetura.md` — camadas e fluxo de dados.
4. `docs/gdd.md`, `docs/campanha.md` e `docs/fluxo-afirmativas.md` — design do jogo.
5. `docs/adr/` — decisões já tomadas. Não as reverta sem pedir.

## Regras inegociáveis

### Direito
- **Nunca invente regra jurídica.** Se um caso não está em `docs/regras-penais.md`,
  pare e pergunte. Não "complete" com o que parecer razoável.
- Toda regra cita a **fonte** (artigo de lei, súmula ou tese) e a marcação devida:
  ⚠️ VALIDAR, 📘 SIMPLIFICAÇÃO didática ou ⚖️ DIVERGÊNCIA (ADR-0004).
- Toda regra implementada referencia o ID (ex.: `// R-ITER-02`) e tem teste.
- A lei muda: antes de escrever ou alterar uma regra, confira o texto vigente
  (planalto.gov.br) e registre a lei que deu a redação atual.
- Os casos de `docs/casos-dourados.md` são os **testes dourados**: a análise do motor
  precisa bater com eles, sempre.
- Afirmativa diz em que base está certa quando a base não é a lei seca
  ("segundo o STJ…", "para a doutrina majoritária…").
- Invariantes checados nos testes do motor:
  - só há "crime" quando o fato é típico, ilícito e o agente é culpável;
  - menor de 18 anos nunca responde por crime;
  - fato sem tipo penal correspondente é sempre atípico.

### Arquitetura
- `packages/motor` é **TypeScript puro**: sem React, DOM ou I/O. Funções determinísticas.
- **A missão declara o fato; a análise esperada é calculada pelo motor.** A ficha
  preenchida pelo jogador é *comparada* com a análise e nunca é gravada (ADR-0002).
- O motor **não valora prova**: o fato chega como apurado. Caso fora das regras gera
  `ErroDeFato`, nunca um palpite.
- Missões e afirmativas são **dados** (`packages/content/data`), validados por schema zod.
- A delegacia é um prédio térreo, desenhado em SVG, em código; o avatar anda pelos
  caminhos da planta (`apps/game/src/mundo/planta.ts`). A interface é toda React (ADR-0001).

### Linguagem e ensino
- Frases curtas e naturais; nada de texto de apostila. Negrito nos conceitos e termos-chave.
- Os personagens apresentam o caso; **ninguém dá aula**. O conceito vem do delegado, que
  lembra o que estudou (`aulas`), com esquema e um exemplo diferente do caso.
- Em cada sala só fala quem trabalha nela ou quem está de passagem (validado no conteúdo).
- Toda etapa da ficha tem pergunta escrita para o caso e explicação no acerto e no erro.
- Os casos andam pela delegacia: seis ambientes, cada um com uma função (GDD, seção 6).
- Afirmativa precisa: sem ressalva que confunda. Na dúvida, simplifique o enunciado.

### Tom (ADR-0005)
- Foco no raciocínio jurídico e no procedimento. Sem detalhe gráfico de violência.
- Vítimas tratadas com respeito. Sem casos, nomes ou pessoas reais.
- Não glamourizar o crime nem o abuso de autoridade.

### Código
- Domínio em português, sem acento nos identificadores (`Fato`, `Analise`, `tipoPenal`).
  Termos técnicos genéricos podem ficar em inglês (`store`).
- Textos de interface em pt-BR, com a terminologia do Código Penal e do CPP.
- TypeScript `strict`. Sem `any` no motor.
- Toda mudança no motor vem com teste (Vitest). Rode testes e typecheck antes de concluir.
- Commits pequenos, um assunto por commit, mensagem em português.

## Layout do repositório

```
apps/game          app (Vite + React), a ser empacotado com Capacitor
packages/motor     motor penal: tipos penais, análise do fato, comparação da ficha
packages/content   schemas + dados de missões, afirmativas, teoria
docs/              GDD, regras, arquitetura, roadmap, ADRs
```

## Comandos

Requer Node ≥ 22.12 (`.nvmrc`) e pnpm via Corepack (`corepack enable`). Rode na raiz:

| Comando | O que faz |
|---|---|
| `pnpm install` | instala as dependências do monorepo |
| `pnpm dev` | sobe o app (`apps/game`) no Vite, em http://localhost:5174 |
| `pnpm test` | Vitest em todos os pacotes |
| `pnpm typecheck` | `tsc --noEmit` em todos os pacotes |
| `pnpm lint` | Biome: lint + verificação de formatação |
| `pnpm format` | Biome: aplica formatação e correções seguras |
| `pnpm build` | build de produção do app em `apps/game/dist` |

Em um pacote só: `pnpm --filter @delegacia/motor test` (ou `@delegacia/content`,
`@delegacia/game`).

## Quando estiver em dúvida

- Dúvida jurídica → pergunte, citando a regra mais próxima.
- Dúvida de design de jogo → siga o GDD; se não estiver lá, proponha e pergunte.
- A direção visual segue a do `cidade-contabil` (papel creme, contorno marrom, blocos
  isométricos), com o azul-marinho da polícia no lugar do verde.
