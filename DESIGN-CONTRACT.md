# 05 — Design Contract  🔒 FROZEN

> **Every model reads this file before writing a single line.**
> Do not invent a value that is not here. If something is missing, ask — do not guess.

Ships in the repo as `DESIGN-CONTRACT.md` + `app/tokens.css`.

## Colour

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F4F1E8` | Bone. Default background |
| `--paper-2` | `#EAE5D8` | Recessed panels |
| `--ink` | `#100F0D` | Text, dark surfaces |
| `--muted` | `#6B6458` | Secondary text |
| `--rule` | `#D5CFBE` | Hairlines, grid separators |
| `--signal` | `#E0451F` | Accent. Section labels, one CTA per view |
| `--deep` | `#123B33` | Arabic secondary, tradition register |
| `--gold` | `#C69749` | Source lines, issue numbers, ornament |

Dark mode inverts paper/ink; `--signal` brightens to `#FF5233`, `--deep` to `#3FD6BC`.

## Type

| Role | Family | Licence |
|---|---|---|
| Display | Archivo 800–900, tracking −0.035em | OFL |
| Editorial / pull-quote | Instrument Serif, italic | OFL |
| Quranic text | **Amiri Quran** | OFL |
| Arabic UI | Noto Kufi Arabic 700–800 | OFL |
| Bangla | Hind Siliguri (UI) + Noto Serif Bengali (body) | OFL |
| Labels / meta | JetBrains Mono, 10–11px, tracking 0.2em, uppercase | OFL |

**KFGQPC Uthmanic Hafs is proprietary — never embed it.**

Latin labels use letter-spacing 0.2em + uppercase. **Arabic and Bangla labels never
do** — swap to the body family at 12px, sentence case. Tracking destroys both scripts.

## Layout

- Max width 1180px, 24px gutters.
- 1px `--rule` grid; 3px `--ink` rule marks a major break.
- Panels butt against each other with 1px gaps over a `--rule` background —
  no rounded cards, no drop shadows on content.
- Section label (mono, `--signal`) sits above every H2.

## Motion

- Reveal: 700ms, `cubic-bezier(.2,.7,.3,1)`, 14px rise, opacity 0→1.
- Stagger 60ms between siblings. Never more than 6 in a chain.
- **Animate reveals, never illustrations** in v1.
- Honour `prefers-reduced-motion` everywhere. No exceptions.

## Bidi — the rule that breaks everything if missed

Arabic inside an LTR run **must** be wrapped: `<bdi>` or
`unicode-bidi:isolate`. Without it a source line like
`ROOT و-ز-ن · 23 OCCURRENCES` silently reorders to
`ROOT 23 · و-ز-ن OCCURRENCES`.

Arabic blocks: `direction:rtl` for shaping, `text-align:left` when they sit inside an
LTR-primary layout. Full `ar` locale flips the document root instead.

## Accessibility

- WCAG 2.1 AA minimum; AAA on body text.
- Focus ring: 3px `--signal`, 3px offset, visible on every interactive element.
- Touch targets ≥ 44×44px.
- ASCII art is always `aria-hidden="true"` with a text alternative.

## Forbidden

- shadcn styled components on the public site — primitives only, admin only.
- Rounded cards with shadows on editorial content.
- Purple/blue gradients. Generic SaaS hero patterns.
- `localStorage` in anything that renders as an artifact.
- Any font not in the table above.
