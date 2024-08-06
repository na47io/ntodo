/** @jsxImportSource preact */
import { Hono } from "hono";
import { bundle } from "@deno/emit";
import { renderToString } from "preact-render-to-string";
import { App } from "@/app.tsx";
import { createAppState } from "@/model.ts";
import { Todo } from "@/todo.ts";
import { Landing } from "@/components/Landing.tsx";

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

const CLIENT_BUNDLE_FNAME = "client.tsx";

const importMap = Deno.readTextFileSync(
  new URL("../import_map.json", import.meta.url),
);

const app = new Hono({});

const kv = await Deno.openKv();

app
  .get(
    "/",
    (_c) => {
      const html = `
    <!DOCTYPE html>
    
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo App</title>
    </head>

    <body>
        <div id="root">${renderToString(<Landing />)}</div>
    </body>
    `;
      return new Response(html, { headers: { "content-type": "text/html" } });
    },
  )
  .get("/createProject", (c) => {
    const projectIdRaw = new URL(c.req.url).searchParams.get("projectId");
    if (!projectIdRaw) {
      return new Response("projectId is required", { status: 400 });
    }

    const projectId = projectIdRaw.trim().replace(/\s+/g, "-").toLowerCase();
    return new Response(null, {
      status: 302,
      headers: { location: `/projects/${projectId}` },
    });
  })
  .get(
    "/projects/:projectId",
    async (c) => {
      const projectIdRaw = c.req.param("projectId");
      const projectId = projectIdRaw.trim().replace(/\s+/g, "-").toLowerCase();
      const result = await kv.get(["project", projectId]);
      const todos = result.value as Todo[];

      // appState has signals and stuff, initialState is a DTO
      const initialState = { projectId, initialTodos: todos ?? INITIAL_TODOS };
      const appState = createAppState(initialState);

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
        window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script type="module" src="../${CLIENT_BUNDLE_FNAME}"></script>
    </head>

    <body>
        <div id="root">${renderToString(<App initialState={appState} />)}</div>
    </body>
    `;
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
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
  })
  .post("api/todos", async (c) => {
    const { todos, projectId } = await c.req.json();
    const { ok } = await kv.set(["project", projectId], todos);
    if (!ok) {
      return new Response("error", { status: 500 });
    }
    return new Response("ok");
  });

Deno.serve({ port: 8080 }, app.fetch);
