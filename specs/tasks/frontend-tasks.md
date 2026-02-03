# Frontend Tasks (SolidJS + MapLibre)

**Role**: Frontend Developer
**Focus**: UI/UX, Map Interaction, State Management, Performance, Accessibility.

---

## Phase 1: Project Setup

### 1.1 Initialize SolidJS Project
- [ ] Create project: `npm init solid@latest` (TypeScript template).
- [ ] Install Core Deps: `solid-js`, `@solidjs/router`, `maplibre-gl`.
- [ ] Install UI Deps: `tailwindcss`, `postcss`, `autoprefixer`, `flowbite`.
- [ ] Configure `vite.config.ts` for path aliases.

### 1.2 Global Styles & Theme
- [ ] Setup Tailwind config (colors, fonts, dark mode).
- [ ] Implement basic layout (Header, Sidebar/Overlay, Map Container).

---

## Phase 2: Core Components

### 2.1 Map Component
- [ ] Create `Map.tsx`: Initialize `maplibre-gl`.
- [ ] Sync Map Viewport with Global State (Signals).
- [ ] Add Vector Tile Source (Maptiler).
- [ ] Custom Markers using SolidJS Portals or MapLibre Marker API.
- [ ] Handle Map Events (`click`, `moveend`, `load`).

### 2.2 Search & Filter UI
- [ ] `SearchBar.tsx`: Input with debounce.
- [ ] `CategoryFilter.tsx`: Horizontal scroll or dropdown.
- [ ] Connect to `SearchStore` to trigger API calls.

### 2.3 Location Form (Contribution)
- [ ] `LocationForm.tsx`: Form for adding new places.
- [ ] Map Picker: Click on map to set `lat/lng`.
- [ ] Image Upload Preview.
- [ ] Client-side validation.

### 2.4 Location Detail View
- [ ] Modal or Side Drawer for location details.
- [ ] Image Gallery (Carousel).

---

## Phase 3: State Management & API Integration

### 3.1 API Client
- [ ] Setup `fetch` wrapper with Base URL and Interceptors.
- [ ] Create `api/locations.ts`, `api/images.ts`.

### 3.2 Reactive Stores
- [ ] Use `createResource` for async data fetching.
- [ ] `useGeolocation`: Custom primitive for user position.

---

## Phase 4: UI Polish & UX

### 4.1 Responsive Design
- [ ] Mobile-First design (Bottom Sheet on mobile, Sidebar on Desktop).
- [ ] Touch gestures validation for map interactions.

### 4.2 Progressive Web App (PWA)
- [ ] Add `vite-plugin-pwa`.
- [ ] Configure `manifest.json`.
- [ ] Service Worker for basic caching.

---

## Phase 5: Production Hardening 🔴

### 5.1 Internationalization (i18n)
- [ ] Integrate `@solid-primitives/i18n` or similar.
- [ ] Create translation files: `vi.json`, `en.json`.
- [ ] Language switcher component.
- [ ] Persist language preference (localStorage).

### 5.2 Accessibility (a11y) - WCAG 2.1 Compliance
- [ ] Semantic HTML (`<main>`, `<nav>`, `<article>`).
- [ ] ARIA attributes for custom components (Modals, Dropdowns).
- [ ] Keyboard navigation support (Tab, Enter, Escape).
- [ ] Focus management in modals.
- [ ] Color contrast validation (4.5:1 minimum).
- [ ] Screen reader testing (NVDA, VoiceOver).

### 5.3 Offline Mode & Service Worker Strategy
- [ ] **Cache-First** for static assets (JS, CSS, Images).
- [ ] **Network-First** for API calls with fallback to cached data.
- [ ] Offline indicator UI.
- [ ] Queue location submissions when offline, sync when online.

### 5.4 Analytics Integration
- [ ] Integrate **Google Analytics 4** (gtag.js).
- [ ] Custom events: `location_view`, `location_submit`, `search_performed`.
- [ ] Optional: Mixpanel/Amplitude for product analytics.
- [ ] Privacy-first: Respect Do Not Track header.

### 5.5 Error Boundary & Crash Reporting
- [ ] Implement SolidJS Error Boundaries for graceful UI fallback.
- [ ] Integrate **Sentry** for frontend error reporting.
- [ ] Capture: Uncaught exceptions, Promise rejections, API errors.
- [ ] Source Maps upload for readable stack traces.

### 5.6 A/B Testing Infrastructure (Future)
- [ ] Feature flags service integration (Unleash, LaunchDarkly).
- [ ] Conditional rendering based on user cohort.

### 5.7 SEO Optimization
- [ ] Dynamic `<title>` and `<meta description>` per page.
- [ ] Open Graph tags for social sharing.
- [ ] `sitemap.xml` generation.
- [ ] Schema.org structured data for locations (LocalBusiness).
- [ ] Consider SSR/SSG for public pages (`solid-start`).

### 5.8 Performance Optimization
- [ ] Lazy load routes (`lazy()` in SolidJS Router).
- [ ] Code splitting for large components.
- [ ] Image lazy loading with `loading="lazy"`.
- [ ] Lighthouse audit: Target Score > 90 (Performance, A11y, SEO).
