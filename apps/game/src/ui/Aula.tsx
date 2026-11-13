import type { Pergunta, Tema } from "@delegacia/content";
import { useState } from "react";
import { tocar } from "../som/sons";
import { Retrato, Texto } from "./comum";

function PerguntaDaAula({ pergunta }: { pergunta: Pergunta }) {
  const [resposta, setResposta] = useState<"C" | "E" | null>(null);
  const responder = (valor: "C" | "E") => {
    setResposta(valor);
    tocar(valor === pergunta.gabarito ? "acerto" : "erro");
  };
  const acertou = resposta === pergunta.gabarito;
  return (
    <div className="aula-pergunta">
      <p>{pergunta.enunciado}</p>
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
        <p className={acertou ? "retorno retorno-acerto" : "retorno retorno-erro"}>
          <strong>
            {acertou ? "Isso!" : "Não é bem assim."} Gabarito:{" "}
            {pergunta.gabarito === "C" ? "Certo" : "Errado"}.
          </strong>{" "}
          {pergunta.explicacao}
        </p>
      )}
    </div>
  );
}

interface Props {
  readonly tema: Tema;
  /** Texto do botão final. Sem `aoContinuar`, a aula é só leitura. */
  readonly rotulo?: string;
  readonly aoContinuar?: () => void;
}

/** Uma aula curta da Dra. Helena: pontos, um exemplo e perguntas rápidas. */
export function Aula({ tema, rotulo = "Entendi", aoContinuar }: Props) {
  return (
    <article className="aula">
      <header className="aula-cabecalho">
        <Retrato id="helena-delegada" grande />
        <div>
          <span className="etiqueta">Aula da Dra. Helena</span>
          <h3>{tema.titulo}</h3>
          <p className="suave">{tema.resumo}</p>
        </div>
      </header>
      <ul className="aula-pontos">
        {tema.pontos.map((ponto) => (
          <li key={ponto}>
            <Texto>{ponto}</Texto>
          </li>
        ))}
      </ul>
      <div className="aula-exemplo">
        <span className="etiqueta">Exemplo</span>
        <p>
          <Texto>{tema.exemplo}</Texto>
        </p>
      </div>
      {tema.fonte && <p className="aula-fonte">Fonte: {tema.fonte}</p>}
      {tema.perguntas.map((pergunta) => (
        <PerguntaDaAula key={pergunta.enunciado} pergunta={pergunta} />
      ))}
      {aoContinuar && (
        <button type="button" className="botao botao-principal" onClick={aoContinuar}>
          {rotulo}
        </button>
      )}
    </article>
  );
}
