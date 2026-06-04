# No user-authored brew journal

**Status:** accepted

## Context & decision

User research surfaced demand for **repeatability and tracking**: "I can't reproduce that great cup," "how do people log their brews?", plus bean inventory and notes. The obvious move is a brew journal.

We are **not** adding **user-authored journaling** — no notes the user writes, no saved/logged brews, no bean inventory, no cross-session history of the user's own cups, no accounts or sync. Homebrew stays a **simulator**; its differentiators are visual play and tell-me-the-one-fix, not record-keeping.

This is deliberately scoped to *user-authored* data. The following are **explicitly allowed** and are not a journal:

- **Featured Recipes** — curated, read-only recipes shipped with the app (e.g. a champion's V60). The user loads them; the user does not create or save them.
- **URL-shareable state** — the current recipe lives in search params so a brew is shareable and refresh-safe. Already in use (see ADR-0002 / the `muted` param).

## Considered options

- **Add user-authored logging/notes**: rejected — the journal apps users complain about (bloated, paywalled, fiddly) compete on record-keeping; we'd fight on their turf, not ours.
- **Full coffee-companion pivot**: rejected — abandons the simulator identity for a crowded market.
- **No persistence at all**: rejected as too strong — URL state and curated content are valuable and carry none of the journal's baggage (accounts, storage, sync).

## Consequences

- Repeatability/tracking pains go unserved here by design; ceded to existing journal apps. The "re-dial per bag is normal" reframe copy softens the sting without storing anything.
- The **Featured Recipe vs user-saved recipe** line is the one to watch: a future "let me save my own recipe" request re-opens this ADR rather than slipping in quietly.
- No accounts/database/sync infrastructure; the app stays client-side with shareable state in the URL.
