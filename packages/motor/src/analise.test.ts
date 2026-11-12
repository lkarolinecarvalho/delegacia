import { describe, expect, it } from "vitest";
import { analisarFato } from "./analise";
import {
  DANO,
  ESTADO_DE_NECESSIDADE,
  FURTO_CONSUMADO,
  fato,
  LEGITIMA_DEFESA,
  LESAO,
  ROUBO_CONSUMADO,
} from "./apoio";
import { ErroDeFato } from "./erros";

describe("fato típico", () => {
  it("R-LEG-01: fato sem tipo penal correspondente é atípico", () => {
    const a = analisarFato(fato([]));
    expect(a).toMatchObject({
      tipico: false,
      tipo: null,
      motivoDaAtipicidade: "sem_tipo",
      conclusao: "fato_atipico",
      forma: null,
      excludente: null,
      culpabilidade: null,
    });
    expect(a.regras).toContain("R-LEG-01");
  });

  it("R-TIP-01 e R-PAT-01: subtrair coisa alheia móvel é furto", () => {
    const a = analisarFato(fato(FURTO_CONSUMADO));
    expect(a).toMatchObject({ tipico: true, tipo: "furto", conclusao: "crime" });
    expect(a.regras).toEqual(expect.arrayContaining(["R-TIP-01", "R-PAT-01", "R-DOLO-01"]));
    expect(a.regras).not.toContain("R-TIP-02");
  });

  it("R-TIP-02 e R-PAT-02: com violência ou grave ameaça prevalece o roubo", () => {
    const a = analisarFato(fato(ROUBO_CONSUMADO));
    expect(a.tipo).toBe("roubo");
    expect(a.regras).toEqual(expect.arrayContaining(["R-TIP-02", "R-PAT-02"]));
  });

  it("R-PAT-03: destruir coisa alheia com dolo é dano", () => {
    expect(analisarFato(fato(DANO))).toMatchObject({ tipo: "dano", conclusao: "crime" });
  });

  it("R-PAT-04 e R-PAT-06: quem tinha a posse lícita e passa a agir como dono comete apropriação indébita", () => {
    const a = analisarFato(fato(["coisa_alheia_movel", "posse_previa_licita", "apropriacao"]));
    expect(a).toMatchObject({ tipo: "apropriacao_indebita", forma: "consumado" });
  });

  it("R-PAT-05 e R-PAT-07: vantagem obtida com a vítima enganada é estelionato", () => {
    const a = analisarFato(
      fato(["fraude", "busca_de_vantagem_ilicita", "vitima_em_erro", "vantagem_obtida"]),
    );
    expect(a).toMatchObject({ tipo: "estelionato", forma: "consumado", conclusao: "crime" });
  });

  it("R-PAT-05: fraude que não engana a vítima é estelionato tentado", () => {
    const a = analisarFato(fato(["fraude", "busca_de_vantagem_ilicita"]));
    expect(a).toMatchObject({ tipo: "estelionato", forma: "tentado" });
  });

  it("R-CULPA-01 e R-PES-01: lesão corporal culposa é típica", () => {
    const a = analisarFato(fato(LESAO, { elementoSubjetivo: "culpa" }));
    expect(a).toMatchObject({ tipico: true, tipo: "lesao_corporal", conclusao: "crime" });
    expect(a.regras).toContain("R-CULPA-01");
    expect(a.regras).not.toContain("R-DOLO-01");
  });

  it("R-CULPA-02: dano culposo é atípico, porque a lei não prevê a forma culposa", () => {
    const a = analisarFato(fato(DANO, { elementoSubjetivo: "culpa" }));
    expect(a).toMatchObject({
      tipico: false,
      tipo: "dano",
      motivoDaAtipicidade: "culpa_sem_previsao",
      conclusao: "fato_atipico",
    });
    expect(a.regras).toEqual(expect.arrayContaining(["R-CULPA-02", "R-PAT-03"]));
  });

  it("R-CULPA-03: sem dolo e sem culpa o fato é atípico", () => {
    const a = analisarFato(fato(LESAO, { elementoSubjetivo: "nenhum" }));
    expect(a).toMatchObject({ tipico: false, motivoDaAtipicidade: "sem_dolo_nem_culpa" });
  });
});

