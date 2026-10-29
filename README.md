# Active Memory

An OpenClaw plugin that runs bounded pre-reply memory retrieval and implements
per-agent Remember across conversations for eligible private conversations,
including the opt-in parallel recall sidecar.

This repository owns the plugin source, extracted from the AgileClaw main
repository. The installed copy lives at `~/.openclaw/extensions/active-memory`;
make code changes here, then build and deploy. Plugin configuration
(`plugins.entries.active-memory`) and persisted state live with the OpenClaw
installation and never enter this repository.

## Development

Use Node.js 24.16+ (below 25) or 26.1+, and pnpm 12.5.1. Keep the existing
OpenClaw checkout at `../AgileClaw`. The development dependency links to that
checkout's public `openclaw/plugin-sdk/*` exports; it does not install or
rebuild OpenClaw. Build OpenClaw separately if its SDK artifacts are missing.

```sh
pnpm install
pnpm build
pnpm test
```

`pnpm typecheck` additionally requires local declarations for the host's
private test facades (`plugin-state-test-runtime`, `sqlite-runtime-testing`).
OpenClaw intentionally publishes these facades as JavaScript-only exports;
generate their declarations from the maintained OpenClaw sources, then run the
full typecheck:

```sh
cd ../AgileClaw
OPENCLAW_BUILD_PRIVATE_QA=1 pnpm build:plugin-sdk:dts
cd ../active-memory
pnpm typecheck
```

The declaration build only writes `.d.ts` files and does not require
restarting the Gateway.

### How the test suite runs

`vitest.config.ts` reuses the linked host's shared Vitest resolve aliases and
setup files verbatim: plugin-sdk surfaces and curated workspace packages load
from the host's maintained sources, exactly as the in-repository shards did
before extraction. Runtime SQLite workers spawn as real Node children through
the host's tsx loader, so `vitest.global-setup.ts` idempotently links the
host's workspace packages into its own `node_modules` — plain Node resolution
inside those children needs the links, and the host repository only creates
them lazily for some packages. The links are additive and untracked.

`index.test.ts` runs under the host's database-workers shard semantics:
isolated forked workers with a 120s per-test timeout.

## Deploy an update

Run the checks above, then install the built output into the live extension
directory (first deployment also needs the host link below):

```sh
plugin_dir="$HOME/.openclaw/extensions/active-memory"
mkdir -p "$plugin_dir/node_modules"
cp -R dist/. "$plugin_dir/dist/"
cp -R assets/. "$plugin_dir/assets/"
cp openclaw.plugin.json package.json "$plugin_dir/"
ln -sfn "$HOME/repos/AgileClaw" "$plugin_dir/node_modules/openclaw"
```

Then use OpenClaw's native plugin reload from the OpenClaw checkout:

```sh
cd ../AgileClaw
pnpm openclaw plugins reload active-memory --wait --json
```

The symlink lets the installed bundle resolve its `openclaw/plugin-sdk/*`
peer imports from the running host checkout, matching how the bundled plugin
resolved them before extraction. Dependency changes need OpenClaw's plugin
installation workflow rather than these output-only copy commands.

## Documentation

`docs/concepts/` holds the user-facing Active Memory guide suite moved from
the AgileClaw repository, and `docs/plugin-reference.md` is the plugin
reference page as last generated there.

## Follow-up proof

Two host-side suites could not move with the source because they exercise the
host's own internals (`src/agents/embedded-agent-runner` turn-context
machinery, `extensions/memory-core`, and the qa-lab harness):

- `test/plugins/parallel-active-memory.integration.test.ts` — the parallel
  recall production-composition suite. Its host-side equivalent must be re-run
  against an installed plugin build (or from the extraction commit
  `chore/extract-active-memory` in the AgileClaw repository) after host
  turn-context changes.
- `test/e2e/qa-lab/runtime/active-memory-trigger-stall.product-proof.e2e.test.ts`
  — the qa-lab trigger-stall product proof, which stays with the host's
  qa-lab scenario inventory.

Both remain recoverable from the AgileClaw repository history at the
extraction commit.

## Verified standalone build

On October 29, 2026, the extracted source passed the standalone esbuild
bundle, the full `tsc --noEmit` typecheck with locally generated private-QA
declarations, and all 368 Vitest tests (52.9s) against the linked OpenClaw
checkout at `2026.9.8` with the parallel-recall turn-context contributions
surface.

## History and recovery

The first commit imports the plugin exactly as it existed in the AgileClaw
repository at `6a32b8a65` on `feat/brand-agileclaw-visible`, then adds the
standalone development scaffolding, mirroring the Agenda plugin's extraction.

To inspect a change, use `git log --oneline` and `git diff`. To restore an
earlier implementation, revert the relevant commit, rerun the checks, and
deploy again.
