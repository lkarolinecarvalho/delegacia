import type { Caso } from "@delegacia/content";
import {
  type Analise,
  type CampoDaFicha,
  esperadoNoCampo,
  type Ficha,
  NOMES_DOS_TITULOS,
  type Procedimento,
  TIPOS_PENAIS,
  type TipoPenal,
  tipoPenal,
} from "@delegacia/motor";

/** Valor de uma opção da ficha, como o motor o compara. */
export type ValorDaFicha = string | boolean;

export interface Opcao {
  readonly valor: ValorDaFicha;
  readonly rotulo: string;
  readonly detalhe?: string;
  /** Agrupa as opções (os tipos penais, pelo título do Código). */
  readonly grupo?: string;
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
  /** Lista longa (o Código inteiro): a ficha mostra uma busca. */
  readonly comBusca: boolean;
}

/** Ordem das etapas: a teoria do crime (R-GER-03) e, depois, a fase policial. */
const ORDEM: readonly CampoDaFicha[] = [
  "tipico",
  "tipo",
  "figura",
  "forma",
  "excludente",
  "culpabilidade",
  "conclusao",
  "acao",
  "instauracao",
  "rito",
  "flagrante",
  "fianca",
  "prazo",
];

const TITULOS: Readonly<Record<CampoDaFicha, string>> = {
  tipico: "Fato típico",
  tipo: "Tipo penal",
  figura: "Figura",
  forma: "Forma",
  excludente: "Ilicitude",
  culpabilidade: "Culpabilidade",
  conclusao: "Conclusão",
  acao: "Ação penal",
  instauracao: "Instauração",
  rito: "Rito",
  flagrante: "Flagrante",
  fianca: "Fiança",
  prazo: "Prazo",
};

