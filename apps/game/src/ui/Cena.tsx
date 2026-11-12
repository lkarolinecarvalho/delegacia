import { conteudo } from "@delegacia/content";
import { useEffect, useMemo, useRef } from "react";
import {
  CENA,
  desenharAvatar,
  desenharCena,
  lugarDaSala,
  naTela,
  PLACA_DO_FORUM,
  profundidade,
} from "../arte/delegacia";
import type { PontoDeTela } from "../arte/iso";
import { avancar, type NaGrade, NOS, noDaSala, rota } from "../mundo/planta";

/** Velocidade do avatar, em ladrilhos por segundo. */
const VELOCIDADE = 13;

const pct = (valor: number, total: number) => `${(valor / total) * 100}%`;

/** Caixa que envolve o contorno da sala e o mesmo contorno, em % dessa caixa. */
function recorte(area: readonly PontoDeTela[]) {
  const xs = area.map((p) => p.x);
  const ys = area.map((p) => p.y);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const [largura, altura] = [Math.max(...xs) - x0, Math.max(...ys) - y0];
  const poligono = area.map((p) => `${pct(p.x - x0, largura)} ${pct(p.y - y0, altura)}`).join(", ");
  return {
    left: pct(x0, CENA.largura),
    top: pct(y0, CENA.altura),
    width: pct(largura, CENA.largura),
    height: pct(altura, CENA.altura),
    clipPath: `polygon(${poligono})`,
  };
}

interface Props {
  /** Sala em que o avatar está ao montar a cena; `null` é o pátio. */
  readonly salaInicial: string | null;
  /** Sala do próximo passo da campanha, marcada com o indicador. */
  readonly destino: string | null;
  /** Quantos presos há na carceragem hoje: com algum, a cela aparece ocupada. */
  readonly presos: number;
  /** Inquéritos com o prazo no fim: viram um aviso na placa da carceragem. */
  readonly prazosCurtos: number;
  /** O jogador tocou numa sala: o avatar começa a andar até ela. */
  readonly aoTocar: (sala: string) => void;
  /** O avatar chegou à sala tocada. */
  readonly aoChegar: (sala: string) => void;
}

/**
 * A delegacia: o desenho, as salas tocáveis, as placas e o avatar, que anda pelos
 * caminhos da planta até a sala tocada. O avatar entra na ordem de desenho pela
 * profundidade: passa atrás do que está à frente dele.
 */
