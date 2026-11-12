import { conteudo } from "@delegacia/content";
import { existeRegra, regra } from "@delegacia/motor";
import { type ReactNode, useEffect, useId } from "react";
import { desenharRetrato } from "../arte/bonecos";
import { paraDataUrl } from "../arte/svg";

const retratos = new Map<string, string>();

function urlDoRetrato(id: string): string {
  let url = retratos.get(id);
  if (!url) {
    url = paraDataUrl(desenharRetrato(id));
    retratos.set(id, url);
  }
  return url;
}

export function Retrato({ id, grande = false }: { id: string; grande?: boolean }) {
  return (
    <span className={grande ? "retrato retrato-grande" : "retrato"}>
      <img src={urlDoRetrato(id)} alt="" />
    </span>
  );
}

export function nomeDoNpc(id: string): string {
  return conteudo.npcs.find((n) => n.id === id)?.nome ?? id;
}

interface PropsDaFolha {
  readonly titulo: string;
  readonly icone?: ReactNode;
  readonly aoFechar: () => void;
  readonly children: ReactNode;
}

/** Base de todos os painéis: uma caixa de papel no meio do palco, com faixa no alto. */
export function Folha({ titulo, icone, aoFechar, children }: PropsDaFolha) {
  const idDoTitulo = useId();
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  return (
    <div className="folha-fundo">
      <button type="button" className="folha-veu" aria-label="Fechar painel" onClick={aoFechar} />
      <section className="folha" role="dialog" aria-modal="true" aria-labelledby={idDoTitulo}>
        <header className="folha-cabecalho">
          <h2 id={idDoTitulo} className="folha-faixa">
            {icone}
            {titulo}
          </h2>
          <button type="button" className="folha-fechar" aria-label="Fechar" onClick={aoFechar}>
            ×
          </button>
        </header>
        <div className="folha-conteudo">{children}</div>
      </section>
    </div>
  );
}

/** A regra de docs/regras-penais.md, com a fonte e as marcações (ADR-0004). */
export function RegraCitada({ id }: { id: string }) {
  if (!existeRegra(id)) return null;
  const r = regra(id);
  return (
    <details className="regra">
      <summary>
        <strong>{r.titulo}</strong>
        <span className="regra-fonte">{r.fonte}</span>
        {r.divergencia && <span className="marca marca-divergencia">há divergência</span>}
        {r.simplificacao && <span className="marca marca-didatica">nota didática</span>}
      </summary>
      <p>{r.resumo}</p>
      <p className="regra-id">{r.id}</p>
    </details>
  );
}

export function Regras({ ids }: { ids: readonly string[] }) {
  const unicas = [...new Set(ids)];
  if (unicas.length === 0) return null;
  return (
    <div className="regras">
      {unicas.map((id) => (
        <RegraCitada key={id} id={id} />
      ))}
    </div>
  );
}

export function Fala({ npc, children }: { npc: string; children: ReactNode }) {
  return (
    <div className="fala">
      <Retrato id={npc} grande />
      <div className="balao">
        <span className="balao-nome">{nomeDoNpc(npc)}</span>
        <p>{children}</p>
      </div>
    </div>
  );
}
