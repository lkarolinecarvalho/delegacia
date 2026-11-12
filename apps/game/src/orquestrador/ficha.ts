import type { Caso } from "@delegacia/content";
import {
  type Analise,
  type CampoDaFicha,
  esperadoNoCampo,
  type Ficha,
  TIPOS_PENAIS,
  tipoPenal,
} from "@delegacia/motor";

/** Valor de uma opção da ficha, como o motor o compara. */
export type ValorDaFicha = string | boolean;

export interface Opcao {
  readonly valor: ValorDaFicha;
  readonly rotulo: string;
  readonly detalhe?: string;
}

export interface EtapaDaFicha {
  readonly campo: CampoDaFicha;
  /** Nome curto da etapa, na trilha da análise. */
  readonly titulo: string;
  readonly pergunta: string;
  readonly opcoes: readonly Opcao[];
  /** `pergunta`: o jogador responde. `informada`: o mentor entrega preenchida. */
  readonly modo: "pergunta" | "informada";
  /** A resposta do motor, mostrada nas etapas informadas. */
  readonly informado: Opcao | null;
}

/** Ordem das etapas na ficha: a da teoria do crime (R-GER-03). */
const ORDEM: readonly CampoDaFicha[] = [
  "tipico",
  "tipo",
  "forma",
  "excludente",
  "culpabilidade",
  "conclusao",
];

const TITULOS: Readonly<Record<CampoDaFicha, string>> = {
  tipico: "Fato típico",
  tipo: "Tipo penal",
  forma: "Forma",
  excludente: "Ilicitude",
  culpabilidade: "Culpabilidade",
  conclusao: "Conclusão",
};

const CONCLUSOES: readonly (Opcao & { readonly desdeOCapitulo: number })[] = [
  {
    valor: "crime",
    rotulo: "Crime",
    detalhe: "Fato típico, ilícito e culpável.",
    desdeOCapitulo: 1,
  },
  {
    valor: "fato_atipico",
    rotulo: "Fato atípico",
    detalhe: "Não se ajusta a um tipo penal.",
    desdeOCapitulo: 1,
  },
  {
    valor: "fato_licito",
    rotulo: "Fato lícito",
    detalhe: "Típico, mas com excludente de ilicitude.",
    desdeOCapitulo: 3,
  },
  {
    valor: "ato_infracional",
    rotulo: "Ato infracional",
    detalhe: "Praticado por menor de 18 anos.",
    desdeOCapitulo: 4,
  },
  {
    valor: "isento_de_pena",
    rotulo: "Isento de pena",
    detalhe: "Falta a culpabilidade do agente.",
    desdeOCapitulo: 4,
  },
];

function opcoesDoCampo(campo: CampoDaFicha, caso: Caso, analise: Analise, capitulo: number) {
  switch (campo) {
    case "tipico":
      return [
        { valor: true, rotulo: "Sim, é típico", detalhe: "A conduta se ajusta a um tipo penal." },
        { valor: false, rotulo: "Não, é atípico", detalhe: "Falta algo para o tipo penal." },
      ];
    case "tipo": {
      // Sugerido: os tipos da missão. Livre: o catálogo inteiro.
      const ids = caso.opcoesDeTipo.length > 0 ? caso.opcoesDeTipo : TIPOS_PENAIS.map((t) => t.id);
      return [
        ...ids.map((id) => {
          const tipo = tipoPenal(id);
          return { valor: id, rotulo: tipo.nome, detalhe: `${tipo.artigo}. ${tipo.texto}` };
        }),
        { valor: "nenhum", rotulo: "Nenhum", detalhe: "O fato é atípico." },
      ];
    }
    case "forma":
      return [
        { valor: "consumado", rotulo: "Consumado", detalhe: "Reuniu todos os elementos do tipo." },
        {
          valor: "tentado",
          rotulo: "Tentado",
          detalhe: "Iniciada a execução, não se consumou por circunstâncias alheias à vontade.",
        },
      ];
    case "excludente":
      return [
        { valor: "nenhuma", rotulo: "Nenhuma", detalhe: "O fato é ilícito." },
        { valor: "legitima_defesa", rotulo: "Legítima defesa" },
        { valor: "estado_de_necessidade", rotulo: "Estado de necessidade" },
        {
          valor: "estrito_cumprimento_do_dever_legal",
          rotulo: "Estrito cumprimento de dever legal",
        },
        { valor: "exercicio_regular_de_direito", rotulo: "Exercício regular de direito" },
      ];
    case "culpabilidade":
      return [
        { valor: "culpavel", rotulo: "Sim, é culpável" },
        { valor: "menoridade", rotulo: "Não: menor de 18 anos" },
        {
          valor: "embriaguez_fortuita",
          rotulo: "Não: embriaguez completa por caso fortuito ou força maior",
        },
      ];
    case "conclusao": {
      // Só aparecem as conclusões já ensinadas, mais a correta (por garantia).
      const correta = esperadoNoCampo(analise, "conclusao");
      return CONCLUSOES.filter((c) => c.desdeOCapitulo <= capitulo || c.valor === correta).map(
        ({ desdeOCapitulo: _, ...opcao }) => opcao,
      );
    }
  }
}

