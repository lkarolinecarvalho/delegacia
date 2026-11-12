import type { Caso } from "@delegacia/content";
import {
  type Analise,
  type CampoDaFicha,
  compararFicha,
  esperadoNoCampo,
  type ResultadoDaFicha,
  tipoPenal,
} from "@delegacia/motor";
import { useMemo, useState } from "react";
import { fichaDasRespostas, montarFicha, type ValorDaFicha } from "../orquestrador/ficha";
import { tocar } from "../som/sons";
import { Regras } from "./comum";

/** Depois de quantas conferências erradas o jogo oferece a resposta. */
const TENTATIVAS_ATE_A_AJUDA = 2;

type Respostas = Partial<Record<CampoDaFicha, ValorDaFicha>>;

interface Props {
  readonly caso: Caso;
  readonly analise: Analise;
  readonly capitulo: number;
  /** A ficha bateu com a análise do motor. Recebe quantas conferências erraram antes. */
  readonly aoAcertar: (tentativasErradas: number) => void;
}

/**
 * A ficha de análise do caso: o "lançamento" deste jogo. O jogador responde as etapas
 * que a missão pede; a ficha é comparada com a análise do motor e nunca é gravada
 * (ADR-0002).
 */
export function FichaDeAnalise({ caso, analise, capitulo, aoAcertar }: Props) {
  const etapas = useMemo(() => montarFicha(caso, analise, capitulo), [caso, analise, capitulo]);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [resultado, setResultado] = useState<ResultadoDaFicha | null>(null);
  const [erros, setErros] = useState(0);

  const perguntas = etapas.filter((e) => e.modo === "pergunta");
  const completa = perguntas.every((e) => respostas[e.campo] !== undefined);
  const tipo = caso.tipoInformado && analise.tipo ? tipoPenal(analise.tipo) : null;

  const escolher = (campo: CampoDaFicha, valor: ValorDaFicha) => {
    tocar("toque");
    setRespostas((atuais) => ({ ...atuais, [campo]: valor }));
    // Mudou a resposta: o retorno daquela etapa deixa de valer.
    setResultado(
      (atual) => atual && { ...atual, campos: atual.campos.filter((c) => c.campo !== campo) },
    );
  };

  const conferir = () => {
    const comparacao = compararFicha(analise, fichaDasRespostas(respostas));
    if (comparacao.correta) {
      tocar("acerto");
      aoAcertar(erros);
      return;
    }
    tocar("erro");
    setErros(erros + 1);
    setResultado(comparacao);
  };

  const mostrarResposta = () => {
    const certas: Respostas = {};
    for (const etapa of perguntas) {
      const esperado = esperadoNoCampo(analise, etapa.campo);
      if (typeof esperado === "string" || typeof esperado === "boolean") {
        certas[etapa.campo] = esperado;
      }
    }
    setRespostas(certas);
    setResultado(null);
  };

  return (
    <div className="ficha">
      {tipo && (
        <div className="ficha-tipo">
          <span className="etiqueta">Tipo penal em análise</span>
          <strong>
            {tipo.nome} <span className="suave">({tipo.artigo})</span>
          </strong>
          <p>{tipo.texto}</p>
        </div>
      )}
      <ol className="ficha-etapas">
        {etapas.map((etapa) => {
          if (etapa.modo === "informada") {
            return (
              <li key={etapa.campo} className="etapa etapa-informada">
                <span className="etapa-titulo">{etapa.titulo}</span>
                <span className="etapa-valor">{etapa.informado?.rotulo ?? "—"}</span>
                <span className="etapa-nota">já analisado</span>
              </li>
            );
          }
          const retorno = resultado?.campos.find((c) => c.campo === etapa.campo);
          const errada = retorno !== undefined && !retorno.correto;
          return (
            <li key={etapa.campo} className={errada ? "etapa etapa-errada" : "etapa"}>
              <span className="etapa-titulo">{etapa.titulo}</span>
              <p className="etapa-pergunta">{etapa.pergunta}</p>
              <div className="opcoes">
                {etapa.opcoes.map((opcao) => {
                  const marcada = respostas[etapa.campo] === opcao.valor;
                  return (
                    <button
                      key={String(opcao.valor)}
                      type="button"
                      className={marcada ? "opcao opcao-marcada" : "opcao"}
                      aria-pressed={marcada}
                      onClick={() => escolher(etapa.campo, opcao.valor)}
                    >
                      <strong>{opcao.rotulo}</strong>
                      {opcao.detalhe && <span>{opcao.detalhe}</span>}
                    </button>
                  );
                })}
              </div>
              {errada && (
                <div className="retorno retorno-erro">
                  <p>{caso.comentarios[etapa.campo] ?? "Releia o fato e a regra desta etapa."}</p>
                  <Regras ids={retorno.regras} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        className="botao botao-principal"
        disabled={!completa}
        onClick={conferir}
      >
        Conferir a análise
      </button>
      {erros >= TENTATIVAS_ATE_A_AJUDA && resultado && (
        <button type="button" className="botao botao-discreto" onClick={mostrarResposta}>
          Mostrar a resposta
        </button>
      )}
    </div>
  );
}
