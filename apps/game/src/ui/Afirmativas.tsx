import type { Afirmativa } from "@delegacia/content";
import { useState } from "react";
import { tocar } from "../som/sons";
import { PONTOS_POR_AFIRMATIVA, resultadoDaResposta } from "../state/jogo";
import { useStore } from "../state/store";
import { Regras } from "./comum";

type Resposta = "C" | "E" | "branco";

interface Props {
  readonly afirmativas: readonly Afirmativa[];
  readonly aoTerminar: () => void;
  readonly rotuloFinal?: string;
}

/** Afirmativas de Certo/Errado, uma por vez, com explicação e regra (fluxo-afirmativas.md). */
export function Afirmativas({ afirmativas, aoTerminar, rotuloFinal = "Continuar" }: Props) {
  const modoBanca = useStore((s) => s.jogo.modoBanca);
  const responder = useStore((s) => s.responder);
  const [indice, setIndice] = useState(0);
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const afirmativa = afirmativas[indice];
  if (!afirmativa) return null;

  const escolher = (valor: Resposta) => {
    setResposta(valor);
    responder(afirmativa, valor);
    const resultado = resultadoDaResposta(afirmativa, valor);
    tocar(resultado === "acerto" ? "acerto" : resultado === "erro" ? "erro" : "toque");
  };
  const avancar = () => {
    if (indice + 1 >= afirmativas.length) {
      aoTerminar();
      return;
    }
    setIndice(indice + 1);
    setResposta(null);
  };

  const resultado = resposta ? resultadoDaResposta(afirmativa, resposta) : null;
  const placar =
    resultado === "acerto"
      ? modoBanca
        ? "+1 na banca"
        : `+${PONTOS_POR_AFIRMATIVA} pontos`
      : resultado === "erro" && modoBanca
        ? "−1 na banca"
        : null;
  const ultima = indice + 1 >= afirmativas.length;

  return (
    <div className="afirmativas">
      <p className="etiqueta">
        Julgue a afirmativa {afirmativas.length > 1 && `(${indice + 1} de ${afirmativas.length})`}
      </p>
      <p className="enunciado">{afirmativa.enunciado}</p>
      {resposta === null ? (
        <div className="certo-errado">
          <button type="button" className="botao botao-certo" onClick={() => escolher("C")}>
            Certo
          </button>
          <button type="button" className="botao botao-errado" onClick={() => escolher("E")}>
            Errado
          </button>
          {modoBanca && (
            <button type="button" className="botao botao-branco" onClick={() => escolher("branco")}>
              Deixar em branco
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={resultado === "acerto" ? "retorno retorno-acerto" : "retorno retorno-erro"}
          >
            <strong>
              {resultado === "acerto" ? "Acertou!" : resultado === "erro" ? "Errou." : "Em branco."}{" "}
              Gabarito: {afirmativa.gabarito === "C" ? "Certo" : "Errado"}.
              {placar && <span className="placar"> {placar}</span>}
            </strong>
            <p>{afirmativa.explicacao}</p>
          </div>
          <Regras ids={afirmativa.regras} />
          <button type="button" className="botao botao-principal" onClick={avancar}>
            {ultima ? rotuloFinal : "Próxima"}
          </button>
        </>
      )}
    </div>
  );
}
