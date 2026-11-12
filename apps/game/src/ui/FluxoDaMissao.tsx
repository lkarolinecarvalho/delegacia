import { type Caso, conteudo, type Missao } from "@delegacia/content";
import {
  type Analise,
  analisarFato,
  analisarProcedimento,
  type Procedimento,
} from "@delegacia/motor";
import { useMemo, useState } from "react";
import { selecionarAfirmativas } from "../orquestrador/afirmativas";
import { perguntasDeFixacao } from "../orquestrador/aula";
import { trilhaDaAnalise } from "../orquestrador/ficha";
import { tocar } from "../som/sons";
import { aulasPendentes } from "../state/jogo";
import { useStore } from "../state/store";
import { Afirmativas } from "./Afirmativas";
import { AulaEmBaloes, Fixacao } from "./AulaEmBaloes";
import { Fala, Regras } from "./comum";
import { FichaDeAnalise } from "./FichaDeAnalise";
import { IconeEstrela } from "./icones";

type Passo = "conversa" | "aulas" | "fixacao" | "fato" | "ficha" | "afirmativas" | "desfecho";

const NOMES_DOS_PASSOS: Readonly<Record<Passo, string>> = {
  conversa: "Conversa",
  aulas: "Aula",
  fixacao: "Fixação",
  fato: "O fato",
  ficha: "Análise",
  afirmativas: "Afirmativas",
  desfecho: "Desfecho",
};

export function CartaoDoFato({ caso }: { caso: Caso }) {
  return (
    <div className="cartao-do-fato">
      <span className="etiqueta">O que ficou apurado</span>
      <h3>{caso.titulo}</h3>
      <ul>
        {caso.linhas.map((linha) => (
          <li key={linha}>{linha}</li>
        ))}
      </ul>
    </div>
  );
}

/** A análise do motor, etapa por etapa: é o que fica registrado do caso. */
export function Trilha({
  analise,
  procedimento = null,
}: {
  analise: Analise;
  procedimento?: Procedimento | null;
}) {
  return (
    <ol className="trilha">
      {trilhaDaAnalise(analise, procedimento).map((linha) => (
        <li key={linha.etapa} className={linha.final ? "trilha-final" : undefined}>
          <span className="trilha-etapa">{linha.etapa}</span>
          <span className="trilha-texto">{linha.texto}</span>
        </li>
      ))}
    </ol>
  );
}

interface Props {
  readonly missao: Missao;
  /** Caso do plantão livre: dá pontos e encerra o plantão, sem avançar a campanha. */
  readonly livre?: boolean;
  readonly aoFechar: () => void;
}

/**
 * O ciclo de uma missão (GDD, seção 7): conversa → aulas → fato → ficha → afirmativas →
 * desfecho. A missão é concluída ao chegar ao desfecho; fechar antes disso a deixa
 * para depois.
 */
