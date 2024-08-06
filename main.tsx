/** @jsxImportSource https://esm.sh/preact */
import { Hono } from "hono";
import { bundle } from "@deno/emit";
import { renderToString } from "https://esm.sh/preact-render-to-string@6.5.7";
import App from "./app.tsx";

const CLIENT_BUNDLE_FNAME = "client.tsx";

const importMap = Deno.readTextFileSync(
  new URL("./import_map.json", import.meta.url),
);

console.log(importMap);

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
        <script type="module" src="${CLIENT_BUNDLE_FNAME}"></script>
    </head>

    <body>
        <div id="root">${renderToString(<App />)}</div>
    </body>
    `;

const app = new Hono({});

app
  .get(
    "/",
    (_c) => new Response(html, { headers: { "content-type": "text/html" } }),
  )
  .get(CLIENT_BUNDLE_FNAME, async (_c) => {
    // when browser comes back for the client javascript
    // bundle it and send back
    const { code } = await bundle(
      new URL(CLIENT_BUNDLE_FNAME, import.meta.url),
      {
        minify: true,
        importMap: JSON.parse(importMap),
        compilerOptions: {
          "jsx": "react-jsx",
          "jsxImportSource": "preact",
        },
      },
    );
    return new Response(code, {
      headers: { "content-type": "application/javascript" },
    });
  });

Deno.serve({ port: 8080 }, app.fetch);
