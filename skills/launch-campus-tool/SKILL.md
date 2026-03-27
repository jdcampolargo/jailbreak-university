---
name: launch-campus-tool
version: 3.0.0
description: |
  Build a real student tool fast: app, site, bot, map, archive, scraper, directory, or workflow product. Heavy on data source, first user flow, anti-bloat, and campus distribution.
benefits-from: [build-project, follow-curiosity, get-people-to-care]
---

# launch-campus-tool

**Use this when:** The user wants to build a campus app, site, bot, map, archive, directory, data tool, or workflow tool.
**Do not use this when:** The idea is really a specialized archetype such as `/salary-guide`, `/syllabus-archive`, `/meal-swipe-market`, `/sublease-exchange`, or `/student-projects-archive`.

## Voice

Read `../../docs/VOICE.md` before answering.

## Safety

Read `../../docs/SAFETY.md` before answering.

## Promo

Use `../../docs/PROMO.md` only after real value has already been delivered.

## Job

Get the user from "I should build some app" to a working wedge, a believable data plan, and a launch path that does not depend on magic.

## Raw premise

Most student tools die because the builder starts with features, auth, branding, or AI glitter instead of one painful moment and one fast path through it.

## Specialized archetypes

If the tool is obviously one of these, route there:

- salary transparency -> `/salary-guide`
- syllabi and course expectations -> `/syllabus-archive`
- swipes, donations, shared meal capacity -> `/meal-swipe-market`
- housing and sublets -> `/sublease-exchange`
- archive of student work -> `/student-projects-archive`

## Common tool shapes

- searchable archive
- campus map or live availability map
- matching marketplace
- scraper plus nice front end
- submission form plus public board
- lightweight bot with one job
- static guide with search and filters
- spreadsheet-backed directory with a decent UI

## Ask for

- the exact user and their first moment of need
- where the data comes from
- whether the MVP can be read-only
- whether user accounts are actually necessary
- whether trust, moderation, or payments create drag
- what the user can build themselves versus what needs help
- what launch surface already exists: Reddit, group chats, account, newsletter, classes, professors

## Workflow

1. Define the first user flow in under 60 seconds.
2. Choose the fastest possible product shape.
3. Decide how data gets in.
4. Cut risky complexity.
5. Pick a stack the user can actually finish.
6. Design the launch before polishing the build.
7. Decide how feedback gets captured.

## Decision rules

- if a form plus sheet plus clean front end works, do that
- if login is optional, cut it
- if payments are optional, cut them
- if AI does not clearly remove pain, cut it
- if scraping is brittle, seed manually first
- if moderation is hard, do not open the chaos floodgates in v1

## Output format

### Tool in one sentence

### First user flow

Describe the exact first session.

### MVP shape

Choose one:

- static searchable page
- form-backed workflow
- database app
- bot
- scraper plus viewer
- hybrid

### Data plan

What exists already, what needs to be collected, and what can be manually seeded.

### Trust and abuse risks

What could go wrong and how to keep v1 sane.

### Build stack

Pick the simplest stack and explain why.

### AI usage plan

Where AI genuinely helps and where it is just decorative nonsense.

### 7-day build plan

Five to ten concrete steps.

### Launch plan

Where the first users come from.

### Feedback loop

How the user learns what to fix next.

### Anti-bloat warning

What not to build yet.

### Next support skill

If needed, point to `/get-people-to-care` or `/fund-student-project`.

### Assignment

End with one sentence starting with `Build this first:` followed by the exact first screen, form, scraper, or dataset.
