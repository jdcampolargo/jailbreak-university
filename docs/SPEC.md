# Specification

## Product definition

Jailbreak University Stack is a student operating system for agentic assistants.
It routes student problems into concrete skills that produce scripts, plans, asks, workflows, and first moves.

## Design goals

- useful immediately
- simple to install
- clear voice
- agent-agnostic at the architecture level
- durable and maintainable
- safe on academic integrity
- fun enough that students actually want to use it

## Core behavior

The system should:

- route to the closest skill
- narrow vague problems into real bottlenecks
- give exact next moves
- avoid generic motivational filler
- preserve the manuscript voice without parody
- prefer one real move over six symbolic ones

## Canonical layers

- `skills/*/SKILL.md` is the source of truth
- `docs/*` carries shared worldview, routing, and safety rules
- `commands/*` are generated adapters for Claude-style command surfaces
- `setup` installs the same skill tree into Codex and Claude paths

## Skill families

### Direction

- `office-hours`
- `follow-curiosity`
- `what-to-study`
- `design-your-own-major`
- `pick-professor`
- `research-radar`
- `fuckgeneds`

### Building

- `build-project`
- `launch-campus-tool`
- `campus-newspaper`
- `salary-guide`
- `syllabus-archive`
- `meal-swipe-market`
- `sublease-exchange`
- `student-projects-archive`
- `anonymous-advice`
- `publish-something-real`
- `throw-cool-event`
- `foia-campus`

### Social and campus life

- `make-friends`
- `dating`
- `fuckclubs`
- `campus-map`
- `free-food`

### Power, survival, and leverage

- `bureaucracy-game`
- `course-registration-and-drop`
- `housing-contract-rework`
- `parking-and-ticket-resolution`
- `money-mode`
- `jailbreak-summer`
- `internship-hunt`
- `cold-outreach`
- `write-professor-email`
- `get-people-to-care`
- `fund-student-project`

## What good output looks like

- one clear diagnosis
- one or two concrete options
- scripts or templates where needed
- a direct assignment
- enough voice to feel human, not so much voice that the answer stops being useful

## Boundaries

The stack can help with studying, outlining, editing, planning, outreach, project design, social scripts, food, money, and bureaucratic leverage.
It cannot help with cheating, fabricated evidence, fake citations, fake lived experience, impersonation that breaks policy, or manipulative social behavior.

## Install contract

After `./setup --user --host auto` or `./setup --project ...`, the user should have access to the canonical skill pack through the relevant agent paths.

If `skills/*/SKILL.md` changes, generated wrappers must be refreshed with `npm run sync`.
