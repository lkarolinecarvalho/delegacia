import {
  CORREDOR,
  type NaGrade,
  PAREDES,
  PORTAS,
  PREDIO,
  SALAS,
  TRECHOS_NA_GRADE,
} from "../mundo/planta";
import { BONECO, desenharBoneco } from "./bonecos";
import { clarear, criarIso, DEFS_DO_ISO, escurecer, type PontoDeTela } from "./iso";

/**
 * A delegacia vista de cima, em blocos isométricos: um prédio térreo, em corte, no meio
 * do terreno, com o pátio das viaturas e a rua na frente. Módulo puro: devolve o SVG do
 * chão, os objetos com a profundidade de cada um e as posições que a interface usa.
 */

/** A cena ocupa o palco inteiro, por baixo do HUD (390×844, o viewport de referência). */
export const CENA = { largura: 390, altura: 844 } as const;

/** Meia largura de um ladrilho, em pixels: o prédio ocupa a largura toda da tela. */
const UNIDADE = 9.5;
const ORIGEM: PontoDeTela = { x: 209, y: 318 };
const ESCALA_DO_BONECO = 0.9;
const PAREDE_ALTA = 5;
const ESPESSURA = 0.4;

const iso = criarIso({ unidade: UNIDADE, origem: ORIGEM });

/** Ponto da grade na tela, nas coordenadas da cena. */
export function naTela([gx, gy]: NaGrade, z = 0): PontoDeTela {
  return iso.ponto(gx, gy, z);
}

/** Profundidade de um ponto da grade: quem está mais à frente é desenhado depois. */
export function profundidade([gx, gy]: NaGrade): number {
  return gx + gy;
}

const COR = {
  grama: "#8fc26c",
  gramaEscura: "#7fb45f",
  piso: "#d8d2c4",
  asfalto: "#6f747b",
  faixa: "#f3efe3",
  parede: "#efe3c8",
  rodape: "#b99a6b",
  madeira: "#b07a4a",
  madeiraEscura: "#7d5233",
  marinho: "#2f4a6b",
  metal: "#9aa5b1",
  papel: "#fbf6ea",
  vidro: "#a9d3e6",
  folha: "#5d8a52",
  tronco: "#7a5638",
  vaso: "#c0714d",
} as const;

const PISOS: Readonly<Record<string, string>> = {
  recepcao: "#e3d6b8",
  cartorio: "#c9b48c",
  gabinete: "#b98f6a",
  oitiva: "#bfc9b4",
};

export interface Objeto {
  /** Profundidade da base (gx + gy do meio). */
  readonly p: number;
  readonly svg: string;
}

/** Bloco apoiado no chão, com a profundidade do meio da base. */
function bloco(
  x: number,
  y: number,
  a: number,
  b: number,
  h: number,
  cor: string,
  extra = "",
): Objeto {
  return { p: x + y + (a + b) / 2, svg: iso.caixa(x, y, 0, a, b, h, cor) + extra };
}

/** Um boneco com os pés no ponto da grade. */
function pessoa(id: string, gx: number, gy: number, olhando: "direita" | "esquerda"): Objeto {
  const pe = iso.ponto(gx, gy, 0);
  const e = ESCALA_DO_BONECO;
  const posicao = `x="${pe.x - BONECO.ancoraX * e}" y="${pe.y - BONECO.ancoraY * e}" width="${BONECO.largura * e}" height="${BONECO.altura * e}"`;
  return {
    p: gx + gy,
    svg: desenharBoneco(id, olhando).replace(/ width="\d+" height="\d+"/, ` ${posicao}`),
  };
}

/** Mesa: corpo e tampo um pouco maior. */
function mesa(x: number, y: number, a: number, b: number, cor: string, sobre = ""): Objeto {
  return {
    p: x + y + (a + b) / 2,
    svg:
      iso.caixa(x + 0.15, y + 0.15, 0, a - 0.3, b - 0.3, 1.4, escurecer(cor, 0.15)) +
      iso.caixa(x, y, 1.4, a, b, 0.25, cor) +
      sobre,
  };
}

