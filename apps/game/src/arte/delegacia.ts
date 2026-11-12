import { BONECO, desenharBoneco } from "./bonecos";
import { clarear, criarIso, DEFS_DO_ISO, escurecer, type Iso, type PontoDeTela } from "./iso";

/**
 * A delegacia em corte, em dois andares, desenhada em blocos isométricos. Módulo puro:
 * devolve o SVG e as posições de cada sala para a interface.
 */

export const CENA = { largura: 390, altura: 590 } as const;

const UNIDADE = 20;
/** Cada sala ocupa SALA_X por SALA_Y ladrilhos; três salas por andar, lado a lado. */
const SALA_X = 4;
const SALA_Y = 5;
const ALTURA_DA_PAREDE = 3.2;
const ESCALA_DO_BONECO = 1.25;

const ORIGEM_X = 124;
const ORIGENS = { primeiro: 86, terreo: 336 } as const;
export type Andar = keyof typeof ORIGENS;

const COR = {
  parede: "#efe3c8",
  rodape: "#b99a6b",
  laje: "#8d7a66",
  madeira: "#b07a4a",
  madeiraEscura: "#7d5233",
  marinho: "#2f4a6b",
  metal: "#9aa5b1",
  papel: "#fbf6ea",
  vidro: "#a9d3e6",
  planta: "#5d8a52",
  vaso: "#c0714d",
} as const;

/** Cor do piso de cada sala. */
const PISOS: Readonly<Record<string, string>> = {
  recepcao: "#d9c7a3",
  cartorio: "#c9b48c",
  carceragem: "#aab0b8",
  gabinete: "#b98f6a",
  oitiva: "#bfc9b4",
  biblioteca: "#c7a986",
};

/** Onde cada sala fica: andar e posição (0, 1 ou 2) ao longo do corredor. */
export const PLANTA: Readonly<Record<string, { andar: Andar; posicao: number }>> = {
  gabinete: { andar: "primeiro", posicao: 0 },
  oitiva: { andar: "primeiro", posicao: 1 },
  biblioteca: { andar: "primeiro", posicao: 2 },
  recepcao: { andar: "terreo", posicao: 0 },
  cartorio: { andar: "terreo", posicao: 1 },
  carceragem: { andar: "terreo", posicao: 2 },
};

/** Personagens fixos de cada sala, com a posição em ladrilhos dentro dela. */
const MORADORES: Readonly<Record<string, { id: string; x: number; y: number }>> = {
  gabinete: { id: "helena-delegada", x: 1.9, y: 0.85 },
  cartorio: { id: "bento-escrivao", x: 1.9, y: 0.8 },
  recepcao: { id: "cida-recepcao", x: 1.7, y: 0.9 },
  oitiva: { id: "rocha-agente", x: 0.7, y: 0.9 },
};

function isoDoAndar(andar: Andar): Iso {
  return criarIso({ unidade: UNIDADE, origem: { x: ORIGEM_X, y: ORIGENS[andar] } });
}

/** Um boneco dentro do desenho, com os pés no ponto lógico (x, y) do andar. */
function bonecoEm(i: Iso, id: string, x: number, y: number): string {
  const pe = i.ponto(x, y, 0);
  const largura = BONECO.largura * ESCALA_DO_BONECO;
  const altura = BONECO.altura * ESCALA_DO_BONECO;
  const posicao = `x="${pe.x - BONECO.ancoraX * ESCALA_DO_BONECO}" y="${pe.y - BONECO.ancoraY * ESCALA_DO_BONECO}" width="${largura}" height="${altura}"`;
  return desenharBoneco(id).replace(/ width="\d+" height="\d+"/, ` ${posicao}`);
}

/** Estante com lombadas coloridas, encostada na parede do fundo. */
function estante(i: Iso, x: number, largura: number, altura: number, cor: string): string {
  const lombadas = ["#c8553f", "#3f6b8a", "#d9a441", "#5d8a52", "#8a5a8f"];
  let desenho = i.caixa(x, 0.1, 0, largura, 0.5, altura, cor);
  for (let prateleira = 0; prateleira * 0.7 + 0.9 <= altura; prateleira += 1) {
    const z = 0.25 + prateleira * 0.7;
    for (let k = 0; k * 0.2 + 0.25 < largura; k += 1) {
      const lombada = lombadas[(k + prateleira * 2) % lombadas.length] ?? COR.papel;
      desenho += i.faceY(0.6, x + 0.1 + k * 0.2, z, 0.16, 0.45, lombada);
    }
  }
  return desenho;
}

function mesa(i: Iso, x: number, y: number, a: number, b: number, cor: string): string {
  return (
    i.caixa(x, y, 0, a, b, 0.75, escurecer(cor, 0.12)) +
    i.caixa(x - 0.08, y - 0.08, 0.75, a + 0.16, b + 0.16, 0.12, cor)
  );
}

