import type { Caso } from "@delegacia/content";
import {
  type Analise,
  type CampoDaFicha,
  compararFicha,
  esperadoNoCampo,
  type Procedimento,
  type ResultadoDaFicha,
  tipoPenal,
} from "@delegacia/motor";
import { useMemo, useState } from "react";
import {
  type EtapaDaFicha,
  fichaDasRespostas,
  montarFicha,
  type Opcao,
  previaDoErro,
  type ValorDaFicha,
} from "../orquestrador/ficha";
import { tocar } from "../som/sons";
import { Regras, Texto } from "./comum";

/** Depois de quantas conferências erradas o jogo oferece a resposta. */
const TENTATIVAS_ATE_A_AJUDA = 2;

type Respostas = Partial<Record<CampoDaFicha, ValorDaFicha>>;

const semAcento = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

interface PropsDasOpcoes {
  readonly etapa: EtapaDaFicha;
  readonly marcada: ValorDaFicha | undefined;
  readonly aoEscolher: (valor: ValorDaFicha) => void;
}

/** As opções de uma etapa. Na lista longa (o Código inteiro), com busca e por título. */
function Opcoes({ etapa, marcada, aoEscolher }: PropsDasOpcoes) {
  const [busca, setBusca] = useState("");
  const termo = semAcento(busca.trim());
  const visiveis = etapa.comBusca
    ? etapa.opcoes.filter(
        (o) =>
          o.valor === marcada ||
          termo === "" ||
          semAcento(`${o.rotulo} ${o.detalhe ?? ""}`).includes(termo),
      )
    : etapa.opcoes;
  const grupos = [...new Set(visiveis.map((o) => o.grupo))];
  const botao = (opcao: Opcao) => {
    const escolhida = marcada === opcao.valor;
    return (
      <button
        key={String(opcao.valor)}
        type="button"
        className={escolhida ? "opcao opcao-marcada" : "opcao"}
        aria-pressed={escolhida}
        onClick={() => aoEscolher(opcao.valor)}
      >
        <strong>{opcao.rotulo}</strong>
        {opcao.detalhe && <span>{opcao.detalhe}</span>}
      </button>
    );
  };
  return (
    <div className={etapa.comBusca ? "opcoes opcoes-do-codigo" : "opcoes"}>
      {etapa.comBusca && (
        <input
          type="search"
          className="busca"
          placeholder="Buscar no Código: nome, artigo ou verbo"
          aria-label="Buscar no Código"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      )}
      {grupos.map((grupo) => (
        <div key={grupo ?? "sem-grupo"} className="opcoes-grupo">
          {grupo && <span className="etiqueta">{grupo}</span>}
          {visiveis.filter((o) => o.grupo === grupo).map(botao)}
        </div>
      ))}
      {visiveis.length === 0 && <p className="suave">Nada encontrado no Código.</p>}
    </div>
  );
}

interface Props {
  readonly caso: Caso;
  readonly analise: Analise;
  /** A fase policial do caso, quando ele a tem. */
  readonly procedimento: Procedimento | null;
  readonly capitulo: number;
  /** A ficha bateu com a análise do motor. Recebe quantas conferências erraram antes. */
  readonly aoAcertar: (tentativasErradas: number) => void;
}

/**
 * A ficha de análise do caso: o "lançamento" deste jogo. O jogador responde as etapas
 * que a missão pede; a ficha é comparada com a análise do motor e nunca é gravada
 * (ADR-0002).
 */
export function FichaDeAnalise({ caso, analise, procedimento, capitulo, aoAcertar }: Props) {
  const etapas = useMemo(
    () => montarFicha(caso, analise, capitulo, procedimento),
    [caso, analise, capitulo, procedimento],
  );
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
    const comparacao = compararFicha(analise, fichaDasRespostas(respostas), procedimento);
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
      const esperado = esperadoNoCampo(analise, etapa.campo, procedimento);
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
          const previa = errada
            ? previaDoErro(etapa.campo, respostas[etapa.campo], procedimento)
            : null;
          return (
            <li key={etapa.campo} className={errada ? "etapa etapa-errada" : "etapa"}>
              <span className="etapa-titulo">{etapa.titulo}</span>
              <p className="etapa-pergunta">{etapa.pergunta}</p>
              <Opcoes
                etapa={etapa}
                marcada={respostas[etapa.campo]}
                aoEscolher={(valor) => escolher(etapa.campo, valor)}
              />
              {errada && (
                <div className="retorno retorno-erro">
                  {previa && (
                    <p className="previa">
                      <strong>Se fosse assim: </strong>
                      {previa}
                    </p>
                  )}
                  <p>
                    <Texto>
                      {caso.comentarios[etapa.campo] ?? "Releia o fato e a regra desta etapa."}
                    </Texto>
                  </p>
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
