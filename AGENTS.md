# AGENTS.md

This repository owns the `active-memory` OpenClaw plugin, extracted from the
AgileClaw main repository. Follow the main repository's working agreement;
this file only records this checkout's local contracts.

- The linked host checkout at `../AgileClaw` provides every
  `openclaw/plugin-sdk/*` surface at runtime through its package exports and
  at test time through its shared Vitest aliases. Never vendor or reimplement
  host SDK surfaces here; when a needed surface is missing, extend the host
  SDK and rebuild it there.
- `pnpm build`, `pnpm test`, and `pnpm typecheck` must pass before deploying.
  `typecheck` needs the host's private-QA declarations; see README for the
  one command that generates them.
- Deploy only built output (`dist/`, `assets/`, `openclaw.plugin.json`,
  `package.json`) to `~/.openclaw/extensions/active-memory` plus the host
  symlink, then reload through `openclaw plugins reload`. Never edit the
  installed copy or copy runtime state back into this repository.
- Plugin behavior changes keep their tests in this repository; product-level
  integration proof that needs the full host harness belongs in the host
  repository's evidence flow.
