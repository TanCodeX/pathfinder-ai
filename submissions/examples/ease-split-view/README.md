# Animated Split View Component (`ease-split-view`)

A highly premium side-by-side split workspace featuring smooth expand/collapse sidebar animations, resizable dragging boundaries, and double-click shortcuts.

## Acceptance Criteria Met
- [x] **Two panels side-by-side** (Sidebar navigation & Main workspace).
- [x] **Toggle functionality** that collapses the sidebar panel to `0px` width while expanding the main workspace container.
- [x] **Smooth width transition** using cubic-bezier transitions, optimized dynamically to bypass transition delays while manual dragging is in progress.
- [x] **Resizable divider option** enabling users to click-and-drag to adjust boundaries manually with standard cursors, double-clicking the divider bar toggles panel collapse.

## Files
- `demo.html`: Structure of workspace panels, interactive resize listener script.
- `style.css`: Contains CSS rules, flex panel widths, and resizing cursor handlers.

## How to use
Embed panels side-by-side using flex rows, include the `.split-divider` element in the center, and assign a mouse dragging callback to calculate boundary widths on the left component.
