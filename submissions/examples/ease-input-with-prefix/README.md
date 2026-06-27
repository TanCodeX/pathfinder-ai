# Input Field with Animated Prefix (`ease-input-with-prefix`)

A sleek form input component with custom prefixes (such as `$`, `@`, or flags) that features interactive container focus glows and animated prefix highlights.

## Acceptance Criteria Met
- [x] **Prefix section changes color** on input focus, implemented smoothly using the `:focus-within` selector.
- [x] **Border glow on focus** surrounding the whole container structure, complete with soft box-shadows.
- [x] **`--ease-prefix-color`** CSS variable used to customize highlight colors per input.
- [x] **Currency, username, domain, and phone number** presets showcase flexible usages.

## Files
- `demo.html`: Forms card containing 4 input variants with unique prefixes.
- `style.css`: Contains CSS rules, variable hooks, focus-within pseudo-classes, and subtle prefix scaling transitions.

## How to use
Wrap the prefix `<span>` and your `<input>` inside an `.ease-input-container`. Style the focused parent using `:focus-within` and customize the active highlights using the `--ease-prefix-color` variable.
