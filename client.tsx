// this file will pretty much always look the same
import { createElement } from "https://esm.sh/react";
import { hydrateRoot } from "https://esm.sh/react-dom/client";
import App from "./app.tsx";

//@ts-ignore - this code runs in the browser where `document` is available
hydrateRoot(document, createElement(App));
