-- ============================================
-- SatVach Database Initialization
-- PostGIS Extension + Initial Setup
-- ============================================

-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for Full-Text Search (trigram matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable uuid-ossp for UUID generation (useful for image filenames)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify PostGIS installation
-- Run: SELECT PostGIS_Version();

-- ============================================
-- Note: Tables will be created via Alembic migrations
-- This file only enables extensions
-- ============================================
