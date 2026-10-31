---
name: Rheinblick Suites & Residence
description: An authentic European boutique sanctuary on the banks of the Rhine in Basel, heavily inspired by Lingers (lingers.it) — understated Alpine limestone, deep espresso graphite, warm bronze accents, and classical Roman Cinzel / Alice typography.
colors:
  canvas: "#FAF8F5"
  canvas-card: "#FFFFFF"
  sand: "#F3EFEA"
  sand-dark: "#E8E2D8"
  ink: "#1F1E1D"
  ink-muted: "#6C6862"
  bronze: "#8F7255"
  bronze-light: "#B89B7E"
  border-hairline: "rgba(31, 30, 29, 0.10)"
  error-red: "#b91c1c"
typography:
  brand:
    fontFamily: "'Cinzel', Georgia, serif"
    letterSpacing: "0.22em"
    textTransform: "uppercase"
  display:
    fontFamily: "'Alice', Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 400
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Alice', Georgia, serif"
    fontSize: "2.5rem"
    fontWeight: 400
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Alice', Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 300
    lineHeight: 1.7
  label:
    fontFamily: "'Cinzel', 'Plus Jakarta Sans', sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    letterSpacing: "0.22em"
    textTransform: "uppercase"
rounded:
  default: "0px"
  card: "0px"
  subtle: "2px"
spacing:
  container: "80rem"
  section-gap: "7rem"
components:
  button-primary:
    background: "{colors.ink}"
    foreground: "{colors.canvas}"
    borderRadius: "{rounded.default}"
  search-bar:
    background: "{colors.canvas-card}"
    border: "{colors.border-hairline}"
    borderRadius: "{rounded.default}"
---

# Design System: Rheinblick Suites & Residence

## Overview

**Creative North Star: Lingers Boutique Retreat (lingers.it)**
A refined European architectural retreat avoiding all generic "AI template" tropes (no tacky glassmorphism, no rounded-3xl floating cards, no colorful cartoon badge icons). Clean, quiet, spacious, and grounded in authentic boutique hospitality.

## 1. Palette & Atmosphere
- **Canvas / Limestone**: `#FAF8F5` (natural warm limestone ground).
- **Ink / Graphite**: `#1F1E1D` (deep warm espresso ink, never pure stark black).
- **Muted Text**: `#6C6862` (warm stone grey).
- **Bronze Accent**: `#8F7255` (warm earthy bronze).
- **Contrast Darkness**: `#181716` (deep nighttime charcoal for header & footer).

## 2. Typography
- **Brand Identity**: `Cinzel` (classical Roman letterforms, airy letter-spacing).
- **Editorial Headings**: `Alice` (weight 400, rounded serifs and open proportions, locally hosted WOFF2).
- **Body & Metadata**: `Plus Jakarta Sans` (weights 300 & 400, high readability).

## 3. Semantic Forms & MCP Guardrails
- Semantic `<form>`, `<label>`, `<input>`, `<select>`, `<button>` preserved across all 5 pages.
- Query/body parameters (`checkIn`, `checkOut`, `adults`, `guestName`, `guestEmail`, `guestPhone`) remain 100% analysable by the MCP creator.
- Explicit human confirmation barrier respected before any reservation becomes confirmed.

## 4. Motion
- Lenis smooth wheel scrolling; native touch scrolling and live reduced-motion support.
- Below-fold entrances are prepared before paint, run once, and animate only opacity/transform. No animated image masks or nested image zooms.
- Responsive WebP photographs (640/1280/1920px) reduce image transfer and decoding work.
