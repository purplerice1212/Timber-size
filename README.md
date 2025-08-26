# Timber-size

Timber-size is a single-file HTML tool for planning timber storage layouts. It generates a shared geometry used by 3D, Plan, Front, and Side views and produces live cut lists from the same model.

## Getting Started

1. Clone this repository or download the source files.
2. Open `index.html` in a modern web browser.
3. Enter your storage pattern and dimensions. The 3D, plan, front, and side views update automatically, and cut lists are generated live.
4. Run automated checks:
   - Command line: `npm test`
   - Browser console: call `runTests()`

## Version Change Log

| Ver | What it is | Key behavior | Problems seen (if any) | Notes |
|-----|-------------|--------------|-------------------------|-------|
| v0 | Early single-file HTML attempts | 4 panes; mm parsing; basic geometry | Camera fit glitches; bins didn’t seat by lip; depth clamping inconsistent | Baseline 4-pane idea |
| v2 | Solid single-file HTML baseline | Single geometry → 4 views; two rails per opening; lip sits on rail; rail depth clamped; Front view; Summary + Cut List; “Apply opening” rewrites pattern | — | Canonical rule set |
| v2R | React attempt (now deprecated) | Newer UI shell; tests present | Only one rail per opening; no Front/rear frame; lip ignored; Side not clamped; “Apply” didn’t rewrite pattern | Keep only UI ideas if ever needed |
| v3 (current) | Single-file HTML (Parts 1–4) | One geometry (buildModel) used by 3D/Plan/Front/Side; Quad⇄Single view switch; Cut List toggle; alerts + hotkeys; duplicate posts auto-collapsed; supports sit inside frame with drop/lift; bins seat by lip; usable depth = min(runnerDepth, depth) everywhere | — | This is the version you should use now |

## Feature List (status for v3)

| Tag | Feature | Status | Notes / where implemented |
|-----|---------|--------|---------------------------|
| F-001 | mm everywhere; parser accepts 283 / 283mm; ceil | ✅ | parseList() (was parsePattern) |
| F-002 | Pattern → channels [post, open1, post, …, post] | ✅ | normalizeSegments() + channels() |
| F-003 | Four views always render (3D, Plan, Front, Side) | ✅ | Each reads M from buildModel() |
| F-004 | Two rails per opening at edges (or centered) | ✅ | railXPositions() (edges/centered) |
| F-005 | Bin helper: opening = body + 2*lip + slack; Apply rewrites pattern | ✅ | Button handler rewrites patternText |
| F-006 | Bins sit by lip: binTop = level + post − binLip | ✅ | Used in 3D & Side |
| F-007 | Clamp rail depth usable = min(runnerDepth, depth) | ✅ | All views + Cut List |
| F-008 | Rear frame (back posts + lintels) & counts | ✅ | Toggle rearFrame |
| F-009 | Supports: top/bottom with drop/lift & orientation (X/Z) | ✅ | No overlap with lintels |
| F-010 | Cut List + Summary live from geometry | ✅ | From M.boxes |
| F-011 | Runtime tests (parser/clamp/counts) | ✅ | runTests() |
| F-012 | View mode switcher: Quad ↔ Single (3D/Plan/Front/Side) | ✅ | Toolbar / class .single |
| F-013 | Fit / + / − / Reset works in any mode | ✅ | Shared 3D camera handlers |
| F-014 | Cut List toggle (show/hide) | ✅ | toggleCutlist |
| F-015 | Single geometry source for all views | ✅ | buildModel(S) → M.boxes |
| F-016 | Bottom row has/no rails (option) | ✅ | bottomRowRails |
| F-017 | Per-row overhang depth (bin can exceed carcass) | ✅ | overhang per row → dHere |
| F-018 | Per-row gap above (bin clearance) | ✅ | gap per row |
| F-019 | Auto height formula (caps + lintels + rows) | ✅ | autoHeightFromRows() |
| F-020 | Plan opening labels: ✓ within ±0.5 mm, else Δ red | ✅ | In renderPlan() |

## Logic Flow (single source of truth)

| Tag | Stage | Rule / formula | Where |
|-----|-------|----------------|-------|
| L-001 | Parse inputs | Text list → mm ceil | parseList() |
| L-002 | Normalize pattern | Ensure [post, open…, post], collapse duplicate posts | normalizeSegments() |
| L-003 | Channels | Keep segments > post as channels {x,w} | channels() |
| L-004 | Levels (rows) | y += height[i] + post (+ gap); start at post + bottomClear | computeLevels() |
| L-005 | Rails per opening | edges: [x, x+w−post]; centered: [x+(w−post)/2] | railXPositions() |
| L-006 | Rail depth clamp | usable = min(runnerDepth, depth) | Build & all views |
| L-007 | Bin sitting | yTop = level + post − binLip | Build (then views read M) |
| L-008 | Bin depth per row | dHere = min(D + max(0, over), D + over) | allows overhang |
| L-009 | Supports Y | top: clamp(post + topDrop, post, H−2·post); bottom: clamp(H−2·post−bottomLift, …) | Avoids lintel overlap |
| L-010 | Rear frame | Mirror posts/lintels at z = D − post | Toggle |
| L-011 | Apply opening | Rewrite patternText posts-kept, channels→suggested | Button handler |
| L-012 | Build model | buildModel(S) → M (boxes, channels, bounds) | Single geometry |
| L-013 | View switching | viewMode ∈ {quad,3d,plan,front,side}; no rebuild | Toolbar |
| L-014 | Cut List | From M (counts, railLen = min(runnerDepth, depth)) | Panel |

