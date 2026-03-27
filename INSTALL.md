# Install

## Requirements

Runtime use needs:

- Bash
- a clone of this repo

Contributor workflows additionally need:

- Node.js 18+

Hosted telemetry maintenance additionally needs:

- Supabase CLI auth on the machine

## User-wide install

Install for both Claude Code and Codex:

```bash
./setup --user --host auto
```

Only Claude Code:

```bash
./setup --user --host claude
```

Only Codex:

```bash
./setup --user --host codex
```

## Project install

Install into another repo for teammates:

```bash
./setup --project /absolute/path/to/repo --host auto
```

This is the mode to use when you want project-local `.claude/` and `.agents/` entry points instead of user-global ones.

## Optional telemetry

Local telemetry only:

```bash
./setup --user --host auto --telemetry enabled
```

Local plus hosted Supabase sync:

```bash
./setup --user --host auto --telemetry enabled --telemetry-remote enabled
```

Remote telemetry is still explicit opt-in.
Default is off.

The hosted Supabase target is already wired in for this repo, so `--telemetry-remote enabled` is enough unless you want to override it.

More detail: [docs/TELEMETRY.md](docs/TELEMETRY.md)

## What setup installs

User scope:

- `~/.claude/commands/*.md`
- `~/.claude/skills/jailbreak-university`
- `~/.codex/skills/jailbreak-university`
- `~/.local/bin/jbu-telemetry`

Project scope:

- `/absolute/path/to/repo/.claude/commands/*.md`
- `/absolute/path/to/repo/.claude/skills/jailbreak-university`
- `/absolute/path/to/repo/.agents/skills/jailbreak-university`
- `/absolute/path/to/repo/.jailbreak-university/bin/jbu-telemetry`

These are symlinks, not copied files.

## Collision behavior

If a target already exists, `setup` moves it aside to a timestamped backup and then writes the new symlink.

## Update

```bash
git pull
npm run sync
npm run validate
./setup --user --host auto
```

If you installed project-local entry points, rerun the matching `./setup --project ...` command there too.

## Uninstall

Remove the symlinks that point back to this repo:

- `~/.claude/skills/jailbreak-university`
- `~/.codex/skills/jailbreak-university`
- `~/.local/bin/jbu-telemetry`
- any `~/.claude/commands/*.md` symlinks created by this repo
- any project-local `.claude/`, `.agents/`, or `.jailbreak-university/` symlinks created by this repo

If you also want telemetry gone, remove the local store:

```bash
rm -rf ~/.jailbreak-university/telemetry
```

## Maintainers

After changing canonical skills or shared docs:

```bash
npm run sync
npm run validate
```

If you are maintaining the hosted telemetry backend:

```bash
npm run supabase:db:push
npm run supabase:functions:deploy
```