function cadeira(x: number, y: number, cor: string): Objeto {
  return {
    p: x + y + 0.6,
    svg: iso.caixa(x, y, 0, 1.2, 1.2, 0.9, cor) + iso.caixa(x, y, 0.9, 0.3, 1.2, 1.1, cor),
  };
}

/** Estante encostada na parede do fundo (gy = 0), com lombadas coloridas. */
function estante(x: number, largura: number, cor: string): Objeto {
  const lombadas = ["#c8553f", "#3f6b8a", "#d9a441", "#5d8a52", "#8a5a8f"];
  let desenho = iso.caixa(x, 0.05, 0, largura, 0.9, 4.2, cor);
  for (let prateleira = 0; prateleira < 3; prateleira += 1) {
    for (let k = 0; k * 0.4 + 0.5 < largura; k += 1) {
      const lombada = lombadas[(k + prateleira * 2) % lombadas.length] ?? COR.papel;
      desenho += iso.faceY(0.95, x + 0.2 + k * 0.4, 0.5 + prateleira * 1.25, 0.32, 0.85, lombada);
    }
  }
  return { p: x + largura / 2 + 0.5, svg: desenho };
}

function planta(x: number, y: number): Objeto {
  return {
    p: x + y + 0.6,
    svg:
      iso.caixa(x, y, 0, 1.1, 1.1, 0.9, COR.vaso) +
      iso.caixa(x - 0.2, y - 0.2, 0.9, 1.5, 1.5, 1.2, COR.folha) +
      iso.caixa(x + 0.1, y + 0.1, 2.1, 0.9, 0.9, 0.9, clarear(COR.folha, 0.15)),
  };
}

function arvore(x: number, y: number, tamanho = 1): Objeto {
  const t = tamanho;
  return {
    p: x + y,
    svg:
      iso.sombra(x - 1.2 * t, y - 1.2 * t, 3.4 * t, 3.4 * t, 0.2) +
      iso.caixa(x - 0.4, y - 0.4, 0, 0.8, 0.8, 2.2 * t, COR.tronco) +
      iso.caixa(x - 1.6 * t, y - 1.6 * t, 2.2 * t, 3.2 * t, 3.2 * t, 2.4 * t, COR.folha) +
      iso.caixa(x - 1 * t, y - 1 * t, 4.6 * t, 2 * t, 2 * t, 1.6 * t, clarear(COR.folha, 0.14)),
  };
}

/** Casa da vizinhança: paredes, telhado e uma porta. Só cenário. */
function casa(x: number, y: number, a: number, b: number, parede: string, telhado: string): Objeto {
  return {
    p: x + y + (a + b) / 2,
    svg:
      iso.sombra(x + 0.6, y + 0.6, a + 0.8, b + 0.8, 0.2) +
      iso.caixa(x, y, 0, a, b, 4.2, parede) +
      iso.faceX(x + a, y + b / 2 - 0.7, 0, 1.4, 2.6, escurecer(telhado, 0.25)) +
      iso.faceY(y + b, x + 1, 1.6, 1.6, 1.5, COR.vidro) +
      iso.caixa(x - 0.4, y - 0.4, 4.2, a + 0.8, b + 0.8, 0.9, telhado) +
      iso.caixa(x + 0.8, y + 0.8, 5.1, a - 1.6, b - 1.6, 0.8, clarear(telhado, 0.1)),
  };
}

