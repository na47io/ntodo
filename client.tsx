/** @jsxImportSource preact */
import { hydrate } from "preact";
import App from "./app.tsx";

//@ts-ignore - this code runs in the browser where `document` is available
hydrate(<App />, document.getElementById("root"));
