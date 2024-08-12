import { Hono } from "hono";
import { renderToString } from "preact-render-to-string";
import { App } from "@/app.tsx";
import { createAppState, Todos } from "@/model.ts";
import { Todo } from "@/todo.ts";
import { CreateNewForm, Landing } from "@/components/Landing.tsx";
import { bundleClientForBrowser } from "@/bundle.ts";

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

const CLIENT_BUNDLE_FNAME = "/dist/bundle.js";

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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        >
    </head>

    <body>
      <main class="container">
        <div id="root">${renderToString(<Landing />)}</div>
      </main>
    </body>
    `;
      return new Response(html, { headers: { "content-type": "text/html" } });
    },
  )
  .get("/new", (_c) => {
    const html = `
    <!DOCTYPE html>
    
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo App</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        >
    </head>

    <body>
      <main class="container">
        <div id="root">${renderToString(<CreateNewForm />)}</div>
      </main>
    </body>
    `;
    return new Response(html, { headers: { "content-type": "text/html" } });
  })
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
      const todos = result.value as Todos;

      // appState has signals and stuff, initialState is a DTO
      const initialState = {
        projectId,
        initialTodos: {
          todos: todos.todos || INITIAL_TODOS,
          version: todos.version,
        },
      };
      const appState = createAppState(initialState);

      const html = `
    <!DOCTYPE html>
    
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo App</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        >
        <script type="importmap">
        ${importMap}
        </script>
        <script>
        window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script type="module" src="${CLIENT_BUNDLE_FNAME}" async=""></script>
    </head>

    <body>
      <main class="container">
        <div id="root">${renderToString(<App initialState={appState} />)}</div>
      </main>
    </body>
    </html>
    `;
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    },
  )
  .get(CLIENT_BUNDLE_FNAME, async (_c) => {
    // if we are not in Deno Deploy, bundle the client code
    if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
      console.log("Bundling client code...");
      await bundleClientForBrowser();
    }

    const bundle = await Deno.readTextFile("." + CLIENT_BUNDLE_FNAME);

    return new Response(bundle, {
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
