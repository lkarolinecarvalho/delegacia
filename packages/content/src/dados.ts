import capitulos from "../data/capitulos.json";
import conceitos from "../data/conceitos.json";
import npcs from "../data/npcs.json";
import salas from "../data/salas.json";
import teoria from "../data/teoria.json";
import type { ConteudoBruto } from "./carregar";

// O Vite embute os JSON no pacote: o conteúdo funciona offline, sem I/O em tempo de jogo.
const arquivosDeMissao = import.meta.glob<unknown[]>("../data/missoes/*.json", {
  eager: true,
  import: "default",
});
const arquivosDeAfirmativas = import.meta.glob<unknown[]>("../data/afirmativas/*.json", {
  eager: true,
  import: "default",
});

/** Cada arquivo é uma lista; o nome do arquivo guarda a ordem. */
const emOrdem = (arquivos: Record<string, unknown[]>): unknown[] =>
  Object.keys(arquivos)
    .sort()
    .flatMap((caminho) => arquivos[caminho] ?? []);

/** Dados do jogo como estão nos arquivos, antes da validação. */
export const dadosBrutos: ConteudoBruto = {
  salas,
  npcs,
  capitulos,
  conceitos,
  teoria,
  missoes: emOrdem(arquivosDeMissao),
  afirmativas: emOrdem(arquivosDeAfirmativas),
};
