// Source-loaded host modules spawn runtime workers as real Node children with
// the tsx loader (see the host's runtime-worker-url.ts). Those children bypass
// Vitest's resolve aliases and need plain Node resolution for the host's
// workspace packages. The host repository links only a few of them into its
// root node_modules (its own builds and Vitest rewrite the remaining imports),
// so this setup idempotently creates the missing links for every workspace
// package its src tree can import. Links are additive and untracked; host
// tooling that resolves through aliases is unaffected.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const hostRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../AgileClaw");
const hostSourceImportedPackages = [
  "acp-core",
  "agent-core",
  "gateway-client",
  "gateway-protocol",
  "llm-core",
  "markdown-core",
  "media-core",
  "media-generation-core",
  "memory-host-sdk",
  "model-catalog-core",
  "net-policy",
  "plugin-package-contract",
  "plugin-sdk",
  "retry",
  "terminal-core",
  "worker-runtime",
];

export default function setup(): void {
  for (const name of hostSourceImportedPackages) {
    const linkPath = path.join(hostRoot, "node_modules", "@openclaw", name);
    if (fs.existsSync(linkPath)) {
      continue;
    }
    const target = path.join(hostRoot, "packages", name);
    if (!fs.existsSync(path.join(target, "package.json"))) {
      throw new Error(`Host workspace package missing for Node link: @openclaw/${name}`);
    }
    fs.mkdirSync(path.dirname(linkPath), { recursive: true });
    fs.symlinkSync(path.relative(path.dirname(linkPath), target), linkPath, "dir");
  }
}
