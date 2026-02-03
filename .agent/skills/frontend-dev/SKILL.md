---
name: frontend-dev
description: Guidelines for SatVach Frontend Development (SolidJS + MapLibre + Flowbite)
---

# Frontend Development Guidelines - Dự Án Sát Vách

## Tech Stack
- **Framework**: SolidJS + Vite (TypeScript)
- **Styling**: TailwindCSS + Flowbite
- **Map Library**: MapLibre GL JS
- **Map Tiles**: Maptiler Free Tier (100k loads/tháng)
- **State Management**: SolidJS Signals & Stores
- **HTTP Client**: Fetch API (native) hoặc axios

## Core Principles

### 1. SolidJS Reactivity
- **Signals**: Use `createSignal` for primitive values (numbers, strings, booleans).
  ```typescript
  const [count, setCount] = createSignal(0);
  const [isLoading, setIsLoading] = createSignal(false);
  
  // Usage in JSX
  <div>{count()}</div>  // Must call as function!
  ```
- **Stores**: Use `createStore` for objects/arrays. **NEVER** spread or destructure store state directly in JSX.
  ```typescript
  import { createStore } from "solid-js/store";
  
  const [state, setState] = createStore({ 
    user: { name: "A" },
    items: []
  });
  
  // ✅ Good - Maintains reactivity
  <div>{state.user.name}</div>
  
  // ❌ Bad - Loses reactivity
  const { name } = state.user;
  <div>{name}</div>
  ```
- **Effects**: Use `createEffect` sparingly, chỉ cho side effects (MapLibre updates, localStorage sync).
  ```typescript
  import { createEffect } from "solid-js";
  
  createEffect(() => {
    // Runs when items() changes
    const data = items();
    updateMapSource(data);
  });
  ```
- **Memos**: Use `createMemo` cho computed values.
  ```typescript
  import { createMemo } from "solid-js";
  
  const filteredItems = createMemo(() => 
    items().filter(item => item.price < 1000000)
  );
  ```

### 2. Map Integration (MapLibre GL JS)

#### Setup MapLibre
```typescript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: mapContainer, // DOM element ref
  style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
  center: [106.6297, 10.8231], // TP.HCM
  zoom: 13
});
```

#### Component Wrapper
```typescript
import { onMount, onCleanup, createEffect } from "solid-js";

function MapView(props) {
  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map;
  
  onMount(() => {
    map = new maplibregl.Map({
      container: mapContainer,
      style: props.styleUrl,
      center: props.center,
      zoom: props.zoom
    });
    
    map.on('load', () => {
      // Add sources and layers
      map.addSource('items', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      
      map.addLayer({
        id: 'items-layer',
        type: 'circle',
        source: 'items',
        paint: {
          'circle-radius': 8,
          'circle-color': '#3b82f6'
        }
      });
    });
  });
  
  // Sync SolidJS state with Map
  createEffect(() => {
    if (map && map.isStyleLoaded()) {
      const source = map.getSource('items') as maplibregl.GeoJSONSource;
      source?.setData(toGeoJSON(props.items()));
    }
  });
  
  onCleanup(() => {
    map?.remove();
  });
  
  return <div ref={mapContainer} class="w-full h-full" />;
}
```

#### Geolocation
```typescript
import { createSignal } from "solid-js";

function useGeolocation() {
  const [position, setPosition] = createSignal<[number, number] | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  
  const getCurrentPosition = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.longitude, pos.coords.latitude]);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };
  
  return { position, error, loading, getCurrentPosition };
}
```

#### Convert Items to GeoJSON
```typescript
function toGeoJSON(items: Item[]) {
  return {
    type: 'FeatureCollection',
    features: items.map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.location.lng, item.location.lat]
      },
      properties: {
        id: item.id,
        title: item.title,
        price: item.price
      }
    }))
  };
}
```

### 3. Styling (TailwindCSS + Flowbite)
- **Utility-First**: Sử dụng Tailwind utility classes.
  ```tsx
  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Click me
  </button>
  ```
