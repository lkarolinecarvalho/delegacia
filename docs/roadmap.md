# Roadmap

Trabalhe **um marco por vez**. Um marco só termina quando os critérios de aceite passam
e os testes e o typecheck estão verdes. Não há "MVP": o jogo é a campanha inteira
([campanha.md](campanha.md)), entregue em fatias jogáveis (ADR-0007).

## Fatia 1 — Parte I, capítulos 1 a 5 (primeira versão jogável)

**Estado:** M0 a M5 entregues na primeira versão, aguardando validação de jogo e
revisão jurídica. Ainda sem persistência: recarregar a página recomeça.

- **M0 — Fundação.** Monorepo pnpm, TypeScript strict, Vitest, Biome, CI, docs e ADRs.
- **M1 — Motor penal.** Tipos penais básicos, análise do fato (teoria do crime),
  comparação da ficha, índice das regras.
  *Aceite:* um teste por regra implementada; casos de borda; invariantes.
- **M2 — Conteúdo.** Schemas zod, 16 missões, aulas, conceitos e afirmativas (≥ 3 por
  conceito). *Aceite:* todo o conteúdo valida; a tabela dourada bate com o motor.
- **M3 — Casca do app.** Palco em retrato, HUD, delegacia em corte, painéis.
- **M4 — Loop do caso.** Aula → conversa → fato → ficha → afirmativas → desfecho.
  *Aceite:* os capítulos 1 a 5 jogáveis de ponta a ponta.
- **M5 — Estudo.** Repetição espaçada, Biblioteca (Teoria, Código, Revisão), Progresso,
  modo banca.

## Fatia 2 — Fase policial (capítulos 6 a 10)

- Motor: ação penal, representação, decadência, menor potencial ofensivo e TCO,
  flagrante, fiança, prazos do inquérito.
- Calendário com prazos correndo; carceragem funcional; quadro de inquéritos.
- **Prévia do erro:** a consequência jurídica da decisão errada (prisão relaxada,
  nulidade, inquérito trancado).

## Fatia 3 — As rondas (Parte Especial)

- Catálogo do Código por título; busca livre do tipo penal; qualificadoras, privilégios
  e causas de aumento no motor.
- Plantão livre com casos sorteados.

## Fatia 4 — As operações (leis especiais)

## Fatia 5 — O Fórum

- Penas, dosimetria trifásica, regime, substituição, sursis, prescrição.

## Por último

- Validação jurídica completa (remover os ⚠️), arte final, som, persistência
  (IndexedDB com versão de schema) e empacotamento com Capacitor.
