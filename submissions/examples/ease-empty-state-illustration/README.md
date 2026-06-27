# Animated Empty State Component (`ease-empty-state-illustration`)

A clean, responsive, and animated empty state component featuring smooth floating illustrations, staggered element entrances, and three distinct layout variants.

## Acceptance Criteria Met
- [x] **Floating animation** (`ease-float`) applied to illustration graphics using soft keyframe translations.
- [x] **Heading and description text** styled with modern spacing.
- [x] **Interactive CTA button** with hover translate and box-shadow shifts.
- [x] **Stagger entrance** of all content elements utilizing incremental animation delay classes (`.stagger-1`, `.stagger-2`, `.stagger-3`).
- [x] **Variants included**:
  - `no-data` (Empty Inbox layout)
  - `no-results` (Search/Filter glass layout)
  - `no-connection` (Server connection/wifi loss layout)

## Files
- `demo.html`: Features an interactive state switcher dashboard.
- `style.css`: Contains state animations, float rules, and staggered delays.

## How to use
Add class `.ease-float` to your SVG containers and use the `.stagger-1`, `.stagger-2`, etc. classes to apply smooth entrance sequences. Switch states by toggling container attributes or classes.
