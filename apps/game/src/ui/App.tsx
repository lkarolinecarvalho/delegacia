import { conteudo, type Missao } from "@delegacia/content";
import { useCallback, useEffect, useRef, useState } from "react";
import { tocar } from "../som/sons";
import { capituloAtual, proximaMissao } from "../state/jogo";
import { type Painel, useStore } from "../state/store";
import { Cena } from "./Cena";
import { Folha, Retrato } from "./comum";
import { FluxoDaMissao } from "./FluxoDaMissao";
import {
  IconeAlvo,
  IconeDistintivo,
  IconeEngrenagem,
  IconeEstrela,
  IconeGrafico,
  IconeLivro,
  IconePasta,
} from "./icones";
import { PainelDaBiblioteca, PainelDeCasos, PainelDeConfig, PainelDeProgresso } from "./Paineis";

/** Tempo da caminhada do avatar até a sala, igual à transição do CSS. */
const CAMINHADA_MS = 650;

const SALAS_NO_FEMININO = new Set(["recepcao", "oitiva", "biblioteca", "carceragem"]);

const TITULOS: Readonly<Record<Exclude<Painel, "missao">, string>> = {
  casos: "Casos",
  biblioteca: "Biblioteca",
  progresso: "Progresso",
  config: "Configurações",
};

function Abertura({ aoComecar }: { aoComecar: () => void }) {
  return (
    <div className="abertura">
      <div className="abertura-cartao">
        <span className="abertura-distintivo">
          <IconeDistintivo />
        </span>
        <h1>Delegacia</h1>
        <p className="abertura-lema">Direito Penal, um plantão de cada vez.</p>
        <p>
          Você passou no concurso e acaba de tomar posse como delegado(a) em Vila Serena. A Dra.
          Helena e o Seu Bento vão ensinar tudo, do zero.
        </p>
        <p>Os casos chegam. Você analisa o fato, decide e responde como na prova.</p>
        <button type="button" className="botao botao-principal" onClick={aoComecar}>
          Assumir o plantão
        </button>
      </div>
    </div>
  );
}

export function App() {
  const jogo = useStore((s) => s.jogo);
  const sala = useStore((s) => s.sala);
  const painel = useStore((s) => s.painel);
  const aberturaVista = useStore((s) => s.aberturaVista);
  const irPara = useStore((s) => s.irPara);
  const abrir = useStore((s) => s.abrir);
  const fecharPainel = useStore((s) => s.fechar);
  const verAbertura = useStore((s) => s.verAbertura);

  // A missão aberta fica guardada: ao ser concluída, a "próxima" já é outra.
  const [missaoAberta, setMissaoAberta] = useState<Missao | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const caminhada = useRef<number | undefined>(undefined);

  const proxima = proximaMissao(jogo, conteudo);
  const capitulo = capituloAtual(jogo, conteudo);
  const tituloDoCapitulo = conteudo.capitulos.find((c) => c.numero === capitulo)?.titulo;
  const salaDoDestino = conteudo.salas.find((s) => s.id === proxima?.sala);

  const fechar = useCallback(() => {
    fecharPainel();
    setMissaoAberta(null);
  }, [fecharPainel]);

  useEffect(() => () => window.clearTimeout(caminhada.current), []);

  const aoTocarNaSala = (id: string) => {
    tocar("toque");
    irPara(id);
    setAviso(null);
    window.clearTimeout(caminhada.current);
    caminhada.current = window.setTimeout(() => {
      if (proxima && id === proxima.sala) {
        setMissaoAberta(proxima);
        abrir("missao");
      } else if (id === "biblioteca") {
        abrir("biblioteca");
      } else {
        const tocada = conteudo.salas.find((s) => s.id === id);
        setAviso(tocada ? `${tocada.nome}: ${tocada.descricao}` : null);
      }
    }, CAMINHADA_MS);
  };

  return (
    <>
      <Cena sala={sala} destino={proxima?.sala ?? null} aoTocar={aoTocarNaSala} />

      <header className="hud">
        <div className="hud-linha">
          <div className="hud-resumo">
            <Retrato id="avatar" />
            <span className="hud-textos">
              <strong>Delegado(a) de Vila Serena</strong>
              <span>
                Plantão {jogo.dia} · Cap. {capitulo}: {tituloDoCapitulo}
              </span>
            </span>
            <span className="hud-pontos">
              <IconeEstrela />
              {jogo.pontos}
            </span>
          </div>
          <button
            type="button"
            className="hud-engrenagem"
            aria-label="Configurações"
            onClick={() => abrir("config")}
          >
            <IconeEngrenagem />
          </button>
        </div>
        <div className="destino">
          <IconeAlvo />
          {proxima && salaDoDestino ? (
            <span>
              Vá {SALAS_NO_FEMININO.has(salaDoDestino.id) ? "à" : "ao"}{" "}
              <strong>{salaDoDestino.nome}</strong>: {proxima.titulo}
            </span>
          ) : (
            <span>
              Você concluiu tudo o que há nesta versão. Revise na <strong>Biblioteca</strong>.
            </span>
          )}
        </div>
        {aviso && <p className="aviso">{aviso}</p>}
      </header>

      <nav className="atalhos" aria-label="Atalhos">
        <button type="button" onClick={() => abrir("casos")}>
          <IconePasta />
          Casos
        </button>
        <button type="button" onClick={() => abrir("biblioteca")}>
          <IconeLivro />
          Biblioteca
        </button>
        <button type="button" onClick={() => abrir("progresso")}>
          <IconeGrafico />
          Progresso
        </button>
      </nav>

      {painel === "missao" && missaoAberta && (
        <Folha titulo={missaoAberta.titulo} icone={<IconeDistintivo />} aoFechar={fechar}>
          <FluxoDaMissao key={missaoAberta.id} missao={missaoAberta} aoFechar={fechar} />
        </Folha>
      )}
      {painel && painel !== "missao" && (
        <Folha titulo={TITULOS[painel]} aoFechar={fechar}>
          {painel === "casos" && <PainelDeCasos />}
          {painel === "biblioteca" && <PainelDaBiblioteca />}
          {painel === "progresso" && <PainelDeProgresso />}
          {painel === "config" && <PainelDeConfig />}
        </Folha>
      )}

      {!aberturaVista && (
        <Abertura
          aoComecar={() => {
            tocar("avanca");
            verAbertura();
          }}
        />
      )}
    </>
  );
}
