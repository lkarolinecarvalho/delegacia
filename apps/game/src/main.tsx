import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/nunito";
import { aplicarProporcaoDoPalco } from "./palco";
import { App } from "./ui/App";
import "./estilos.css";

const palco = document.getElementById("palco");
if (!palco) throw new Error("Elemento #palco não encontrado em index.html");

aplicarProporcaoDoPalco(palco);

createRoot(palco).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