function cadeira(i: Iso, x: number, y: number, cor: string): string {
  return i.caixa(x, y, 0, 0.5, 0.5, 0.45, cor) + i.caixa(x, y, 0.45, 0.5, 0.12, 0.55, cor);
}

function planta(i: Iso, x: number, y: number): string {
  return (
    i.caixa(x, y, 0, 0.5, 0.5, 0.45, COR.vaso) +
    i.caixa(x - 0.1, y - 0.1, 0.45, 0.7, 0.7, 0.6, COR.planta) +
    i.caixa(x + 0.05, y + 0.05, 1.05, 0.4, 0.4, 0.45, clarear(COR.planta, 0.15))
  );
}

/** Os móveis de cada sala; `x0` é o começo da sala no eixo x do andar. */
function moveis(i: Iso, sala: string, x0: number): string {
  const morador = MORADORES[sala];
  const pessoa = morador ? bonecoEm(i, morador.id, x0 + morador.x, morador.y) : "";
  switch (sala) {
    case "recepcao":
      return [
        planta(i, x0 + 0.3, 0.3),
        pessoa,
        // Balcão de atendimento, com o tampo mais claro.
        i.caixa(x0 + 0.7, 1.7, 0, 2.6, 0.7, 1.05, COR.marinho),
        i.caixa(x0 + 0.6, 1.6, 1.05, 2.8, 0.9, 0.12, COR.madeira),
        i.caixa(x0 + 1.2, 1.75, 1.17, 0.5, 0.4, 0.05, COR.papel),
      ].join("");
    case "cartorio":
      return [
        i.caixa(x0 + 0.3, 0.1, 0, 0.8, 0.6, 1.9, COR.metal),
        i.caixa(x0 + 2.9, 0.1, 0, 0.8, 0.6, 1.9, COR.metal),
        pessoa,
        mesa(i, x0 + 1.0, 1.5, 2.1, 0.95, COR.madeira),
        // Pilhas de autos sobre a mesa.
        i.caixa(x0 + 1.2, 1.7, 0.87, 0.5, 0.4, 0.3, COR.papel),
        i.caixa(x0 + 2.3, 1.75, 0.87, 0.5, 0.4, 0.15, "#e7c97a"),
      ].join("");
    case "carceragem": {
      let grades = i.caixa(x0 + 0.5, 0.4, 0, 2.6, 0.6, 0.4, COR.metal);
      const cor = "#5b6470";
      for (let k = 0; k <= 9; k += 1) {
        grades += i.caixa(x0 + 0.2 + k * 0.4, 2.3, 0, 0.08, 0.08, 2.4, cor);
      }
      return grades + i.caixa(x0 + 0.15, 2.28, 2.4, 3.75, 0.12, 0.12, cor);
    }
    case "gabinete":
      return [
        estante(i, x0 + 0.3, 1.3, 2.3, COR.madeiraEscura),
        // Bandeira ao lado da estante.
        i.caixa(x0 + 3.3, 0.3, 0, 0.1, 0.1, 2.5, COR.metal),
        i.faceY(0.35, x0 + 2.55, 1.7, 0.75, 0.75, "#3f8f55"),
        pessoa,
        mesa(i, x0 + 0.9, 1.6, 2.3, 1.0, COR.madeiraEscura),
        i.caixa(x0 + 1.3, 1.85, 0.87, 0.6, 0.45, 0.06, COR.papel),
      ].join("");
    case "oitiva":
      return [
        pessoa,
        cadeira(i, x0 + 1.75, 1.0, COR.marinho),
        mesa(i, x0 + 1.2, 1.7, 1.6, 0.95, COR.madeira),
        cadeira(i, x0 + 1.75, 2.85, COR.marinho),
      ].join("");
    case "biblioteca":
      return [
        estante(i, x0 + 0.2, 1.1, 2.5, COR.madeira),
        estante(i, x0 + 1.45, 1.1, 2.5, COR.madeira),
        estante(i, x0 + 2.7, 1.1, 2.5, COR.madeira),
        mesa(i, x0 + 1.2, 2.0, 1.5, 0.9, COR.madeiraEscura),
        i.caixa(x0 + 1.6, 2.2, 0.87, 0.6, 0.45, 0.1, "#c8553f"),
      ].join("");
    default:
      return "";
  }
}

