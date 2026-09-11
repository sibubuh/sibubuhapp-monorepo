---
name: Sibubuh Playground
description: A personal portfolio and blog — warm paper, soft ink, one restrained indigo accent.
colors:
  primary: "oklch(0.55 0.18 264)"
  background: "oklch(0.985 0.006 85)"
  foreground: "oklch(0.22 0.012 70)"
  card: "oklch(1 0 0)"
  muted: "oklch(0.95 0.01 85)"
  muted-foreground: "oklch(0.5 0.014 70)"
  border: "oklch(0.9 0.01 85)"
  accent: "oklch(0.94 0.012 85)"
  ink: "oklch(0.2 0.012 70)"
  ink-foreground: "oklch(0.95 0.008 85)"
  destructive: "oklch(0.58 0.2 27)"
typography:
  display:
    fontFamily: "Lora, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "1.5rem 1.75rem"
  button-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "9999px"
    padding: "0.5rem 1.25rem"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  chip:
    rounded: "9999px"
    padding: "0.5rem 1.25rem"
---

# Design System: Sibubuh Playground

## Overview

**Creative North Star: "The Playground Atelier"**

A personal portfolio built like a warm editorial studio — restrained paper-and-ink neutrals form the calm, curated base, while a single indigo accent and tactile micro-interactions bring the "playground" to life. The system is deliberately quiet at rest: surfaces are flat, type does the heavy lifting, and color is used sparingly. Motion and hover states are where the personality surfaces — scale shifts, opacity fades, and the indigo accent light up only when the visitor reaches for something.

The incumbent system already commits to this thesis: Lora for editorial voice, Inter for UI chrome, a warm paper background, and an ink-dark footer that closes the page like a book cover. The design preserves all of it and tightens the craft — consistent radius scale, one shadow vocabulary, and a single accent discipline.

**Key Characteristics:**
- Warm paper + soft ink neutrals with one restrained indigo accent (flat-lift depth)
- Editorial serif (Lora) for display, grotesk (Inter) for UI — clear role split
- Tactile, confident components: visible hover/focus, micro-scale motion
- Dark mode via `data-theme="dark"` flips the whole surface; ink band closes every page
- Accent is rare by design — used on ≤10% of any screen

## Colors

A warm editorial palette: paper and ink neutrals carry the layout; a single cool indigo provides every accent and action cue.

### Primary
- **Playground Indigo** (`oklch(0.55 0.18 264)`): The only accent. Used on primary buttons, active chips, links on hover, and the eyebrow rule. Its cool temperature deliberately contrasts the warm paper.

### Neutral
- **Warm Paper** (`oklch(0.985 0.006 85)`): Page background. The warm base the whole system reads against.
- **Soft Ink** (`oklch(0.22 0.012 70)`): Body text and icons. Near-black with a warm cast — softer than pure black.
- **Card White** (`oklch(1 0 0)`): Surface for cards, popovers, dropdowns — a step brighter than the paper background.
- **Muted Paper** (`oklch(0.95 0.01 85)`): Secondary backgrounds, the CTA band, empty-state fills.
- **Muted Ink** (`oklch(0.5 0.014 70)`): Secondary text, timestamps, captions — legible but receding.
- **Hairline** (`oklch(0.9 0.01 85)`): Borders, dividers, slider tracks. Visible only at close range.
- **Accent Paper** (`oklch(0.94 0.012 85)`): Hover backgrounds for menu items and list rows.

### Named Roles
- **Ink Cover** (`oklch(0.2 0.012 70)`): The footer band — a deliberate dark closing surface. Text switches to `ink-foreground` (warm off-white) and `ink-muted` for secondary.
- **Signal Red** (`oklch(0.58 0.2 27)`): Destructive actions only.

### Named Rules
**The One Voice Rule.** Playground Indigo appears on ≤10% of any given screen. Its rarity is the point — every accent earns attention. Never pair it with a second accent.

## Typography

**Display Font:** Lora (with ui-serif, Georgia fallback)
**Body/UI Font:** Inter (with ui-sans-serif, system-ui fallback)

**Character:** Lora brings an editorial, slightly warm serif voice to headlines and section titles; Inter handles all UI chrome — nav, buttons, labels, timestamps — with a clean, neutral grotesk. The pairing is a classic magazine split: expressive display, invisible UI.

### Hierarchy
- **Display** (500, clamp(2.25rem, 5vw, 3.75rem), 1.08): Hero and page titles. Tight leading, balanced measure.
- **Headline** (500, text-3xl → text-4xl, tight): Section titles via `SectionHeading`. Serif voice continues.
- **Title** (600, text-base, snug): Card titles, link labels. Semibold for quick scanning.
- **Body** (400, 1rem → 1.0625rem, 1.6): Prose, ledes, descriptions. Max measure ~65ch via `max-w-md`/`max-w-2xl`.
- **Label** (500, text-xs → text-sm, tracked): Timestamps, nav links, eyebrow labels, chip text. Uppercase tracking on meta.

