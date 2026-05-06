# Design system

Tokens for Ato's Art. Warm African editorial register. Light theme, single-mode (no dark mode planned). Color in OKLCH; neutrals tinted toward the brand hue. The site has two strategy modes: **Restrained** for product surfaces (cart, checkout, dashboards) and **Committed** for brand surfaces (homepage, artwork detail, artist profile).

## Color

All neutrals are tinted toward hue 35° (warm earth, between terracotta and ochre). Chroma stays low at the extremes so the cream doesn't look yellow and the ink doesn't look brown.

### Surface (light theme)

| Token | OKLCH | Use |
|---|---|---|
| `--bg` | `oklch(0.97 0.012 70)` | Page background. Warm cream, never pure white. |
| `--surface` | `oklch(0.985 0.008 75)` | Cards, sheets, inputs. Slightly lifted from `--bg`. |
| `--muted` | `oklch(0.93 0.014 65)` | Filter chips, secondary buttons, disabled states. |
| `--border` | `oklch(0.88 0.014 65)` | 1px borders. Always tinted, never grey. |
| `--ink` | `oklch(0.20 0.02 35)` | Body text, headlines, icons. Deep warm earth. |
| `--ink-muted` | `oklch(0.45 0.02 35)` | Captions, metadata, helper text. |
| `--ink-soft` | `oklch(0.62 0.018 35)` | Tertiary labels, placeholder text. |

### Accent

| Token | OKLCH | Strategy use |
|---|---|---|
| `--accent` | `oklch(0.55 0.155 35)` | Terracotta. Primary buttons, links, focus rings. |
| `--accent-press` | `oklch(0.48 0.15 32)` | Pressed/active state of accent. |
| `--accent-soft` | `oklch(0.92 0.04 50)` | Tinted backgrounds for badges, success-after-action. |
| `--ochre` | `oklch(0.72 0.13 75)` | Supporting accent. Used sparingly: highlights in copy, in-focus filter, never as a button color. |
| `--moss` | `oklch(0.50 0.09 145)` | Success states (paid, shipped). Never used decoratively. |
| `--brick` | `oklch(0.50 0.16 25)` | Destructive states. Confirmations, error inline text. |

### Strategy distribution

- **Restrained** (cart, checkout, dashboards, forms): `--bg`, `--surface`, `--ink`, with `--accent` for the primary action and nothing else colored. Roughly 95% neutrals, 5% accent.
- **Committed** (homepage hero, artwork detail page header, artist profile banner): `--accent` or `--ochre` carries 30 to 50% of the surface in a deliberate block. Used as a full-bleed band, a background card on a single hero, or a confident type color. Never as a gradient.

The full palette mode (3+ named roles) only appears on the artist profile when category tags need to be color-coded. Drenched mode is reserved for a future seasonal campaign page.

## Typography

Two families, both free for commercial use.

| Role | Family | Weights |
|---|---|---|
| Display | **Fraunces** (variable serif, Google Fonts) | 400, 600 (700 italic for emphasis) |
| Body / UI | **Geist** (already wired in `app/layout.tsx`) | 400, 500, 600 |
| Numeric / mono | **Geist Mono** | 400 |

Fraunces handles every headline and every artwork title. It has the editorial weight of a quarterly print magazine and resists the SaaS-grotesk cliché. Italic Fraunces on a single key word ("brought to you") is the one allowed flourish.

### Scale

A 1.3 modular scale, but used non-uniformly: display steps lean larger, body steps lean tighter.

| Token | Size | Line height | Letter-spacing | Use |
|---|---|---|---|---|
| `display-1` | 72px / 4.5rem | 1.02 | -0.025em | Hero headline only. Fraunces 600. |
| `display-2` | 52px / 3.25rem | 1.05 | -0.02em | Section headers on brand pages. |
| `display-3` | 38px / 2.375rem | 1.1 | -0.018em | Artwork title on detail page. |
| `h1` | 28px / 1.75rem | 1.2 | -0.01em | Dashboard page titles. |
| `h2` | 22px / 1.375rem | 1.3 | -0.005em | Section titles in product surfaces. |
| `h3` | 18px / 1.125rem | 1.4 | 0 | Card titles, form section headers. |
| `body` | 16px / 1rem | 1.55 | 0 | Default paragraph. Cap at 65–72ch. |
| `body-sm` | 14px / 0.875rem | 1.5 | 0 | Captions, metadata. |
| `mono-sm` | 13px / 0.8125rem | 1.4 | 0 | Order numbers, prices in tables. |

### Hierarchy rules

- Headlines: Fraunces 600, tight line-height, slight negative tracking.
- Body: Geist 400, generous line-height, neutral tracking.
- Weight contrast carries hierarchy when scale gap is too tight (e.g., a dashboard with `h2` and `h3` close in size). Never use color to differentiate hierarchy levels; reserve color for state.

## Spacing

Step scale, in `rem` for fluid sizing. Used non-uniformly: section gaps reach for the high end, intra-component padding stays tight.

