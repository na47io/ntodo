/** @jsxImportSource preact */
import { Hono } from "hono";
import { bundle } from "@deno/emit";
import { renderToString } from "preact-render-to-string";
import { App } from "@/app.tsx";
import { createAppState } from "@/model.ts";
import { Todo } from "@/todo.ts";

const CLIENT_BUNDLE_FNAME = "client.tsx";

const importMap = Deno.readTextFileSync(
  new URL("../import_map.json", import.meta.url),
);

const app = new Hono({});

app
  .get(
    "/",
    (_c) => {
      // TODO: get this from the server baby
      const INITIAL_TODOS: Todo[] = [
        {
          id: crypto.randomUUID(),
          text: "Main Task 1",
          completed: false,
          children: [
            {
              id: crypto.randomUUID(),
              text: "Subtask 1.1",
              completed: false,
            },
            {
              id: crypto.randomUUID(),
              text: "Subtask 1.2",
              completed: false,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          text: "Main Task 2",
          completed: false,
          children: [
            {
              id: crypto.randomUUID(),
              text: "Subtask 2.1",
              completed: false,
            },
            {
              id: crypto.randomUUID(),
              text: "Subtask 2.2",
              completed: false,
              children: [
                {
                  id: crypto.randomUUID(),
                  text: "Sub-subtask 2.2.1",
                  completed: false,
                },
              ],
            },
          ],
        },
      ];
      const html = `
    <!DOCTYPE html>
    
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo App</title>
        <script type="importmap">
        ${importMap}
        </script>
        <script>
        window.__INITIAL_STATE__ = ${JSON.stringify(INITIAL_TODOS)};
        </script>
        <script type="module" src="${CLIENT_BUNDLE_FNAME}"></script>
    </head>

    <body>
        <div id="root">${
        renderToString(<App initialState={createAppState(INITIAL_TODOS)} />)
      }</div>
    </body>
    `;
      return new Response(html, { headers: { "content-type": "text/html" } });
    },
  )
  .get(CLIENT_BUNDLE_FNAME, async (_c) => {
    // when browser comes back for the client javascript
    // bundle it and send back
    const { code } = await bundle(
      new URL(CLIENT_BUNDLE_FNAME, import.meta.url),
      {
        minify: true,
        compilerOptions: {
          "jsx": "react-jsx",
          "jsxImportSource": "preact",
        },
        importMap: JSON.parse(importMap),
      },
    );
    return new Response(code, {
      headers: { "content-type": "application/javascript" },
    });
  });

Deno.serve({ port: 8080 }, app.fetch);
