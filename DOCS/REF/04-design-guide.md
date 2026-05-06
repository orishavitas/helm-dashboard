<!-- KICKSTART_FILE: design-guide | PROJECT: helm | VERSION: 1.0 -->

# Design Guide — helm

---

## 1. Overview {#overview}

This guide defines the visual language and UX patterns for helm.
It is the source of truth for how the product looks and feels.

→ See: `01-product-brief.md` for product tone and target users.
→ See: `02-prd.md` for screens and flows this guide applies to.

---

## 2. Visual Language {#visual-language}

### Brand Personality
**Dense, calm, productive.** helm is a developer tool — it should feel like a well-configured terminal or IDE, not a marketing site. Information density matters. Color is used for signal, not decoration. No hero images, no animations beyond functional transitions.

### Color System {#colors}

```
Primary:    #6366f1   (indigo-500) — CTAs, active nav, focus rings, links
Accent:     #10b981   (emerald-500) — success states, "done" tasks, positive deploy status

Status colors:
  Success:  #10b981  (emerald-500) — deploy ready, task done
  Warning:  #f59e0b  (amber-500)   — building, paused, blocked task
  Error:    #ef4444  (red-500)     — deploy failed, critical priority
  Info:     #3b82f6  (blue-500)    — informational, in-progress

Neutrals (light mode):
  --background:     #0f0f12    (near-black)    — page background
  --surface:        #18181b    (zinc-900)      — card / panel background
  --surface-raised: #1f1f23    (zinc-800/90)   — elevated elements, dropdowns
  --border:         #27272a    (zinc-800)      — default borders
  --border-muted:   #3f3f46    (zinc-700)      — subtle dividers
  --text-primary:   #fafafa    (zinc-50)       — headings, primary labels
  --text-secondary: #a1a1aa    (zinc-400)      — supporting text, metadata
  --text-muted:     #52525b    (zinc-600)      — placeholders, disabled

Dark mode: helm IS dark mode. No light mode in MVP.
```

**Design rationale:** A developer working across project context at the start of the day doesn't want a bright white dashboard. Dark, dense, readable — like VS Code, not Notion.

### Typography {#typography}

```
Font Family:    Geist (by Vercel) — available via next/font/google
Fallback stack: -apple-system, 'Segoe UI', sans-serif

Monospace:      Geist Mono — for commit hashes, deploy IDs, branch names, code
Mono fallback:  'Fira Code', 'Cascadia Code', monospace

Scale:
  --text-xs:   11px / 1.4 lh  — metadata, timestamps, badges
  --text-sm:   13px / 1.5 lh  — secondary labels, helper text, table rows
  --text-base: 15px / 1.6 lh  — body default
  --text-lg:   17px / 1.5 lh  — card titles, section headings
  --text-xl:   20px / 1.4 lh  — page headings
  --text-2xl:  24px / 1.3 lh  — dashboard project count, big stats

Weight: Regular (400), Medium (500), Semibold (600). No bold (700) in UI.
```

### Spacing System {#spacing}

```
Base unit: 4px
Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48px

Usage:
  - Component internal padding: 12–16px
  - Between related elements: 8px
  - Between card sections: 16–20px
  - Between cards in a grid: 12–16px
  - Page padding: 24px (mobile), 32px (desktop)
```

### Border Radius
```
none: 0px    — dividers, progress bars
sm:   4px    — badges, tags, small chips
md:   6px    — inputs, buttons
lg:   8px    — cards, panels
xl:   12px   — modals, command palette
```

---

## 3. Component Patterns {#components}

### Buttons
```
Primary:   bg-indigo-500, text-white, hover:bg-indigo-600
Secondary: bg-zinc-800, text-zinc-100, border border-zinc-700, hover:bg-zinc-700
Ghost:     bg-transparent, text-zinc-400, hover:text-zinc-100 hover:bg-zinc-800
Danger:    bg-red-500/10, text-red-400, border border-red-500/20, hover:bg-red-500/20
Disabled:  opacity-40, cursor-not-allowed (all variants)

Sizes:
  sm: height 28px, px 10px, text-xs, radius-sm
  md: height 36px, px 14px, text-sm, radius-md   (default)
  lg: height 44px, px 20px, text-base, radius-md
```

### Forms / Inputs
```
Height:     36px (md), 44px (lg)
Background: bg-zinc-900
Border:     border border-zinc-700, focus: border-indigo-500 ring-1 ring-indigo-500/30
Label:      text-xs font-medium text-zinc-400, mb-1.5
Helper:     text-xs text-zinc-600, mt-1
Error:      text-xs text-red-400, mt-1, border-red-500 on input
Placeholder: text-zinc-600
```

### Cards
```
Background: bg-zinc-900 (surface)
Border:     border border-zinc-800
Radius:     lg (8px)
Padding:    16px
Shadow:     none (flat, border-driven separation)
Hover (interactive cards): border-zinc-700, bg-zinc-800/50
```

### Status Badges
```
Done / Ready:     bg-emerald-500/10  text-emerald-400  border border-emerald-500/20
In Progress:      bg-blue-500/10     text-blue-400     border border-blue-500/20
Blocked / Error:  bg-red-500/10      text-red-400      border border-red-500/20
Todo / Paused:    bg-zinc-700/50     text-zinc-400     border border-zinc-700
Building:         bg-amber-500/10    text-amber-400    border border-amber-500/20

Usage: Always text-xs, px-2 py-0.5, radius-sm
```

### Priority Indicators (Tasks)
```
Critical:  text-red-400    dot bg-red-500
High:      text-amber-400  dot bg-amber-500
Medium:    text-blue-400   dot bg-blue-500    (default)
Low:       text-zinc-500   dot bg-zinc-600
```

