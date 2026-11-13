import type { Esquema, Pergunta, Tema } from "@delegacia/content";

/** Um balão da lembrança: uma ideia por vez, para o jogador ir passando. */
export interface BalaoDaAula {
  /** Tema a que o balão pertence. */
  readonly tema: string;
  readonly titulo: string;
  readonly tipo: "abertura" | "ponto" | "esquema" | "exemplo";
  readonly texto: string;
  /** O desenho do tema, no balão que o resume. */
  readonly esquema: Esquema | null;
  /** Fonte legal do tema, mostrada junto do exemplo. */
  readonly fonte: string | null;
  /** O último balão do tema: ao passar dele, o tema conta como visto. */
  readonly fechaOTema: boolean;
}

/** O que o delegado diz a si mesmo ao ver o desenho do tema. */
export const TEXTO_DO_ESQUEMA = "Em um desenho, para não esquecer:";

/**
 * Quebra os temas em balões: a abertura, um balão por ponto, o desenho do tema (se
 * houver) e um exemplo. É o delegado lembrando o que estudou; as perguntas ficam para
 * a fixação, depois.
 */
export function baloesDaAula(temas: readonly Tema[]): BalaoDaAula[] {
  return temas.flatMap((tema) => {
    const base = {
      tema: tema.id,
      titulo: tema.titulo,
      esquema: null,
      fonte: null,
      fechaOTema: false,
    } as const;
    return [
      { ...base, tipo: "abertura" as const, texto: tema.resumo },
      ...tema.pontos.map((texto) => ({ ...base, tipo: "ponto" as const, texto })),
      ...(tema.esquema
        ? [{ ...base, tipo: "esquema" as const, texto: TEXTO_DO_ESQUEMA, esquema: tema.esquema }]
        : []),
      {
        ...base,
        tipo: "exemplo" as const,
        texto: tema.exemplo,
        fonte: tema.fonte ?? null,
        fechaOTema: true,
      },
    ];
  });
}

/** As perguntas de fixação dos temas, na ordem em que foram lembrados. */
export function perguntasDeFixacao(temas: readonly Tema[]): Pergunta[] {
  return temas.flatMap((tema) => tema.perguntas);
}
