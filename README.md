# Homebrew — Coffee Brewing Playground

An interactive, single-screen web app where you tweak brewing variables and a
brewing method and watch how the resulting coffee changes, grounded in published
coffee science. See [`CONTEXT.md`](./CONTEXT.md) for the domain glossary and
[`docs/adr`](./docs/adr) for architecture decisions.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Motion.

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # typecheck (tsc -b) + production build
npm run typecheck  # type-check only
npm run lint       # eslint
npm run preview    # preview the production build
```

## Structure

- `src/lib/coffee/` — deep modules (pure, no UI): Extraction Engine, Taste
  Mapper, Coach, and shared domain types. Placeholders for now; calibrated in
  later slices (see ADR-0001).
- `src/components/ui/` — shadcn/ui components.
- `src/App.tsx` — the playground screen (placeholder shell for now).