export function Cena({ salaInicial, destino, presos, prazosCurtos, aoTocar, aoChegar }: Props) {
  const desenho = useMemo(() => {
    const cena = desenharCena();
    const objetos = cena.objetos.map((o) => `<g data-p="${o.p}">${o.svg}</g>`).join("");
    const avatar = `<g data-avatar><g data-lado="direita">${desenharAvatar("direita")}</g><g data-lado="esquerda" display="none">${desenharAvatar("esquerda")}</g></g>`;
    return `${cena.fundo}<g data-objetos>${objetos}${avatar}</g>`;
  }, []);
  const salas = useMemo(() => conteudo.salas.map((s) => ({ ...s, lugar: lugarDaSala(s.id) })), []);

  const svg = useRef<SVGSVGElement>(null);
  const aoChegarAtual = useRef(aoChegar);
  aoChegarAtual.current = aoChegar;
  /** Pede uma caminhada; preenchido pelo efeito que cuida da animação. */
  const andarAte = useRef<(sala: string) => void>(() => {});
  const inicio = useRef(salaInicial);

  useEffect(() => {
    const camada = svg.current?.querySelector<SVGGElement>("[data-objetos]");
    const avatar = camada?.querySelector<SVGGElement>("[data-avatar]");
    if (!camada || !avatar) return;
    const objetos = [...camada.querySelectorAll<SVGGElement>(":scope > [data-p]")];
    const profundidades = objetos.map((o) => Number(o.dataset.p));
    const lados = {
      direita: avatar.querySelector<SVGGElement>('[data-lado="direita"]'),
      esquerda: avatar.querySelector<SVGGElement>('[data-lado="esquerda"]'),
    };

    let no = noDaSala(inicio.current);
    let posicao: NaGrade = NOS[no] ?? [0, 0];
    let caminho: readonly NaGrade[] = [];
    let alvo: string | null = null;
    let pendente: string | null = null;
    let quadro = 0;
    let anterior = 0;
    let naFrenteDe = -1;

    const desenhar = (balanco: number) => {
      const tela = naTela(posicao);
      avatar.setAttribute("transform", `translate(${tela.x} ${tela.y}) rotate(${balanco})`);
      // O avatar fica logo atrás do primeiro objeto mais à frente que ele.
      const p = profundidade(posicao);
      let indice = profundidades.findIndex((outra) => outra > p);
      if (indice < 0) indice = objetos.length;
      if (indice !== naFrenteDe) {
        naFrenteDe = indice;
        camada.insertBefore(avatar, objetos[indice] ?? null);
      }
    };

    const chegar = () => {
      const sala = alvo;
      alvo = null;
      if (sala) no = noDaSala(sala);
      desenhar(0);
      if (pendente) {
        const proxima = pendente;
        pendente = null;
        partir(proxima);
      } else if (sala) {
        aoChegarAtual.current(sala);
      }
    };

    const andar = (agora: number) => {
      const delta = Math.min(Math.max(agora - anterior, 0), 50) / 1000;
      anterior = agora;
      const de = naTela(posicao).x;
      const passo = avancar(posicao, caminho, VELOCIDADE * delta);
      posicao = passo.posicao;
      caminho = passo.rota;
      const dx = naTela(posicao).x - de;
      if (Math.abs(dx) > 0.01) {
        lados.direita?.setAttribute("display", dx > 0 ? "inline" : "none");
        lados.esquerda?.setAttribute("display", dx > 0 ? "none" : "inline");
      }
      if (caminho.length === 0) {
        chegar();
        return;
      }
      desenhar(Math.sin(agora / 70) * 4);
      quadro = requestAnimationFrame(andar);
    };

    function partir(sala: string) {
      alvo = sala;
      caminho = rota(no, noDaSala(sala));
      if (caminho.length === 0) {
        chegar();
        return;
      }
      anterior = performance.now();
      quadro = requestAnimationFrame(andar);
    }

    andarAte.current = (sala) => {
      // No meio de uma caminhada, o novo destino espera a chegada.
      if (alvo) pendente = sala;
      else partir(sala);
    };
    desenhar(0);
    return () => {
      cancelAnimationFrame(quadro);
      andarAte.current = () => {};
    };
  }, []);

  useEffect(() => {
    svg.current
      ?.querySelector("[data-preso]")
      ?.setAttribute("display", presos > 0 ? "inline" : "none");
  }, [presos]);

  return (
    <div className="cena">
      <div className="cena-caixa">
        <svg
          ref={svg}
          className="cena-desenho"
          viewBox={`0 0 ${CENA.largura} ${CENA.altura}`}
          aria-hidden="true"
          // O desenho é gerado em código pelo próprio projeto (arte/delegacia.ts).
          dangerouslySetInnerHTML={{ __html: desenho }}
        />
        {salas.map((s) => (
          <button
            key={s.id}
            type="button"
            className="sala-area"
            style={recorte(s.lugar.area)}
            aria-label={`Ir para: ${s.nome}`}
            onClick={() => {
              aoTocar(s.id);
              andarAte.current(s.id);
            }}
          />
        ))}
        {salas.map((s) => (
          <span
            key={s.id}
            className={s.id === destino ? "placa placa-destino" : "placa"}
            style={{
              left: pct(s.lugar.placa.x, CENA.largura),
              top: pct(s.lugar.placa.y, CENA.altura),
            }}
          >
            {s.id === destino && <span className="placa-aviso">!</span>}
            {s.nome}
            {s.id === "carceragem" && prazosCurtos > 0 && (
              <span className="placa-conta">{prazosCurtos}</span>
            )}
          </span>
        ))}
        <span
          className="placa placa-fechada"
          style={{
            left: pct(PLACA_DO_FORUM.x, CENA.largura),
            top: pct(PLACA_DO_FORUM.y, CENA.altura),
          }}
        >
          Fórum · em breve
        </span>
      </div>
    </div>
  );
}