function desenharAndar(andar: Andar): string {
  const i = isoDoAndar(andar);
  const salas = Object.entries(PLANTA)
    .filter(([, lugar]) => lugar.andar === andar)
    .sort(([, a], [, b]) => a.posicao - b.posicao)
    .map(([id]) => id);
  const comprimento = SALA_X * salas.length;
  const h = ALTURA_DA_PAREDE;

  const partes: string[] = [
    i.sombra(0.6, 0.8, comprimento + 0.4, SALA_Y + 0.4, 0.22),
    // Laje.
    i.caixa(-0.25, -0.25, -0.45, comprimento + 0.25, SALA_Y + 0.25, 0.45, COR.laje),
    // Paredes do fundo, com a espessura no alto.
    i.faceY(0, 0, 0, comprimento, h, COR.parede),
    i.faceX(0, 0, 0, SALA_Y, h, clarear(COR.parede, 0.25)),
    i.topo(-0.25, -0.25, h, comprimento + 0.25, 0.25, clarear(COR.parede, 0.4)),
    i.topo(-0.25, 0, h, 0.25, SALA_Y, clarear(COR.parede, 0.4)),
    i.faceY(0, 0, 0, comprimento, 0.22, COR.rodape),
    i.faceX(0, 0, 0, SALA_Y, 0.22, COR.rodape),
  ];

  salas.forEach((sala, posicao) => {
    const x0 = posicao * SALA_X;
    partes.push(i.topo(x0, 0, 0, SALA_X, SALA_Y, PISOS[sala] ?? COR.parede));
    // Janela na parede do fundo (a carceragem tem só uma fresta gradeada).
    partes.push(
      sala === "carceragem"
        ? i.faceY(0, x0 + 1.4, 2.2, 1.2, 0.45, "#6d7885")
        : sala === "biblioteca" || sala === "gabinete" || sala === "cartorio"
          ? ""
          : i.faceY(0, x0 + 2.2, 1.3, 1.3, 1.2, COR.vidro),
    );
    partes.push(moveis(i, sala, x0));
    // Divisória baixa para a sala seguinte, com o vão da porta na frente.
    if (posicao < salas.length - 1) {
      partes.push(i.caixa(x0 + SALA_X - 0.1, 0, 0, 0.2, 3.3, 1.3, COR.parede));
    }
  });

  // Na sala do canto, uma janela na parede lateral.
  partes.splice(8, 0, i.faceX(0, 1.6, 1.3, 1.6, 1.2, COR.vidro));
  return partes.join("");
}

function desenharPatio(): string {
  const i = isoDoAndar("terreo");
  const branco = "#f4f1e8";
  return [
    i.sombra(5.4, 6.5, 3.6, 1.6, 0.25),
    // Rodas, carroceria, cabine e giroflex da viatura.
    i.caixa(5.6, 7.35, 0, 0.6, 0.2, 0.45, "#2b2f36"),
    i.caixa(7.7, 7.35, 0, 0.6, 0.2, 0.45, "#2b2f36"),
    i.caixa(5.2, 6.3, 0.25, 3.4, 1.2, 0.6, branco),
    i.faceY(7.5, 5.2, 0.4, 3.4, 0.22, COR.marinho),
    i.caixa(6.0, 6.4, 0.85, 1.7, 1.0, 0.5, "#3d5878"),
    i.caixa(6.65, 6.6, 1.35, 0.2, 0.6, 0.14, "#d6453c"),
    i.caixa(6.85, 6.6, 1.35, 0.2, 0.6, 0.14, "#3f7fd6"),
  ].join("");
}

let cenaPronta: string | null = null;

/** O conteúdo SVG (sem a tag `<svg>`) da delegacia: os dois andares e o pátio. */
export function desenharDelegacia(): string {
  cenaPronta ??= [
    `<defs>${DEFS_DO_ISO}</defs>`,
    desenharAndar("primeiro"),
    desenharAndar("terreo"),
    desenharPatio(),
  ].join("");
  return cenaPronta;
}

export interface LugarDaSala {
  /** Onde o avatar para, na sala. */
  readonly avatar: PontoDeTela;
  /** Onde fica a placa com o nome da sala. */
  readonly placa: PontoDeTela;
  /** Contorno da sala, para o toque. */
  readonly area: readonly PontoDeTela[];
}

/** Posições de uma sala na cena, nas coordenadas do SVG. */
export function lugarDaSala(sala: string): LugarDaSala {
  const lugar = PLANTA[sala];
  if (!lugar) throw new Error(`Sala fora da planta: ${sala}`);
  const i = isoDoAndar(lugar.andar);
  const x0 = lugar.posicao * SALA_X;
  const x1 = x0 + SALA_X;
  const h = ALTURA_DA_PAREDE;
  return {
    avatar: i.ponto(x0 + 2.7, 4.0, 0),
    placa: i.ponto(x0 + SALA_X / 2, 0, h + 0.25),
    area: [
      i.ponto(x0, 0, h),
      i.ponto(x1, 0, h),
      i.ponto(x1, 0, 0),
      i.ponto(x1, SALA_Y, 0),
      i.ponto(x0, SALA_Y, 0),
      i.ponto(x0, 0, 0),
    ],
  };
}

/** Onde o avatar fica antes de entrar: no pátio, ao lado da viatura. */
export const LUGAR_DO_PATIO: PontoDeTela = isoDoAndar("terreo").ponto(3.3, 7.5, 0);

export const TAMANHO_DO_BONECO = {
  largura: BONECO.largura * ESCALA_DO_BONECO,
  altura: BONECO.altura * ESCALA_DO_BONECO,
  ancoraX: BONECO.ancoraX * ESCALA_DO_BONECO,
  ancoraY: BONECO.ancoraY * ESCALA_DO_BONECO,
} as const;
