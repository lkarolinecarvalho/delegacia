# Modelo de conteúdo

Missões, afirmativas e teoria são JSON em `packages/content/data`, validados por schemas
zod em `packages/content/src`. Conteúdo inválido quebra os testes e o CI.

| Arquivo | O que tem |
|---|---|
| `capitulos.json` | Número, parte e título de cada capítulo |
| `missoes/*.json` | Um arquivo por capítulo, com as missões em ordem; o número na frente guarda a ordem |
| `afirmativas/*.json` | Afirmativas de Certo/Errado, por assunto |
| `conceitos.json` | Conceitos, com nível e definição curta |
| `teoria.json` | Temas das aulas: pontos curtos, um exemplo e perguntas |
| `npcs.json`, `salas.json` | Cadastros |

## Missão

A missão declara **o fato**, nunca a resposta. A análise esperada é calculada pelo
motor (ADR-0002).

```jsonc
{
  "id": "m202-mao-na-bolsa",
  "titulo": "A mão na bolsa",
  "capitulo": 2,
  "nivel": 1,
  "sala": "oitiva",
  "npc": "bento-escrivao",
  "requisitos": ["m201-bicicleta"],
  "aulas": ["consumacao-e-tentativa"],          // temas mostrados antes, na primeira vez
  "dialogo": [{ "npc": "bento-escrivao", "texto": "…" }],   // no máximo 3 falas
  "caso": {
    "titulo": "Ocorrência 012 — ponto de ônibus",
    "linhas": ["…"],                             // o que ficou apurado, em frases curtas
    "fato": {
      "elementos": ["subtracao", "coisa_alheia_movel"],
      "elementoSubjetivo": "dolo",               // dolo | culpa | nenhum
      "execucao": { "iniciada": true, "interrompidaPor": "circunstancias_alheias" },
      "justificante": null,                      // ou legítima defesa / estado de necessidade, com os requisitos
      "agente": { "idade": 31, "embriaguez": "nenhuma" }
    },
    "pede": ["forma", "conclusao"],              // etapas que o jogador responde
    "informa": ["tipico"],                       // etapas que o mentor entrega preenchidas
    "tipoInformado": true,                       // o mentor diz qual é o crime
    "opcoesDeTipo": [],                          // com "tipo" em `pede`: os tipos sugeridos
    "comentarios": { "forma": "…" },             // fala do mentor quando a etapa sai errada
    "desfecho": "…"
  },
  "conceitos": ["consumacao-e-tentativa"],
  "recompensa": { "pontos": 60 }
}
```

**Missão de conversa:** sem `caso`, com `aulas` obrigatório e `conceitos` vazio.

Regras conferidas no carregamento: as referências existem (sala, npc, aulas,
requisitos, conceitos, regras citadas); as etapas de `pede` e de `informa` existem na
análise do fato; com `tipo` em `pede`, o tipo correto está entre as opções; todo
conceito usado em missão tem pelo menos 3 afirmativas.

## Afirmativa

```jsonc
{
  "id": "af-tentativa-01",
  "conceitoId": "consumacao-e-tentativa",
  "nivelMin": 1,
  "enunciado": "…",
  "gabarito": "C",                 // C | E
  "explicacao": "…",               // por que está certa ou errada, em até 2 frases
  "regras": ["R-ITER-02"]
}
```