### Named Rules
**The Two-Voice Rule.** Display and section headlines are always Lora (serif); everything else — buttons, nav, labels, timestamps — is Inter (grotesk). Never mix within a single element.

## Layout

Editorial single-column rhythm inside a centered `max-w-7xl` container with consistent `px-6 md:px-8` gutters. Major sections use a 12-column grid (`lg:grid-cols-12`) for asymmetric copy/image splits (6/6 or 7/5). Vertical spacing is generous — sections sit 20–28 units apart (`py-20 md:py-28`) to let the paper breathe.

Responsive behavior is mobile-first: single column stacks below `md`, the 12-column grid kicks in at `lg`. The navbar collapses to a hamburger + theme toggle at `md` and below. Cards and grids reflow from 1 → 2 → 3 columns with Tailwind's standard breakpoints.

## Elevation & Depth

**Flat-by-default.** Surfaces are flat at rest; depth is conveyed through tonal layering (paper → card white → muted) rather than ambient shadows. The single shadow appears only as a response to state.

### Shadow Vocabulary
- **Card Lift** (`0 1px 2px oklch(0.2 0.02 70 / 0.04), 0 12px 32px -16px oklch(0.2 0.02 70 / 0.18)`): Applied to cards and the hero image panel. Soft, low-opacity, large spread — a gentle float, never a hard cast.

### Named Rules
**The Flat-Lift Rule.** No shadow at rest on UI chrome (buttons, nav, inputs). The `shadow-card` token is reserved for content surfaces (cards, hero images) and only intensifies on hover where motion already signals interaction.

## Shapes

A restrained corner language. Content surfaces use a medium radius (`rounded-xl` / 1.5rem on cards, `rounded-xl` on hero images); interactive controls are softer (`rounded-md` on primary buttons, `rounded-full` on the nav CTA and chips). The radius scale is fixed: sm (0.375rem), md (0.75rem), lg (1rem), xl (1.5rem), 2xl (2rem). Borders are 1px `hairline` — visible but never heavy.

## Components

### Buttons
- **Shape:** Medium corners (`rounded-md`, 0.75rem) for primary actions; pill (`9999px`) for nav CTAs.
- **Primary:** Playground Indigo background, warm paper text, `px-7 py-3.5`, Inter medium. Hover fades to 90% opacity.
- **Hover / Focus:** Opacity fade (0.2s) for primary; the nav pill uses framer-motion scale (1.03 hover, 0.97 tap). Focus-visible gets the indigo ring (`outline: 2px solid var(--color-ring)`).

### Chips (Pill)
- **Style:** Full pill (`9999px`), 1px hairline border, `px-5 py-2`, Inter medium, text-sm.
- **State:** Unselected uses muted-foreground text on transparent background; selected/active flips to indigo background with paper text. Hover darkens the border.

### Cards / Containers
- **Corner Style:** `rounded-xl` (1.5rem).
- **Background:** Card white (`oklch(1 0 0)`).
- **Shadow Strategy:** `shadow-card` at rest; image cards add a subtle `group-hover:scale-[1.03]` zoom on the thumbnail.
- **Border:** 1px hairline.
- **Internal Padding:** `p-6` (1.5rem).

### Navigation
- **Style:** Fixed top bar, `bg-background/85` with `backdrop-blur-md`, 1px hairline border. Inter medium, text-sm.
- **States:** Links are muted-foreground at rest, foreground on hover; the CTA is an indigo pill with motion scale. Mobile collapses to hamburger + theme toggle.
- **Dropdown:** Card-white popover with `shadow-card`, `rounded-xl`, indigo ring on hover.

### Eyebrow
- **Style:** Inter medium, text-sm, indigo text with a 24px indigo rule to the left. The section label — always the accent voice.

## Do's and Don'ts

### Do:
- **Do** keep Playground Indigo rare — one primary action per viewport, one active chip, one eyebrow.
- **Do** use Lora for headlines and Inter for everything else; never mix within one element.
- **Do** rely on tonal layering (paper → card → muted) for structure before reaching for shadows.
- **Do** respect the flat-lift rule: shadows only on content surfaces, never on chrome at rest.
- **Do** use the fixed radius scale — no arbitrary `rounded-[2rem]` one-offs.

### Don't:
- **Don't** introduce a second accent color. Indigo is the only voice.
- **Don't** add shadows to buttons, nav, or inputs at rest.
- **Don't** use Lora for UI chrome (buttons, labels, timestamps) — that's Inter's role.
- **Don't** let the indigo accent exceed ~10% of a screen — its power is in its scarcity.
- **Don't** use pure black (`#000`) for text or backgrounds — use Soft Ink and Ink Cover for the warm cast.