/** Viatura estacionada, com a frente para a rua (ao longo de gx). */
function viatura(x: number, y: number): Objeto {
  const branco = "#f4f1e8";
  return {
    p: x + y + 3.8,
    svg:
      iso.sombra(x + 0.3, y + 0.5, 5.8, 2.9, 0.25) +
      // Rodas do lado visível.
      iso.caixa(x + 0.8, y + 2.5, 0, 1, 0.3, 0.9, "#2b2f36") +
      iso.caixa(x + 3.9, y + 2.5, 0, 1, 0.3, 0.9, "#2b2f36") +
      iso.caixa(x, y, 0.5, 5.6, 2.6, 1.3, branco) +
      iso.faceY(y + 2.6, x, 0.8, 5.6, 0.45, COR.marinho) +
      iso.caixa(x + 1.2, y + 0.2, 1.8, 2.9, 2.2, 1.1, "#3d5878") +
      iso.caixa(x + 2.3, y + 0.5, 2.9, 0.35, 1.6, 0.3, "#d6453c") +
      iso.caixa(x + 2.65, y + 0.5, 2.9, 0.35, 1.6, 0.3, "#3f7fd6"),
  };
}

/**
 * Parede baixa, partida em pedaços de um ladrilho para a profundidade ficar certa. Os
 * pedaços são lisos (sem o brilho de quina dos blocos), para a parede parecer inteira.
 */
function paredeBaixa(
  eixo: "x" | "y",
  em: number,
  de: number,
  ate: number,
  altura: number,
): Objeto[] {
  const t = ESPESSURA;
  const topo = clarear(COR.parede, 0.35);
  const pedacos: Objeto[] = [];
  for (let inicio = de; inicio < ate - 1e-9; inicio += 1) {
    const tamanho = Math.min(1, ate - inicio);
    const ultimo = inicio + tamanho >= ate - 1e-9;
    pedacos.push(
      eixo === "x"
        ? {
            p: em + inicio + tamanho / 2,
            svg:
              iso.faceX(em + t / 2, inicio, 0, tamanho, altura, COR.parede) +
              (ultimo ? iso.faceY(inicio + tamanho, em - t / 2, 0, t, altura, COR.parede) : "") +
              iso.topo(em - t / 2, inicio, altura, t, tamanho, topo),
          }
        : {
            p: em + inicio + tamanho / 2,
            svg:
              iso.faceY(em + t / 2, inicio, 0, tamanho, altura, COR.parede) +
              (ultimo ? iso.faceX(inicio + tamanho, em - t / 2, 0, t, altura, COR.parede) : "") +
              iso.topo(inicio, em - t / 2, altura, tamanho, t, topo),
          },
    );
  }
  return pedacos;
}

const forma = (cantos: readonly NaGrade[], cor: string, z = 0): string =>
  iso.poligono(
    cantos.map(([x, y]) => [x, y, z] as const),
    cor,
  );

const retangulo = (x0: number, y0: number, x1: number, y1: number, cor: string): string =>
  forma(
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ],
    cor,
  );

/** O terreno: gramado, pátio, calçadas e a rua com a faixa de pedestres. */
function desenharTerreno(): string {
  const partes: string[] = [
    `<rect x="-600" y="-600" width="1600" height="2100" fill="${COR.grama}"/>`,
    // Manchas mais escuras no gramado, para ele não ficar chapado.
    retangulo(-22, -6, -8, 6, COR.gramaEscura),
    retangulo(-4, 26, 14, 44, COR.gramaEscura),
    retangulo(44, 8, 60, 30, COR.gramaEscura),
    retangulo(-10, -24, 12, -10, COR.gramaEscura),
    // Calçada em volta do prédio e o pátio das viaturas, até a rua.
    retangulo(-1.5, -1.5, 33, 23.5, COR.piso),
    retangulo(19, 23.5, 33, 34, COR.piso),
    // A rua, ao longo de gy, com o meio-fio dos dois lados.
    retangulo(33, -80, 34, 120, "#b9b3a6"),
    retangulo(34, -80, 41, 120, COR.asfalto),
    retangulo(41, -80, 42, 120, "#b9b3a6"),
    retangulo(42, -80, 44, 120, COR.piso),
  ];
  // Linha tracejada no meio da rua.
  for (let y = -80; y < 120; y += 4) {
    if (y > 13 && y < 22) continue;
    partes.push(retangulo(37.35, y, 37.65, y + 2, COR.faixa));
  }
  // Faixa de pedestres, na direção da entrada.
  for (let y = 14.5; y < 20.5; y += 1.2) {
    partes.push(retangulo(34.6, y, 40.4, y + 0.6, COR.faixa));
  }
  // Caminho da porta até a rua e as vagas das viaturas.
  partes.push(retangulo(19.5, PORTAS.entrada - 1.3, 33, PORTAS.entrada + 1.3, "#c9c1ae"));
  for (const y of [3, 7, 11, 21.5, 25.5, 29.5]) {
    partes.push(retangulo(22.5, y, 30.5, y + 0.2, COR.faixa));
  }
  return partes.join("");
}

