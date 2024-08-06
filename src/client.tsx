import { hydrate } from "preact";
import { App } from "@/app.tsx";
import { createAppState, InitialState } from "@/model.ts";

const initialState = createAppState(
    //@ts-ignore - this code runs in the browser where `globalThis` is window
    globalThis.__INITIAL_STATE__ as InitialState,
);

//@ts-ignore - this code runs in the browser where `document` is available
hydrate(<App initialState={initialState} />, document.getElementById("root"));
