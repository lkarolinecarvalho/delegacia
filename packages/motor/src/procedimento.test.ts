import { describe, expect, it } from "vitest";
import { analisarFato } from "./analise";
import { DANO, FURTO_CONSUMADO, fato, LESAO, ROUBO_CONSUMADO } from "./apoio";
import { TIPOS_PENAIS } from "./catalogo";
import { compararFicha } from "./comparacao";
import { ErroDeFato } from "./erros";
import { analisarProcedimento } from "./procedimento";
import { existeRegra } from "./regras";
import type { Contexto, Elemento, Fato } from "./tipos";

const contexto = (mudancas: Partial<Contexto> = {}): Contexto => ({
  situacao: "nenhuma",
  vitimaManifestou: false,
  mesesDesdeAAutoria: 0,
  ...mudancas,
});

const procedimento = (
  elementos: readonly Elemento[],
  ctx: Partial<Contexto> = {},
  mudancas: Partial<Fato> = {},
) => analisarProcedimento(analisarFato(fato(elementos, mudancas)), contexto(ctx));

const AMEACA: readonly Elemento[] = ["ameaca_de_mal_injusto_e_grave", "vitima_tomou_conhecimento"];
const INJURIA: readonly Elemento[] = ["ofensa_a_dignidade", "vitima_tomou_conhecimento"];
const LESAO_DOMESTICA: readonly Elemento[] = [...LESAO, "contexto_domestico_contra_mulher"];
const HOMICIDIO: readonly Elemento[] = ["matar_alguem", "morte"];

describe("ação penal e instauração", () => {
  it("R-ACAO-01: no furto a ação é pública incondicionada e o delegado age de ofício", () => {
    const p = procedimento(FURTO_CONSUMADO);
    expect(p).toMatchObject({ acao: "publica_incondicionada", instauracao: "pode_instaurar" });
    expect(p.regras.acao).toContain("R-ACAO-01");
  });

  it("R-ACAO-02: na ameaça, sem representação, o inquérito não pode ser iniciado", () => {
    const p = procedimento(AMEACA);
    expect(p).toMatchObject({ acao: "publica_condicionada", instauracao: "aguarda_a_vitima" });
    expect(p.regras.instauracao).toContain("R-ACAO-02");
    expect(procedimento(AMEACA, { vitimaManifestou: true }).instauracao).toBe("pode_instaurar");
  });

  it("R-ACAO-03: na injúria e no dano a ação é privada e depende de requerimento", () => {
    expect(procedimento(INJURIA)).toMatchObject({
      acao: "privada",
      instauracao: "aguarda_a_vitima",
    });
    expect(procedimento(DANO, { vitimaManifestou: true })).toMatchObject({
      acao: "privada",
      instauracao: "pode_instaurar",
    });
  });

  it("R-ACAO-04: seis meses sem manifestação da vítima levam à decadência", () => {
    expect(procedimento(AMEACA, { mesesDesdeAAutoria: 5 }).instauracao).toBe("aguarda_a_vitima");
    const p = procedimento(AMEACA, { mesesDesdeAAutoria: 6 });
    expect(p.instauracao).toBe("decadencia");
    expect(p.regras.instauracao).toContain("R-ACAO-04");
    // A decadência não atinge a ação incondicionada nem quem já se manifestou.
    expect(procedimento(FURTO_CONSUMADO, { mesesDesdeAAutoria: 12 }).instauracao).toBe(
      "pode_instaurar",
    );
    expect(
      procedimento(AMEACA, { mesesDesdeAAutoria: 12, vitimaManifestou: true }).instauracao,
    ).toBe("pode_instaurar");
  });
});

