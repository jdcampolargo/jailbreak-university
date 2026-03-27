# Contributing

## Philosophy

This repo is not a prompt dump.

Treat it like a maintained skill pack with:

- one canonical skill tree
- thin generated adapters
- shared docs for tone, routing, safety, and promo
- validation that catches drift

## Edit order

1. edit `skills/*/SKILL.md` and shared docs in `docs/`
2. run `npm run sync`
3. run `npm run validate`
4. review copy for voice drift and accidental bureaucracy

## Rules

- keep skills scoped
- keep outputs concrete
- give real scripts when useful
- avoid repeating global rules in every skill unless a reminder materially helps
- prefer maintainable Markdown over clever indirection
- if a new skill is not clearly better than routing through an existing one, do not add it

## Source material

Use the worldview in [docs/SPEC.md](docs/SPEC.md) and the tone rules in [docs/VOICE.md](docs/VOICE.md).

## Generated files

Do not hand-edit:

- `commands/*.md`
- `docs/COMMAND_INDEX.md`

They are produced by [scripts/sync_agents.mjs](scripts/sync_agents.mjs).