/** O piso do prédio e as duas paredes altas do fundo, com janelas e quadros. */
function desenharPredio(): string {
  const { x: X, y: Y } = PREDIO;
  const h = PAREDE_ALTA;
  const partes: string[] = [
    iso.sombra(1.5, 1.5, X + 1.5, Y + 1.5, 0.25),
    retangulo(-0.4, -0.4, X + 0.15, Y + 0.15, "#8d7a66"),
    retangulo(0, 0, X, Y, PISOS.recepcao ?? COR.piso),
    retangulo(CORREDOR.x0, CORREDOR.y0, CORREDOR.x1, CORREDOR.y1, "#d6c7a4"),
  ];
  for (const [id, s] of Object.entries(SALAS)) {
    partes.push(retangulo(s.x0, s.y0, s.x1, s.y1, PISOS[id] ?? COR.piso));
  }
  // Tapete do gabinete, sob a mesa e as cadeiras de quem é atendido.
  partes.push(retangulo(2, 2.4, 8, 8.2, "#34495f"), retangulo(2.3, 2.7, 7.7, 7.9, "#3f5873"));
  // Tapete do saguão, da entrada ao meio da sala.
  partes.push(retangulo(9, PORTAS.entrada - 1, 18.6, PORTAS.entrada + 1, "#9c5a4a"));
  partes.push(retangulo(9.3, PORTAS.entrada - 0.7, 18.3, PORTAS.entrada + 0.7, "#b76e5c"));

  const claro = clarear(COR.parede, 0.25);
  partes.push(
    // Parede do fundo à direita (gy = 0) e à esquerda (gx = 0), com a espessura no alto.
    iso.faceY(0, 0, 0, X, h, COR.parede),
    iso.faceX(0, 0, 0, Y, h, claro),
    iso.topo(-0.4, -0.4, h, X + 0.4, 0.4, clarear(COR.parede, 0.4)),
    iso.topo(-0.4, 0, h, 0.4, Y, clarear(COR.parede, 0.4)),
    iso.faceX(X, -0.4, 0, 0.4, h, COR.parede),
    iso.faceY(Y, -0.4, 0, 0.4, h, COR.parede),
    iso.faceY(0, 0, 0, X, 0.35, COR.rodape),
    iso.faceX(0, 0, 0, Y, 0.35, COR.rodape),
    // Gabinete: janela e quadros. Cartório: relógio e quadro de avisos.
    iso.faceX(0, 3, 2, 3.4, 2.2, COR.vidro),
    iso.faceY(0, 7.3, 2.6, 1.1, 1.4, "#8a5a3c"),
    iso.faceY(0, 7.45, 2.75, 0.8, 1.1, "#d8cfa8"),
    iso.faceY(0, 16.3, 2.4, 2.2, 1.8, "#b98f5a"),
    iso.faceY(0, 16.5, 2.9, 0.7, 1, COR.papel),
    iso.faceY(0, 17.5, 2.7, 0.7, 1, "#f1d98a"),
    // Sala de oitiva: janela e quadro.
    iso.faceX(0, 13.6, 2, 3.4, 2.2, COR.vidro),
    iso.faceX(0, 19.2, 2.2, 1.8, 1.5, "#8a5a3c"),
    iso.faceX(0, 19.4, 2.4, 1.4, 1.1, "#c9d6de"),
  );
  return partes.join("");
}

