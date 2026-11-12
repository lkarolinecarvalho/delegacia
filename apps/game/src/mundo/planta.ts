/**
 * Planta da delegacia, sem desenho: salas, paredes, pontos de caminhada e rotas.
 *
 * O prédio é térreo e fica numa grade (`gx` desce para a direita da tela, `gy` desce
 * para a esquerda). As salas do fundo encostam nas duas paredes altas; o saguão da
 * recepção liga todas elas e dá para o pátio, por onde o avatar chega.
 */

export type NaGrade = readonly [gx: number, gy: number];

/** Tamanho do prédio, em ladrilhos. */
export const PREDIO = { x: 19, y: 22 } as const;

export interface SalaNaPlanta {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  /** Nó do grafo em que o avatar para nesta sala. */
  readonly no: string;
}

/** O retângulo de cada sala, pelo id de `packages/content/data/salas.json`. */
export const SALAS: Readonly<Record<string, SalaNaPlanta>> = {
  gabinete: { x0: 0, y0: 0, x1: 8, y1: 8.5, no: "gabinete" },
  biblioteca: { x0: 8, y0: 0, x1: 14.5, y1: 8.5, no: "biblioteca" },
  carceragem: { x0: 14.5, y0: 0, x1: 19, y1: 8.5, no: "carceragem" },
  cartorio: { x0: 0, y0: 10.5, x1: 8, y1: 16.25, no: "cartorio" },
  oitiva: { x0: 0, y0: 16.25, x1: 8, y1: 22, no: "oitiva" },
  recepcao: { x0: 8, y0: 10.5, x1: 19, y1: 22, no: "recepcao" },
};

/** Faixa de circulação entre as salas do fundo e as da lateral: faz parte do saguão. */
export const CORREDOR = { x0: 0, y0: 8.5, x1: 19, y1: 10.5 } as const;

/** Eixos por onde o avatar anda. */
const EIXO_DO_CORREDOR = 9.5;
const EIXO_DO_SAGUAO = 9.5;
const EIXO_DA_ENTRADA = 17.5;
export const PORTAS = {
  gabinete: 4,
  biblioteca: 11.2,
  cartorio: 13.4,
  oitiva: 19.4,
  entrada: EIXO_DA_ENTRADA,
} as const;
/** Meia largura do vão de uma porta. */
export const MEIO_VAO = 0.8;

/** Nó em que o avatar começa: no pátio, em frente à entrada. */
export const NO_INICIAL = "patio";

/** Pontos por onde o avatar passa. Todo trecho entre dois nós segue a grade. */
export const NOS: Readonly<Record<string, NaGrade>> = {
  patio: [24, EIXO_DA_ENTRADA],
  entrada: [18.4, EIXO_DA_ENTRADA],
  balcao: [15.6, EIXO_DA_ENTRADA],
  recepcao: [15.6, 13.6],
  saguao: [EIXO_DO_SAGUAO, EIXO_DA_ENTRADA],
  "frente-da-oitiva": [EIXO_DO_SAGUAO, PORTAS.oitiva],
  oitiva: [5.4, PORTAS.oitiva],
  "frente-do-cartorio": [EIXO_DO_SAGUAO, PORTAS.cartorio],
  cartorio: [5.4, PORTAS.cartorio],
  corredor: [EIXO_DO_SAGUAO, EIXO_DO_CORREDOR],
  "frente-do-gabinete": [PORTAS.gabinete, EIXO_DO_CORREDOR],
  gabinete: [PORTAS.gabinete, 6.2],
  "frente-da-biblioteca": [PORTAS.biblioteca, EIXO_DO_CORREDOR],
  biblioteca: [PORTAS.biblioteca, 6.2],
  carceragem: [16.7, EIXO_DO_CORREDOR],
};

const TRECHOS: readonly (readonly [string, string])[] = [
  ["patio", "entrada"],
  ["entrada", "balcao"],
  ["balcao", "recepcao"],
  ["balcao", "saguao"],
  ["saguao", "frente-da-oitiva"],
  ["frente-da-oitiva", "oitiva"],
  ["saguao", "frente-do-cartorio"],
  ["frente-do-cartorio", "cartorio"],
  ["frente-do-cartorio", "corredor"],
  ["corredor", "frente-do-gabinete"],
  ["frente-do-gabinete", "gabinete"],
  ["corredor", "frente-da-biblioteca"],
  ["frente-da-biblioteca", "biblioteca"],
  ["frente-da-biblioteca", "carceragem"],
];

export const TRECHOS_NA_GRADE: readonly (readonly [NaGrade, NaGrade])[] = TRECHOS.map(([a, b]) => [
  ponto(a),
  ponto(b),
]);

function ponto(no: string): NaGrade {
  const p = NOS[no];
  if (!p) throw new Error(`Nó fora da planta: ${no}`);
  return p;
}

