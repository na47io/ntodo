/** @jsxImportSource https://esm.sh/preact */
// this file will pretty much always look the same
import { hydrate } from "https://esm.sh/preact";
import App from "./app.tsx";

//@ts-ignore - this code runs in the browser where `document` is available
hydrate(<App />, document.getElementById("root"));