- **Flowbite Components**: Sử dụng Flowbite cho complex components (modals, dropdowns).
  ```tsx
  // Modal component
  <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-md">
      <h3 class="text-xl font-bold mb-4">Item Details</h3>
      <p>{item.description}</p>
    </div>
  </div>
  ```
- **Dark Mode**: Support dark mode với `dark:` prefix.
  ```tsx
  <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    Content
  </div>
  ```
- **Responsive**: Mobile-first design.
  ```tsx
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Items */}
  </div>
  ```

### 4. API Integration
```typescript
// lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function searchItems(lat: number, lng: number, radius: number) {
  const response = await fetch(
    `${API_BASE}/api/v1/search?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/api/v1/upload`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}
```

### 5. State Management
```typescript
// stores/itemStore.ts
import { createStore } from "solid-js/store";

export const [itemStore, setItemStore] = createStore({
  items: [] as Item[],
  loading: false,
  error: null as string | null
});

export async function loadItems(lat: number, lng: number, radius: number) {
  setItemStore('loading', true);
  try {
    const data = await searchItems(lat, lng, radius);
    setItemStore('items', data);
  } catch (err) {
    setItemStore('error', err.message);
  } finally {
    setItemStore('loading', false);
  }
}
```

### 6. Directory Structure
```
src/frontend/
  ├── components/
  │   ├── Map/
  │   │   ├── MapView.tsx           # Main map component
  │   │   ├── ItemMarker.tsx        # Custom marker
  │   │   └── SearchRadius.tsx      # Radius circle overlay
  │   ├── Item/
  │   │   ├── ItemCard.tsx          # Item display card
  │   │   ├── ItemList.tsx          # List view
  │   │   └── ItemDetail.tsx        # Detail modal
  │   └── UI/
  │       ├── Button.tsx
  │       ├── Input.tsx
  │       └── Modal.tsx
  ├── pages/
  │   ├── Home.tsx                  # Main map view
  │   ├── ItemCreate.tsx            # Create new item
  │   └── Profile.tsx               # User profile
  ├── stores/
  │   ├── itemStore.ts              # Items state
  │   └── userStore.ts              # User state
  ├── lib/
  │   ├── api.ts                    # API client
  │   ├── mapUtils.ts               # Map helpers
  │   └── geolocation.ts            # Geolocation hook
  ├── types/
  │   └── index.ts                  # TypeScript types
  ├── assets/
  │   └── images/
  ├── App.tsx                       # Main app component
  ├── index.tsx                     # Entry point
  └── index.css                     # Global styles + Tailwind
```

### 7. TypeScript Types
```typescript
// types/index.ts
export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  location: {
    lat: number;
    lng: number;
  };
  image_url: string;
  created_at: string;
}

export interface SearchParams {
  lat: number;
  lng: number;
  radius: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
```

### 8. Environment Variables
```typescript
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAPTILER_KEY: string;
}

// Usage
const apiUrl = import.meta.env.VITE_API_URL;
```

### 9. Performance Best Practices
- **Lazy Loading**: Lazy load routes và heavy components.
  ```typescript
  import { lazy } from "solid-js";
  const ItemDetail = lazy(() => import("./components/Item/ItemDetail"));
  ```
- **Debouncing**: Debounce search input.
  ```typescript
  import { createSignal } from "solid-js";
  
  const [searchTerm, setSearchTerm] = createSignal("");
  const debouncedSearch = debounce((term) => {
    // Perform search
  }, 500);
  ```
- **Virtualization**: Virtualize long lists (solid-virtual).
- **Image Optimization**: Lazy load images, use WebP format.

### 10. Testing
```typescript
// __tests__/MapView.test.tsx
import { render } from "@solidjs/testing-library";
import MapView from "../components/Map/MapView";

test("renders map container", () => {
  const { container } = render(() => <MapView />);
  expect(container.querySelector('.maplibregl-map')).toBeInTheDocument();
});
```

### 11. Build & Deploy
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 12. Common Pitfalls
- ❌ Forgetting to call signals as functions: `count` instead of `count()`
- ❌ Destructuring store state in JSX
- ❌ Not cleaning up map instance in `onCleanup`
- ❌ Using React patterns (useEffect, useState) instead of SolidJS primitives
- ❌ Not handling map load state before adding layers
