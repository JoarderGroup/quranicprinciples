# Quranic Principles

A magazine for Muslim readers — one principle, one incident, one thing you will
not forget. `quranicprinciples.com` · EN / العربية / বাংলা.

## Law of the repo

1. **`DESIGN-CONTRACT.md` is frozen.** Every agent and human reads it before
   writing a line. Colours and type live in `app/tokens.css` — no hex anywhere else.
2. **The text of an āyah is never authored here.** It is fetched from the Quran
   API by reference (`lib/quran.ts`). We may discuss a verse; we never type one.
3. **Arabic inside an LTR run always passes through `<Bidi>`**
   (`components/arabic/Bidi.tsx`), or source lines silently reorder.
4. Card rendering is browser-side. Satori / `@vercel/og` are banned (no RTL).

## Stack

Next.js 15 (App Router, RSC) · Tailwind CSS 4 · next-intl · Motion ·
Lucide · Supabase (client wiring only — schema and queries land in Phase 2).

## Run

```bash
npm install
npm run dev
```

Environment variable names are in `.env.example`. Real values are pasted into
Vercel by a human — never committed.

## Ownership (see vault `_AGENT-PROTOCOL.md`)

| Area | Owner |
|---|---|
| Design contract, tokens, signature pages | Claude + Fable 5 |
| Remaining routes, admin | Antigravity |
| Supabase schema, data layer, card export | Codex |
| AR/BN translations (`messages/*.json`) | Hermes → human review |

Licence: code MIT. Editorial content all rights reserved. Fonts OFL.
