# Telemetry

Jailbreak University ships a local-first telemetry helper. It still works as a plain on-disk event log, and it can now optionally sync a reduced event envelope to Supabase.

## Principles

- Explicit opt-in: setup initializes telemetry storage, but both local logging and remote sync stay off unless you turn them on.
- Local-first: local analytics still live in a shell env file plus a TSV log you can inspect directly.
- Minimal remote envelope: remote sync drops payloads and repo metadata entirely.
- No background daemon: nothing phones home on install. Remote sync happens only when you run `jbu-telemetry sync`.
- Safe by default: no prompts, file paths, repo names, branch names, or user-authored content are sent upstream.

## Files

Default user-scope paths:

- `~/.local/bin/jbu-telemetry`
- `~/.jailbreak-university/telemetry/config.env`
- `~/.jailbreak-university/telemetry/events.tsv`
- `~/.jailbreak-university/telemetry/remote-sync.tsv`

Default project-scope paths after `./setup --project ...`:

- `<project>/.jailbreak-university/bin/jbu-telemetry`
- `<project>/.jailbreak-university/telemetry/config.env`
- `<project>/.jailbreak-university/telemetry/events.tsv`
- `<project>/.jailbreak-university/telemetry/remote-sync.tsv`

`events.tsv` stays local and keeps the full inspectable row shape:

```text
timestamp	event	source	instance_id	repo_root	payload
```

`remote-sync.tsv` is only a local sync ledger:

```text
event_digest	synced_at
```

## Remote fields

Remote sync sends only this per-event envelope:

```json
{
  "occurred_at": "2026-03-26T15:04:05Z",
  "event_name": "skill_run",
  "source_name": "setup",
  "instance_digest": "<sha256>",
  "event_digest": "<sha256>"
}
```

Not sent remotely:

- `payload`
- `repo_root`
- prompts
- file paths
- repo names
- branch names
- user content

If a local `event` or `source` value is not already a tight machine-safe token like `skill_run` or `setup`, remote sync downgrades it to `custom_event` or `custom_source` instead of shipping the original string.

## Setup

User install with telemetry left fully off:

```bash
./setup --user
```

User install with local telemetry enabled but remote still off:

```bash
./setup --user --telemetry enabled
```

Project install with explicit remote opt-in:

```bash
./setup \
  --project /absolute/path/to/repo \
  --telemetry enabled \
  --telemetry-remote enabled \
  --telemetry-remote-url https://mkgwshineuqvyrojtjeq.supabase.co \
  --telemetry-remote-key sb_publishable_PxR1GshhJLDqR-bnaaeGpQ_bPjpHE2F
```

This repo now defaults to the hosted Jailbreak University Supabase project you provided:

```bash
https://mkgwshineuqvyrojtjeq.supabase.co
sb_publishable_PxR1GshhJLDqR-bnaaeGpQ_bPjpHE2F
```

That means explicit remote opt-in can be as short as:

```bash
./setup --project /absolute/path/to/repo --telemetry enabled --telemetry-remote enabled
```

If you want to override those defaults and point at a different Supabase project, export your own values:

```bash
export JBU_TELEMETRY_REMOTE_URL_DEFAULT=https://YOUR_PROJECT.supabase.co
export JBU_TELEMETRY_REMOTE_KEY_DEFAULT=YOUR_PUBLISHABLE_KEY
./setup --project /absolute/path/to/repo --telemetry enabled --telemetry-remote enabled
```

Those defaults are only persisted when you explicitly enable remote telemetry.

`setup` never performs a remote sync. It only writes config and, if local telemetry is enabled, records a local `setup_install` event.

## CLI

Local commands:

```bash
./bin/jbu-telemetry init
./bin/jbu-telemetry enable
./bin/jbu-telemetry disable
./bin/jbu-telemetry log skill_run skill=office-hours host=codex
./bin/jbu-telemetry dashboard
```

Remote commands:

