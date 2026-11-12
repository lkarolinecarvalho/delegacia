import type { Pergunta, Tema } from "@delegacia/content";
import { useMemo, useState } from "react";
import { baloesDaAula } from "../orquestrador/aula";
import { tocar } from "../som/sons";
import { Fala } from "./comum";

/** Quem dá as aulas. */
const PROFESSORA = "helena-delegada";

interface PropsDaAula {
  readonly temas: readonly Tema[];
  /** O jogador passou do último balão de um tema. */
  readonly aoVerTema: (tema: string) => void;
  readonly aoTerminar: () => void;
}

/**
 * A aula em balões: a Dra. Helena fala uma ideia por vez, e o jogador vai passando.
 * Nada de texto corrido; as perguntas vêm depois, na fixação.
 */
export function AulaEmBaloes({ temas, aoVerTema, aoTerminar }: PropsDaAula) {
  const baloes = useMemo(() => baloesDaAula(temas), [temas]);
  const [indice, setIndice] = useState(0);
  const balao = baloes[indice];
  if (!balao) return null;
  const doTema = baloes.filter((b) => b.tema === balao.tema);
  const posicao = doTema.indexOf(balao);

  const continuar = () => {
    if (balao.fechaOTema) aoVerTema(balao.tema);
    if (indice + 1 >= baloes.length) {
      aoTerminar();
      return;
    }
    tocar("toque");
    setIndice(indice + 1);
  };

  return (
    <div className="aula-em-baloes">
      <header className="aula-titulo">
        <span className="etiqueta">Aula da Dra. Helena</span>
        <h3>{balao.titulo}</h3>
        <ol className="aula-progresso" aria-label={`Balão ${posicao + 1} de ${doTema.length}`}>
          {doTema.map((b, i) => (
            <li
              key={`${b.tipo}-${b.texto}`}
              className={i < posicao ? "feito" : i === posicao ? "atual" : undefined}
            />
          ))}
        </ol>
      </header>
      <Fala key={indice} npc={PROFESSORA}>
        {balao.tipo === "exemplo" && <span className="etiqueta balao-etiqueta">Exemplo</span>}
        {balao.texto}
      </Fala>
      {balao.fonte && <p className="aula-fonte">Fonte: {balao.fonte}</p>}
      <button type="button" className="botao botao-principal" onClick={continuar}>
        Continuar
      </button>
    </div>
  );
}

interface PropsDaFixacao {
  readonly perguntas: readonly Pergunta[];
  readonly aoTerminar: () => void;
}

/** Fixação: as perguntas de Certo ou Errado da aula, uma por vez, depois dela. */
export function Fixacao({ perguntas, aoTerminar }: PropsDaFixacao) {
  const [indice, setIndice] = useState(0);
  const [resposta, setResposta] = useState<"C" | "E" | null>(null);
  const pergunta = perguntas[indice];
  if (!pergunta) return null;
  const acertou = resposta === pergunta.gabarito;

  const responder = (valor: "C" | "E") => {
    setResposta(valor);
    tocar(valor === pergunta.gabarito ? "acerto" : "erro");
  };
  const continuar = () => {
    if (indice + 1 >= perguntas.length) {
      aoTerminar();
      return;
    }
    setIndice(indice + 1);
    setResposta(null);
  };

  return (
    <div className="afirmativas">
      <p className="etiqueta">
        Fixação {perguntas.length > 1 && `(${indice + 1} de ${perguntas.length})`}
      </p>
      <p className="enunciado">{pergunta.enunciado}</p>
      {resposta === null ? (
        <div className="certo-errado">
          <button type="button" className="botao botao-certo" onClick={() => responder("C")}>
            Certo
          </button>
          <button type="button" className="botao botao-errado" onClick={() => responder("E")}>
            Errado
          </button>
        </div>
      ) : (
        <>
          <div className={acertou ? "retorno retorno-acerto" : "retorno retorno-erro"}>
            <strong>
              {acertou ? "Isso!" : "Não é bem assim."} Gabarito:{" "}
              {pergunta.gabarito === "C" ? "Certo" : "Errado"}.
            </strong>
            <p>{pergunta.explicacao}</p>
          </div>
          <button type="button" className="botao botao-principal" onClick={continuar}>
            Continuar
          </button>
        </>
      )}
    </div>
  );
}
