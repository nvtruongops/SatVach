# Design System - Sát Vách

## Color Palette

The project uses a specific 5-color palette derived from the brand identity.

| Color Name | Hex Code | Tailwind Name | Usage |
|O---|---|---|---|
| **Deep Blue** | `#227C9D` | `brand-blue` / `primary` | Primary actions, headers, extensive branding |
| **Keppel** | `#17C3B2` | `brand-teal` / `secondary` | Success states, secondary buttons, highlights |
| **Sunset** | `#FFCB77` | `brand-yellow` / `accent` | Warnings, highlights, engaging UI elements |
| **Floral White** | `#FEF9EF` | `brand-cream` / `background` | Page backgrounds, cards (light mode) |
| **Bittersweet** | `#FE6D73` | `brand-red` / `danger` | Error states, destructve actions, attention grabbers |

## Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)

## Tailwind Configuration

These colors should be configured in `tailwind.config.js` under `theme.extend.colors`.

```javascript
colors: {
  primary: '#227C9D',
  secondary: '#17C3B2',
  accent: '#FFCB77',
  danger: '#FE6D73',
  surface: '#FEF9EF',
  brand: {
    blue: '#227C9D',
    teal: '#17C3B2',
    yellow: '#FFCB77',
    cream: '#FEF9EF',
    red: '#FE6D73',
  }
}
```
