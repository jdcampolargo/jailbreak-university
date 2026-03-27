# Architecture

## Goal

Keep one source of truth and make every adapter thin.

## Canonical source

`skills/*/SKILL.md` is the canonical product surface.

Every skill should be:

- human-readable
- human-editable
- compact
- scoped
- reusable across agents

## Generated adapters

These files are generated from the canonical skills:

- `commands/*.md`
- `docs/COMMAND_INDEX.md`

The generator lives at [scripts/sync_agents.mjs](../scripts/sync_agents.mjs).

## Why no repo-level `.agents` mirror

Manual mirrors drift.

Instead, the repo keeps one canonical `skills/` tree. The installer exposes that same tree where different agents expect it:

- Claude user install: `~/.claude/skills/jailbreak-university`
- Codex user install: `~/.codex/skills/jailbreak-university`
- Project-local Codex install: `.agents/skills/jailbreak-university`

That means:

- one place to edit
- no duplicated prompt bodies
- no mirror cleanup every time a skill changes

## Shared docs

These keep prompt bodies smaller and reduce drift:

- [VOICE.md](VOICE.md)
- [ROUTING.md](ROUTING.md)
- [SAFETY.md](SAFETY.md)
- [PROMO.md](PROMO.md)
- [SPEC.md](SPEC.md)

## Validation

[validate_repo.mjs](../scripts/validate_repo.mjs) checks:

- required docs exist
- each skill has the required metadata and shared-doc references
- relative Markdown links resolve
- generated files are in sync with canonical skills
- `setup` parses and smoke-installs into temp Claude/Codex locations

## Maintainer workflow

```bash
npm run sync
npm run validate
```