/** Nó em que o avatar fica numa sala; `null` é o pátio. */
export function noDaSala(sala: string | null): string {
  if (sala === null) return NO_INICIAL;
  const naPlanta = SALAS[sala];
  if (!naPlanta) throw new Error(`Sala fora da planta: ${sala}`);
  return naPlanta.no;
}

/**
 * Caminho de um nó a outro pelos trechos (busca em largura: o grafo é uma árvore).
 * Devolve os pontos a visitar, em ordem, sem o de partida. Vazio se já está lá.
 */
export function rota(de: string, para: string): NaGrade[] {
  ponto(de);
  ponto(para);
  const anterior = new Map<string, string | null>([[de, null]]);
  const fila = [de];
  for (let atual = fila.shift(); atual !== undefined; atual = fila.shift()) {
    if (atual === para) break;
    for (const [a, b] of TRECHOS) {
      const vizinho = a === atual ? b : b === atual ? a : null;
      if (vizinho && !anterior.has(vizinho)) {
        anterior.set(vizinho, atual);
        fila.push(vizinho);
      }
    }
  }
  if (!anterior.has(para)) throw new Error(`Não há caminho de ${de} a ${para}`);
  const caminho: NaGrade[] = [];
  for (let no: string | null = para; no !== null && no !== de; no = anterior.get(no) ?? null) {
    caminho.unshift(ponto(no));
  }
  return caminho;
}

export interface Passo {
  readonly posicao: NaGrade;
  /** O que ainda falta percorrer. Vazio quando o avatar chegou. */
  readonly rota: readonly NaGrade[];
}

/** Avança `distancia` ladrilhos ao longo da rota, parando exatamente no último ponto. */
export function avancar(posicao: NaGrade, caminho: readonly NaGrade[], distancia: number): Passo {
  let [x, y] = posicao;
  let restante = distancia;
  const pendentes = [...caminho];
  while (pendentes.length > 0 && restante > 0) {
    const [ax, ay] = pendentes[0] as NaGrade;
    const ateOAlvo = Math.hypot(ax - x, ay - y);
    if (ateOAlvo <= restante) {
      [x, y] = [ax, ay];
      restante -= ateOAlvo;
      pendentes.shift();
    } else {
      x += ((ax - x) / ateOAlvo) * restante;
      y += ((ay - y) / ateOAlvo) * restante;
      restante = 0;
    }
  }
  return { posicao: [x, y], rota: pendentes };
}

export interface Parede {
  /** `x`: parede sobre a linha gx = `em`, de `de` a `ate` em gy. `y`: o contrário. */
  readonly eixo: "x" | "y";
  readonly em: number;
  readonly de: number;
  readonly ate: number;
  readonly altura: number;
}

const BAIXA = 1.1;
const DE_FORA = 0.8;
const p = (eixo: "x" | "y", em: number, de: number, ate: number, altura = BAIXA): Parede => ({
  eixo,
  em,
  de,
  ate,
  altura,
});

/**
 * Paredes baixas (o prédio é visto em corte), já com os vãos das portas. As duas
 * paredes altas do fundo e a grade da carceragem são desenhadas à parte.
 */
export const PAREDES: readonly Parede[] = [
  // Entre as salas do fundo.
  p("x", 8, 0, 8.5),
  p("x", 14.5, 0, 8.5, 1.6),
  // Frente das salas do fundo, com as portas do gabinete e da biblioteca.
  p("y", 8.5, 0, PORTAS.gabinete - MEIO_VAO),
  p("y", 8.5, PORTAS.gabinete + MEIO_VAO, PORTAS.biblioteca - MEIO_VAO),
  p("y", 8.5, PORTAS.biblioteca + MEIO_VAO, 14.5),
  // Cartório e sala de oitiva.
  p("y", 10.5, 0, 8),
  p("y", 16.25, 0, 8),
  p("x", 8, 10.5, PORTAS.cartorio - MEIO_VAO),
  p("x", 8, PORTAS.cartorio + MEIO_VAO, PORTAS.oitiva - MEIO_VAO),
  p("x", 8, PORTAS.oitiva + MEIO_VAO, 22),
  // Fachadas da frente, com a entrada para o pátio.
  p("y", 22, 0, 19, DE_FORA),
  p("x", 19, 0, PORTAS.entrada - MEIO_VAO, DE_FORA),
  p("x", 19, PORTAS.entrada + MEIO_VAO, 22, DE_FORA),
];

/** Sala em que o ponto da grade cai, se houver. */
export function salaNoPonto([gx, gy]: NaGrade): string | null {
  for (const [id, s] of Object.entries(SALAS)) {
    if (gx >= s.x0 && gx <= s.x1 && gy >= s.y0 && gy <= s.y1) return id;
  }
  return null;
}