function perguntaDoCampo(campo: CampoDaFicha, caso: Caso, analise: Analise): string {
  switch (campo) {
    case "tipico":
      return caso.tipoInformado && analise.tipo
        ? `O fato se ajusta ao tipo do ${tipoPenal(analise.tipo).nome.toLowerCase()}?`
        : "O fato se ajusta a algum tipo penal?";
    case "tipo":
      return "Qual é o crime?";
    case "forma":
      return "Consumado ou tentado?";
    case "excludente":
      return "Há excludente de ilicitude?";
    case "culpabilidade":
      return "O agente é culpável?";
    case "conclusao":
      return "Qual é a conclusão?";
  }
}

/**
 * As etapas da ficha de um caso, na ordem da análise: as que o jogador responde e as
 * que o mentor informa. Etapas ainda não ensinadas não aparecem (ADR-0003).
 */
export function montarFicha(caso: Caso, analise: Analise, capitulo: number): EtapaDaFicha[] {
  return ORDEM.filter((campo) => caso.pede.includes(campo) || caso.informa.includes(campo)).map(
    (campo) => {
      const opcoes: readonly Opcao[] = opcoesDoCampo(campo, caso, analise, capitulo);
      const esperado = esperadoNoCampo(analise, campo);
      return {
        campo,
        titulo: TITULOS[campo],
        pergunta: perguntaDoCampo(campo, caso, analise),
        opcoes,
        modo: caso.pede.includes(campo) ? "pergunta" : "informada",
        informado: opcoes.find((o) => o.valor === esperado) ?? null,
      };
    },
  );
}

/** Monta a ficha do motor a partir das respostas do jogador. */
export function fichaDasRespostas(
  respostas: Readonly<Partial<Record<CampoDaFicha, ValorDaFicha>>>,
): Ficha {
  // Os valores vêm das opções de `montarFicha`, que usam os mesmos literais do motor.
  return respostas as Ficha;
}

const ROTULOS_DOS_PASSOS: Readonly<Record<string, string>> = {
  sem_tipo: "Nenhum tipo penal descreve o fato",
  sem_dolo_nem_culpa: "Sem dolo e sem culpa",
  culpa_sem_previsao: "Conduta culposa, e o tipo não tem forma culposa",
  atos_preparatorios: "Não houve início de execução",
  culposo_sem_resultado: "Crime culposo não admite tentativa",
  consumado: "Consumado",
  tentado: "Tentado",
  nenhuma: "Sem excludente: fato ilícito",
  excludente_afastada: "Excludente alegada, mas falta requisito: fato ilícito",
  legitima_defesa: "Legítima defesa: fato lícito",
  estado_de_necessidade: "Estado de necessidade: fato lícito",
  culpavel: "Agente culpável",
  menoridade: "Menor de 18 anos: inimputável",
  embriaguez_fortuita: "Embriaguez completa e fortuita: isento de pena",
  crime: "Crime",
  fato_atipico: "Fato atípico",
  fato_licito: "Fato lícito: não há crime",
  ato_infracional: "Ato infracional",
  isento_de_pena: "Isento de pena",
};

const ETAPAS: Readonly<Record<string, string>> = {
  tipicidade: "Fato típico",
  forma: "Forma",
  ilicitude: "Ilicitude",
  culpabilidade: "Culpabilidade",
  conclusao: "Conclusão",
};

export interface LinhaDaTrilha {
  readonly etapa: string;
  readonly texto: string;
  readonly regras: readonly string[];
}

/** A análise do motor em linhas legíveis, para o desfecho e para o registro dos casos. */
export function trilhaDaAnalise(analise: Analise): LinhaDaTrilha[] {
  return analise.passos.map((passo) => {
    const tipo =
      passo.etapa === "tipicidade" && analise.tipico && analise.tipo
        ? tipoPenal(analise.tipo)
        : null;
    const texto = tipo
      ? `Típico: ${tipo.nome} (${tipo.artigo})`
      : (ROTULOS_DOS_PASSOS[passo.resultado] ?? passo.resultado);
    return { etapa: ETAPAS[passo.etapa] ?? passo.etapa, texto, regras: passo.regras };
  });
}