describe("consumação e tentativa", () => {
  it("R-ITER-01: reunidos os elementos do tipo, o crime está consumado", () => {
    const a = analisarFato(fato(DANO));
    expect(a.forma).toBe("consumado");
    expect(a.regras).toContain("R-ITER-01");
  });

  it("R-ITER-02: execução iniciada e interrompida por circunstância alheia é tentativa", () => {
    const a = analisarFato(fato(["subtracao", "coisa_alheia_movel"]));
    expect(a).toMatchObject({ tipo: "furto", forma: "tentado", conclusao: "crime" });
    expect(a.regras).toContain("R-ITER-02");
  });

  it("R-ITER-03: sem início de execução não há crime", () => {
    const a = analisarFato(
      fato(["subtracao", "coisa_alheia_movel"], { execucao: { iniciada: false } }),
    );
    expect(a).toMatchObject({ tipico: false, motivoDaAtipicidade: "atos_preparatorios" });
  });

  it("R-ITER-04: crime culposo não admite tentativa", () => {
    const a = analisarFato(fato(["ofensa_a_integridade_corporal"], { elementoSubjetivo: "culpa" }));
    expect(a).toMatchObject({ tipico: false, motivoDaAtipicidade: "culposo_sem_resultado" });
  });

  it("R-ITER-05: furto e roubo consumam-se com a inversão da posse", () => {
    for (const elementos of [FURTO_CONSUMADO, ROUBO_CONSUMADO]) {
      const a = analisarFato(fato(elementos));
      expect(a.forma).toBe("consumado");
      expect(a.regras).toContain("R-ITER-05");
    }
  });

  it("R-ITER-06: desistência voluntária ainda não é coberta", () => {
    const desistiu = fato(["subtracao", "coisa_alheia_movel"], {
      execucao: { iniciada: true, interrompidaPor: "vontade_propria" },
    });
    let erro: unknown;
    try {
      analisarFato(desistiu);
    } catch (e) {
      erro = e;
    }
    expect(erro).toBeInstanceOf(ErroDeFato);
    expect(erro).toMatchObject({ codigo: "CASO_NAO_COBERTO", regra: "R-ITER-06" });
  });
});

describe("ilicitude", () => {
  it("R-LD-01 e R-ILI-01: com todos os requisitos, a legítima defesa torna o fato lícito", () => {
    const a = analisarFato(fato(LESAO, { justificante: LEGITIMA_DEFESA }));
    expect(a).toMatchObject({
      tipico: true,
      tipo: "lesao_corporal",
      excludente: "legitima_defesa",
      culpabilidade: null,
      conclusao: "fato_licito",
    });
    expect(a.regras).toEqual(expect.arrayContaining(["R-LD-01", "R-ILI-01"]));
  });

  it("R-LD-02: agressão que já cessou não autoriza legítima defesa", () => {
    const a = analisarFato(
      fato(LESAO, { justificante: { ...LEGITIMA_DEFESA, atualOuIminente: false } }),
    );
    expect(a).toMatchObject({ excludente: "nenhuma", conclusao: "crime" });
    expect(a.requisitosAusentes).toEqual(["atualOuIminente"]);
    expect(a.regras).toContain("R-LD-02");
  });

  it("R-ILI-02: sem moderação, a excludente é afastada", () => {
    const a = analisarFato(
      fato(LESAO, { justificante: { ...LEGITIMA_DEFESA, usoModerado: false } }),
    );
    expect(a).toMatchObject({ excludente: "nenhuma", conclusao: "crime" });
    expect(a.regras).toContain("R-ILI-02");
  });

  it("R-EN-01: com todos os requisitos, o estado de necessidade torna o fato lícito", () => {
    const a = analisarFato(fato(DANO, { justificante: ESTADO_DE_NECESSIDADE }));
    expect(a).toMatchObject({ excludente: "estado_de_necessidade", conclusao: "fato_licito" });
    expect(a.regras).toContain("R-EN-01");
  });

  it("R-EN-01: perigo que podia ser evitado de outro modo afasta a excludente", () => {
    const a = analisarFato(
      fato(DANO, { justificante: { ...ESTADO_DE_NECESSIDADE, inevitavelDeOutroModo: false } }),
    );
    expect(a).toMatchObject({ excludente: "nenhuma", conclusao: "crime" });
  });

  it("R-EN-02: quem tinha o dever legal de enfrentar o perigo não alega estado de necessidade", () => {
    const a = analisarFato(
      fato(DANO, { justificante: { ...ESTADO_DE_NECESSIDADE, deverLegalDeEnfrentar: true } }),
    );
    expect(a).toMatchObject({ excludente: "nenhuma", conclusao: "crime" });
    expect(a.regras).toContain("R-EN-02");
  });
});

