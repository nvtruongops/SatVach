# MVP Master Task List - Sát Vách Platform

## Overview

Đây là file task tổng hợp cho **MVP (Minimum Viable Product)** của dự án Sát Vách.  
Các tasks được sắp xếp theo thứ tự thực hiện và dependencies.

**Target**: Working product with core features

---

## Task Dependencies Legend

```
→ : depends on (must complete before)
| : can run in parallel
```

**Critical Path**: DEV-1.3 → DB-1.1 → DB-1.4 → DB-2.1 → BE-2.1 → BE-3.6 → BE-4.2 → FE-2.2 → FE-3.3

---

## Sprint 1: Infrastructure Setup (Week 1)

### DevOps - Docker & Infrastructure

- [x] **DEV-1.1** Create Backend Dockerfile (Multi-stage, Python Slim)
- [x] **DEV-1.2** Create Frontend Dockerfile (Multi-stage, Node -> Nginx)
- [x] **DEV-1.3** Setup Docker Compose with services: `backend`, `frontend`, `db`, `minio`
  - _depends_on_: DEV-1.1, DEV-1.2
- [x] **DEV-1.4** Configure Health Checks for all services
  - _depends_on_: DEV-1.3
- [x] **DEV-1.5** Configure Networks and Volumes (Persistence)
  - _depends_on_: DEV-1.3
- [x] **DEV-1.6** Setup `.env` file handling and environment variables
- [x] **DEV-1.7** Setup `.env.example` template with all required variables

### Database - PostGIS Setup

- [x] **DB-1.1** Create `database/init.sql` with PostGIS extension and initial setup
  - _depends_on_: DEV-1.3
  - _content_: `CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS pg_trgm;`
- [x] **DB-1.2** Initialize Alembic: `alembic init alembic`
  - _depends_on_: DB-1.1
- [x] **DB-1.3** Configure `env.py` for async migrations
  - _depends_on_: DB-1.2
- [x] **DB-1.4** Verify PostGIS extension is working (`SELECT PostGIS_Version();`)
  - _depends_on_: DB-1.1

### External Services Setup

