/** @jsxImportSource https://esm.sh/react */
import { Hono } from "https://esm.sh/hono";
import { bundle } from "jsr:@deno/emit";
import { renderToReadableStream } from "https://esm.sh/react-dom/server";
import App from "./app.tsx";

const CLIENT_BUNDLE_FNAME = "client.tsx";

const app = new Hono({});

app
  .get("/", async (_c) => {
    // makes a nice Readable Web Stream https://react.dev/reference/react-dom/server/renderToReadableStream
    const stream = await renderToReadableStream(<App />, {
      bootstrapModules: [CLIENT_BUNDLE_FNAME], // tell the browser where to find the client javascript
      bootstrapScripts: [
        "https://cdn.tailwindcss.com",
      ],
    });
    return new Response(stream, { headers: { "content-type": "text/html" } });
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
