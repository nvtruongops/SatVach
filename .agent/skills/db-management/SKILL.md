---
name: db-management
description: Guidelines for PostGIS Database Management - Dự Án Sát Vách
---

# Database Management Guidelines - Dự Án Sát Vách

## Tech Stack
- **Engine**: PostgreSQL 15
- **Extension**: PostGIS 3.3
- **Docker Image**: postgis/postgis:15-3.3
- **Migration**: Alembic
- **ORM**: SQLAlchemy 2.0 + GeoAlchemy2

## Core Principles

### 1. Spatial Data Types
- **GEOGRAPHY vs GEOMETRY**:
  - **GEOGRAPHY(POINT, 4326)**: Dùng cho GPS coordinates (lat/lng), tính khoảng cách bằng meters trên Earth sphere.
  - **GEOMETRY**: Dùng cho projected coordinates, nhanh hơn nhưng cần projection.
- **Recommendation**: Dùng `GEOGRAPHY(POINT, 4326)` cho dự án Sát Vách.
  ```sql
  CREATE TABLE items (
      id SERIAL PRIMARY KEY,
      location GEOGRAPHY(POINT, 4326) NOT NULL
  );
  ```

### 2. Spatial Indexing (BẮT BUỘC!)
- **GIST Index**: LUÔN LUÔN tạo GIST index trên spatial columns.
  ```sql
  CREATE INDEX idx_items_location ON items USING GIST(location);
  ```
- **Performance Impact**: Tăng tốc spatial queries lên 1000x.
- **Verify Index**: Kiểm tra index đã được tạo.
  ```sql
  SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename = 'items';
  ```

### 3. Common PostGIS Functions

#### ST_MakePoint - Tạo Point từ coordinates
```sql
-- Tạo point từ longitude, latitude
INSERT INTO items (title, location) VALUES
('Test Item', ST_MakePoint(106.6297, 10.8231));
```

#### ST_DWithin - Tìm trong bán kính
```sql
-- Tìm items trong bán kính 2000m
SELECT * FROM items
WHERE ST_DWithin(
    location,
    ST_MakePoint(106.6297, 10.8231),
    2000  -- meters
);
```

#### ST_Distance - Tính khoảng cách
```sql
-- Tính khoảng cách và sắp xếp
SELECT 
    id, 
    title,
    ST_Distance(location, ST_MakePoint(106.6297, 10.8231)) as distance_meters
FROM items
ORDER BY distance_meters
LIMIT 10;
```

#### ST_AsGeoJSON - Export GeoJSON
```sql
-- Convert geometry sang GeoJSON
SELECT 
    id,
    title,
    ST_AsGeoJSON(location)::json as location
FROM items;
```

### 4. Migration Workflow (Alembic)

#### Setup Alembic
```bash
# Initialize Alembic
alembic init alembic

# Edit alembic.ini - set database URL
sqlalchemy.url = postgresql+asyncpg://user:pass@localhost/satvach
```

#### Create Migration
```bash
# Auto-generate migration từ SQLAlchemy models
alembic revision --autogenerate -m "Create items table"

# Review migration file trong alembic/versions/
```

#### Review Migration (QUAN TRỌNG!)
- **Spatial Columns**: Alembic có thể không detect đúng Geography type.
  ```python
  # Trong migration file, sửa thành:
  op.add_column('items', 
      sa.Column('location', 
          geoalchemy2.types.Geography(
              geometry_type='POINT', 
              srid=4326
          ), 
          nullable=False
      )
  )
  ```
- **GIST Index**: Alembic thường bỏ qua GIST index, phải thêm thủ công.
  ```python
  # Thêm vào migration file:
  op.create_index(
      'idx_items_location',
      'items',
      ['location'],
      postgresql_using='gist'
  )
  ```

#### Apply Migration
```bash
# Run migrations
alembic upgrade head

# Rollback 1 version
alembic downgrade -1

# Check current version
alembic current
```

### 5. Docker Setup

#### docker-compose.yml
```yaml
postgres:
  image: postgis/postgis:15-3.3
  environment:
    POSTGRES_DB: satvach
    POSTGRES_USER: admin
    POSTGRES_PASSWORD: admin
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
  ports:
    - "5432:5432"
```

#### init.sql
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_items_location ON items USING GIST(location);

-- Create timestamp index
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
```

### 6. Performance Optimization

#### Analyze Tables
```sql
-- Update statistics sau khi insert nhiều data
ANALYZE items;
```

#### Vacuum
```sql
-- Clean up dead rows
VACUUM ANALYZE items;
```

#### Query Optimization
```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM items
WHERE ST_DWithin(location, ST_MakePoint(106.6297, 10.8231), 2000);

-- Kiểm tra có dùng index không (phải thấy "Index Scan using idx_items_location")
```

#### Connection Pooling
- SQLAlchemy tự động quản lý connection pool.
- Default: 5 connections, max overflow: 10.
- Adjust nếu cần:
  ```python
  engine = create_async_engine(
      DATABASE_URL,
      pool_size=20,
      max_overflow=10
  )
  ```

### 7. Backup & Restore

#### Backup Database
```bash
# Backup toàn bộ database
docker exec satvach-db pg_dump -U admin satvach > backup.sql

# Backup chỉ schema
docker exec satvach-db pg_dump -U admin -s satvach > schema.sql

# Backup chỉ data
docker exec satvach-db pg_dump -U admin -a satvach > data.sql
```

#### Restore Database
```bash
# Restore từ backup
docker exec -i satvach-db psql -U admin satvach < backup.sql
```

### 8. Monitoring

#### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('satvach'));
```

#### Check Table Size
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Check Active Connections
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'satvach';
```

#### Slow Query Log
```sql
-- Enable slow query log (queries > 1 second)
ALTER DATABASE satvach SET log_min_duration_statement = 1000;
```

### 9. Common Issues & Solutions

#### Issue: Spatial queries chậm
- **Solution**: Kiểm tra GIST index đã tồn tại chưa.
- **Verify**: `EXPLAIN ANALYZE` phải thấy "Index Scan".

#### Issue: Alembic không detect Geography column
- **Solution**: Thêm thủ công trong migration file.

#### Issue: Connection pool exhausted
- **Solution**: Tăng `pool_size` hoặc kiểm tra connection leaks.

#### Issue: PostGIS extension not found
- **Solution**: Chạy `CREATE EXTENSION postgis;` trong database.

### 10. Best Practices

1. **Luôn dùng GIST index** cho spatial columns.
2. **Review migrations** trước khi apply.
3. **Backup trước khi migrate** production database.
4. **Test spatial queries** với EXPLAIN ANALYZE.
5. **Monitor database size** và connection count.
6. **Vacuum định kỳ** để maintain performance.
7. **Dùng Geography type** cho GPS coordinates.
8. **Limit results** trong queries (pagination).
9. **Index timestamp columns** nếu sort by date.
10. **Keep migrations small** và focused.
