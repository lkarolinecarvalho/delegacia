import type { Pergunta, Tema } from "@delegacia/content";
import { useMemo, useState } from "react";
import { baloesDaAula } from "../orquestrador/aula";
import { tocar } from "../som/sons";
import { Fala, Texto } from "./comum";
import { Esquema } from "./Esquema";

/** Quem lembra: o próprio delegado. */
const DELEGADO = "voce";

interface PropsDaAula {
  readonly temas: readonly Tema[];
  /** O jogador passou do último balão de um tema. */
  readonly aoVerTema: (tema: string) => void;
  readonly aoTerminar: () => void;
}

/**
 * O delegado lembra o que estudou sobre o assunto do caso, uma ideia por balão, e o
 * jogador vai passando. Ninguém dá aula: os colegas apresentam o caso, e o conceito
 * vem da memória de quem estudou para o concurso.
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
        <span className="etiqueta">Você se lembra do que estudou</span>
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
      <Fala key={indice} npc={DELEGADO} pensando>
        {balao.tipo === "exemplo" && <span className="etiqueta balao-etiqueta">Um exemplo</span>}
        <Texto>{balao.texto}</Texto>
      </Fala>
      {balao.esquema && <Esquema esquema={balao.esquema} />}
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

/** Fixação: perguntas de Certo ou Errado sobre o que foi lembrado, uma por vez. */
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
      <p className="enunciado">
        <Texto>{pergunta.enunciado}</Texto>
      </p>
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
            <p>
              <Texto>{pergunta.explicacao}</Texto>
            </p>
          </div>
          <button type="button" className="botao botao-principal" onClick={continuar}>
            Continuar
          </button>
        </>
      )}
    </div>
  );
}
