import { conteudo } from "@delegacia/content";
import { useMemo } from "react";
import { desenharBoneco } from "../arte/bonecos";
import {
  CENA,
  desenharDelegacia,
  LUGAR_DO_PATIO,
  lugarDaSala,
  TAMANHO_DO_BONECO,
} from "../arte/delegacia";
import type { PontoDeTela } from "../arte/iso";
import { paraDataUrl } from "../arte/svg";

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
  /** Sala em que o avatar está; `null` é o pátio. */
  readonly sala: string | null;
  /** Sala do próximo passo da campanha, marcada com o indicador. */
  readonly destino: string | null;
  readonly aoTocar: (sala: string) => void;
}

/** A delegacia em corte: o desenho, as salas tocáveis, as placas e o avatar. */
export function Cena({ sala, destino, aoTocar }: Props) {
  const arte = useMemo(() => desenharDelegacia(), []);
  const avatar = useMemo(() => paraDataUrl(desenharBoneco("avatar", "esquerda")), []);
  const salas = useMemo(() => conteudo.salas.map((s) => ({ ...s, lugar: lugarDaSala(s.id) })), []);
  const onde = sala ? lugarDaSala(sala).avatar : LUGAR_DO_PATIO;

  return (
    <div className="cena">
      <div className="cena-caixa">
        <svg
          className="cena-desenho"
          viewBox={`0 0 ${CENA.largura} ${CENA.altura}`}
          aria-hidden="true"
          // O desenho é gerado em código pelo próprio projeto (arte/delegacia.ts).
          dangerouslySetInnerHTML={{ __html: arte }}
        />
        <span className="cena-andar" style={{ top: pct(118, CENA.altura) }}>
          1º andar
        </span>
        <span className="cena-andar" style={{ top: pct(368, CENA.altura) }}>
          Térreo
        </span>
        {salas.map((s) => (
          <button
            key={s.id}
            type="button"
            className="sala-area"
            style={recorte(s.lugar.area)}
            aria-label={`Ir para: ${s.nome}`}
            onClick={() => aoTocar(s.id)}
          />
        ))}
        <img
          className="avatar"
          src={avatar}
          alt=""
          style={{
            left: pct(onde.x - TAMANHO_DO_BONECO.ancoraX, CENA.largura),
            top: pct(onde.y - TAMANHO_DO_BONECO.ancoraY, CENA.altura),
            width: pct(TAMANHO_DO_BONECO.largura, CENA.largura),
          }}
        />
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
          </span>
        ))}
      </div>
    </div>
  );
}