```
--space-1: 0.25rem;   /*  4px */
--space-2: 0.5rem;    /*  8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.5rem;    /* 24px */
--space-6: 2rem;      /* 32px */
--space-7: 3rem;      /* 48px */
--space-8: 4rem;      /* 64px */
--space-9: 6rem;      /* 96px */
--space-10: 8rem;     /* 128px */
--space-11: 12rem;    /* 192px */
```

Rhythm rule: between major page sections on brand surfaces, lean `--space-9` or `--space-10`. Inside a card or form group, lean `--space-3` to `--space-5`. Same padding everywhere is the failure mode.

## Border, radius, elevation

Borders are always 1px and always tinted. No 2px borders, ever. No side-stripe accent borders (banned).

```
--radius-1: 4px;   /* inputs, small chips */
--radius-2: 8px;   /* buttons, secondary cards */
--radius-3: 12px;  /* primary cards */
--radius-4: 20px;  /* hero panels */
--radius-5: 32px;  /* full-bleed editorial blocks */
```

Elevation is barely-there and warm-tinted. Shadows compound the warmth; they never read grey.

```
--shadow-1: 0 1px 2px 0 oklch(0.20 0.02 35 / 0.05);
--shadow-2: 0 4px 12px -2px oklch(0.20 0.02 35 / 0.07);
--shadow-3: 0 12px 32px -8px oklch(0.20 0.02 35 / 0.10);
```

## Motion

Exponential ease-out only. No bounce, no elastic, no spring on UI affordances (springs are reserved for the rare gesture: drag-to-dismiss on the cart drawer, which doesn't exist yet). Layout properties (`width`, `height`, `top`, `left`, `padding`, `margin`) are never animated.

```
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
```

Durations:

| Token | Duration | Use |
|---|---|---|
| `--dur-press` | 120ms | `:active` press feedback. |
| `--dur-hover` | 180ms | Hover transitions. |
| `--dur-state` | 240ms | Cart drawer open, dropdown reveal. |
| `--dur-section` | 320ms | Page-level transitions, hero reveal. |

`prefers-reduced-motion: reduce` cuts movement, keeps opacity and color transitions.

## Components

Specs the polish pass should enforce. Not exhaustive; treat as the contract.

### Button

- Default: `--accent` background, `--bg` text. Press state: `transform: scale(0.97)` + `--accent-press` background.
- Outline: 1px `--border`, hover lifts to `--surface`, press identical.
- Ghost: no background, text-only, hover gets `--muted` background.
- Transition: `transform 120ms ease-out-quart, background-color 180ms ease-out-quart`. Never `transition: all`.
- Active state is mandatory; a button without `:active` feedback is a bug.

### Input / textarea

- 1px `--border`, `--surface` background, `--ink` text.
- Focus: `--accent` border, no neon ring; warm subtle outline (`outline-color: --accent / 0.3`, 2px offset).
- Placeholder: `--ink-soft`. No italic placeholders.

### Artwork card (the most important component)

- Square aspect ratio for image, full bleed inside `--radius-3`.
- Image: `transition: transform 240ms ease-out-quint`, hover (gated behind `(hover: hover) and (pointer: fine)`) scales to 1.04. No filter, no overlay.
- Below image: artwork title (Fraunces, body size, `--ink`), artist name (Geist, body-sm, `--ink-muted`), price (Geist, body weight 600, `--ink`).
- Three lines of metadata, no card chrome, no card border. The image is the card.

### Hero (homepage)

- Committed strategy. Full-bleed warm cream `--bg` with one large editorial composition.
- Display-1 Fraunces 600 for the headline. One italic word in the headline is permitted.
- No metrics row. No "+" suffix on numbers anywhere. No "join 1,000 happy collectors."
- Primary CTA in `--accent`, secondary CTA outline. Stack vertical on mobile, side-by-side from `md:` up.

### Empty state

- No illustration. No "looks like…" copy.
- Display-3 headline stating the fact. body-sm subline pointing to the action. One ghost-button next step.

## Anti-patterns specific to this codebase

These already exist in the repo and the polish pass must remove them:

1. **Hero metrics row** in `app/(shop)/page.tsx`. The `{artworkCount}+ Artworks · {artistCount}+ Artists · 15+ Countries` block is a banned hero-metric template. Replace with a quiet editorial line referencing one named artist and the country of origin.
2. **`transition-all`** in `components/ui/button.tsx`. Replace with named properties.
3. **`#000000`-equivalent classes** wherever they appear in arbitrary Tailwind values. Audit and replace with `--ink`.
4. **Card-in-form-in-Card** on the auth pages. Drop the outer Card; the form is the page.
5. **Default browser easings** everywhere. Replace with `--ease-out-quart` or `--ease-out-quint`.
6. **Three identical category cards** on the homepage. The current 6-up grid of identical buttons is the banned identical-card-grid. Replace with an asymmetric editorial layout (one large, three medium, two small) or a horizontal scroll.
