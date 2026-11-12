import { tipoPenal } from "./catalogo";
import { ErroDeFato } from "./erros";
import type {
  Analise,
  Contexto,
  Fianca,
  Flagrante,
  Instauracao,
  PrazoDoInquerito,
  Procedimento,
  SituacaoDeFlagrante,
} from "./tipos";

/** Pena máxima, em meses, da infração de menor potencial ofensivo (R-JECRIM-01). */
const TETO_DO_MENOR_POTENCIAL = 24;
/** Pena máxima, em meses, até a qual o delegado concede fiança (R-FIANCA-01). */
const TETO_DA_FIANCA_DO_DELEGADO = 48;
/** Meses para a vítima representar ou oferecer queixa (R-ACAO-04). */
const PRAZO_DA_DECADENCIA = 6;

const FLAGRANTES: Readonly<
  Record<SituacaoDeFlagrante, { readonly especie: Flagrante; readonly regra: string }>
> = {
  // R-FLAG-01: está cometendo a infração ou acaba de cometê-la.
  cometendo: { especie: "proprio", regra: "R-FLAG-01" },
  acabou_de_cometer: { especie: "proprio", regra: "R-FLAG-01" },
  // R-FLAG-02: perseguido logo após, em situação que faça presumir ser o autor.
  perseguido_logo_apos: { especie: "improprio", regra: "R-FLAG-02" },
  // R-FLAG-03: encontrado logo depois com instrumentos, armas, objetos ou papéis.
  encontrado_logo_depois: { especie: "presumido", regra: "R-FLAG-03" },
  // R-FLAG-04: fora dessas hipóteses não há flagrante.
  nenhuma: { especie: "nao_ha", regra: "R-FLAG-04" },
};

/**
 * A fase policial do caso: ação penal, instauração, rito, flagrante, fiança e prazo do
 * inquérito (regras-penais.md, seção 10). Só existe quando a análise conclui por crime.
 */
export function analisarProcedimento(analise: Analise, contexto: Contexto): Procedimento {
  if (analise.conclusao !== "crime" || !analise.tipo) {
    throw new ErroDeFato(
      "CASO_NAO_COBERTO",
      "A fase policial só é analisada quando há crime. Ato infracional segue o ECA, ainda fora do jogo.",
    );
  }
  if (!Number.isInteger(contexto.mesesDesdeAAutoria) || contexto.mesesDesdeAAutoria < 0) {
    throw new ErroDeFato("FATO_INVALIDO", "Os meses desde a autoria precisam ser um inteiro.");
  }
  const tipo = tipoPenal(analise.tipo);
  const qualificado = analise.figura === "qualificado" ? tipo.qualificado : null;
  const penaMaxima = qualificado?.penaMaximaMeses ?? tipo.penaMaximaMeses;
  const inafiancavel = qualificado?.inafiancavel ?? tipo.inafiancavel;

  // Ação penal ------------------------------------------------------------------------
  // R-ACAO-01: a ação é pública incondicionada, salvo quando a lei diz outra coisa.
  const acao = tipo.acao;
  const regraDaAcao =
    acao === "publica_condicionada" ? "R-ACAO-02" : acao === "privada" ? "R-ACAO-03" : null;
  const regrasDaAcao = ["R-ACAO-01", ...(regraDaAcao ? [regraDaAcao] : []), tipo.regra];

  // Instauração -----------------------------------------------------------------------
  let instauracao: Instauracao;
  let regrasDaInstauracao: string[];
  if (!regraDaAcao) {
    instauracao = "pode_instaurar";
    regrasDaInstauracao = ["R-ACAO-01"];
  } else if (contexto.vitimaManifestou) {
    // R-ACAO-02 e R-ACAO-03: com a representação ou o requerimento, o delegado age.
    instauracao = "pode_instaurar";
    regrasDaInstauracao = [regraDaAcao];
  } else if (contexto.mesesDesdeAAutoria >= PRAZO_DA_DECADENCIA) {
    // R-ACAO-04: seis meses sem manifestação extinguem a punibilidade.
    instauracao = "decadencia";
    regrasDaInstauracao = [regraDaAcao, "R-ACAO-04"];
  } else {
    instauracao = "aguarda_a_vitima";
    regrasDaInstauracao = [regraDaAcao];
  }
  const podeAgir = instauracao === "pode_instaurar";

  // Rito ------------------------------------------------------------------------------
  // R-JECRIM-01: pena máxima de até dois anos. R-MP-01: a Lei Maria da Penha a afasta.
  const menorPotencialOfensivo = penaMaxima <= TETO_DO_MENOR_POTENCIAL && !tipo.afastaALei9099;
  const rito = menorPotencialOfensivo ? "termo_circunstanciado" : "inquerito";
  const regrasDoRito = [
    "R-JECRIM-01",
    ...(menorPotencialOfensivo ? ["R-JECRIM-02"] : []),
    ...(tipo.afastaALei9099 ? ["R-MP-01"] : []),
  ];

  // Flagrante -------------------------------------------------------------------------
  const { especie: flagrante, regra: regraDoFlagrante } = FLAGRANTES[contexto.situacao];
  // O auto de prisão em flagrante depende de o delegado poder agir. No termo
  // circunstanciado não se impõe prisão em flagrante (R-JECRIM-02).
  const autuado = flagrante !== "nao_ha" && podeAgir && !menorPotencialOfensivo;

  // Fiança ----------------------------------------------------------------------------
  let fianca: Fianca;
  let regrasDaFianca: string[];
  if (!autuado) {
    fianca = "nao_se_aplica";
    regrasDaFianca = menorPotencialOfensivo && flagrante !== "nao_ha" ? ["R-JECRIM-02"] : [];
  } else if (inafiancavel) {
    // R-FIANCA-03
    fianca = "inafiancavel";
    regrasDaFianca = ["R-FIANCA-03"];
  } else if (penaMaxima <= TETO_DA_FIANCA_DO_DELEGADO) {
    // R-FIANCA-01
    fianca = "delegado";
    regrasDaFianca = ["R-FIANCA-01"];
  } else {
    // R-FIANCA-02
    fianca = "juiz";
    regrasDaFianca = ["R-FIANCA-01", "R-FIANCA-02"];
  }
  // 📘 O jogo presume que a fiança arbitrada pelo delegado é paga (R-FIANCA-01).
  const preso = autuado && fianca !== "delegado";

  // Prazo do inquérito ------------------------------------------------------------------
  // R-IP-01: dez dias com o indiciado preso, trinta com ele solto.
  const prazo: PrazoDoInquerito =
    rito === "inquerito" && podeAgir ? (preso ? "10_dias" : "30_dias") : "nao_se_aplica";

  return {
    acao,
    menorPotencialOfensivo,
    instauracao,
    rito,
    flagrante,
    fianca,
    preso,
    prazo,
    regras: {
      acao: regrasDaAcao,
      instauracao: regrasDaInstauracao,
      rito: regrasDoRito,
      flagrante: [regraDoFlagrante],
      fianca: regrasDaFianca,
      prazo: prazo === "nao_se_aplica" ? [] : ["R-IP-01"],
    },
  };
}

/** Dias do prazo do inquérito, para o quadro da delegacia. */
export function diasDoPrazo(prazo: PrazoDoInquerito): number | null {
  return prazo === "10_dias" ? 10 : prazo === "30_dias" ? 30 : null;
}
