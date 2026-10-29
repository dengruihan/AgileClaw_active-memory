// Standalone Vitest config for the extracted plugin. It reuses the linked
// OpenClaw checkout's shared Vitest resolve aliases verbatim: those aliases are
// the host's own source-loading contract (plugin-sdk facades, curated workspace
// packages, runtime shims) and hand-copying them here would drift. The host
// setup files must keep resolving relative to their location there.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Alias } from "vitest/config";
import { sharedVitestConfig } from "../AgileClaw/test/vitest/vitest.shared.config";

const pluginRoot = path.dirname(fileURLToPath(import.meta.url));
const hostRoot = path.resolve(pluginRoot, "../AgileClaw");
const hostAliases = ((sharedVitestConfig as { resolve?: { alias?: Alias[] } }).resolve ?? {})
  .alias ?? [];

export default defineConfig({
  resolve: {
    alias: hostAliases,
  },
  server: {
    fs: { allow: [pluginRoot, hostRoot] },
  },
  test: {
    root: pluginRoot,
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**"],
    globalSetup: [path.join(pluginRoot, "vitest.global-setup.ts")],
    setupFiles: [
      path.join(hostRoot, "test", "setup-openclaw-runtime.ts"),
      path.join(hostRoot, "test", "setup.extensions.ts"),
    ],
    clearMocks: false,
    unstubEnvs: true,
    unstubGlobals: true,
    // index.test.ts runs the real SQLite worker broker like the host's
    // extension-database-workers shard: isolated forked workers with the host's
    // 120s default timeout (its slowest case takes ~13s wall time).
    pool: "forks",
    isolate: true,
    testTimeout: 120_000,
    hookTimeout: 180_000,
  },
});