describe("rito", () => {
  it("R-JECRIM-01 e R-JECRIM-02: pena máxima de até dois anos vai para termo circunstanciado", () => {
    const p = procedimento(LESAO, { vitimaManifestou: true });
    expect(p).toMatchObject({ menorPotencialOfensivo: true, rito: "termo_circunstanciado" });
    expect(p.regras.rito).toEqual(expect.arrayContaining(["R-JECRIM-01", "R-JECRIM-02"]));
  });

  it("R-JECRIM-01: furto (quatro anos) segue por inquérito", () => {
    expect(procedimento(FURTO_CONSUMADO)).toMatchObject({
      menorPotencialOfensivo: false,
      rito: "inquerito",
    });
  });

  it("R-MP-01, R-MP-02 e R-MP-03: lesão contra a mulher não tem termo circunstanciado nem depende de representação", () => {
    const p = procedimento(LESAO_DOMESTICA);
    expect(p).toMatchObject({
      acao: "publica_incondicionada",
      instauracao: "pode_instaurar",
      menorPotencialOfensivo: false,
      rito: "inquerito",
    });
    expect(p.regras.rito).toContain("R-MP-01");
    expect(p.regras.acao).toContain("R-MP-03");
  });
});

describe("flagrante e fiança", () => {
  it("R-FLAG-01, R-FLAG-02 e R-FLAG-03: as espécies de flagrante do art. 302", () => {
    expect(procedimento(FURTO_CONSUMADO, { situacao: "cometendo" }).flagrante).toBe("proprio");
    expect(procedimento(FURTO_CONSUMADO, { situacao: "acabou_de_cometer" }).flagrante).toBe(
      "proprio",
    );
    const improprio = procedimento(FURTO_CONSUMADO, { situacao: "perseguido_logo_apos" });
    expect(improprio.flagrante).toBe("improprio");
    expect(improprio.regras.flagrante).toEqual(["R-FLAG-02"]);
    const presumido = procedimento(FURTO_CONSUMADO, { situacao: "encontrado_logo_depois" });
    expect(presumido.flagrante).toBe("presumido");
    expect(presumido.regras.flagrante).toEqual(["R-FLAG-03"]);
  });

  it("R-FLAG-04: fora das hipóteses do art. 302 não há flagrante, nem fiança, nem preso", () => {
    const p = procedimento(ROUBO_CONSUMADO);
    expect(p).toMatchObject({ flagrante: "nao_ha", fianca: "nao_se_aplica", preso: false });
    expect(p.regras.flagrante).toEqual(["R-FLAG-04"]);
  });

  it("R-FIANCA-01: no furto em flagrante o delegado arbitra a fiança, e o autor sai solto", () => {
    const p = procedimento(FURTO_CONSUMADO, { situacao: "acabou_de_cometer" });
    expect(p).toMatchObject({ fianca: "delegado", preso: false, prazo: "30_dias" });
  });

  it("R-FIANCA-02: no roubo em flagrante só o juiz concede fiança, e o autor fica preso", () => {
    const p = procedimento(ROUBO_CONSUMADO, { situacao: "perseguido_logo_apos" });
    expect(p).toMatchObject({ fianca: "juiz", preso: true, prazo: "10_dias" });
    expect(p.regras.fianca).toContain("R-FIANCA-02");
  });

  it("R-FIANCA-03 e R-PES-08: homicídio qualificado é inafiançável", () => {
    const p = procedimento(
      HOMICIDIO,
      { situacao: "acabou_de_cometer" },
      { circunstancias: ["motivo_futil"] },
    );
    expect(p).toMatchObject({ fianca: "inafiancavel", preso: true });
    // O homicídio simples é afiançável, mas só pelo juiz.
    expect(procedimento(HOMICIDIO, { situacao: "acabou_de_cometer" }).fianca).toBe("juiz");
  });

  it("R-PAT-08: o furto qualificado passa de quatro anos, e a fiança é do juiz", () => {
    const p = procedimento(
      FURTO_CONSUMADO,
      { situacao: "cometendo" },
      { circunstancias: ["rompimento_de_obstaculo"] },
    );
    expect(p).toMatchObject({ fianca: "juiz", preso: true });
  });

  it("R-JECRIM-02: no termo circunstanciado não se impõe prisão em flagrante nem fiança", () => {
    const p = procedimento(LESAO, { situacao: "cometendo", vitimaManifestou: true });
    expect(p).toMatchObject({ flagrante: "proprio", fianca: "nao_se_aplica", preso: false });
    expect(p.regras.fianca).toEqual(["R-JECRIM-02"]);
  });

  it("R-MP-01: na lesão contra a mulher em flagrante há auto de prisão, e a fiança é do juiz", () => {
    const p = procedimento(LESAO_DOMESTICA, { situacao: "acabou_de_cometer" });
    expect(p).toMatchObject({
      flagrante: "proprio",
      fianca: "juiz",
      preso: true,
      prazo: "10_dias",
    });
  });

  it("R-ACAO-02: sem a representação não se lavra o auto, ainda que haja flagrante", () => {
    const p = procedimento(
      ["fraude", "busca_de_vantagem_ilicita", "vitima_em_erro", "vantagem_obtida"],
      { situacao: "acabou_de_cometer" },
    );
    expect(p).toMatchObject({
      flagrante: "proprio",
      instauracao: "aguarda_a_vitima",
      fianca: "nao_se_aplica",
      preso: false,
      prazo: "nao_se_aplica",
    });
  });
});

