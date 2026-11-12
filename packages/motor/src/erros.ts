export type CodigoDeErro = "CASO_NAO_COBERTO" | "TIPIFICACAO_AMBIGUA" | "FATO_INVALIDO";

/**
 * O fato não pode ser analisado com as regras de docs/regras-penais.md. O motor nunca
 * "completa" com um palpite: recusa o caso.
 */
export class ErroDeFato extends Error {
  readonly codigo: CodigoDeErro;
  /** Regra que explica a recusa, quando houver. */
  readonly regra: string | undefined;

  constructor(codigo: CodigoDeErro, mensagem: string, regra?: string) {
    super(mensagem);
    this.name = "ErroDeFato";
    this.codigo = codigo;
    this.regra = regra;
  }
}