describe("culpabilidade", () => {
  it("R-CULP-01 e R-CULP-02: menor de 18 anos responde por ato infracional", () => {
    const a = analisarFato(fato(FURTO_CONSUMADO, { agente: { idade: 17, embriaguez: "nenhuma" } }));
    expect(a).toMatchObject({
      tipico: true,
      tipo: "furto",
      culpabilidade: "menoridade",
      conclusao: "ato_infracional",
    });
    expect(a.regras).toEqual(expect.arrayContaining(["R-CULP-01", "R-CULP-02"]));
  });

  it("R-CULP-01: com 18 anos completos o agente é imputável", () => {
    const a = analisarFato(fato(FURTO_CONSUMADO, { agente: { idade: 18, embriaguez: "nenhuma" } }));
    expect(a).toMatchObject({ culpabilidade: "culpavel", conclusao: "crime" });
  });

  it("R-CULP-03: embriaguez voluntária ou culposa não exclui a imputabilidade", () => {
    for (const embriaguez of ["voluntaria", "culposa"] as const) {
      const a = analisarFato(fato(LESAO, { agente: { idade: 40, embriaguez } }));
      expect(a).toMatchObject({ culpabilidade: "culpavel", conclusao: "crime" });
      expect(a.regras).toContain("R-CULP-03");
    }
  });

  it("R-CULP-04: embriaguez completa por caso fortuito isenta de pena", () => {
    const a = analisarFato(fato(LESAO, { agente: { idade: 40, embriaguez: "fortuita_completa" } }));
    expect(a).toMatchObject({ culpabilidade: "embriaguez_fortuita", conclusao: "isento_de_pena" });
  });

  it("R-GER-03: a excludente de ilicitude é vista antes da culpabilidade", () => {
    const a = analisarFato(
      fato(LESAO, {
        justificante: LEGITIMA_DEFESA,
        agente: { idade: 16, embriaguez: "nenhuma" },
      }),
    );
    expect(a).toMatchObject({ conclusao: "fato_licito", culpabilidade: null });
    expect(a.passos.map((p) => p.etapa)).toEqual(["tipicidade", "forma", "ilicitude", "conclusao"]);
  });

  it("R-CRIME-01: fato típico, ilícito e culpável é crime", () => {
    const a = analisarFato(fato(ROUBO_CONSUMADO));
    expect(a.conclusao).toBe("crime");
    expect(a.passos.at(-1)?.regras).toContain("R-CRIME-01");
  });
});

it("recusa idade inválida", () => {
  expect(() => analisarFato(fato(LESAO, { agente: { idade: -1, embriaguez: "nenhuma" } }))).toThrow(
    ErroDeFato,
  );
});