### Navigation
```
Type:    Left sidebar (desktop); top bar only (mobile)
Width:   220px fixed (desktop)
Behavior: Fixed, scrolls content area only

Sidebar sections:
  - Logo + project name at top (24px)
  - [Dashboard] — all projects
  - Divider
  - [Projects list] — click to expand per-project nav
    - ↳ [Project] Sprint / Tasks / Todos
  - Divider
  - [Settings] at bottom

Active item:   bg-zinc-800 text-white rounded-md
Inactive item: text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-md
Item height:   32px, px 10px, text-sm
```

### Loading States
```
- Skeleton screens: bg-zinc-800 animate-pulse rounded-md
- Use skeletons for: project cards, task lists, GitHub/Vercel data sections
- Button loading: spinner icon (Lucide Loader2) replaces label, width preserved
- Never use full-page spinners — partial skeletons only
```

### Empty States
```
Pattern: Centered in content area
  - Icon (Lucide, zinc-700, 32px)
  - Title: text-zinc-300 text-sm font-medium
  - Description: text-zinc-600 text-xs, max-w-xs centered
  - CTA: Secondary button

Examples:
  - No projects: "Create your first project" → [New Project] button
  - No sprint tasks: "Add your first task" → inline quick-add activates
  - No todos: "Nothing here — add a todo" → no CTA (just add field)
```

### Toast Notifications
```
Position:   bottom-right (desktop), top-center (mobile)
Duration:   success 2.5s, warning 4s, error persist until dismissed
Max:        3 toasts simultaneously
Style:      bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-xl
Types:      success (emerald dot), error (red dot), warning (amber dot), info (blue dot)
```

---

## 4. Layout System {#layouts}

### Breakpoints
```
mobile:   0 — 767px
desktop:  768px+
```
No tablet breakpoint — helm is desktop-first. Mobile shows a simplified list view.

### App Shell (Authenticated)
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (220px fixed)  │  Content Area (flex-1)    │
│                         │                           │
│  helm logo              │  [Page Header]            │
│  ─────────              │  ─────────────────────    │
│  Dashboard              │                           │
│  ─────────              │  [Page Content]           │
│  > project-a            │                           │
│    Sprint               │                           │
│    Tasks                │                           │
│    Todos                │                           │
│  > project-b            │                           │
│    ...                  │                           │
│  ─────────              │                           │
│  Settings               │                           │
└─────────────────────────────────────────────────────┘
```

### Dashboard Layout
```
Page header: "Dashboard" h1 + [New Project] button — flex justify-between

Project cards grid:
  Desktop: 2 columns (grid-cols-2), gap-3
  Wide (1440px+): 3 columns

Project card anatomy:
  ┌─────────────────────────────────────┐
  │  [Project Name]       [Status badge]│
  │  Description (1 line, truncated)    │
  │  ─────────────────────────────────  │
  │  Sprint: Name (N/M tasks)  [██░░░░] │
  │  ─────────────────────────────────  │
  │  Deploy: ● Ready  2m ago   [branch] │
  │  PRs: 3 open                        │
  └─────────────────────────────────────┘
```

### Project Detail Layout
```
Page header: [← Back] Project Name [Status] [Edit]

Sections (vertical stack, full width):
  1. Sprint section (collapsible)
     - Sprint header: name, date range, progress bar, [Close Sprint] [New Sprint]
     - Task list: inline quick-add at top, task rows below
  2. GitHub section
     - Open PRs (expandable list)
     - Recent commits (last 5, monospace)
  3. Vercel section
     - Latest deployment per environment (production, preview)
  4. Todos section
     - Project-scoped todos, simple checklist
```

### Forms
```
- New Project: Sheet (right drawer), not modal
- New Sprint: Inline above task list, minimal (name + optional dates)
- Task quick-add: Inline input row at top of task list, no modal
- Settings: Full page
```

---

## 5. Interaction Model {#interactions}

### Animation Principles
- Duration: 100ms (micro — status changes), 200ms (transitions), 0ms (data updates)
- Easing: ease-out for entering elements
- No decorative animations — only functional transitions
- Respect `prefers-reduced-motion` — disable all transitions if set

### Key Interactions
| Action | Feedback |
|--------|---------|
| Click task status badge | Cycles status inline, optimistic update |
| Add task (Enter in quick-add) | Task appears at top of list, field clears, stays focused |
| Close sprint | Confirmation: "Close sprint? N tasks remaining." — [Cancel] [Close Sprint] |
| Delete project | Confirmation dialog required (destructive) |
| Connect GitHub / Vercel | Opens install flow in same tab; returns to project on completion |
| Hover project card | border-zinc-700 — subtle, not distracting |

---

## 6. Screen Inventory {#screens}

| Screen | Route | Auth Required | Notes |
|--------|-------|--------------|-------|
| Login | `/login` | No | Google OAuth button, minimal layout |
| Dashboard | `/` | Yes | All active projects grid |
| Project Detail | `/projects/[id]` | Yes | Sprint, tasks, GitHub, Vercel, todos |
| Sprint View | `/projects/[id]/sprints/[sprintId]` | Yes | [ASSUMED: may merge into project detail] |
| Settings | `/settings` | Yes | Profile, Vercel token, GitHub App status |
| GitHub App Callback | `/api/github/app/callback` | Yes | Internal redirect handler |
| 404 | `*` | No | Minimal, link back to dashboard |

---

## 7. Accessibility {#accessibility}

- All interactive elements keyboard navigable (Tab order follows visual order)
- Focus rings visible: `ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900`
- Status colors always paired with text or icon — never color-only state communication
- Minimum contrast: all text combinations checked against dark background
- ARIA labels on all icon-only buttons (status cycle, delete, etc.)
- Task status cycling: also accessible via keyboard select, not just click
