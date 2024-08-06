/** @jsxImportSource preact */
import { hydrate } from "preact";
import { App } from "@/app.tsx";
import { createAppState } from "@/model.ts";

//@ts-ignore - this code runs in the browser where `globalThis` is window
const initialState = createAppState(globalThis.__INITIAL_STATE__ as Todo[]);

//@ts-ignore - this code runs in the browser where `document` is available
hydrate(<App initialState={initialState} />, document.getElementById("root"));
