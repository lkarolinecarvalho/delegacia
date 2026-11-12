import { conteudo } from "@delegacia/content";
import { nomeDoCrime } from "../orquestrador/ficha";
import { tocar } from "../som/sons";
import { inqueritos, PONTOS_POR_RELATORIO, presosHoje } from "../state/jogo";
import { useStore } from "../state/store";

const tituloDaMissao = (id: string) => conteudo.missoes.find((m) => m.id === id)?.titulo ?? id;

const plantoes = (n: number) => `${n} ${n === 1 ? "plantão" : "plantões"}`;

/**
 * O quadro da delegacia, no cartório: quem está preso hoje e os inquéritos em
 * andamento, com o prazo de cada um (CPP, art. 10). No jogo, um plantão vale um dia.
 */
export function PainelDoQuadro() {
  const jogo = useStore((s) => s.jogo);
  const relatar = useStore((s) => s.relatar);
  const presos = presosHoje(jogo);
  const lista = inqueritos(jogo);
  const crime = (missao: string) => {
    const registro = jogo.registro.find((r) => r.missao === missao);
    return registro ? nomeDoCrime(registro.analise) : null;
  };

  return (
    <div className="quadro">
      <h4>Presos hoje</h4>
      {presos.length === 0 ? (
        <p className="vazio">Ninguém preso hoje.</p>
      ) : (
        <ul className="lista lista-fixa">
          {presos.map((preso) => (
            <li key={preso.missao}>
              <strong>{tituloDaMissao(preso.missao)}</strong>
              <span>{crime(preso.missao)}</span>
              <span className="suave">
                Preso em flagrante no plantão {preso.dia}. Auto ao juiz, nota de culpa e audiência
                de custódia em até 24 horas.
              </span>
            </li>
          ))}
        </ul>
      )}

      <h4>Inquéritos</h4>
      {lista.length === 0 && (
        <p className="vazio">
          Os inquéritos aparecem aqui a partir do capítulo sobre o inquérito policial.
        </p>
      )}
      <ul className="lista lista-fixa">
        {lista.map((inquerito) => {
          const vencido = inquerito.restam < 0;
          return (
            <li key={inquerito.missao} className={inquerito.relatado ? "relatado" : undefined}>
              <strong>{tituloDaMissao(inquerito.missao)}</strong>
              <span>{crime(inquerito.missao)}</span>
              <span className="suave">
                Instaurado no plantão {inquerito.aberto} · indiciado{" "}
                {inquerito.indiciadoPreso ? "preso: 10 dias" : "solto: 30 dias"}
              </span>
              {inquerito.relatado ? (
                <span className="selo selo-feito">Relatado e remetido</span>
              ) : (
                <>
                  <span className={vencido ? "selo selo-vencido" : "selo"}>
                    {vencido
                      ? `Prazo vencido há ${plantoes(-inquerito.restam)}`
                      : inquerito.restam === 0
                        ? "Vence hoje"
                        : `Restam ${plantoes(inquerito.restam)}`}
                  </span>
                  <button
                    type="button"
                    className="botao botao-discreto"
                    onClick={() => {
                      tocar("moeda");
                      relatar(inquerito.missao);
                    }}
                  >
                    Relatar e remeter{vencido ? "" : ` (+${PONTOS_POR_RELATORIO})`}
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <p className="suave nota">
        O delegado relata o que apurou e remete os autos. Ele não pode arquivar o inquérito.
      </p>
    </div>
  );
}
