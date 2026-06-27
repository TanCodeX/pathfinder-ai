# Infinite Scroll Loading Trigger (`ease-infinite-scroll-trigger`)

An efficient infinite scroll component utilizing an `IntersectionObserver` to trigger a simulated network load when the user approaches the bottom of a card feed.

## Acceptance Criteria Met
- [x] **IntersectionObserver triggers load** with lightweight, non-blocking vanilla Javascript.
- [x] **Loader appears** smoothly with `.ease-fade-in` transitions.
- [x] **Loader disappears** or resets seamlessly once mock data cards are loaded and appended.
- [x] **Custom visual spinner** styled via `.ease-loader-spinner` featuring CSS keyframe infinite rotation.

## Files
- `demo.html`: Houses a mockup scrollable feed list and Javascript listener.
- `style.css`: Contains CSS rules for loader animations, border spinning, and slide-in entry keyframes.

## How to use
Observe a sentinel element at the bottom of the feed container. Use `IntersectionObserver` inside your script to add `.ease-fade-in` to your spinner, fetch details, and append new list cards.
