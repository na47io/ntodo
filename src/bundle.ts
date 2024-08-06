import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild-plugins-deno";

export async function bundleClientForBrowser(
    entryPoint: string = "./src/client.tsx",
    outfile: string = "./dist/bundle.js",
): Promise<void> {
    try {
        console.log("Bundling client for browser...");
        const result = await esbuild.build({
            entryPoints: [entryPoint],
            bundle: true,
            outfile: outfile,
            format: "esm",
            target: "es2020",
            plugins: [
                ...denoPlugins({
                    loader: "portable",
                    importMapURL: new URL("../import_map.json", import.meta.url)
                        .toString(),
                }),
            ],
            jsx: "automatic",
            jsxFactory: "h",
            jsxFragment: "Fragment",
            jsxImportSource: "preact",
            define: {
                "process.env.NODE_ENV": '"production"',
            },
            minify: true,
            sourcemap: true,
        });

        console.log("Build succeeded:", result);

        esbuild.stop();
    } catch (error) {
        console.error("Build failed:", error);
        Deno.exit(1);
    }
}

// Run the bundling process if this script is executed directly
if (import.meta.main) {
    await bundleClientForBrowser();
}