describe("inquérito", () => {
  it("R-IP-01: dez dias com o autor preso, trinta com ele solto", () => {
    expect(procedimento(ROUBO_CONSUMADO, { situacao: "cometendo" }).prazo).toBe("10_dias");
    const solto = procedimento(ROUBO_CONSUMADO);
    expect(solto.prazo).toBe("30_dias");
    expect(solto.regras.prazo).toEqual(["R-IP-01"]);
  });

  it("no termo circunstanciado não há prazo de inquérito", () => {
    expect(procedimento(LESAO, { vitimaManifestou: true }).prazo).toBe("nao_se_aplica");
  });
});

describe("limites", () => {
  it("só há fase policial quando há crime", () => {
    const atipico = analisarFato(fato(DANO, { elementoSubjetivo: "culpa" }));
    expect(() => analisarProcedimento(atipico, contexto())).toThrow(ErroDeFato);
    const menor = analisarFato(
      fato(FURTO_CONSUMADO, { agente: { idade: 16, embriaguez: "nenhuma" } }),
    );
    expect(() => analisarProcedimento(menor, contexto())).toThrow(ErroDeFato);
  });

  it("a ficha da fase policial é conferida contra o procedimento", () => {
    const analise = analisarFato(fato(ROUBO_CONSUMADO));
    const p = analisarProcedimento(analise, contexto({ situacao: "perseguido_logo_apos" }));
    const certa = { flagrante: "improprio", fianca: "juiz", prazo: "10_dias" } as const;
    expect(compararFicha(analise, certa, p).correta).toBe(true);
    const errada = compararFicha(analise, { ...certa, fianca: "delegado" }, p);
    expect(errada.correta).toBe(false);
    expect(errada.campos.find((c) => c.campo === "fianca")?.regras).toContain("R-FIANCA-02");
    // Sem o procedimento, as etapas da fase policial nunca são dadas como certas.
    expect(compararFicha(analise, certa).correta).toBe(false);
  });

  it("toda regra citada pelo procedimento existe, para todos os tipos e situações", () => {
    for (const tipo of TIPOS_PENAIS) {
      const analise = analisarFato(fato([...tipo.exige, ...tipo.consumaCom]));
      for (const situacao of ["nenhuma", "cometendo", "perseguido_logo_apos"] as const) {
        for (const vitimaManifestou of [true, false]) {
          const p = analisarProcedimento(analise, contexto({ situacao, vitimaManifestou }));
          for (const id of Object.values(p.regras).flat()) {
            expect(existeRegra(id), `${tipo.id}: ${id}`).toBe(true);
          }
          // Preso só existe com flagrante, e nunca no menor potencial ofensivo.
          if (p.preso) {
            expect(p.flagrante).not.toBe("nao_ha");
            expect(p.menorPotencialOfensivo).toBe(false);
            expect(p.prazo).toBe("10_dias");
          }
        }
      }
    }
  });
});

