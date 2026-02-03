# Backend Tasks (FastAPI + PostGIS + MinIO)

**Role**: Backend Developer
**Focus**: API Design, Business Logic, Database Interactions, Performance.

---

## Phase 1: Project Initialization & Structure

### 1.1 Setup FastAPI Project Structure
- [ ] Initialize project with standard layout: `src/api`, `src/core`, `src/db`, `src/services`, `src/models`.
- [ ] Configure `poetry` or `pip` (requirements.txt) for dependency management.
- [ ] Setup `src/core/config.py` using `pydantic-settings` for Environment Variables.
- [ ] _Ref: Tech Stack 2.1_

### 1.2 Database & Storage Connection
- [ ] Implement `AsyncSession` setup for SQLAlchemy in `src/db/session.py`.
- [ ] Configure `aioboto3` client for asynchronous MinIO access.
- [ ] Implement Health Check endpoints (`/health`, `/ready`).
- [ ] _Ref: Tech Stack 2.2, 2.3_

---

## Phase 2: Core Models & Migrations

### 2.1 Implement SQLAlchemy Models
- [ ] Create `Location` model with `Geometry('POINT')` (PostGIS).
- [ ] Create `Image` model (1-n relationship with Location).
- [ ] Create `ModerationLog` model.
- [ ] Ensure correct Foreign Keys and Cascade rules.

### 2.2 Pydantic Schemas
- [ ] `LocationCreate`, `LocationResponse`, `LocationSearchParams`.
- [ ] `ImageUploadResponse`.
- [ ] Implement custom validators (coordinate ranges, string lengths).

---

## Phase 3: Service Layer Implementation

### 3.1 Storage Service (MinIO)
- [ ] Implement `upload_image` with validation (File type, Size < 5MB).
- [ ] Image optimization (Resize/Compression) using `Pillow`.
- [ ] Implement `delete_image` and `get_presigned_url`.

### 3.2 Spatial Search Service
- [ ] `ST_DWithin` query builder for Radius Search.
- [ ] `ST_MakeEnvelope` for Viewport-based lazy loading.
- [ ] Text Search (Postgres Full-Text Search) combined with Spatial filters.
- [ ] Optimize queries with `selectinload` to avoid N+1.

### 3.3 Location Service
- [ ] CRUD operations for Locations.
- [ ] Transaction management for creating Location + Images.
- [ ] Moderation status handling (`pending`, `approved`, `rejected`).

---

## Phase 4: API Endpoints (v1)

### 4.1 Public Location Endpoints
- [ ] `POST /locations`: Submit new location.
- [ ] `GET /locations/search`: Radius search with filters.
- [ ] `GET /locations/viewport`: Bounding box search.
- [ ] `GET /locations/{id}`: Detailed view.

### 4.2 Image Endpoints
- [ ] `POST /images/upload`: Handle multipart upload.

### 4.3 Admin/Moderation Endpoints
- [ ] `GET /admin/locations`: List pending locations.
- [ ] `PATCH /admin/locations/{id}/status`: Approve/Reject.

---

## Phase 5: Production Hardening 🔴

### 5.1 Structured Logging
- [ ] Implement JSON-based logging (e.g., `structlog`, `python-json-logger`).
- [ ] Add **Correlation ID** middleware (X-Request-ID propagation).
- [ ] Configure log levels per environment (DEBUG dev, INFO prod).
- [ ] Log to stdout for Docker compatibility (12-factor app).

### 5.2 Distributed Tracing (OpenTelemetry)
- [ ] Integrate `opentelemetry-instrumentation-fastapi`.
- [ ] Configure Tracer Provider (export to Jaeger/Zipkin/OTLP).
- [ ] Add custom spans for critical operations (DB queries, MinIO calls).

### 5.3 Circuit Breaker & Resilience
- [ ] Implement Circuit Breaker for MinIO calls (e.g., `pybreaker`).
- [ ] Add Retry with Exponential Backoff for transient failures.
- [ ] Define Fallback strategies (e.g., return cached data if DB timeout).

### 5.4 Background Jobs
- [ ] Setup **ARQ** (async Redis queue) or **Celery** for background tasks.
- [ ] Offload: Image thumbnail generation, Email sending.
- [ ] Implement Dead Letter Queue (DLQ) for failed jobs.

### 5.5 Email & Notification Service
- [ ] Integrate Email provider (SendGrid, Mailgun, or SMTP).
- [ ] Template-based emails (Jinja2).
- [ ] Notification abstraction layer (email, push, SMS future).

### 5.6 API Versioning Strategy
- [ ] Document versioning policy (URL path `/api/v1/`, `/api/v2/`).
- [ ] Define deprecation strategy (Sunset headers).
- [ ] Plan for backward compatibility during transitions.

### 5.7 WebSocket for Real-time Updates (Future)
- [ ] Design WebSocket gateway for live map updates.
- [ ] Use Redis Pub/Sub as message broker.

### 5.8 Data Export/Import
- [ ] API endpoint for bulk data export (CSV, GeoJSON).
- [ ] Admin tool for bulk import with validation.
- [ ] GDPR: User data export on request.
