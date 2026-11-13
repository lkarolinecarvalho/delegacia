/**
 * Planta da delegacia, sem desenho: salas, paredes, pontos de caminhada e rotas.
 *
 * O prédio é térreo e fica numa grade (`gx` desce para a direita da tela, `gy` desce
 * para a esquerda). No fundo, o gabinete, a investigação e o arquivo; na frente, a sala
 * de oitiva, o cartório e a recepção, por onde se entra.
 */

export type NaGrade = readonly [gx: number, gy: number];

/** Tamanho do prédio principal, em ladrilhos. */
export const PREDIO = { x: 20, y: 17 } as const;

export interface SalaNaPlanta {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  /** Nó do grafo em que o avatar para nesta sala. */
  readonly no: string;
}

/** Corredor do fundo, entre as salas de trás e as da frente. */
export const CORREDOR = { x0: 0, y0: 7, x1: 20, y1: 8.6 } as const;

/** Linha (gx) da porta da frente: o avatar entra e cruza a recepção por ela. */
export const EIXO_DA_ENTRADA = 17;
/** Linha (gy) por onde o avatar anda no corredor do fundo. */
const FUNDO = 7.8;
/** Linha (gy) da porta entre a recepção e o cartório. */
const PORTA_DO_CARTORIO = 13.5;

/** O retângulo de cada sala, pelo id de `packages/content/data/salas.json`. */
export const SALAS: Readonly<Record<string, SalaNaPlanta>> = {
  gabinete: { x0: 0, y0: 0, x1: 7, y1: 7, no: "gabinete" },
  investigacao: { x0: 7, y0: 0, x1: 14, y1: 7, no: "investigacao" },
  arquivo: { x0: 14, y0: 0, x1: 20, y1: 7, no: "arquivo" },
  oitiva: { x0: 0, y0: 8.6, x1: 7, y1: 17, no: "oitiva" },
  cartorio: { x0: 7, y0: 8.6, x1: 14, y1: 17, no: "cartorio" },
  recepcao: { x0: 14, y0: 8.6, x1: 20, y1: 17, no: "recepcao" },
};

/** Onde fica o vão de cada porta, no eixo livre da parede em que ela está. */
const PORTAS = {
  gabinete: 3.5,
  oitiva: 4.5,
  investigacao: 10.5,
  arquivo: EIXO_DA_ENTRADA,
} as const;
/** Meia largura do vão de uma porta. */
export const MEIO_VAO = 0.8;

/** Nó em que o avatar começa: na calçada, em frente à porta. */
export const NO_INICIAL = "patio";

/** Pontos por onde o avatar passa. Todo trecho entre dois nós segue a grade. */
export const NOS: Readonly<Record<string, NaGrade>> = {
  patio: [EIXO_DA_ENTRADA, 20.5],
  entrada: [EIXO_DA_ENTRADA, 16.2],
  "frente-do-cartorio": [EIXO_DA_ENTRADA, PORTA_DO_CARTORIO],
  // Em frente ao balcão da recepção.
  recepcao: [EIXO_DA_ENTRADA, 11],
  cartorio: [11.6, PORTA_DO_CARTORIO],
  corredor: [EIXO_DA_ENTRADA, FUNDO],
  arquivo: [PORTAS.arquivo, 5.2],
  "frente-da-investigacao": [PORTAS.investigacao, FUNDO],
  investigacao: [PORTAS.investigacao, 5.2],
  "frente-da-oitiva": [PORTAS.oitiva, FUNDO],
  oitiva: [PORTAS.oitiva, 13.2],
  "frente-do-gabinete": [PORTAS.gabinete, FUNDO],
  gabinete: [PORTAS.gabinete, 5.2],
};

const TRECHOS: readonly (readonly [string, string])[] = [
  ["patio", "entrada"],
  ["entrada", "frente-do-cartorio"],
  ["frente-do-cartorio", "cartorio"],
  ["frente-do-cartorio", "recepcao"],
  ["recepcao", "corredor"],
  ["corredor", "arquivo"],
  ["corredor", "frente-da-investigacao"],
  ["frente-da-investigacao", "investigacao"],
  ["frente-da-investigacao", "frente-da-oitiva"],
  ["frente-da-oitiva", "oitiva"],
  ["frente-da-oitiva", "frente-do-gabinete"],
  ["frente-do-gabinete", "gabinete"],
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

/** Nó em que o avatar fica numa sala; `null` é a calçada. */
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

/** Uma parede com vãos de porta: devolve os trechos entre eles. */
function comPortas(
  eixo: "x" | "y",
  em: number,
  de: number,
  ate: number,
  portas: readonly number[],
  altura = BAIXA,
): Parede[] {
  const cortes = [...portas].sort((a, b) => a - b);
  const trechos: Parede[] = [];
  let inicio = de;
  for (const porta of cortes) {
    trechos.push(p(eixo, em, inicio, porta - MEIO_VAO, altura));
    inicio = porta + MEIO_VAO;
  }
  trechos.push(p(eixo, em, inicio, ate, altura));
  return trechos;
}

/**
 * Paredes baixas (o prédio é visto em corte), já com os vãos das portas. As duas
 * paredes altas do fundo são desenhadas à parte.
 */
export const PAREDES: readonly Parede[] = [
  // Entre as salas do fundo, e a frente delas, com as três portas.
  p("x", 7, 0, 7),
  p("x", 14, 0, 7),
  ...comPortas("y", 7, 0, 20, [PORTAS.gabinete, PORTAS.investigacao, PORTAS.arquivo]),
  // Fundo da oitiva e do cartório; a recepção é aberta para o corredor.
  ...comPortas("y", 8.6, 0, 14, [PORTAS.oitiva]),
  p("x", 7, 8.6, 17),
  // Entre o cartório e a recepção, com a porta entre os dois.
  ...comPortas("x", 14, 8.6, 17, [PORTA_DO_CARTORIO]),
  // Fachadas, com a porta da frente.
  ...comPortas("y", PREDIO.y, 0, PREDIO.x, [EIXO_DA_ENTRADA], DE_FORA),
  p("x", PREDIO.x, 0, PREDIO.y, DE_FORA),
];

/** Sala em que o ponto da grade cai, se houver. */
export function salaNoPonto([gx, gy]: NaGrade): string | null {
  for (const [id, s] of Object.entries(SALAS)) {
    if (gx >= s.x0 && gx <= s.x1 && gy >= s.y0 && gy <= s.y1) return id;
  }
  return null;
}