/** O que fica atrás do prédio: desenhado antes das paredes altas. */
function fundos(): Objeto[] {
  return [
    casa(-17, -9, 7, 6, "#e7c9a0", "#b5553f"),
    casa(-6, -20, 7, 6, "#d7dfe6", "#5f7890"),
    arvore(-5, -4, 1.1),
    arvore(4, -6),
    arvore(12, -5, 1.2),
    arvore(22, -6),
    arvore(-12, -1),
  ];
}

function moveis(): Objeto[] {
  const papeis = (x: number, y: number, cor: string = COR.papel) =>
    iso.caixa(x, y, 1.65, 0.9, 0.7, 0.25, cor);
  /** Computador sobre a mesa: base, monitor e a tela acesa. */
  const computador = (x: number, y: number) =>
    iso.caixa(x, y, 1.65, 0.9, 0.6, 0.15, "#cfc8b8") +
    iso.caixa(x + 0.05, y + 0.1, 1.8, 0.8, 0.3, 0.9, "#3a3a40") +
    iso.faceY(y + 0.4, x + 0.12, 1.92, 0.66, 0.66, "#7fd0e8");
  const arquivo = (x: number, y: number) =>
    bloco(
      x,
      y,
      1.3,
      1,
      3,
      COR.metal,
      [0.5, 1.4, 2.3].map((z) => iso.faceY(y + 1, x + 0.35, z, 0.6, 0.15, "#5b6470")).join(""),
    );
  return [
    // Gabinete: estantes, bandeira, a Dra. Helena à mesa e as cadeiras de quem é atendido.
    estante(0.5, 2.9, COR.madeiraEscura),
    estante(3.7, 2.9, COR.madeiraEscura),
    {
      p: 9.3,
      svg:
        iso.caixa(8.7, 0.5, 0, 0.25, 0.25, 4.6, COR.metal) +
        iso.faceY(0.62, 7.3, 3, 1.4, 1.4, "#3f8f55") +
        iso.faceY(0.62, 7.7, 3.4, 0.6, 0.6, "#f2c531"),
    },
    pessoa("helena-delegada", 5, 2.2, "esquerda"),
    mesa(3, 3.1, 4, 1.8, COR.madeiraEscura, papeis(3.5, 3.6) + computador(5.6, 3.4)),
    cadeira(3.1, 5.5, "#8a5a3c"),
    cadeira(6.3, 5.5, "#8a5a3c"),
    planta(0.5, 7.4),

    // Cartório: arquivos, estante de autos, o Seu Bento e a mesa dele.
    arquivo(10.5, 0.2),
    arquivo(11.9, 0.2),
    estante(13.6, 2.8, COR.madeira),
    arquivo(16.9, 0.2),
    pessoa("bento-escrivao", 14.5, 2.2, "esquerda"),
    mesa(
      12.6,
      3.1,
      3.8,
      1.8,
      COR.madeira,
      papeis(13, 3.6) + papeis(14.1, 3.5, "#e7c97a") + computador(15.2, 3.4),
    ),
    cadeira(13.9, 5.5, COR.marinho),
    // Pilha de caixas de autos, no canto.
    bloco(17.2, 6.6, 1.3, 1.3, 1, "#c9a56a", iso.caixa(17.3, 6.7, 1, 1.1, 1.1, 0.9, "#d9b97c")),

    // Sala de oitiva: o Agente Rocha, a mesa com o gravador e as cadeiras.
    arquivo(6.3, 11.3),
    pessoa("rocha-agente", 1.3, 13.4, "direita"),
    cadeira(0.9, 17, COR.marinho),
    mesa(
      2.4,
      15.8,
      1.8,
      3.4,
      COR.madeira,
      iso.caixa(3, 17.1, 1.65, 0.5, 0.45, 0.2, "#2a2a2e") + papeis(2.8, 16.2),
    ),
    planta(0.5, 20.4),

    // Recepção: a Dona Cida atrás do balcão, o banco de espera e as plantas.
    pessoa("cida-recepcao", 12.1, 14.2, "direita"),
    {
      p: 13.7 + 14.2,
      svg:
        iso.caixa(13.2, 11.9, 0, 1, 4.6, 1.9, COR.marinho) +
        iso.caixa(13.05, 11.75, 1.9, 1.3, 4.9, 0.25, COR.madeira) +
        iso.caixa(13.3, 12.8, 2.15, 0.7, 0.9, 0.2, COR.papel),
    },
    bloco(10.6, 20.6, 4.6, 1, 0.9, COR.madeira),
    planta(17.4, 11.6),
    planta(17.4, 20.4),
  ];
}

