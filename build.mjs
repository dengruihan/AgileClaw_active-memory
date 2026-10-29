import { fileURLToPath } from "node:url";
import { build } from "esbuild";

await build({
  absWorkingDir: fileURLToPath(new URL("./", import.meta.url)),
  entryPoints: ["index.ts"],
  outdir: "dist",
  bundle: true,
  external: ["openclaw/plugin-sdk/*"],
  platform: "node",
  format: "esm",
  target: "node24",
  sourcemap: true,
});
