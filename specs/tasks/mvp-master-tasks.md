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
- [ ] **DB-1.2** Initialize Alembic: `alembic init alembic`
  - _depends_on_: DB-1.1
- [ ] **DB-1.3** Configure `env.py` for async migrations
  - _depends_on_: DB-1.2
- [ ] **DB-1.4** Verify PostGIS extension is working (`SELECT PostGIS_Version();`)
  - _depends_on_: DB-1.1

### External Services Setup
- [x] **EXT-1.1** Register Maptiler account (https://www.maptiler.com/cloud/)
- [x] **EXT-1.2** Create Maptiler API Key and note free tier limits (100k loads/month)
- [x] **EXT-1.3** Add `MAPTILER_API_KEY` to `.env` and `.env.example`
- [x] **EXT-1.4** Test Maptiler tile URL accessibility

### 🔲 Sprint 1 Checkpoint
- [ ] All Docker services start successfully
- [ ] PostgreSQL + PostGIS running and accessible (`SELECT PostGIS_Version();` returns value)
- [ ] MinIO console accessible at :9001
- [ ] Health endpoints responding
- [ ] Maptiler API Key configured and tested

---

## Sprint 2: Backend Core (Week 2-3)

### Backend - Project Structure
- [ ] **BE-1.1** Initialize FastAPI project structure: `src/api`, `src/core`, `src/db`, `src/services`, `src/models`
- [ ] **BE-1.2** Setup `pydantic-settings` for configuration management
- [ ] **BE-1.3** Implement AsyncSession setup for SQLAlchemy
- [ ] **BE-1.4** Configure aioboto3 client for MinIO
- [ ] **BE-1.5** Implement Health Check endpoints (`/health`, `/ready`)

### Backend - Models & Schemas
- [ ] **BE-2.1** Create `Location` SQLAlchemy model with PostGIS Geometry
  - _depends_on_: BE-1.3, DB-1.4
- [ ] **BE-2.2** Create `Image` model (1-n relationship with Location)
  - _depends_on_: BE-2.1
- [ ] **BE-2.3** Create `ModerationLog` model
  - _depends_on_: BE-2.1
- [ ] **BE-2.4** Define Foreign Keys and Cascade rules
  - _depends_on_: BE-2.1, BE-2.2, BE-2.3
- [ ] **BE-2.5** Create Pydantic schemas: `LocationCreate`, `LocationResponse`, `LocationSearchParams`
  - _depends_on_: BE-2.1
- [ ] **BE-2.6** Create Pydantic schema: `ImageUploadResponse`
  - _depends_on_: BE-2.2
- [ ] **BE-2.7** Implement custom validators (coordinate ranges, string lengths)
  - _depends_on_: BE-2.5

### Database - Migrations
- [ ] **DB-2.1** Generate initial migration for `locations`, `images`, `moderation_logs`
  - _depends_on_: BE-2.4
- [ ] **DB-2.2** Add GIST index on `locations.geom`
- [ ] **DB-2.3** Add GIN index for Full-Text Search
- [ ] **DB-2.4** Add B-Tree indexes on `category`, `status`, `created_at`

### 🔲 Sprint 2 Checkpoint
- [ ] Database migrations run successfully
- [ ] Models create tables correctly
- [ ] Pydantic validation works for all schemas
- [ ] FastAPI auto-docs accessible at `/docs`

---

## Sprint 3: Backend Services & API (Week 3-4)

### Backend - Storage Service
- [ ] **BE-3.1** Implement `upload_image` with file type validation (JPEG, PNG, WebP)
- [ ] **BE-3.2** Implement file size validation (max 5MB)
- [ ] **BE-3.3** Implement image optimization with Pillow (resize/compress)
- [ ] **BE-3.4** Implement `delete_image` method
- [ ] **BE-3.5** Implement `get_presigned_url` method

### Backend - Spatial Search Service
- [ ] **BE-3.6** Implement `ST_DWithin` query for radius search
- [ ] **BE-3.7** Implement `ST_MakeEnvelope` for viewport lazy loading
- [ ] **BE-3.8** Implement PostgreSQL Full-Text Search
- [ ] **BE-3.9** Combine spatial + text + category filters
- [ ] **BE-3.10** Optimize with `selectinload` to avoid N+1

### Backend - Location Service
- [ ] **BE-3.11** Implement Create Location with transaction management
- [ ] **BE-3.12** Implement Read Location (by ID)
- [ ] **BE-3.13** Implement Update Location
- [ ] **BE-3.14** Implement Delete Location (cascade images)
- [ ] **BE-3.15** Implement moderation status handling

### Backend - API Endpoints
- [ ] **BE-4.1** `POST /api/v1/locations` - Create location
- [ ] **BE-4.2** `GET /api/v1/locations/search` - Radius search with filters
- [ ] **BE-4.3** `GET /api/v1/locations/viewport` - Bounding box search
- [ ] **BE-4.4** `GET /api/v1/locations/{id}` - Get location details
- [ ] **BE-4.5** `POST /api/v1/images/upload` - Upload image
- [ ] **BE-4.6** `GET /api/v1/admin/locations` - List pending (moderation)
- [ ] **BE-4.7** `PATCH /api/v1/admin/locations/{id}/status` - Approve/Reject

### Security - Basic API Protection
- [ ] **SEC-1.1** Implement rate limiting (slowapi): 100 req/min read, 10 req/min write
- [ ] **SEC-1.2** Configure strict CORS
- [ ] **SEC-1.3** Add Security Headers (X-Content-Type-Options, X-Frame-Options, CSP)
- [ ] **SEC-1.4** Input sanitization in Pydantic models
- [ ] **SEC-1.5** Escape HTML/Script tags in text fields

### 🔲 Sprint 3 Checkpoint
- [ ] All API endpoints working via Swagger
- [ ] Image upload to MinIO works
- [ ] Spatial search returns correct results
- [ ] Rate limiting active
- [ ] CORS configured

---

## Sprint 4: Frontend Core (Week 4-5)

### Frontend - Project Setup
- [ ] **FE-1.1** Initialize SolidJS project with TypeScript
- [ ] **FE-1.2** Install dependencies: `solid-js`, `@solidjs/router`, `maplibre-gl`
- [ ] **FE-1.3** Install UI dependencies: `tailwindcss`, `flowbite`
- [ ] **FE-1.4** Configure Vite with path aliases
- [ ] **FE-1.5** Setup Tailwind config (colors, fonts)
- [ ] **FE-1.6** Implement basic layout (Header, Map Container)

### Frontend - Map Component
- [ ] **FE-2.1** Create `Map.tsx` with MapLibre GL JS initialization
  - _depends_on_: FE-1.2
- [ ] **FE-2.2** Configure Maptiler Vector Tile source
  - _depends_on_: FE-2.1, EXT-1.3
- [ ] **FE-2.3** Sync Map Viewport with Global State (Signals)
  - _depends_on_: FE-2.1
- [ ] **FE-2.4** Implement custom markers for locations
- [ ] **FE-2.5** Handle map events: `click`, `moveend`, `load`
- [ ] **FE-2.6** Implement marker clustering for dense areas

### Frontend - Search & Filter
- [ ] **FE-2.7** Create `SearchBar.tsx` with debounce
- [ ] **FE-2.8** Create `CategoryFilter.tsx` (dropdown/horizontal scroll)
- [ ] **FE-2.9** Create Radius slider (500m - 50km)
- [ ] **FE-2.10** Connect filters to SearchStore

### Frontend - Location Form
- [ ] **FE-2.11** Create `LocationForm.tsx`
- [ ] **FE-2.12** Implement Map Picker (click to set lat/lng)
- [ ] **FE-2.13** Implement Image Upload Preview (max 5 images)
- [ ] **FE-2.14** Client-side validation
- [ ] **FE-2.15** Form submission handling

### Frontend - Location Detail
- [ ] **FE-2.16** Create Location Detail Modal/Drawer
- [ ] **FE-2.17** Implement Image Gallery (Carousel)
- [ ] **FE-2.18** Display distance from user location

### 🔲 Sprint 4 Checkpoint
- [ ] Map renders with Maptiler tiles
- [ ] Markers display on map
- [ ] Search/Filter UI functional
- [ ] Location form submits successfully
- [ ] Detail view shows all information

---

## Sprint 5: API Integration & State (Week 5-6)

### Frontend - API Client
- [ ] **FE-3.1** Setup fetch wrapper with Base URL
- [ ] **FE-3.2** Implement request/response interceptors
- [ ] **FE-3.3** Create `api/locations.ts`
- [ ] **FE-3.4** Create `api/images.ts`
- [ ] **FE-3.5** Error handling for API calls

### Frontend - State Management
- [ ] **FE-3.6** Implement `createResource` for location fetching
- [ ] **FE-3.7** Create `useGeolocation` primitive
- [ ] **FE-3.8** Implement SearchStore for filters
- [ ] **FE-3.9** Implement viewport-based lazy loading

### Frontend - Responsive Design
- [ ] **FE-4.1** Mobile-first layout (Bottom Sheet on mobile)
- [ ] **FE-4.2** Desktop layout (Sidebar)
- [ ] **FE-4.3** Touch gesture support for map
- [ ] **FE-4.4** Responsive map controls

### Security - Data Protection
- [ ] **SEC-2.1** Verify image magic bytes on upload
- [ ] **SEC-2.2** Strip EXIF metadata from images
- [ ] **SEC-2.3** Audit `.env` usage
- [ ] **SEC-2.4** Ensure ModerationLog captures audit trail
- [ ] **SEC-2.5** Disable/protect Swagger UI in production

### 🔲 Sprint 5 Checkpoint
- [ ] Frontend fully integrated with Backend
- [ ] Geolocation working
- [ ] Lazy loading on map viewport change
- [ ] Responsive on mobile and desktop

---

## Sprint 6: Testing & Polish (Week 6-7)

### Testing - Backend Unit Tests
- [ ] **TEST-1.1** Test Pydantic validations (boundary values)
- [ ] **TEST-1.2** Test Services with mocked DB
- [ ] **TEST-1.3** Test utility functions

### Testing - Frontend Unit Tests
- [ ] **TEST-1.4** Test utility functions (formatters)
- [ ] **TEST-1.5** Test state logic (Stores/Signals)

### Testing - Integration Tests
- [ ] **TEST-2.1** Setup TestClient with Dockerized test database
- [ ] **TEST-2.2** Test workflow: Create Location → Upload Image → Search → Verify
- [ ] **TEST-2.3** Test database rollbacks per test

### Testing - E2E Tests
- [ ] **TEST-3.1** Setup Playwright
- [ ] **TEST-3.2** Test: Visitor opens map → Pan/Zoom → Click marker → See details
- [ ] **TEST-3.3** Test: Contributor adds place → Fills form → Uploads → Submits
- [ ] **TEST-3.4** Test: Search with keyword → Adjust radius → Verify results

### Testing - Performance
- [ ] **TEST-4.1** Setup Locust for load testing
- [ ] **TEST-4.2** Test 500 concurrent users scenario
- [ ] **TEST-4.3** Verify 95th percentile < 500ms
- [ ] **TEST-4.4** Lighthouse audit (target > 90)

### Database - Seed Data
- [ ] **DB-4.1** Create script to generate 1000+ test locations
- [ ] **DB-4.2** Verify spatial index performance

### 🔲 Sprint 6 Checkpoint
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met

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

| Category | Total Tasks | Priority |
|----------|-------------|----------|
| DevOps | 17 | P0 |
| Database | 10 | P0 |
| Backend | 34 | P0 |
| Frontend | 31 | P0 |
| Security | 10 | P1 |
| Testing | 14 | P1 |
| External | 4 | P0 |
| **Total** | **120** | - |

---

## Notes

- Tasks prefixed with role code: `BE-` (Backend), `FE-` (Frontend), `DB-` (Database), `DEV-` (DevOps), `SEC-` (Security), `TEST-` (Testing), `EXT-` (External Services)
- `_depends_on_`: Indicates tasks that must be completed first
- Checkpoints at end of each sprint to validate progress
- All tasks should be tracked in project management tool (GitHub Issues, Jira, Linear)
- Blockers should be escalated immediately

---

## Quick Reference: Critical Dependencies

| Task | Depends On | Blocks |
|------|------------|--------|
| DB-1.1 (init.sql) | DEV-1.3 | DB-1.4, DB-2.1 |
| DB-2.1 (migration) | BE-2.4 | BE-3.6, BE-3.11 |
| BE-2.1 (Location model) | DB-1.4 | BE-2.2, BE-2.3, DB-2.1 |
| FE-2.2 (Maptiler config) | EXT-1.3 | FE-2.4, FE-2.5 |
| FE-5.1 (prod build) | FE-1.* ~ FE-4.* | DEV-2.2, Deployment |
