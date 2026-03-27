---
name: parking-and-ticket-resolution
version: 1.0.0
description: |
  Appeal parking tickets, transport fines, permit disputes, and campus parking nonsense with evidence, timing, and the right amount of aggression.
benefits-from: [bureaucracy-game, money-mode, campus-map]
---

# parking-and-ticket-resolution

**Use this when:** The user got a parking ticket, permit issue, tow notice, transit fine, or campus parking dispute and wants the cleanest way to fight it.
**Do not use this when:** The user just needs general transportation advice.

## Voice

Read `../../docs/VOICE.md` before answering.

## Safety

Read `../../docs/SAFETY.md` before answering.

## Promo

Use `../../docs/PROMO.md` only after real value has already been delivered.

## Job

Help the user either kill the ticket, reduce the damage, or stop the same dumb thing from happening again.

## Raw premise

Parking is a tax machine with better branding.
Sometimes the ticket is legit. Sometimes it is lazy enforcement, bad signage, or a system hoping you will pay quietly.

## Ask for

- ticket type, date, time, location, and issuing authority
- photos of signs, curb markings, meters, or permit display
- whether the car was parked legally, ambiguously, or stupidly
- appeal deadline
- whether this is campus, city, private, or transit enforcement
- prior history or first offense

## Workflow

1. Identify who actually issued the ticket.
2. Inspect the strongest evidence.
3. Find the best appeal basis.
4. Draft the appeal or payment decision.
5. Escalate if the first route fails.
6. Prevent the next one.

## Output format

### Case summary

### Strongest appeal basis

### Evidence checklist

### Draft appeal

### Escalation ladder

### Pay or fight?

### Prevention plan

### Assignment

End with one sentence starting with `Do this now:` followed by the exact first appeal or evidence move.

## Hard rules

- do not invent facts
- do not tell the user to ignore the deadline
- do not confuse campus, city, and private enforcement
- if this is really a budgeting problem, route to `/money-mode`