- [x] **EXT-1.1** Register Maptiler account (https://www.maptiler.com/cloud/)
- [x] **EXT-1.2** Create Maptiler API Key and note free tier limits (100k loads/month)
- [x] **EXT-1.3** Add `MAPTILER_API_KEY` to `.env` and `.env.example`
- [x] **EXT-1.4** Test Maptiler tile URL accessibility

### 🔲 Sprint 1 Checkpoint

- [x] All Docker services start successfully
- [x] PostgreSQL + PostGIS running and accessible (`SELECT PostGIS_Version();` returns value)
- [x] MinIO console accessible at :9001
- [x] Health endpoints responding
- [x] Maptiler API Key configured and tested

---

## Sprint 2: Backend Core (Week 2-3)

### Backend - Project Structure

- [x] **BE-1.1** Initialize FastAPI project structure: `src/api`, `src/core`, `src/db`, `src/services`, `src/models`
- [x] **BE-1.2** Setup `pydantic-settings` for configuration management
- [x] **BE-1.3** Implement AsyncSession setup for SQLAlchemy
- [x] **BE-1.4** Configure aioboto3 client for MinIO
- [x] **BE-1.5** Implement Health Check endpoints (`/health`, `/ready`)

### Backend - Models & Schemas

- [x] **BE-2.1** Create `Location` SQLAlchemy model with PostGIS Geometry
  - _depends_on_: BE-1.3, DB-1.4
- [x] **BE-2.2** Create `Image` model (1-n relationship with Location)
  - _depends_on_: BE-2.1
- [x] **BE-2.3** Create `ModerationLog` model
  - _depends_on_: BE-2.1
- [x] **BE-2.4** Define Foreign Keys and Cascade rules
  - _depends_on_: BE-2.1, BE-2.2, BE-2.3
- [x] **BE-2.5** Create Pydantic schemas: `LocationCreate`, `LocationResponse`, `LocationSearchParams`
  - _depends_on_: BE-2.1
- [x] **BE-2.6** Create Pydantic schema: `ImageUploadResponse`
  - _depends_on_: BE-2.2
- [x] **BE-2.7** Implement custom validators (coordinate ranges, string lengths)
  - _depends_on_: BE-2.5

### Database - Migrations

- [x] **DB-2.1** Generate initial migration for `locations`, `images`, `moderation_logs`
  - _depends_on_: BE-2.4
- [x] **DB-2.2** Add GIST index on `locations.geom`
- [x] **DB-2.3** Add GIN index for Full-Text Search
- [x] **DB-2.4** Add B-Tree indexes on `category`, `status`, `created_at`

### 🔲 Sprint 2 Checkpoint

- [x] Database migrations run successfully
- [x] Models create tables correctly
- [x] Pydantic validation works for all schemas
- [x] FastAPI auto-docs accessible at `/docs`

---

## Sprint 3: Backend Services & API (Week 3-4)

### Backend - Storage Service

- [x] **BE-3.1** Implement `upload_image` with file type validation (JPEG, PNG, WebP)
- [x] **BE-3.2** Implement file size validation (max 5MB)
- [x] **BE-3.3** Implement image optimization with Pillow (resize/compress)
- [x] **BE-3.4** Implement `delete_image` method
- [x] **BE-3.5** Implement `get_presigned_url` method

### Backend - Spatial Search Service

- [x] **BE-3.6** Implement `ST_DWithin` query for radius search
- [x] **BE-3.7** Implement `ST_MakeEnvelope` for viewport lazy loading
- [x] **BE-3.8** Implement PostgreSQL Full-Text Search
- [x] **BE-3.9** Combine spatial + text + category filters
- [x] **BE-3.10** Optimize with `selectinload` to avoid N+1

### Backend - Location Service

- [x] **BE-3.11** Implement Create Location with transaction management
- [x] **BE-3.12** Implement Read Location (by ID)
- [x] **BE-3.13** Implement Update Location
- [x] **BE-3.14** Implement Delete Location (cascade images)
- [x] **BE-3.15** Implement moderation status handling

### Backend - API Endpoints

- [x] **BE-4.1** `POST /api/v1/locations` - Create location
- [x] **BE-4.2** `GET /api/v1/locations/search` - Radius search with filters
- [x] **BE-4.3** `GET /api/v1/locations/viewport` - Bounding box search
- [x] **BE-4.4** `GET /api/v1/locations/{id}` - Get location details
- [x] **BE-4.5** `POST /api/v1/images/upload` - Upload image
- [x] **BE-4.6** `GET /api/v1/admin/locations` - List pending (moderation)
- [x] **BE-4.7** `PATCH /api/v1/admin/locations/{id}/status` - Approve/Reject

### Security - Basic API Protection

- [x] **SEC-1.1** Implement rate limiting (slowapi): 100 req/min read, 10 req/min write
- [x] **SEC-1.2** Configure strict CORS
- [x] **SEC-1.3** Add Security Headers (X-Content-Type-Options, X-Frame-Options, CSP)
- [x] **SEC-1.4** Input sanitization in Pydantic models
- [x] **SEC-1.5** Escape HTML/Script tags in text fields

### 🔲 Sprint 3 Checkpoint

- [x] All API endpoints working via Swagger
- [x] Image upload to MinIO works
- [x] Spatial search returns correct results
- [x] Rate limiting active
- [x] CORS configured

---

## Sprint 4: Frontend Core (Week 4-5)

### Frontend - Project Setup

- [x] **FE-1.1** Initialize SolidJS project with TypeScript
- [x] **FE-1.2** Install dependencies: `solid-js`, `@solidjs/router`, `maplibre-gl`
- [x] **FE-1.3** Install UI dependencies: `tailwindcss`, `flowbite`
- [x] **FE-1.4** Configure Vite with path aliases
- [x] **FE-1.5** Setup Tailwind config (colors, fonts)
- [x] **FE-1.6** Implement basic layout (Header, Map Container)

### Frontend - Map Component

- [x] **FE-2.1** Create `Map.tsx` with MapLibre GL JS initialization
  - _depends_on_: FE-1.2
- [x] **FE-2.2** Configure Maptiler Vector Tile source
  - _depends_on_: FE-2.1, EXT-1.3
- [x] **FE-2.3** Sync Map Viewport with Global State (Signals)
  - _depends_on_: FE-2.1
- [x] **FE-2.4** Implement custom markers for locations
- [x] **FE-2.5** Handle map events: `click`, `moveend`, `load`
- [x] **FE-2.6** Implement marker clustering for dense areas

### Frontend - Search & Filter

- [x] **FE-2.7** Create `SearchBar.tsx` with debounce
- [x] **FE-2.8** Create `CategoryFilter.tsx` (dropdown/horizontal scroll)
- [x] **FE-2.9** Create Radius slider (500m - 50km)
- [x] **FE-2.10** Connect filters to SearchStore

### Frontend - Location Form

- [x] **FE-2.11** Create `LocationForm.tsx`
- [x] **FE-2.12** Implement Map Picker (click to set lat/lng)
- [x] **FE-2.13** Implement Image Upload Preview (max 5 images)
- [x] **FE-2.14** Client-side validation
- [x] **FE-2.15** Form submission handling

### Frontend - Location Detail

- [x] **FE-2.16** Create Location Detail Modal/Drawer
- [x] **FE-2.17** Implement Image Gallery (Carousel)
- [x] **FE-2.18** Display distance from user location

### 🔲 Sprint 4 Checkpoint

- [x] Map renders with Maptiler tiles
- [x] Markers display on map
- [x] Search/Filter UI functional
- [x] Location form submits successfully
- [x] Detail view shows all information

---

## Sprint 5: API Integration & State (Week 5-6)

### Frontend - API Client

- [x] **FE-3.1** Setup fetch wrapper with Base URL
- [x] **FE-3.2** Implement request/response interceptors
- [x] **FE-3.3** Create `api/locations.ts`
- [x] **FE-3.4** Create `api/images.ts`
- [x] **FE-3.5** Error handling for API calls

### Frontend - State Management

- [x] **FE-3.6** Implement `createResource` for location fetching
- [x] **FE-3.7** Create `useGeolocation` primitive
- [x] **FE-3.8** Implement SearchStore for filters
- [x] **FE-3.9** Implement viewport-based lazy loading

### Frontend - Responsive Design

- [x] **FE-4.1** Mobile-first layout (Bottom Sheet on mobile)
- [x] **FE-4.2** Desktop layout (Sidebar)
- [x] **FE-4.3** Touch gesture support for map
- [x] **FE-4.4** Responsive map controls

### Security - Data Protection

- [x] **SEC-2.1** Verify image magic bytes on upload
- [x] **SEC-2.2** Strip EXIF metadata from images
- [x] **SEC-2.3** Audit `.env` usage
- [x] **SEC-2.4** Ensure ModerationLog captures audit trail
- [x] **SEC-2.5** Disable/protect Swagger UI in production

### 🔲 Sprint 5 Checkpoint

- [x] Frontend fully integrated with Backend
- [x] Geolocation working
- [x] Lazy loading on map viewport change
- [x] Responsive on mobile and desktop

---

## Sprint 6: Testing & Polish (Week 6-7)

### Testing - Backend Unit Tests

- [x] **TEST-1.1** Test Pydantic validations (boundary values)
- [x] **TEST-1.2** Test Services with mocked DB
- [x] **TEST-1.3** Test utility functions

### Testing - Frontend Unit Tests

- [x] **TEST-1.4** Test utility functions (formatters)
- [x] **TEST-1.5** Test state logic (Stores/Signals)

### Testing - Integration Tests

- [x] **TEST-2.1** Setup TestClient with Dockerized test database
- [x] **TEST-2.2** Test workflow: Create Location → Upload Image → Search → Verify
- [x] **TEST-2.3** Test database rollbacks per test

### Testing - E2E Tests

- [x] **TEST-3.1** Setup Playwright
- [x] **TEST-3.2** Test: Visitor opens map → Pan/Zoom → Click marker → See details
- [x] **TEST-3.3** Test: Contributor adds place → Fills form → Uploads → Submits
- [x] **TEST-3.4** Test: Search with keyword → Adjust radius → Verify results

### Testing - Performance

- [x] **TEST-4.1** Setup Locust for load testing
- [x] **TEST-4.2** Test 500 concurrent users scenario
- [x] **TEST-4.3** Verify 95th percentile < 500ms (Achieved: 60ms)
- [x] **TEST-4.4** Lighthouse audit (target > 90) - Score: 88/100 (Optimized from 86)

### Database - Seed Data

- [x] **DB-4.1** Create script to generate 1000+ test locations
- [x] **DB-4.2** Verify spatial index performance (6.8ms query time)

### 🔲 Sprint 6 Checkpoint

- [x] All unit tests passing
- [x] Integration tests passing
- [x] E2E tests passing
- [x] Performance benchmarks met (Locust < 60ms, FCP < 1.3s)

---

## Sprint 7: CI/CD & Deployment (Week 7-8)

### DevOps - CI Pipeline

- [ ] **DEV-2.1** GitHub Actions: Backend CI (pytest, ruff)
- [ ] **DEV-2.2** GitHub Actions: Frontend CI (vitest, build)
- [ ] **DEV-2.3** Docker image build verification

### Frontend - Production Build Verification

- [ ] **FE-5.1** Verify `npm run build` completes successfully
- [ ] **FE-5.2** Verify production bundle size is acceptable (< 500KB gzipped)
- [ ] **FE-5.3** Verify all environment variables are properly injected
- [ ] **FE-5.4** Test production build locally with `npm run preview`
- [ ] **FE-5.5** Verify Maptiler tiles load correctly in production build

### DevOps - CD Pipeline

- [ ] **DEV-2.4** Auto-deploy on merge to main
- [ ] **DEV-2.5** Docker image push to GHCR/DockerHub

### DevOps - Production Infrastructure

- [ ] **DEV-3.1** Setup Cloudflare Tunnel
- [ ] **DEV-3.2** Configure Ingress rules (API, Frontend)
- [ ] **DEV-3.3** Configure Nginx (Gzip, Cache headers)

### DevOps - Monitoring

- [ ] **DEV-4.1** Setup centralized logging (stdout)
- [ ] **DEV-4.2** Create backup script (pg_dump to MinIO)
- [ ] **DEV-4.3** Schedule daily backup cron job

### 🔲 Sprint 7 Checkpoint

- [ ] CI pipeline runs on every PR
- [ ] CD deploys on merge to main
- [ ] Cloudflare Tunnel exposing application
- [ ] Backups running daily

---

## Final MVP Checklist

### Functional Requirements

- [ ] Interactive map displays with vector tiles
- [ ] User can contribute new locations
- [ ] User can upload images (max 5, max 5MB each)
- [ ] Spatial search works (radius 500m - 50km)
- [ ] Category filtering works
- [ ] Text search works (Vietnamese support)
- [ ] Location detail view shows all information
- [ ] Admin can approve/reject locations

### Non-Functional Requirements

- [ ] Response time < 500ms (95th percentile)
- [ ] Supports 500 concurrent users
- [ ] Mobile responsive
- [ ] Maptiler within free tier (100k loads/month)
- [ ] Rate limiting active
- [ ] CORS configured
- [ ] Security headers set

### Documentation

- [ ] API documentation auto-generated at `/docs`
- [ ] README with setup instructions
- [ ] Environment variables documented

### Deployment

- [ ] Docker Compose production config ready
- [ ] Cloudflare Tunnel configured
- [ ] Backups scheduled
- [ ] Health checks operational

---

## Task Summary

| Category  | Total Tasks | Priority |
| --------- | ----------- | -------- |
| DevOps    | 17          | P0       |
| Database  | 10          | P0       |
| Backend   | 34          | P0       |
| Frontend  | 31          | P0       |
| Security  | 10          | P1       |
| Testing   | 14          | P1       |
| External  | 4           | P0       |
| **Total** | **120**     | -        |

---

## Notes

- Tasks prefixed with role code: `BE-` (Backend), `FE-` (Frontend), `DB-` (Database), `DEV-` (DevOps), `SEC-` (Security), `TEST-` (Testing), `EXT-` (External Services)
- `_depends_on_`: Indicates tasks that must be completed first
- Checkpoints at end of each sprint to validate progress
- All tasks should be tracked in project management tool (GitHub Issues, Jira, Linear)
- Blockers should be escalated immediately

---

## Quick Reference: Critical Dependencies

| Task                     | Depends On      | Blocks                 |
| ------------------------ | --------------- | ---------------------- |
| DB-1.1 (init.sql)        | DEV-1.3         | DB-1.4, DB-2.1         |
| DB-2.1 (migration)       | BE-2.4          | BE-3.6, BE-3.11        |
| BE-2.1 (Location model)  | DB-1.4          | BE-2.2, BE-2.3, DB-2.1 |
| FE-2.2 (Maptiler config) | EXT-1.3         | FE-2.4, FE-2.5         |
| FE-5.1 (prod build)      | FE-1._ ~ FE-4._ | DEV-2.2, Deployment    |
