# Jailbreak University

Jailbreak University is a reusable skill pack for Claude Code, Codex, and other agents that can read `SKILL.md` files.

You install it into your agent so it stops giving generic college advice and starts giving sharp, practical help with things students actually care about: what to study, what to build, how to get research or internships, how to deal with bureaucracy, how to make friends, how to write better emails, and how to use college like infrastructure instead of a script.

Most college advice trains compliance.

This repo is for students who want more agency, better work, better people, and a college experience that feels like their life instead of someone else's plan.

It is based on [*The Jailbroken Guide to the University*](https://www.juandavidcampolargo.com/jailbroken).

## Why use this

Because the normal college script is thin:

- pick the safe major
- chase prestige
- collect credentials
- hope meaning appears later

That script makes people legible.
It does not always make them alive.

This stack is for a different way of using college:

- use the university without letting the university use you
- build proof instead of just collecting positions
- navigate bureaucracy intelligently
- follow curiosity harder than prestige theater

## Main philosophy

- college is infrastructure, not destiny
- projects are a real classroom
- interesting people matter more than official prestige
- bureaucracy is a game played by humans
- friendship compounds
- if the thing should exist, build it
- if you want to understand the system, ask for the files

## Who this is for

This is for:

- students who feel the default script closing in
- students who want projects, leverage, friendships, and real work
- students stuck in admin loops, bad classes, drift, or recruiting theater
- builders who want agents that help students move, not just reflect forever


## Quick start

Requirements:

- Git
- Bash
- macOS or Linux
- Windows via WSL or Git Bash

### Install

Use GitHub's `Code` button to copy this repo's clone URL, then run:

```bash
git clone https://github.com/jdcampolargo/jailbreak-university.git ~/jailbreak-university
cd ~/jailbreak-university
./setup --user --host auto
```

### Then do this

1. Open your agent.
2. Run `office-hours`.
3. Paste one real problem or question
4. Follow the next move it gives you.
5. Create projects, follow your curiosity, and become fully alive!

In Claude Code the command is `/office-hours`.
In most other hosts it is `office-hours`.

## Start here

| Skill | Use it when |
| --- | --- |
| `office-hours` | your situation is messy and you need the real bottleneck named |
| `jailbroken` | you are trapped in prestige scripts, borrowed goals, or obedience loops |
| `make-me-alive` | your life is working on paper but feels dead in practice |
| `build-project` | you want to build something real but the idea is still mushy |
| `bureaucracy-game` | you need to win a fight with an office, form, petition, or fake rule wall |
| `internship-hunt` | you want useful work, not just a prettier logo on your resume |
| `what-to-study` | you are trying to choose classes, fields, or a direction that is actually yours |
| `make-friends` | you want real people around you, not more weak ties and dead social drift |

Full skill index: [docs/COMMAND_INDEX.md](docs/COMMAND_INDEX.md)  
Examples: [docs/EXAMPLES.md](docs/EXAMPLES.md)

## What a good run looks like

```text
You:    office-hours
You:    I want to get the most out of college.

Agent:  Which is the real problem right now: direction, people, money, admin,
        classes, or a project?

You:    Direction. I'm doing some stuff, but none of it feels like mine.

Agent:  Good. Which is more true: you already know what you want and are scared
        to commit, or you genuinely do not know yet?

You:    I kind of know. I'm just scared to commit.

Agent:  Then this is not an information problem. It is a courage problem.
        Stop treating it like course planning.

        Best next move: pick one live curiosity and give it a 7-day public test.
        Route next: follow-curiosity
        Do this now: write down the one thing you keep thinking about when nobody
        is grading you, then design one small public experiment around it tonight.
```

That is the standard.
The skill should narrow the board fast, make you do most of the talking, then give you one move that changes something real.

## What this repo helps with

Projects and momentum:

- `build-project`
- `launch-campus-tool`
- `publish-something-real`
- `get-people-to-care`
- `fund-student-project`

Direction and academic strategy:

- `office-hours`
- `jailbroken`
- `make-me-alive`
- `follow-curiosity`
- `what-to-study`
- `design-your-own-major`
- `reading-list`

Research, internships, and outreach:

- `research-radar`
- `internship-hunt`
- `cold-outreach`
- `write-professor-email`
- `pick-professor`

Bureaucracy and systems:

- `bureaucracy-game`
- `foia-campus`
- `course-registration-and-drop`
- `housing-contract-rework`
- `parking-and-ticket-resolution`
- `academic-record-repair`
- `intl-student-systems`
- `free-food`
- `money-mode`

People and social life:

- `make-friends`
- `dating`
- `meet-interesting-people`
- `campus-map`
- `fuckclubs`
- `throw-cool-event`

## Install details

### Default install

```bash
./setup --user --host auto
```

Use this if you want the skills available on your machine.

### Project install

```bash
./setup --project /absolute/path/to/your/repo --host auto
```

Use this if you want project-local entry points inside another repo.

### Optional telemetry

Local only:

```bash
./setup --user --host auto --telemetry enabled
```

Local plus hosted sync:

```bash
./setup --user --host auto --telemetry enabled --telemetry-remote enabled
```

Telemetry is opt-in.
Default is off.

### What `setup` changes

- creates symlinks for installed skills and command wrappers
- installs the `jbu-telemetry` CLI
- does not enable telemetry unless you opt in
- does not send prompts, repo names, branch names, file paths, or user content

More detail:

- [INSTALL.md](INSTALL.md)
- [docs/TELEMETRY.md](docs/TELEMETRY.md)

## Host compatibility

| Host | Invocation | Install mode | Notes |
| --- | --- | --- | --- |
| Claude Code | `/office-hours` | `./setup --user --host claude` or `auto` | Generated slash-command wrappers |
| Codex | `office-hours` | `./setup --user --host codex` or `auto` | Canonical skills installed for Codex |
| Other `SKILL.md`-compatible hosts | host-specific | use canonical `skills/` tree | Use the canonical skills directly if no wrapper layer exists |

## Why this repo exists

A lot of students are smart, ambitious, and completely trapped in dead scripts.
They do what sounds good, what looks legible, what gets approval, what keeps options open.
Then four years disappear.

This repo exists because college can be used in a much more alive way.
As a laboratory for curiosity.
As a place to build things.
As a place to meet people who change your life.
As a system full of resources, leverage, rooms, data, offices, and weird opportunities that most students never touch.

This is not a replacement for thinking.
It is a way to make your tools think better with you.

## Safety and integrity

This repo helps with:

- understanding material
- planning projects
- editing honest drafts
- finding mentors and opportunities
- navigating bureaucracy with truth and evidence
- building proof, relationships, and momentum

## Troubleshooting

Skill not showing up?

```bash
./setup --user --host auto
```

Generated wrappers stale?

```bash
npm run sync
npm run validate
```

Want to inspect the actual source of truth?

- canonical skills: [`skills/`](skills)
- generated wrappers: [`commands/`](commands)
- routing guide: [docs/ROUTING.md](docs/ROUTING.md)

Telemetry issue?

```bash
jbu-telemetry status
jbu-telemetry sync
```

## Docs

| Doc | Why it matters |
| --- | --- |
| [docs/COMMAND_INDEX.md](docs/COMMAND_INDEX.md) | full command list |
| [docs/EXAMPLES.md](docs/EXAMPLES.md) | example prompts and situations |
| [docs/VOICE.md](docs/VOICE.md) | product voice and interaction rules |
| [docs/ROUTING.md](docs/ROUTING.md) | how skills route into each other |
| [docs/SAFETY.md](docs/SAFETY.md) | integrity boundaries |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | repo structure and source of truth |
| [docs/TELEMETRY.md](docs/TELEMETRY.md) | local and hosted telemetry details |

## Maintainers

The canonical source of truth is [`skills/`](skills).
Generated wrappers live in [`commands/`](commands).

After changing skills or shared docs:

```bash
npm run sync
npm run validate
```

## License

MIT.
Use the university as a tool. Go jailbreak yourself.
