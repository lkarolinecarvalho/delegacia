import type { ReactNode } from "react";

/** Ícones da interface, desenhados em código (sem arquivos de terceiros). */
function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      className="icone"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconePasta = () => (
  <Icone>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Icone>
);

export const IconeLivro = () => (
  <Icone>
    <path d="M12 6c-2-1.3-4.5-1.5-8-1v13c3.500-.5 6-.3 8 1 2-1.300 4.500-1.500 8-1V5c-3.500-.5-6-.3-8 1z" />
    <path d="M12 6v13" />
  </Icone>
);

export const IconeGrafico = () => (
  <Icone>
    <path d="M5 20v-6M12 20V5M19 20v-9" />
  </Icone>
);

export const IconeEngrenagem = () => (
  <Icone>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900l2.100 2.100M17 17l2.100 2.100M4.900 19.100L7 17M17 7l2.100-2.100" />
  </Icone>
);

export const IconeEstrela = () => (
  <svg className="icone icone-estrela" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.500l2.900 6 6.600.900-4.800 4.600 1.200 6.500L12 17.400l-5.900 3.100 1.200-6.500L2.500 9.400l6.600-.900z"
      fill="#f7c63c"
      stroke="#4a3728"
      strokeWidth="1.500"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconeDistintivo = () => (
  <Icone>
    <path d="M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </Icone>
);

export const IconeAlvo = () => (
  <Icone>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </Icone>
);
