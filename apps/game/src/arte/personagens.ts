/** Aparência dos personagens. Os desenhos (boneco e retrato) ficam em `bonecos.ts`. */
export interface Aparencia {
  readonly pele: string;
  readonly cabelo: string;
  readonly roupa: string;
  /** Colete por cima da roupa. */
  readonly avental?: string;
  readonly calca: string;
  readonly coque?: boolean;
  readonly bone?: string;
  readonly barba?: boolean;
  readonly oculos?: boolean;
  readonly gravata?: string;
}

const AVATAR: Aparencia = {
  pele: "#f0c39a",
  cabelo: "#4a2f22",
  roupa: "#fbf6ea",
  avental: "#2f4a6b",
  calca: "#3d4756",
  gravata: "#f2b632",
};

const PADRAO: Aparencia = {
  pele: "#f1c7a0",
  cabelo: "#4a3728",
  roupa: "#7fa6c9",
  calca: "#5b6470",
};

/** Aparência de cada personagem, pelo id do NPC no conteúdo. */
const APARENCIAS: Readonly<Record<string, Aparencia>> = {
  avatar: AVATAR,
  "helena-delegada": {
    pele: "#c98f64",
    cabelo: "#2b2320",
    roupa: "#34495e",
    calca: "#2f3b45",
    gravata: "#c8553f",
    oculos: true,
  },
  "bento-escrivao": {
    pele: "#f1c7a0",
    cabelo: "#c9c4bb",
    roupa: "#e9dfc6",
    avental: "#8a6f4d",
    calca: "#5b4a3a",
    oculos: true,
    barba: true,
  },
  "rocha-agente": {
    pele: "#a9744f",
    cabelo: "#241f1c",
    roupa: "#2b2f36",
    avental: "#1f2937",
    calca: "#2b2f36",
    bone: "#1f2937",
  },
  "lia-investigadora": {
    pele: "#c98f64",
    cabelo: "#2b2320",
    roupa: "#8a4b5a",
    calca: "#3d4756",
    coque: true,
  },
  "tavares-investigador": {
    pele: "#e9b98f",
    cabelo: "#5a3a26",
    roupa: "#5f7a52",
    calca: "#4a3f35",
    barba: true,
  },
  "nadia-investigadora": {
    pele: "#8a5a3c",
    cabelo: "#15100d",
    roupa: "#4f6f9a",
    calca: "#2f3b45",
    oculos: true,
  },
  "anselmo-cidadao": {
    pele: "#e2ae84",
    cabelo: "#c9c4bb",
    roupa: "#b9a27a",
    calca: "#5b4a3a",
    oculos: true,
  },
  "cida-recepcao": {
    pele: "#e9b98f",
    cabelo: "#8a4b2f",
    roupa: "#7fa6c9",
    calca: "#3d4756",
    coque: true,
  },
};

export function aparenciaDe(id: string): Aparencia {
  return APARENCIAS[id] ?? PADRAO;
}
