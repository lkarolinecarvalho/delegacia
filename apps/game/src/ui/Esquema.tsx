import type { Esquema as DadosDoEsquema } from "@delegacia/content";
import { Fragment } from "react";

const traco = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Seta() {
  return (
    <svg className="esquema-sinal" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" {...traco} />
    </svg>
  );
}

function Mais() {
  return (
    <svg className="esquema-sinal" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" {...traco} />
    </svg>
  );
}

function Igual() {
  return (
    <svg className="esquema-sinal" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9h14M5 15h14" {...traco} />
    </svg>
  );
}

/** Marca de um requisito: presente, ausente ou não analisado. */
function Marca({ valor }: { valor: boolean | null | undefined }) {
  if (valor === undefined) {
    return (
      <svg className="esquema-marca" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    );
  }
  if (valor === null) {
    return (
      <svg
        className="esquema-marca esquema-marca-neutra"
        viewBox="0 0 24 24"
        aria-label="não analisado"
      >
        <path d="M7 12h10" {...traco} />
      </svg>
    );
  }
  return valor ? (
    <svg className="esquema-marca esquema-marca-sim" viewBox="0 0 24 24" aria-label="presente">
      <path d="M5 12.5l4.5 4.5L19 7.5" {...traco} />
    </svg>
  ) : (
    <svg className="esquema-marca esquema-marca-nao" viewBox="0 0 24 24" aria-label="ausente">
      <path d="M6 6l12 12M18 6L6 18" {...traco} />
    </svg>
  );
}

interface Props {
  readonly esquema: DadosDoEsquema;
  /** Em `requisitos`: o que o caso tem (true), não tem (false) ou não chegou a analisar. */
  readonly marcas?: readonly (boolean | null)[] | undefined;
  /** Em `etapas`: até onde o caso chegou (índice da etapa). */
  readonly ativo?: number | undefined;
}

/**
 * O desenho de um conceito, montado em vetor a partir dos dados do tema: passos em
 * sequência, partes que se somam, colunas lado a lado ou um conceito e seus requisitos.
 */
export function Esquema({ esquema, marcas, ativo }: Props) {
  if (esquema.tipo === "etapas") {
    return (
      <div className="esquema esquema-etapas">
        {esquema.itens.map((item, i) => (
          <Fragment key={item}>
            {i > 0 && <Seta />}
            <span
              className={
                ativo === undefined
                  ? "esquema-caixa"
                  : i === ativo
                    ? "esquema-caixa esquema-caixa-atual"
                    : i < ativo
                      ? "esquema-caixa esquema-caixa-feita"
                      : "esquema-caixa esquema-caixa-apagada"
              }
            >
              {item}
            </span>
          </Fragment>
        ))}
      </div>
    );
  }
  if (esquema.tipo === "soma") {
    return (
      <div className="esquema esquema-etapas">
        {esquema.partes.map((parte, i) => (
          <Fragment key={parte}>
            {i > 0 && <Mais />}
            <span className="esquema-caixa">{parte}</span>
          </Fragment>
        ))}
        <Igual />
        <span className="esquema-caixa esquema-caixa-atual">{esquema.resultado}</span>
      </div>
    );
  }
  if (esquema.tipo === "comparacao") {
    return (
      <div
        className="esquema esquema-colunas"
        style={{ gridTemplateColumns: `repeat(${esquema.colunas.length}, 1fr)` }}
      >
        {esquema.colunas.map((coluna) => (
          <div key={coluna.titulo} className="esquema-coluna">
            <strong>{coluna.titulo}</strong>
            <ul>
              {coluna.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="esquema esquema-requisitos">
      <strong className="esquema-centro">{esquema.centro}</strong>
      <svg
        className="esquema-chave"
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M100 0v7M8 16V7h184v9"
          {...traco}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ul>
        {esquema.itens.map((item, i) => (
          <li key={item}>
            <Marca valor={marcas ? marcas[i] : undefined} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
