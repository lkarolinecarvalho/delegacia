import { conteudo, type Missao, type Tema } from "@delegacia/content";
import {
  existeRegra,
  NOMES_DOS_TITULOS,
  regra,
  TIPOS_PENAIS,
  TITULOS,
  tipoPenal,
} from "@delegacia/motor";
import { useState } from "react";
import { selecionarParaRevisao } from "../orquestrador/afirmativas";
import { nomeDoCrime } from "../orquestrador/ficha";
import { casosDoArquivo } from "../orquestrador/plantaoLivre";
import { definirSom } from "../som/sons";
import { CAIXA_MAXIMA, diasAteARevisao } from "../state/estudo";
import { capituloAtual, missaoDisponivel } from "../state/jogo";
import { useStore } from "../state/store";
import { Afirmativas } from "./Afirmativas";
import { Aula } from "./Aula";
import { nomeDoCapitulo, RegraCitada } from "./comum";
import { Trilha } from "./FluxoDaMissao";

/** A campanha por parte e capítulo, com o plantão livre no alto. */
export function PainelDeCasos({ aoPlantaoLivre }: { aoPlantaoLivre: () => void }) {
  const jogo = useStore((s) => s.jogo);
  const [aberto, setAberto] = useState<string | null>(null);
  const noArquivo = casosDoArquivo(jogo, conteudo).length;
  return (
    <div className="casos">
      <section className="plantao-livre">
        <h3>Plantão livre</h3>
        <p className="suave">
          Um caso sorteado do arquivo, sem ajuda: a ficha inteira, com o Código todo aberto.
          {jogo.plantoesLivres > 0 && ` Você já resolveu ${jogo.plantoesLivres}.`}
        </p>
        <button
          type="button"
          className="botao botao-principal"
          disabled={noArquivo === 0}
          onClick={aoPlantaoLivre}
        >
          {noArquivo === 0 ? "Conclua um caso para abrir" : "Sortear um caso"}
        </button>
      </section>
      {conteudo.capitulos.map((capitulo, i) => {
        const missoes = conteudo.missoes.filter((m) => m.capitulo === capitulo.numero);
        const novaParte = conteudo.capitulos[i - 1]?.parte !== capitulo.parte;
        return (
          <section key={capitulo.numero} className="capitulo">
            {novaParte && <p className="parte">{capitulo.parte}</p>}
            <h3>{nomeDoCapitulo(capitulo.numero)}</h3>
            <p className="suave">{capitulo.resumo}</p>
            {missoes.length === 0 && <p className="em-breve">Em breve</p>}
            <ul>
              {missoes.map((missao) => {
                const feita = jogo.concluidas.includes(missao.id);
                const proxima = missaoDisponivel(jogo, missao);
                const registro = jogo.registro.find((r) => r.missao === missao.id);
                return (
                  <li key={missao.id} className={feita ? "feita" : proxima ? "proxima" : "fechada"}>
                    <button
                      type="button"
                      disabled={!registro}
                      onClick={() => setAberto(aberto === missao.id ? null : missao.id)}
                    >
                      <span className="marcador">{feita ? "✓" : proxima ? "▶" : "•"}</span>
                      {missao.titulo}
                      {!missao.caso && <span className="suave"> · conversa</span>}
                    </button>
                    {registro && aberto === missao.id && (
                      <Trilha analise={registro.analise} procedimento={registro.procedimento} />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Assunto que não é crime: fatos atípicos, lícitos e os demais desfechos. */
const SEM_CRIME = "Não houve crime";

/**
 * O arquivo: os casos concluídos, separados por assunto (o título do Código em que o
 * crime está). Daqui o delegado revê a análise de um caso ou o refaz sem ajuda.
 */
export function PainelDoArquivo({ aoRever }: { aoRever: (missao: Missao) => void }) {
  const jogo = useStore((s) => s.jogo);
  const [aberto, setAberto] = useState<string | null>(null);
  const casos = casosDoArquivo(jogo, conteudo).flatMap((missao) => {
    const registro = jogo.registro.find((r) => r.missao === missao.id);
    if (!registro) return [];
    const { analise } = registro;
    const assunto =
      analise.conclusao === "crime" && analise.tipo
        ? NOMES_DOS_TITULOS[tipoPenal(analise.tipo).titulo]
        : SEM_CRIME;
    return [{ missao, registro, assunto }];
  });
  const assuntos = [...TITULOS.map((t) => NOMES_DOS_TITULOS[t]), SEM_CRIME];
  if (casos.length === 0) {
    return (
      <div className="casos">
        <p className="suave">
          O arquivo ainda está vazio. Todo caso que você concluir vem para cá, separado por assunto.
        </p>
      </div>
    );
  }
  return (
    <div className="casos">
      <p className="suave">
        Os casos que você concluiu, por assunto. Abra um para rever a análise ou refaça-o sem ajuda.
      </p>
      {assuntos.map((assunto) => {
        const doAssunto = casos.filter((c) => c.assunto === assunto);
        if (doAssunto.length === 0) return null;
        return (
          <section key={assunto} className="capitulo">
            <h3>{assunto}</h3>
            <ul>
              {doAssunto.map(({ missao, registro }) => (
                <li key={missao.id} className="feita">
                  <button
                    type="button"
                    onClick={() => setAberto(aberto === missao.id ? null : missao.id)}
                  >
                    <span className="marcador">✓</span>
                    {missao.titulo}
                    <span className="suave"> · {nomeDoCrime(registro.analise) ?? "sem crime"}</span>
                  </button>
                  {aberto === missao.id && (
                    <>
                      <Trilha analise={registro.analise} procedimento={registro.procedimento} />
                      <button
                        type="button"
                        className="botao botao-discreto"
                        onClick={() => aoRever(missao)}
                      >
                        Refazer este caso sem ajuda
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Teoria() {
  const vistos = useStore((s) => s.jogo.temasVistos);
  const [tema, setTema] = useState<Tema | null>(null);
  if (tema) {
    return <Aula tema={tema} rotulo="Voltar aos temas" aoContinuar={() => setTema(null)} />;
  }
  const temas = conteudo.teoria.filter((t) => vistos.includes(t.id));
  if (temas.length === 0) {
    return <p className="vazio">As aulas da Dra. Helena aparecem aqui depois de assistidas.</p>;
  }
  return (
    <ul className="lista">
      {temas.map((t) => (
        <li key={t.id}>
          <button type="button" onClick={() => setTema(t)}>
            <strong>{t.titulo}</strong>
            <span className="suave">{t.resumo}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Tipos penais e regras que já apareceram nos casos concluídos. */
function Codigo() {
  const registro = useStore((s) => s.jogo.registro);
  const tipos = TIPOS_PENAIS.filter((t) => registro.some((r) => r.analise.tipo === t.id));
  const regras = [...new Set(registro.flatMap((r) => r.analise.regras))]
    .filter(existeRegra)
    .filter((id) => !tipos.some((t) => t.regra === id))
    .sort();
  if (registro.length === 0) {
    return <p className="vazio">O Código se abre aos poucos, a cada caso concluído.</p>;
  }
  return (
    <>
      <h4>Tipos penais já vistos</h4>
      {tipos.length === 0 && <p className="vazio">Nenhum ainda.</p>}
      {TITULOS.filter((titulo) => tipos.some((t) => t.titulo === titulo)).map((titulo) => (
        <div key={titulo}>
          <p className="etiqueta">{NOMES_DOS_TITULOS[titulo]}</p>
          <ul className="lista lista-fixa">
            {tipos
              .filter((t) => t.titulo === titulo)
              .map((t) => (
                <li key={t.id}>
                  <strong>
                    {t.nome} <span className="suave">· {t.artigo}</span>
                  </strong>
                  <span>{t.texto}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <h4>Regras já aplicadas</h4>
      <div className="regras">
        {regras.map((id) => (
          <RegraCitada key={regra(id).id} id={id} />
        ))}
      </div>
      <p className="suave nota">
        O conteúdo jurídico desta versão ainda não foi validado por profissional da área.
      </p>
    </>
  );
}

function Revisao() {
  const [bateria, setBateria] = useState<ReturnType<typeof selecionarParaRevisao> | null>(null);
  const [rodada, setRodada] = useState(0);
  const jogo = useStore((s) => s.jogo);
  if (bateria) {
    return (
      <Afirmativas
        key={rodada}
        afirmativas={bateria}
        rotuloFinal="Terminar a revisão"
        aoTerminar={() => setBateria(null)}
      />
    );
  }
  const candidatas = selecionarParaRevisao(
    conteudo.afirmativas,
    jogo,
    capituloAtual(jogo, conteudo),
  );
  return (
    <div className="revisao">
      <p>
        A revisão cobra os conceitos que você já encontrou e que estão vencidos na repetição
        espaçada. O que você erra volta logo; o que acerta, demora mais.
      </p>
      {candidatas.length === 0 ? (
        <p className="vazio">Nada vencido agora. Volte depois do próximo plantão.</p>
      ) : (
        <button
          type="button"
          className="botao botao-principal"
          onClick={() => {
            setRodada(rodada + 1);
            setBateria(candidatas);
          }}
        >
          Revisar {candidatas.length} {candidatas.length === 1 ? "conceito" : "conceitos"}
        </button>
      )}
    </div>
  );
}

const ABAS = [
  ["teoria", "Teoria"],
  ["codigo", "Código"],
  ["revisao", "Revisão"],
] as const;

export function PainelDaBiblioteca() {
  const [aba, setAba] = useState<(typeof ABAS)[number][0]>("teoria");
  return (
    <div className="biblioteca">
      <div className="abas" role="tablist">
        {ABAS.map(([id, nome]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            className={aba === id ? "aba aba-ativa" : "aba"}
            onClick={() => setAba(id)}
          >
            {nome}
          </button>
        ))}
      </div>
      {aba === "teoria" && <Teoria />}
      {aba === "codigo" && <Codigo />}
      {aba === "revisao" && <Revisao />}
    </div>
  );
}

/** A força de cada conceito já cobrado: o "caderno de erros" do jogador. */
export function PainelDeProgresso() {
  const jogo = useStore((s) => s.jogo);
  const [aberto, setAberto] = useState<string | null>(null);
  const conceitos = conteudo.conceitos.filter((c) => jogo.estudo[c.id]);
  const casos = conteudo.missoes.filter((m) => m.caso);
  const deprimeira = jogo.registro.filter((r) => r.tentativasErradas === 0).length;
  return (
    <div className="progresso">
      <div className="numeros">
        <div>
          <strong>{jogo.pontos}</strong>
          <span>pontos</span>
        </div>
        <div>
          <strong>
            {jogo.registro.length}/{casos.length}
          </strong>
          <span>casos</span>
        </div>
        <div>
          <strong>{deprimeira}</strong>
          <span>de primeira</span>
        </div>
        {jogo.modoBanca && (
          <div>
            <strong>{jogo.saldoBanca > 0 ? `+${jogo.saldoBanca}` : jogo.saldoBanca}</strong>
            <span>na banca</span>
          </div>
        )}
      </div>
      <h4>Conceitos</h4>
      {conceitos.length === 0 && (
        <p className="vazio">Os conceitos aparecem aqui depois da primeira afirmativa.</p>
      )}
      <ul className="lista">
        {conceitos.map((conceito) => {
          const estudo = jogo.estudo[conceito.id];
          if (!estudo) return null;
          const dias = diasAteARevisao(estudo, jogo.dia);
          return (
            <li key={conceito.id}>
              <button
                type="button"
                onClick={() => setAberto(aberto === conceito.id ? null : conceito.id)}
              >
                <strong>{conceito.nome}</strong>
                <span className="caixas" role="img" aria-label={`Caixa ${estudo.caixa} de 5`}>
                  {Array.from({ length: CAIXA_MAXIMA }, (_, i) => (
                    <i key={`caixa-${i + 1}`} className={i < estudo.caixa ? "cheia" : undefined} />
                  ))}
                </span>
                <span className="suave">
                  {estudo.acertos} {estudo.acertos === 1 ? "acerto" : "acertos"} · {estudo.erros}{" "}
                  {estudo.erros === 1 ? "erro" : "erros"} ·{" "}
                  {dias === 0 ? "revisar agora" : `revisão em ${dias} plantão(ões)`}
                </span>
                {aberto === conceito.id && <span className="definicao">{conceito.definicao}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PainelDeConfig() {
  const modoBanca = useStore((s) => s.jogo.modoBanca);
  const som = useStore((s) => s.som);
  const definirModoBanca = useStore((s) => s.definirModoBanca);
  const guardarSom = useStore((s) => s.definirSom);
  const reiniciar = useStore((s) => s.reiniciar);
  return (
    <div className="config">
      <label className="chave">
        <input
          type="checkbox"
          checked={som}
          onChange={(e) => {
            guardarSom(e.target.checked);
            definirSom(e.target.checked);
          }}
        />
        <span>
          <strong>Som</strong>
          <span className="suave">Efeitos sonoros da interface.</span>
        </span>
      </label>
      <label className="chave">
        <input
          type="checkbox"
          checked={modoBanca}
          onChange={(e) => definirModoBanca(e.target.checked)}
        />
        <span>
          <strong>Modo banca</strong>
          <span className="suave">
            Estilo CEBRASPE: acerto +1, erro −1, branco 0. Aparece a opção de deixar em branco.
          </span>
        </span>
      </label>
      <button type="button" className="botao botao-discreto" onClick={reiniciar}>
        Recomeçar o jogo
      </button>
      <p className="suave nota">
        Esta versão não salva o progresso: recarregar a página recomeça do início.
      </p>
    </div>
  );
}
