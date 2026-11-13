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
  "id": "m202-golpe-de-faca",
  "titulo": "A faca na oficina",
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
    "contexto": null,                            // a fase policial; ver abaixo
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

**Fase policial.** A partir do capítulo 6, o caso pode trazer o `contexto`:

```jsonc
"contexto": {
  "situacao": "perseguido_logo_apos",  // cometendo | acabou_de_cometer | perseguido_logo_apos | encontrado_logo_depois | nenhuma
  "vitimaManifestou": false,           // a vítima representou ou requereu
  "mesesDesdeAAutoria": 0              // meses desde que a vítima soube quem é o autor
}
```

Com ele, a ficha pode pedir `acao`, `instauracao`, `rito`, `flagrante`, `fianca` e
`prazo`. Só casos em que há crime podem ter contexto. O fato aceita ainda
`circunstancias` (as que qualificam o crime) e `erroDeTipo` (`inevitavel` ou `evitavel`),
e a ficha pode pedir `figura` (simples ou qualificado). Com `tipo` em `pede` e
`opcoesDeTipo` vazio, a escolha é livre: o Código inteiro, com busca.

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

## Cenas em várias salas, temas revelados e negrito

```jsonc
{
  "sala": "gabinete",                    // onde a missão se resolve (a cena final)
  "dialogo": [ /* até 8 falas curtas */ ],
  "antes": [                             // paradas anteriores, na ordem; só conversa
    { "sala": "recepcao", "falas": [{ "npc": "cida-recepcao", "texto": "…" }] },
    { "sala": "cartorio", "falas": [ /* … */ ] }
  ],
  "revela": ["legalidade"]               // temas que a conversa ensina
}
```

- **`antes`**: o jogador vai de sala em sala; ao fim de cada parada, o destino passa a
  ser a sala seguinte. A fixação, o caso e o desfecho ficam na cena final.
- **`revela`**: temas ensinados dentro da conversa, sem aula. As perguntas deles viram a
  fixação, e os temas ficam guardados na Biblioteca. Um tema aparece uma única vez na
  campanha, em `aulas` ou em `revela`.
- **Negrito**: trechos entre `**` saem em negrito nas falas, nas aulas, no fato, nos
  comentários e no desfecho. Só nas palavras-chave.
- A sala tem `nome` (completo) e `placa` (curto, para o mapa).

## Quem fala onde, perguntas do caso, desfecho e esquemas

- **`npcs.json`**: quem trabalha na delegacia tem `sala`. Quem está de passagem (vítima,
  testemunha, conduzido, morador, advogado) não tem. `voce` é o próprio delegado, para
  as perguntas curtas que ele faz nas conversas. **Em cada cena só fala quem é da sala
  ou quem está de passagem**: o carregamento do conteúdo recusa o resto.
- **`caso.perguntas`**: a pergunta de cada etapa de `pede`, escrita para o caso e sem
  entregar a resposta. Todo caso da campanha tem uma por etapa.
- **`caso.comentarios`**: a explicação de cada etapa de `pede`, mostrada depois da
  conferência, no acerto e no erro. Voz neutra, sem "Seu Bento:" na frente.
- **`caso.desfecho`**: o que acontece com o caso e com as pessoas. Missão sem caso tem
  `desfecho` no nível da missão.
- **`aulas`**: os temas que o delegado **lembra** depois da conversa. Os personagens não
  explicam conceito: apresentam o caso.
- **`tema.exemplo`**: fácil e diferente do caso da missão em que o tema aparece.
- **`tema.esquema`** (opcional): o desenho do conceito, em um de quatro formatos:

```jsonc
{ "tipo": "etapas", "itens": ["Cogitação", "Preparação", "Execução", "Consumação"] }
{ "tipo": "soma", "partes": ["Fato típico", "Ilícito", "Culpável"], "resultado": "Crime" }
{ "tipo": "comparacao", "colunas": [{ "titulo": "Dolo", "itens": ["Quis o resultado"] }, { "titulo": "Culpa", "itens": ["Descuido"] }] }
{ "tipo": "requisitos", "centro": "Furto", "itens": ["Subtrair", "Coisa móvel", "Coisa alheia"] }
```

Na ficha, o jogo desenha sozinho o conceito com os fatos do caso (elementos do tipo
presentes, até onde a execução chegou, requisitos da excludente): isso sai da análise
do motor, não do conteúdo.
