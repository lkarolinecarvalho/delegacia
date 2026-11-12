import type { Pergunta, Tema } from "@delegacia/content";

/** Um balão da aula: uma ideia por vez, para o jogador ir passando. */
export interface BalaoDaAula {
  /** Tema a que o balão pertence. */
  readonly tema: string;
  readonly titulo: string;
  readonly tipo: "abertura" | "ponto" | "exemplo";
  readonly texto: string;
  /** Fonte legal do tema, mostrada junto do exemplo. */
  readonly fonte: string | null;
  /** O último balão do tema: ao passar dele, o tema conta como visto. */
  readonly fechaOTema: boolean;
}

/**
 * Quebra as aulas em balões de conversa: a abertura do tema, um balão por ponto e o
 * exemplo. As perguntas ficam para a fixação, depois da aula.
 */
export function baloesDaAula(temas: readonly Tema[]): BalaoDaAula[] {
  return temas.flatMap((tema) => {
    const base = { tema: tema.id, titulo: tema.titulo, fonte: null, fechaOTema: false } as const;
    return [
      { ...base, tipo: "abertura" as const, texto: tema.resumo },
      ...tema.pontos.map((texto) => ({ ...base, tipo: "ponto" as const, texto })),
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

/** As perguntas de fixação das aulas, na ordem em que os temas foram dados. */
export function perguntasDeFixacao(temas: readonly Tema[]): Pergunta[] {
  return temas.flatMap((tema) => tema.perguntas);
}
