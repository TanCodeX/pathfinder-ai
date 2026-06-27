# Keyboard Command Bar Modal (`ease-command-bar`)

A premium, keyboard-accessible command bar (CMD+K) component with a glassmorphic background overlay, smooth zoom scaling modal animation, and staggered results.

## Acceptance Criteria Met
- [x] **Backdrop overlay** fades in with an elegant dark blur (`backdrop-filter: blur(8px)`).
- [x] **Input panel** zooms/scales in smoothly from the center of the viewport on trigger.
- [x] **Results stagger** in dynamically when filtering commands or searching.
- [x] **Keyboard shortcuts** supported for list navigation (`ArrowDown`/`ArrowUp`) and execution (`Enter`).
- [x] **ESC to close** is globally supported, alongside clicking the overlay backdrop.

## Files
- `demo.html`: Features a landing trigger card, interactive search filter script, and keyboard list index tracking.
- `style.css`: Contains glassmorphism overlays, center zoom keyframes, active highlighted rows, and staggered delays.

## How to use
Listen to the global `window.addEventListener('keydown')` event to detect `Ctrl+K` or `Cmd+K`. Toggle class `.active` on the container overlay to show the popup input search.