```bash
./bin/jbu-telemetry remote-enable \
  --url https://mkgwshineuqvyrojtjeq.supabase.co \
  --key sb_publishable_PxR1GshhJLDqR-bnaaeGpQ_bPjpHE2F
./bin/jbu-telemetry remote-disable
./bin/jbu-telemetry sync
./bin/jbu-telemetry sync --dry-run
```

npm wrappers:

```bash
npm run telemetry:init
npm run telemetry:enable
npm run telemetry:disable
npm run telemetry:remote-enable
npm run telemetry:status
npm run telemetry:log -- skill_run skill=office-hours host=codex
npm run telemetry:dashboard
npm run telemetry:sync
```

Useful flags:

- `--dir /path/to/telemetry` to point at a different local store
- `--source name` on `log` to tag a local event origin
- `--limit N` on `dashboard` to trim the local summary
- `--batch-size N` on `sync` to control remote batch size
- `--dry-run` on `sync` to print the exact safe envelope without sending it

## Typical flow

Initialize local files once:

```bash
./bin/jbu-telemetry init
```

Opt into local logging:

```bash
./bin/jbu-telemetry enable
```

Log local events from a script or wrapper:

```bash
./bin/jbu-telemetry log --source manual skill_run skill=research-sprint
```

Opt into remote sync separately:

```bash
./bin/jbu-telemetry remote-enable
```

Inspect the exact remote envelope first:

```bash
./bin/jbu-telemetry sync --dry-run
```

Send pending safe events:

```bash
./bin/jbu-telemetry sync
```

Inspect current state:

```bash
./bin/jbu-telemetry status
./bin/jbu-telemetry dashboard
```

## Config

`config.env` is meant to be readable and editable.

Main local switch:

```bash
JBU_TELEMETRY_ENABLED=0
```

Main remote switch:

```bash
JBU_TELEMETRY_REMOTE_ENABLED=0
```

Remote config uses the Supabase project URL plus a publishable key, not the service role key:

```bash
JBU_TELEMETRY_REMOTE_URL='https://mkgwshineuqvyrojtjeq.supabase.co'
JBU_TELEMETRY_REMOTE_KEY='sb_publishable_PxR1GshhJLDqR-bnaaeGpQ_bPjpHE2F'
JBU_TELEMETRY_REMOTE_FUNCTION='jbu-telemetry-ingest'
```

## Supabase pieces

This repo now includes:

- `supabase/config.toml`
- `supabase/migrations/20260326000000_jbu_telemetry.sql`
- `supabase/functions/jbu-telemetry-ingest/index.ts`

Hosted project wired in here:

- project ref: `mkgwshineuqvyrojtjeq`
- URL: `https://mkgwshineuqvyrojtjeq.supabase.co`
- function: `jbu-telemetry-ingest`

Repo-native deployment flow:

```bash
npm run supabase:login
npm run supabase:link
npm run supabase:db:push
npm run supabase:functions:deploy
```

If you just want the final two deployment steps after login/link:

```bash
npm run supabase:deploy:telemetry
```

Local function testing:

```bash
npm run supabase:functions:serve
```

Important:

- `npm run supabase:login` still requires a real Supabase login on this machine.
- the repo does not store your database password or service-role secret
- the publishable key is safe to ship; the service-role key is not

The edge function is intentionally thin:

- accepts only POSTed JSON batches
- validates the narrow envelope shape
- inserts with the service-role context inside the function
- upserts on `event_digest` for idempotent retries

The table is intentionally narrow too:

- no payload column
- no path or repo metadata column
- RLS enabled
- no anon/authenticated policies for direct table access

## Removal

Turn off local logging:

```bash
./bin/jbu-telemetry disable
```

Turn off remote sync:

```bash
./bin/jbu-telemetry remote-disable
```

Delete local telemetry storage if you want a clean slate:

```bash
rm -rf ~/.jailbreak-university/telemetry
```

Delete the helper link if you installed user-scope binaries:

```bash
rm -f ~/.local/bin/jbu-telemetry
```