const PERGUNTAS: Readonly<Record<CampoDaFicha, string>> = {
  tipico: "O fato se ajusta a algum tipo penal?",
  tipo: "Qual é o crime?",
  figura: "Simples ou qualificado?",
  forma: "Consumado ou tentado?",
  excludente: "Há excludente de ilicitude?",
  culpabilidade: "O agente é culpável?",
  conclusao: "Qual é a conclusão?",
  acao: "Qual é a ação penal?",
  instauracao: "A delegacia pode agir agora?",
  rito: "Termo circunstanciado ou inquérito?",
  flagrante: "Há flagrante? De que espécie?",
  fianca: "Quem pode conceder a fiança?",
  prazo: "Qual é o prazo para concluir o inquérito?",
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

/** Opções fixas das etapas que não dependem do caso. */
const OPCOES: Readonly<Partial<Record<CampoDaFicha, readonly Opcao[]>>> = {
  tipico: [
    { valor: true, rotulo: "Sim, é típico", detalhe: "A conduta se ajusta a um tipo penal." },
    { valor: false, rotulo: "Não, é atípico", detalhe: "Falta algo para o tipo penal." },
  ],
  figura: [
    { valor: "simples", rotulo: "Simples", detalhe: "Só o tipo básico." },
    {
      valor: "qualificado",
      rotulo: "Qualificado",
      detalhe: "Há circunstância que a lei pune com pena maior.",
    },
  ],
  forma: [
    { valor: "consumado", rotulo: "Consumado", detalhe: "Reuniu todos os elementos do tipo." },
    {
      valor: "tentado",
      rotulo: "Tentado",
      detalhe: "Iniciada a execução, não se consumou por circunstâncias alheias à vontade.",
    },
  ],
  excludente: [
    { valor: "nenhuma", rotulo: "Nenhuma", detalhe: "O fato é ilícito." },
    { valor: "legitima_defesa", rotulo: "Legítima defesa" },
    { valor: "estado_de_necessidade", rotulo: "Estado de necessidade" },
    { valor: "estrito_cumprimento_do_dever_legal", rotulo: "Estrito cumprimento de dever legal" },
    { valor: "exercicio_regular_de_direito", rotulo: "Exercício regular de direito" },
  ],
  culpabilidade: [
    { valor: "culpavel", rotulo: "Sim, é culpável" },
    { valor: "menoridade", rotulo: "Não: menor de 18 anos" },
    {
      valor: "embriaguez_fortuita",
      rotulo: "Não: embriaguez completa por caso fortuito ou força maior",
    },
  ],
  acao: [
    {
      valor: "publica_incondicionada",
      rotulo: "Pública incondicionada",
      detalhe: "O Estado age por conta própria.",
    },
    {
      valor: "publica_condicionada",
      rotulo: "Pública condicionada",
      detalhe: "Depende da representação da vítima.",
    },
    { valor: "privada", rotulo: "Privada", detalhe: "A própria vítima move a ação, por queixa." },
  ],
  instauracao: [
    {
      valor: "pode_instaurar",
      rotulo: "Sim, pode agir",
      detalhe: "De ofício, ou porque a vítima já se manifestou.",
    },
    {
      valor: "aguarda_a_vitima",
      rotulo: "Não: falta a vítima se manifestar",
      detalhe: "Sem representação ou requerimento, não se instaura.",
    },
    {
      valor: "decadencia",
      rotulo: "Não: houve decadência",
      detalhe: "Passaram seis meses sem a vítima se manifestar.",
    },
  ],
  rito: [
    {
      valor: "termo_circunstanciado",
      rotulo: "Termo circunstanciado",
      detalhe: "Infração de menor potencial ofensivo: vai ao Juizado.",
    },
    { valor: "inquerito", rotulo: "Inquérito policial", detalhe: "Os demais casos." },
  ],
  flagrante: [
    {
      valor: "proprio",
      rotulo: "Próprio",
      detalhe: "Está cometendo a infração ou acaba de cometê-la.",
    },
    { valor: "improprio", rotulo: "Impróprio", detalhe: "Perseguido logo após." },
    {
      valor: "presumido",
      rotulo: "Presumido",
      detalhe: "Encontrado logo depois, com objetos que o apontam como autor.",
    },
    { valor: "nao_ha", rotulo: "Não há flagrante" },
  ],
  fianca: [
    { valor: "delegado", rotulo: "O delegado", detalhe: "Pena máxima de até quatro anos." },
    { valor: "juiz", rotulo: "Só o juiz", detalhe: "Pena máxima acima de quatro anos." },
    { valor: "inafiancavel", rotulo: "Ninguém: é inafiançável" },
    {
      valor: "nao_se_aplica",
      rotulo: "Não se discute fiança",
      detalhe: "Não há auto de prisão em flagrante.",
    },
  ],
  prazo: [
    { valor: "10_dias", rotulo: "10 dias", detalhe: "Indiciado preso." },
    { valor: "30_dias", rotulo: "30 dias", detalhe: "Indiciado solto." },
    { valor: "nao_se_aplica", rotulo: "Não há inquérito a concluir" },
  ],
};

const opcaoDoTipo = (tipo: TipoPenal): Opcao => ({
  valor: tipo.id,
  rotulo: tipo.nome,
  detalhe: `${tipo.artigo}. ${tipo.texto}`,
  grupo: NOMES_DOS_TITULOS[tipo.titulo],
});

function opcoesDoCampo(
  campo: CampoDaFicha,
  caso: Caso,
  analise: Analise,
  capitulo: number,
  procedimento: Procedimento | null,
): readonly Opcao[] {
  if (campo === "tipo") {
    // Sugerido: os tipos da missão. Livre: o Código inteiro, por título.
    const tipos =
      caso.opcoesDeTipo.length > 0 ? caso.opcoesDeTipo.map((id) => tipoPenal(id)) : TIPOS_PENAIS;
    return [
      ...tipos.map(opcaoDoTipo),
      { valor: "nenhum", rotulo: "Nenhum", detalhe: "O fato é atípico." },
    ];
  }
  if (campo === "conclusao") {
    // Só aparecem as conclusões já ensinadas, mais a correta (por garantia).
    const correta = esperadoNoCampo(analise, "conclusao", procedimento);
    return CONCLUSOES.filter((c) => c.desdeOCapitulo <= capitulo || c.valor === correta).map(
      ({ desdeOCapitulo: _, ...opcao }) => opcao,
    );
  }
  return OPCOES[campo] ?? [];
}

/**
 * As etapas da ficha de um caso, na ordem da análise: as que o jogador responde e as
 * que o mentor informa. Etapas ainda não ensinadas não aparecem (ADR-0003).
 */
export function montarFicha(
  caso: Caso,
  analise: Analise,
  capitulo: number,
  procedimento: Procedimento | null = null,
): EtapaDaFicha[] {
  return ORDEM.filter((campo) => caso.pede.includes(campo) || caso.informa.includes(campo)).map(
    (campo) => {
      const opcoes = opcoesDoCampo(campo, caso, analise, capitulo, procedimento);
      const esperado = esperadoNoCampo(analise, campo, procedimento);
      const tipo = caso.tipoInformado && analise.tipo ? tipoPenal(analise.tipo) : null;
      return {
        campo,
        titulo: TITULOS[campo],
        pergunta:
          campo === "tipico" && tipo
            ? `O fato se ajusta ao tipo do crime de ${tipo.nome.toLowerCase()}?`
            : PERGUNTAS[campo],
        opcoes,
        modo: caso.pede.includes(campo) ? "pergunta" : "informada",
        informado: opcoes.find((o) => o.valor === esperado) ?? null,
        comBusca: campo === "tipo" && caso.opcoesDeTipo.length === 0,
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

/**
 * A prévia do erro: o que aconteceria se a decisão errada fosse tomada. Só existe para
 * as etapas da fase policial, em que o erro tem consequência jurídica direta.
 */
export function previaDoErro(
  campo: CampoDaFicha,
  informado: ValorDaFicha | undefined,
  procedimento: Procedimento | null,
): string | null {
  if (!procedimento || informado === undefined) return null;
  switch (campo) {
    case "flagrante":
      if (procedimento.flagrante === "nao_ha") {
        return "Se você prendesse em flagrante aqui, a prisão seria ilegal, e o juiz a relaxaria na audiência de custódia.";
      }
      if (informado === "nao_ha") {
        return "Havia flagrante. Sem o auto de prisão, o autor iria embora e o registro do flagrante se perderia.";
      }
      return "Havia flagrante, mas de outra espécie. Releia como o autor foi encontrado.";
    case "rito":
      return procedimento.rito === "termo_circunstanciado"
        ? "Um inquérito aqui seria desnecessário: a infração de menor potencial ofensivo vai ao Juizado por termo circunstanciado."
        : "Só um termo circunstanciado deixaria o caso sem a investigação devida: aqui a Lei 9.099 não se aplica.";
    case "instauracao":
      if (procedimento.instauracao === "aguarda_a_vitima") {
        return "A lei diz que o inquérito não pode ser iniciado sem a manifestação da vítima. O que fosse feito poderia ser anulado.";
      }
      if (procedimento.instauracao === "decadencia") {
        return "A punibilidade já está extinta pela decadência. Investigar agora seria constrangimento ilegal.";
      }
      return "A delegacia ficaria parada sem motivo: aqui você já pode agir.";
    case "fianca":
      if (procedimento.fianca === "nao_se_aplica") {
        return "Só se fala em fiança quando há auto de prisão em flagrante, e aqui não há.";
      }
      if (informado === "delegado") {
        return "Fiança concedida por quem não tem atribuição é inválida: o preso sairia por um ato nulo.";
      }
      if (procedimento.fianca === "delegado") {
        return "O autor ficaria preso sem necessidade até o juiz decidir. Você mesmo podia arbitrar a fiança.";
      }
      return "A fiança seria tratada pela autoridade errada.";
    case "prazo":
      return procedimento.prazo === "10_dias"
        ? "Com o indiciado preso, passar dos dez dias torna a prisão ilegal por excesso de prazo."
        : procedimento.prazo === "30_dias"
          ? "Com o indiciado solto, o prazo é de trinta dias. Correr sem necessidade prejudica a apuração."
          : "Não há inquérito a concluir neste caso.";
    case "acao":
      return informado === "publica_incondicionada"
        ? "Tratar a ação como incondicionada levaria a investigar e a processar contra a vontade da vítima, o que a lei não permite aqui."
        : "Esperar pela vítima deixaria o crime sem apuração: aqui o Estado age por conta própria.";
    default:
      return null;
  }
}

const ROTULOS_DOS_PASSOS: Readonly<Record<string, string>> = {
  sem_tipo: "Nenhum tipo penal descreve o fato",
  sem_dolo_nem_culpa: "Sem dolo e sem culpa",
  culpa_sem_previsao: "Conduta culposa, e o tipo não tem forma culposa",
  atos_preparatorios: "Não houve início de execução",
  culposo_sem_resultado: "Crime culposo não admite tentativa",
  erro_de_tipo: "Erro de tipo inevitável: sem dolo e sem culpa",
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
  /** A linha que fecha a análise do crime, destacada. */
  readonly final?: boolean;
}

/** Nome do crime como a análise o classificou: com a forma qualificada, se houver. */
export function nomeDoCrime(analise: Analise): string | null {
  if (!analise.tipo) return null;
  const tipo = tipoPenal(analise.tipo);
  const figura = analise.figura === "qualificado" ? tipo.qualificado : null;
  return figura ? `${figura.nome} (${figura.artigo})` : `${tipo.nome} (${tipo.artigo})`;
}

/** A análise do motor em linhas legíveis, para o desfecho e para o registro dos casos. */
export function trilhaDaAnalise(
  analise: Analise,
  procedimento: Procedimento | null = null,
): LinhaDaTrilha[] {
  const linhas: LinhaDaTrilha[] = analise.passos.map((passo) => {
    const crime = passo.etapa === "tipicidade" && analise.tipico ? nomeDoCrime(analise) : null;
    return {
      etapa: ETAPAS[passo.etapa] ?? passo.etapa,
      texto: crime ? `Típico: ${crime}` : (ROTULOS_DOS_PASSOS[passo.resultado] ?? passo.resultado),
      final: passo.etapa === "conclusao",
    };
  });
  if (!procedimento) return linhas;
  const rotulo = (campo: CampoDaFicha, valor: ValorDaFicha) =>
    OPCOES[campo]?.find((o) => o.valor === valor)?.rotulo ?? String(valor);
  linhas.push(
    { etapa: "Ação penal", texto: rotulo("acao", procedimento.acao) },
    { etapa: "Rito", texto: rotulo("rito", procedimento.rito) },
  );
  if (procedimento.instauracao !== "pode_instaurar") {
    linhas.push({ etapa: "Instauração", texto: rotulo("instauracao", procedimento.instauracao) });
  }
  if (procedimento.flagrante !== "nao_ha") {
    linhas.push({ etapa: "Flagrante", texto: rotulo("flagrante", procedimento.flagrante) });
  }
  if (procedimento.fianca !== "nao_se_aplica") {
    linhas.push({
      etapa: "Fiança",
      texto: `${rotulo("fianca", procedimento.fianca)}${procedimento.preso ? " — fica preso" : " — sai solto"}`,
    });
  }
  if (procedimento.prazo !== "nao_se_aplica") {
    linhas.push({ etapa: "Prazo", texto: `Inquérito em ${rotulo("prazo", procedimento.prazo)}` });
  }
  return linhas;
}