describe("Parte Especial", () => {
  it("todo tipo do catálogo é reconhecido pelos próprios elementos, como consumado", () => {
    for (const tipo of TIPOS_PENAIS) {
      const a = analisarFato(fato([...tipo.exige, ...tipo.consumaCom]));
      expect(a, tipo.id).toMatchObject({ tipo: tipo.id, forma: "consumado", figura: "simples" });
      expect(existeRegra(tipo.regra), tipo.regra).toBe(true);
      if (tipo.qualificado) expect(existeRegra(tipo.qualificado.regra)).toBe(true);
    }
  });

  it("R-QUAL-01 e R-PAT-08: uma circunstância basta para qualificar o furto", () => {
    const a = analisarFato(fato(FURTO_CONSUMADO, { circunstancias: ["escalada"] }));
    expect(a).toMatchObject({ tipo: "furto", figura: "qualificado" });
    expect(a.regras).toEqual(expect.arrayContaining(["R-QUAL-01", "R-PAT-08"]));
    // Circunstância de outro crime não qualifica o furto.
    expect(analisarFato(fato(FURTO_CONSUMADO, { circunstancias: ["motivo_torpe"] })).figura).toBe(
      "simples",
    );
  });

  it("R-PES-07: homicídio culposo é típico e não se qualifica", () => {
    const a = analisarFato(
      fato(HOMICIDIO, { elementoSubjetivo: "culpa", circunstancias: ["meio_cruel"] }),
    );
    expect(a).toMatchObject({ tipo: "homicidio", figura: "simples", conclusao: "crime" });
  });

  it("R-PAT-09: a extorsão consuma-se quando a vítima cede, sem depender da vantagem", () => {
    const base: Elemento[] = [
      "constrangimento_mediante_violencia_ou_ameaca",
      "busca_de_vantagem_economica",
    ];
    expect(analisarFato(fato(base)).forma).toBe("tentado");
    const cedeu = analisarFato(fato([...base, "vitima_cedeu"]));
    expect(cedeu).toMatchObject({ tipo: "extorsao", forma: "consumado" });
    expect(cedeu.regras).toContain("R-PAT-09");
  });

  it("R-ADM-03 e R-ADM-04: exigir é concussão; solicitar ou receber é corrupção passiva", () => {
    expect(analisarFato(fato(["funcionario_publico", "exige_vantagem_indevida"])).tipo).toBe(
      "concussao",
    );
    expect(
      analisarFato(fato(["funcionario_publico", "solicita_ou_recebe_vantagem_indevida"])).tipo,
    ).toBe("corrupcao_passiva");
  });

  it("R-PES-09: calúnia e difamação dependem de terceiro; a injúria, da própria vítima", () => {
    expect(analisarFato(fato(["imputacao_falsa_de_crime"])).forma).toBe("tentado");
    expect(
      analisarFato(fato(["imputacao_falsa_de_crime", "terceiro_tomou_conhecimento"])).forma,
    ).toBe("consumado");
    expect(analisarFato(fato(INJURIA))).toMatchObject({ tipo: "injuria", forma: "consumado" });
  });
});

describe("erro de tipo", () => {
  it("R-ERRO-01: o erro inevitável exclui o dolo e a culpa", () => {
    const a = analisarFato(fato(FURTO_CONSUMADO, { erroDeTipo: "inevitavel" }));
    expect(a).toMatchObject({
      tipico: false,
      tipo: "furto",
      motivoDaAtipicidade: "erro_de_tipo",
      conclusao: "fato_atipico",
    });
    expect(a.regras).toContain("R-ERRO-01");
  });

  it("R-ERRO-02: o erro evitável pune por culpa, se o tipo tiver forma culposa", () => {
    const lesao = analisarFato(fato(LESAO, { erroDeTipo: "evitavel" }));
    expect(lesao).toMatchObject({ tipico: true, tipo: "lesao_corporal", conclusao: "crime" });
    expect(lesao.regras).toEqual(expect.arrayContaining(["R-ERRO-02", "R-CULPA-01"]));
    const furto = analisarFato(fato(FURTO_CONSUMADO, { erroDeTipo: "evitavel" }));
    expect(furto).toMatchObject({ tipico: false, motivoDaAtipicidade: "culpa_sem_previsao" });
    expect(furto.regras).toContain("R-ERRO-02");
  });
});
