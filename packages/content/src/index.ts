import { type Conteudo, carregarConteudo } from "./carregar";
import { dadosBrutos } from "./dados";

export {
  type Conteudo,
  type ConteudoBruto,
  carregarConteudo,
  ErroDeConteudo,
  VARIANTES_MINIMAS,
} from "./carregar";
export { dadosBrutos } from "./dados";
export * from "./schemas";

/** O conteúdo do jogo, já validado. Conteúdo inválido impede o app de subir. */
export const conteudo: Conteudo = carregarConteudo(dadosBrutos);
