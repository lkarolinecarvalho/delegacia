import { conteudo, type Missao } from "@delegacia/content";
import { useCallback, useState } from "react";
import { cenaDaVez, cenasDaMissao, salaDaVez } from "../orquestrador/cenas";
import { casosDoArquivo, missaoDoPlantaoLivre } from "../orquestrador/plantaoLivre";
import { tocar } from "../som/sons";
import { capituloAtual, inqueritos, proximaMissao } from "../state/jogo";
import { type Painel, useStore } from "../state/store";
import { Cena } from "./Cena";
import { Folha, nomeDoCapitulo, Retrato } from "./comum";
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
import { PainelDoQuadro } from "./Quadro";

/** Com este tanto de plantões ou menos, o inquérito vira aviso na placa do cartório. */
const PRAZO_CURTO = 3;

const SALAS_NO_FEMININO = new Set(["recepcao", "oitiva", "investigacao"]);
/** A sala que guarda os procedimentos concluídos: a entrada do plantão livre. */
const SALA_DO_ARQUIVO = "arquivo";
/** A sala em que fica o quadro de presos e de prazos. */
const SALA_DO_QUADRO = "cartorio";

const TITULOS: Readonly<Record<Exclude<Painel, "missao">, string>> = {
  casos: "Casos",
  biblioteca: "Biblioteca",
  progresso: "Progresso",
  config: "Configurações",
  quadro: "Quadro da delegacia",
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
  const [livre, setLivre] = useState(false);
  // Sala vista de dentro. Sem ela, a tela mostra o mapa da delegacia.
  const [dentro, setDentro] = useState<string | null>(null);

  const proxima = proximaMissao(jogo, conteudo);
  const capitulo = capituloAtual(jogo, conteudo);
  // A missão pode passar por várias salas: o destino é a sala da cena da vez.
  const destino = proxima ? salaDaVez(jogo, proxima) : null;
  const salaDoDestino = conteudo.salas.find((s) => s.id === destino);
  const cenas = proxima ? cenasDaMissao(proxima).length : 1;
  const cena = proxima ? cenaDaVez(jogo, proxima) + 1 : 1;

  const fechar = useCallback(() => {
    fecharPainel();
    setMissaoAberta(null);
    setLivre(false);
  }, [fecharPainel]);

  const prazosCurtos = inqueritos(jogo).filter(
    (i) => !i.relatado && i.restam <= PRAZO_CURTO,
  ).length;
  // Recomeçar o jogo volta ao mapa.
  const foco = aberturaVista ? dentro : null;
  const salaEmFoco = conteudo.salas.find((x) => x.id === foco);
  const missaoDaSala = proxima && destino === foco ? proxima : null;

  /** O avatar chegou: a tela passa a mostrar a sala por dentro. */
  const aoChegarNaSala = (id: string) => {
    irPara(id);
    setDentro(id);
  };

  const comecarMissao = (missao: Missao) => {
    tocar("avanca");
    setMissaoAberta(missao);
    abrir("missao");
  };

  /** Sorteia um caso do arquivo e o abre sem ajuda. */
  const iniciarPlantaoLivre = () => {
    const sorteado = missaoDoPlantaoLivre(jogo, conteudo, Math.random());
    if (!sorteado) return;
    setMissaoAberta(sorteado);
    setLivre(true);
    abrir("missao");
  };

  return (
    <>
      <Cena
        // Recomeçar o jogo remonta a cena, com o avatar de volta ao pátio.
        key={aberturaVista ? "jogo" : "abertura"}
        salaInicial={sala}
        destino={destino}
        foco={foco}
        prazosCurtos={prazosCurtos}
        aoTocar={() => tocar("toque")}
        aoChegar={aoChegarNaSala}
      />

      <header className="hud">
        <div className="hud-linha">
          <div className="hud-resumo">
            <Retrato id="avatar" />
            <span className="hud-textos">
              <strong>Plantão {jogo.dia} · Vila Serena</strong>
              <span>{nomeDoCapitulo(capitulo)}</span>
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
              {cenas > 1 && ` (${cena} de ${cenas})`}
            </span>
          ) : (
            <span>
              Campanha em dia. Abra <strong>Casos</strong> e sorteie um plantão livre.
            </span>
          )}
        </div>
      </header>

      {salaEmFoco && !painel && (
        <section className="cartao-da-sala" aria-label={salaEmFoco.nome}>
          <h2>{salaEmFoco.nome}</h2>
          <p className="suave">{salaEmFoco.descricao}</p>
          {missaoDaSala ? (
            <button
              type="button"
              className="botao botao-principal"
              onClick={() => comecarMissao(missaoDaSala)}
            >
              {cena > 1 ? "Continuar" : missaoDaSala.caso ? "Atender" : "Conversar"}:{" "}
              {missaoDaSala.titulo}
            </button>
          ) : (
            <p className="cartao-da-sala-nada">Nada à sua espera aqui agora.</p>
          )}
          {salaEmFoco.id === SALA_DO_ARQUIVO && (
            <>
              <button
                type="button"
                className="botao botao-discreto"
                disabled={casosDoArquivo(jogo, conteudo).length === 0}
                onClick={iniciarPlantaoLivre}
              >
                Plantão livre: sortear um caso do arquivo
              </button>
              <button type="button" className="botao botao-discreto" onClick={() => abrir("casos")}>
                Consultar os casos
              </button>
            </>
          )}
          {salaEmFoco.id === SALA_DO_QUADRO && (
            <button type="button" className="botao botao-discreto" onClick={() => abrir("quadro")}>
              Quadro de presos e prazos
              {prazosCurtos > 0 && <span className="placa-conta">{prazosCurtos}</span>}
            </button>
          )}
          <button
            type="button"
            className="botao botao-discreto"
            onClick={() => {
              tocar("toque");
              setDentro(null);
            }}
          >
            Voltar ao mapa
          </button>
        </section>
      )}

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
        <Folha
          titulo={livre ? `Plantão livre: ${missaoAberta.titulo}` : missaoAberta.titulo}
          icone={<IconeDistintivo />}
          aoFechar={fechar}
        >
          <FluxoDaMissao
            key={missaoAberta.id}
            missao={missaoAberta}
            livre={livre}
            aoFechar={fechar}
          />
        </Folha>
      )}
      {painel && painel !== "missao" && (
        <Folha titulo={TITULOS[painel]} aoFechar={fechar}>
          {painel === "casos" && <PainelDeCasos aoPlantaoLivre={iniciarPlantaoLivre} />}
          {painel === "quadro" && <PainelDoQuadro />}
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
