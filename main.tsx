/** @jsxImportSource https://esm.sh/preact */
import { Hono } from "https://esm.sh/hono";
import { bundle } from "jsr:@deno/emit";
import { render } from "https://esm.sh/preact-render-to-string";
import App from "./app.tsx";

const CLIENT_BUNDLE_FNAME = "client.tsx";

const app = new Hono({});

app
  .get("/", (_c) => {
    // makes a nice Readable Web Stream https://react.dev/reference/react-dom/server/renderToReadableStream
    const app = render(<App />);
    const html = `
    <!DOCTYPE html>
    
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo App</title>
        <script type="module" src="${CLIENT_BUNDLE_FNAME}"></script>
    </head>

    <body>
        <div id="root">${app}</div>
    </body>
    `;
    return new Response(html, { headers: { "content-type": "text/html" } });
  })
  .get(CLIENT_BUNDLE_FNAME, async (_c) => {
    // when browser comes back for the client javascript
    // bundle it and send back
    const { code } = await bundle(
      new URL(CLIENT_BUNDLE_FNAME, import.meta.url),
      {
        minify: true,
      },
    );
    return new Response(code, {
      headers: { "content-type": "application/javascript" },
    });
  });

Deno.serve({ port: 8080 }, app.fetch);