function terrenoDaFrente(): Objeto[] {
  return [
    viatura(23.2, 4),
    viatura(23.2, 8),
    viatura(23.2, 26.5),
    // Mastro com a bandeira, ao lado da entrada.
    {
      p: 31 + 14,
      svg:
        iso.caixa(30.7, 13.7, 0, 0.9, 0.9, 0.4, "#b9b3a6") +
        iso.caixa(31, 14, 0.4, 0.25, 0.25, 7.5, COR.metal) +
        iso.faceY(14.12, 31.25, 6.1, 2.2, 1.6, "#3f8f55") +
        iso.faceY(14.12, 31.9, 6.5, 0.9, 0.8, "#f2c531"),
    },
    arvore(2, 29, 1.1),
    arvore(13, 30),
    arvore(8, 38, 1.2),
    arvore(26, 37),
    arvore(31.5, 1),
    // O outro lado da rua: o Fórum e a vizinhança.
    {
      p: 48 + 43 + 8,
      svg:
        iso.sombra(46.5, 37.5, 13, 13, 0.2) +
        iso.caixa(45, 36, 0, 12, 12, 0.6, "#d9d2c0") +
        iso.caixa(46, 37, 0.6, 10, 10, 5.4, "#f1ead8") +
        [38, 40.5, 43, 45.5]
          .map((y) => iso.caixa(45.2, y, 0.6, 0.7, 0.7, 5.4, "#fbf6ea"))
          .join("") +
        iso.faceX(56, 41, 0.6, 2, 3, "#7d5233") +
        iso.caixa(44.8, 35.8, 6, 12.4, 12.4, 0.9, "#c9b48c") +
        iso.caixa(46.5, 37.5, 6.9, 9, 9, 0.7, "#b99a6b"),
    },
    casa(46, 20, 7, 7, "#e7c9a0", "#b5553f"),
    casa(47, 58, 7, 7, "#d7dfe6", "#5f7890"),
    casa(58, 30, 7, 6, "#f0d9b5", "#8a5a44"),
    arvore(45, 30),
    arvore(56, 52, 1.2),
    arvore(46, 68),
  ];
}

export interface DesenhoDaCena {
  /** Tudo o que fica sempre atrás: terreno, piso e paredes altas. */
  readonly fundo: string;
  /** Objetos em ordem de profundidade; o avatar entra entre eles. */
  readonly objetos: readonly Objeto[];
}

let pronto: DesenhoDaCena | null = null;

export function desenharCena(): DesenhoDaCena {
  if (pronto) return pronto;
  const atras = fundos().sort((a, b) => a.p - b.p);
  const objetos = [
    ...PAREDES.flatMap((p) => paredeBaixa(p.eixo, p.em, p.de, p.ate, p.altura)),
    ...moveis(),
    ...terrenoDaFrente(),
  ].sort((a, b) => a.p - b.p);
  pronto = {
    fundo: [
      `<defs>${DEFS_DO_ISO}</defs>`,
      desenharTerreno(),
      atras.map((o) => o.svg).join(""),
      desenharPredio(),
    ].join(""),
    objetos,
  };
  return pronto;
}

