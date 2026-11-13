import type { Afirmativa, Missao } from "@delegacia/content";
import type { Analise, Procedimento } from "@delegacia/motor";
import { create } from "zustand";
import {
  avancarCena,
  concluirMissao,
  concluirPlantaoLivre,
  type EstadoDoJogo,
  estadoInicial,
  marcarTemaVisto,
  relatarInquerito,
  responderAfirmativa,
} from "./jogo";

export type Painel = "missao" | "casos" | "biblioteca" | "progresso" | "config" | "quadro";

interface Store {
  readonly jogo: EstadoDoJogo;
  /** Sala em que o avatar está; `null` é o pátio, antes de entrar. */
  readonly sala: string | null;
  readonly painel: Painel | null;
  readonly som: boolean;
  readonly aberturaVista: boolean;
  irPara(sala: string): void;
  abrir(painel: Painel): void;
  fechar(): void;
  verAbertura(): void;
  verTema(tema: string): void;
  responder(afirmativa: Afirmativa, resposta: "C" | "E" | "branco"): void;
  concluir(
    missao: Missao,
    analise: Analise | null,
    tentativasErradas: number,
    procedimento: Procedimento | null,
  ): void;
  concluirLivre(): void;
  seguir(missao: Missao): void;
  relatar(missao: string): void;
  definirModoBanca(ligado: boolean): void;
  definirSom(ligado: boolean): void;
  reiniciar(): void;
}

/** Estado do jogo. Não há persistência nesta versão: recarregar a página recomeça. */
export const useStore = create<Store>((set) => ({
  jogo: estadoInicial(),
  sala: null,
  painel: null,
  som: true,
  aberturaVista: false,
  irPara: (sala) => set({ sala }),
  abrir: (painel) => set({ painel }),
  fechar: () => set({ painel: null }),
  verAbertura: () => set({ aberturaVista: true }),
  verTema: (tema) => set((s) => ({ jogo: marcarTemaVisto(s.jogo, tema) })),
  responder: (afirmativa, resposta) =>
    set((s) => ({ jogo: responderAfirmativa(s.jogo, afirmativa, resposta) })),
  concluir: (missao, analise, tentativasErradas, procedimento) =>
    set((s) => ({
      jogo: concluirMissao(s.jogo, missao, analise, tentativasErradas, procedimento),
    })),
  concluirLivre: () => set((s) => ({ jogo: concluirPlantaoLivre(s.jogo) })),
  seguir: (missao) => set((s) => ({ jogo: avancarCena(s.jogo, missao) })),
  relatar: (missao) => set((s) => ({ jogo: relatarInquerito(s.jogo, missao) })),
  definirModoBanca: (ligado) => set((s) => ({ jogo: { ...s.jogo, modoBanca: ligado } })),
  definirSom: (ligado) => set({ som: ligado }),
  reiniciar: () => set({ jogo: estadoInicial(), sala: null, painel: null, aberturaVista: false }),
}));
