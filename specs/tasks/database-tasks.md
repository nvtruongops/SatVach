# Database Tasks (PostgreSQL + PostGIS)

**Role**: Database Administrator / Backend Developer
**Focus**: Schema Design, Data Integrity, Spatial Performance, Disaster Recovery.

---

## Phase 1: Schema & Tools Setup

### 1.1 PostGIS Initialization
- [ ] Ensure `CREATE EXTENSION IF NOT EXISTS postgis;` runs on startup.
- [ ] Verify `geometry` type availability.

### 1.2 Alembic Setup
- [ ] Initialize Alembic: `alembic init alembic`.
- [ ] Configure `env.py` to import SQLAlchemy metadata.
- [ ] Set up async migration runner.

---

## Phase 2: Migration Management

### 2.1 Initial Schema Migration
- [ ] Generate migration for `locations`, `images`, `moderation_logs`.
- [ ] Verify `Geometry` columns are correctly typed.

### 2.2 Indexing Migration
- [ ] **GIST** index on `locations.geom` (Critical for spatial performance).
- [ ] **GIN** index for Full-Text Search on `name` and `description`.
- [ ] **B-Tree** indexes on `category`, `status`, `created_at`.

---

## Phase 3: Performance Tuning

### 3.1 Query Analysis
- [ ] Use `EXPLAIN ANALYZE` on spatial queries to ensure Index usage.
- [ ] Tune `work_mem` for complex spatial joins if needed.

### 3.2 Maintenance Scripts
- [ ] Script for `VACUUM ANALYZE` (if not auto-managed).
- [ ] Backup scripts (pg_dump).

---

## Phase 4: Seed Data

### 4.1 Mock Data Generation
- [ ] Script to generate 1000+ random locations within HCM/Hanoi bounds.
- [ ] Verify spatial index performance (< 500ms response).

---

## Phase 5: Production Hardening 🔴

### 5.1 Connection Pooling (PgBouncer)
- [ ] Deploy **PgBouncer** as connection pool proxy.
- [ ] Configure Transaction Pooling mode.
- [ ] Set `max_client_conn` and `default_pool_size`.
- [ ] Health check integration with Docker.

### 5.2 Read Replicas Setup
- [ ] Configure PostgreSQL **Streaming Replication**.
- [ ] Setup Read Replica for reporting/search queries.
- [ ] Update application to route read-only queries to replica.
- [ ] Test failover scenarios.

### 5.3 Point-in-Time Recovery (PITR)
- [ ] Enable **WAL archiving** (`archive_mode = on`).
- [ ] Configure `pg_basebackup` for base backups.
- [ ] Store WAL archives in MinIO (S3-compatible).
- [ ] Document and test recovery procedure.

### 5.4 Database Monitoring
- [ ] Enable `pg_stat_statements` extension.
- [ ] Monitor slow queries (> 100ms).
- [ ] Setup alerts for: Connection exhaustion, Disk usage > 80%, Replication lag.
- [ ] Consider Prometheus `postgres_exporter` + Grafana dashboards.

### 5.5 Data Archiving Strategy
- [ ] Define retention policy (e.g., archive locations > 2 years old).
- [ ] Implement `archive_locations` table (partitioned by year).
- [ ] Scheduled job to move old data to archive.

### 5.6 GDPR / Data Privacy Compliance
- [ ] Implement hard delete capability for user data on request.
- [ ] Anonymization strategy for historical data.
- [ ] Audit trail for data deletion requests.
- [ ] Data export endpoint (JSON/CSV).

### 5.7 Disaster Recovery Testing
- [ ] Document Recovery Time Objective (RTO): Target < 1 hour.
- [ ] Document Recovery Point Objective (RPO): Target < 15 minutes.
- [ ] Quarterly disaster recovery drills.
- [ ] Runbook for failover to replica.