/** O avatar, virado para um lado, com os pés na origem do desenho. */
export function desenharAvatar(olhando: "direita" | "esquerda"): string {
  const e = ESCALA_DO_BONECO;
  const posicao = `x="${-BONECO.ancoraX * e}" y="${-BONECO.ancoraY * e}" width="${BONECO.largura * e}" height="${BONECO.altura * e}"`;
  return desenharBoneco("avatar", olhando).replace(/ width="\d+" height="\d+"/, ` ${posicao}`);
}

export interface LugarDaSala {
  /** Onde fica a placa com o nome da sala. */
  readonly placa: PontoDeTela;
  /** Contorno do piso da sala, para o toque. */
  readonly area: readonly PontoDeTela[];
}

/** Margem para a placa não sair pela lateral da tela. */
const MARGEM_DA_PLACA = 58;

export function lugarDaSala(sala: string): LugarDaSala {
  const s = SALAS[sala];
  if (!s) throw new Error(`Sala fora da planta: ${sala}`);
  // A placa fica no alto da parede do fundo da sala; a da recepção, sobre o saguão.
  const meio =
    sala === "recepcao"
      ? // Do lado de fora da fachada, para não cobrir o caminho do avatar pelo saguão.
        iso.ponto(12, 24.4, 0)
      : s.y0 === 0
        ? iso.ponto((s.x0 + s.x1) / 2, 0, PAREDE_ALTA + 0.5)
        : iso.ponto(0, (s.y0 + s.y1) / 2, PAREDE_ALTA + 0.5);
  return {
    placa: {
      x: Math.min(Math.max(meio.x, MARGEM_DA_PLACA), CENA.largura - MARGEM_DA_PLACA),
      y: meio.y,
    },
    area: [
      iso.ponto(s.x0, s.y0, 0),
      iso.ponto(s.x1, s.y0, 0),
      iso.ponto(s.x1, s.y1, 0),
      iso.ponto(s.x0, s.y1, 0),
    ],
  };
}

export interface FocoDaSala {
  /** Meio da sala, na cena. */
  readonly centro: PontoDeTela;
  /** Quanto aproximar para a sala ocupar a largura da tela. */
  readonly escala: number;
}

/** Enquadramento da visão de dentro da sala: o piso e as paredes altas dela. */
export function focoDaSala(sala: string): FocoDaSala {
  const s = SALAS[sala];
  if (!s) throw new Error(`Sala fora da planta: ${sala}`);
  const cantos = [
    iso.ponto(s.x0, s.y0, PAREDE_ALTA),
    iso.ponto(s.x1, s.y0, PAREDE_ALTA),
    iso.ponto(s.x0, s.y1, PAREDE_ALTA),
    iso.ponto(s.x1, s.y0, 0),
    iso.ponto(s.x0, s.y1, 0),
    iso.ponto(s.x1, s.y1, 0),
  ];
  const xs = cantos.map((c) => c.x);
  const ys = cantos.map((c) => c.y);
  const largura = Math.max(...xs) - Math.min(...xs);
  return {
    centro: {
      x: (Math.max(...xs) + Math.min(...xs)) / 2,
      y: (Math.max(...ys) + Math.min(...ys)) / 2,
    },
    escala: Math.min(2.4, (CENA.largura * 0.96) / largura),
  };
}

/** Onde fica a placa do Fórum, do outro lado da rua. */
export const PLACA_DO_FORUM: PontoDeTela = iso.ponto(51, 42, 9.5);

/** Os caminhos do avatar, na tela: usados só nos testes da cena. */
export const CAMINHOS_NA_TELA = TRECHOS_NA_GRADE.map(([a, b]) => [naTela(a), naTela(b)] as const);
