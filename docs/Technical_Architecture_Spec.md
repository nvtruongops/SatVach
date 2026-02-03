# Technical Architecture Specification: "Sat Vach" Hyperlocal Social Network

## 1. Executive Summary

**Project Vision**: "Sat Vach" (Close Neighbors) aims to redefine urban connectivity by bridging the gap between social media and hyperlocal commerce. In high-density metropolises like Ho Chi Minh City, traditional platforms often fail to capture the nuances of neighborhood-level interactions. Sat Vach leverages a "Map-first centric" approach to visualize social and commercial data down to the "alley" (hem) level—the fundamental unit of Vietnamese urban culture.

**Strategic Goal**: Establish a Hyperlocal Social Network that facilitates real-time connection, sharing economy, and community engagement within strictly defined geographic radii.

---

## 2. Frontend Architecture & Design Standards

The client-side architecture is designed with a "Web-First" strategy to ensure rapid deployment, broad accessibility, and high performance on mobile browsers without the friction of app store installations.

### 2.1 Core Framework Stack
*   **Application Framework**: **SolidJS**
    *   *Rationale*: Chosen for its superior performance over legacy React-based architectures. SolidJS utilizes fine-grained reactivity, meaning it updates only the specific DOM nodes that change, rather than re-rendering entire component trees. This is critical for maintaining high frame rates (60fps) in a map-heavy application.
*   **Build Tooling**: **Vite**
    *   *Standard*: Provides instant Hot Module Replacement (HMR) during development and highly optimized production bundles (~7KB core runtime), ensuring fast load times even on 4G networks.

### 2.2 Map Engineering (The Core Experience)
The application centers around an interactive map interface. The choice of technology here is pivotal for the User Experience (UX).

*   **Rendering Engine**: **MapLibre GL JS**
    *   *Technology*: Utilizes WebGL to render **Vector Tiles** on the client side.
    *   *Advantage*: Unlike raster tiles (static images), vector tiles allow for smooth zooming, dynamic rotation, and 3D terrain/building rendering without pixelation. Styles can be changed instantly (e.g., Day/Night mode) via CSS/JSON without re-downloading data.
*   **Tile Strategy**: **Vector Tiles**
    *   *Efficiency*: Significantly lower bandwidth usage compared to raster images, crucial for mobile users with limited data plans.
    *   *Interactivity*: Every element on the map (building, road, POI) is an interactive entity that can react to hover, click, or tap events.

### 2.3 User Interface (UI) & Design System
To ensure a premium, modern aesthetic ("WOW factor") that appeals to Gen Z and urban residents.

*   **Component Library**: **Flowbite**
    *   *Implementation*: A robust set of UI components (Modals, Cards, Navigation) built on top of TailwindCSS.
    *   *Philosophy*: Utility-first CSS allows for rapid styling iteration while maintaining design consistency.
*   **Styling**: **TailwindCSS**
    *   *Responsive Design*: Mobile-first approach ensures the interface adapts seamlessly from smartphones to desktop screens.
    *   *Theming*: Centralized configuration for colors, typography, and spacing to maintain brand identity (e.g., potential Neon Cyberpunk or Modern Pastel themes).

### 2.4 State Management & Performance
*   **Reactivity**: Leveraging SolidJS built-in **Stores** for global state management (User session, Map viewport status, Filter criteria). This avoids the boilerplate and overhead of external libraries like Redux.
*   **Optimization**: 
    *   Lazy loading of non-critical components.
    *   Asset optimization (WebP images).
    *   Efficient data fetching patterns to minimize main-thread blocking.

---

## 3. Backend Services & Data Integration

The backend serves as an enabler for the rich frontend experience, focusing on speed, spatial accuracy, and scalability.

### 3.1 API & Application Layer
*   **Service**: **Python FastAPI**
    *   *Role*: Handles business logic, authentication, and especially spatial data processing.
    *   *Architecture*: Async/await patterns ensure the server can handle high concurrency (many user requests simultaneously) without stalling.
    *   *Documentation*: Auto-generated OpenAPI (Swagger) specifications allow frontend developers to have a clear, live contract of available endpoints.

### 3.2 Spatial Data Infrastructure
*   **Database**: **PostgreSQL** with **PostGIS** extension.
    *   *Function*: Stores not just text data, but geometric types (Points, Polygons).
    *   *Capability*: Performs complex spatial queries efficiently, such as "Find all items for sale within a 500m walking radius of this point."
*   **Tile Generation**: **Dynamic MVT (Mapbox Vector Tiles)**
    *   *Process*: Use PostGIS functions (`ST_AsMVT`) to generate vector tiles directly from the database on-demand. This gives "Sat Vach" complete autonomy over its map data, removing dependence on expensive third-party map APIs.

### 3.3 Static Asset Storage
*   **Object Storage**: **MinIO** (Self-hosted S3 Compatible)
    *   *Usage*: Stores user-generated content (Images, Avatars).
    *   *Protocol*: S3-compatible API ensures that if the system needs to scale to cloud providers (AWS, Cloudflare R2) in the future, the code requires zero changes.

---

## 4. Infrastructure & Deployment

*   **Containerization**: **Docker & Docker Compose** encapsulate the entire stack (Database, API, Storage) into portable units, ensuring consistency between development and production environments.
*   **Exposure**: **Cloudflare Tunnel** provides a secure, encrypted connection from the self-hosted environment to the public internet without exposing ports or requiring static IPs.

## 5. Summary

This architecture prioritizes **User Experience** through a high-performance, web-based vector map interface. By choosing modern tools like SolidJS and MapLibre, "Sat Vach" ensures the application feels like a native app—smooth, responsive, and immersive—while maintaining the agility and reach of the web.
