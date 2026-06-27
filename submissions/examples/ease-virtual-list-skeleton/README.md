# Virtual List Skeleton Loader (`ease-virtual-list-skeleton`)

A modern list placeholder component with a shimmer animation, staggered element entrance, and dynamic loaded content transitions suitable for virtualized feeds.

## Acceptance Criteria Met
- [x] **N skeleton rows** (5 rows implemented) styled with a flowing background shimmer effect.
- [x] **Varied widths** on the text title and description components to emulate a natural text layout.
- [x] **Staggered entrance** on initial skeleton component display using animation-delay classes (`.stagger-1`, `.stagger-2`, etc.).
- [x] **Fade-out animation** when actual content is triggered to load.

## Files
- `demo.html`: Features a toggle button to trigger real content loading and reset animations.
- `style.css`: Contains CSS variables, staggered delay transitions, and keyframe-based shimmer effects.

## How to use
Wrap list elements in `.shimmer` class, style the linear background shifting keyframe, and stagger entry delays using `.stagger-1` to `.stagger-N`. Toggle loading container visibilities smoothly.