export function FluxoDaMissao({ missao, livre = false, aoFechar }: Props) {
  const verTema = useStore((s) => s.verTema);
  const concluir = useStore((s) => s.concluir);
  const concluirLivre = useStore((s) => s.concluirLivre);
  // Fotografia do estado ao abrir a missão: as aulas e as afirmativas não mudam no meio.
  const [aulas] = useState(() =>
    aulasPendentes(useStore.getState().jogo, missao).flatMap(
      (id) => conteudo.teoria.find((t) => t.id === id) ?? [],
    ),
  );
  const [afirmativas] = useState(() =>
    selecionarAfirmativas(missao, conteudo.afirmativas, useStore.getState().jogo),
  );
  const fixacao = useMemo(() => perguntasDeFixacao(aulas), [aulas]);
  const analise = useMemo(() => (missao.caso ? analisarFato(missao.caso.fato) : null), [missao]);
  const procedimento = useMemo(
    () =>
      analise && missao.caso?.contexto ? analisarProcedimento(analise, missao.caso.contexto) : null,
    [analise, missao],
  );

  const passos = useMemo<Passo[]>(
    () => [
      "conversa",
      ...(aulas.length > 0 ? (["aulas"] as const) : []),
      ...(fixacao.length > 0 ? (["fixacao"] as const) : []),
      ...(missao.caso ? (["fato", "ficha"] as const) : []),
      ...(missao.caso && afirmativas.length > 0 ? (["afirmativas"] as const) : []),
      "desfecho",
    ],
    [aulas, fixacao, afirmativas, missao],
  );
  const [indice, setIndice] = useState(0);
  const [fala, setFala] = useState(0);
  const [errosNaFicha, setErrosNaFicha] = useState(0);
  const passo = passos[indice] ?? "desfecho";

  const avancar = (erros = errosNaFicha) => {
    const proximo = passos[indice + 1];
    if (proximo === "desfecho") {
      if (livre) concluirLivre();
      else concluir(missao, analise, erros, procedimento);
      tocar("missao");
    } else {
      tocar("avanca");
    }
    setIndice(indice + 1);
  };

  const falaAtual = missao.dialogo[fala];

  return (
    <div className="fluxo">
      <ol className="fluxo-passos" aria-label="Etapas da missão">
        {passos.map((p, i) => (
          <li
            key={p}
            className={i === indice ? "atual" : i < indice ? "feito" : undefined}
            aria-current={i === indice ? "step" : undefined}
          >
            {NOMES_DOS_PASSOS[p]}
          </li>
        ))}
      </ol>

      {passo === "conversa" && falaAtual && (
        <>
          <Fala npc={falaAtual.npc}>{falaAtual.texto}</Fala>
          <button
            type="button"
            className="botao botao-principal"
            onClick={() => {
              if (fala + 1 < missao.dialogo.length) {
                tocar("toque");
                setFala(fala + 1);
              } else {
                avancar();
              }
            }}
          >
            Continuar
          </button>
        </>
      )}

      {passo === "aulas" && (
        <AulaEmBaloes temas={aulas} aoVerTema={verTema} aoTerminar={() => avancar()} />
      )}

      {passo === "fixacao" && <Fixacao perguntas={fixacao} aoTerminar={() => avancar()} />}

      {passo === "fato" && missao.caso && (
        <>
          <CartaoDoFato caso={missao.caso} />
          <p className="dica">
            O que está no cartão é o que aconteceu. Agora, a análise é com você.
          </p>
          <button type="button" className="botao botao-principal" onClick={() => avancar()}>
            Analisar o caso
          </button>
        </>
      )}

      {passo === "ficha" && missao.caso && analise && (
        <>
          <details className="rever-o-fato">
            <summary>Rever o fato</summary>
            <CartaoDoFato caso={missao.caso} />
          </details>
          <FichaDeAnalise
            caso={missao.caso}
            analise={analise}
            procedimento={procedimento}
            capitulo={missao.capitulo}
            aoAcertar={(erros) => {
              setErrosNaFicha(erros);
              avancar(erros);
            }}
          />
        </>
      )}

      {passo === "afirmativas" && (
        <Afirmativas
          afirmativas={afirmativas}
          aoTerminar={() => avancar()}
          rotuloFinal="Ver o desfecho"
        />
      )}

      {passo === "desfecho" && (
        <div className="desfecho">
          {missao.caso && analise ? (
            <>
              <span className="etiqueta">Registrado no plantão</span>
              <Trilha analise={analise} procedimento={procedimento} />
              <p className="desfecho-texto">{missao.caso.desfecho}</p>
              {procedimento?.preso && (
                <p className="dica">
                  O autor fica preso até a audiência de custódia, em até 24 horas.
                </p>
              )}
              {procedimento && procedimento.prazo !== "nao_se_aplica" && !livre && (
                <p className="dica">
                  O inquérito entrou no quadro da delegacia, com o prazo correndo.
                </p>
              )}
              <details className="rever-o-fato">
                <summary>Regras aplicadas</summary>
                <Regras ids={analise.regras} />
              </details>
            </>
          ) : (
            <p className="desfecho-texto">
              Conversa concluída. As aulas ficam guardadas na Biblioteca, em Teoria.
            </p>
          )}
          <p className="recompensa">
            <IconeEstrela /> +{missao.recompensa.pontos} pontos
            {missao.caso && errosNaFicha === 0 && <span> · análise certa de primeira</span>}
          </p>
          <button type="button" className="botao botao-principal" onClick={aoFechar}>
            {missao.caso ? "Encerrar o plantão" : "Concluir"}
          </button>
        </div>
      )}
    </div>
  );
}
