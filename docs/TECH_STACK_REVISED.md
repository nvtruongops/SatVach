# TECH STACK CUỐI CÙNG CHO DỰ ÁN SÁT VÁCH
## SolidJS + Vite + MapLibre GL JS + Python FastAPI + PostgreSQL/PostGIS

---

## 1. FRONTEND - WEB APP

### 1.1 Core Framework: SolidJS + Vite

**Quyết định:** SolidJS với Vite

**Lý do chọn SolidJS:**
- ⚡ Hiệu năng vượt trội: Nhanh hơn React 2-3x trong benchmark
- 📦 Bundle size cực nhỏ: ~7KB core (React ~45KB)
- 🎯 Fine-grained reactivity: Chỉ update đúng phần thay đổi, không re-render toàn bộ component
- 🔄 Syntax quen thuộc: Giống React JSX, dễ học
- 🚀 Vite integration hoàn hảo: HMR cực nhanh
- 💪 TypeScript support tốt
- 🆓 Hoàn toàn miễn phí, MIT license

### 1.2 Map Library: MapLibre GL JS

**Quyết định:** MapLibre GL JS (Vector Tiles)

**Lý do:**
- ⚡ Vector tiles - mượt mà, hiệu năng cao
- 🎨 Styling linh hoạt (JSON style spec)
- 🔄 Xoay bản đồ, 3D buildings
- 📱 Cùng codebase cho web & mobile (MapLibre Native)
- 🆓 Hoàn toàn miễn phí, open source (BSD license)
- 🚀 WebGL rendering - 60fps

**Vector Tile Sources (Miễn Phí):**

**Quyết định:** Sử dụng Maptiler Free Tier (100,000 tile loads/tháng)

**Lý do chọn Maptiler:**
- ✅ Free tier hào phóng: 100,000 loads/tháng (~2,000-3,000 users)
- ✅ Customize style được (màu sắc, font, layers) qua UI editor
- ✅ Nhiều style templates đẹp sẵn (Streets, Outdoor, Satellite, Dark)
- ✅ Dữ liệu chất lượng cao (OSM + proprietary data)
- ✅ SLA và support chính thức
- ✅ Analytics dashboard để theo dõi usage
- ✅ Độ trễ thấp (CDN toàn cầu)
- ✅ Phù hợp cho MVP và giai đoạn growth

**Cách đăng ký:**
1. Truy cập https://www.maptiler.com/cloud/
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard → API Keys → Copy key
4. Chọn style template hoặc customize trong Map Editor

**Style URLs có sẵn:**
- Streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_KEY`
- Basic: `https://api.maptiler.com/maps/basic-v2/style.json?key=YOUR_KEY`
- Bright: `https://api.maptiler.com/maps/bright-v2/style.json?key=YOUR_KEY`
- Pastel: `https://api.maptiler.com/maps/pastel/style.json?key=YOUR_KEY`
- Satellite Hybrid: `https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_KEY`

**Quản lý API Key:**
- Lưu trong file `.env` (không commit lên Git)
- Sử dụng environment variables
- Có thể restrict domain trong dashboard để tránh abuse

**Giới hạn Free Tier:**
- 100,000 tile loads/tháng
- Unlimited map views
- Unlimited API calls (geocoding, routing)
- Vượt quota: $25/100,000 loads thêm

**Ước tính usage:**
- 1 user session trung bình: 30-50 tile loads
- 100,000 loads ≈ 2,000-3,000 sessions
- Với 500-1,000 active users/tháng (mỗi user vào 3 lần) → Vừa đủ free tier

**Khi nào cần upgrade:**
- Khi có >3,000 sessions/tháng
- Khi cần features nâng cao (custom fonts, offline maps)
- Khi cần SLA cao hơn

**Plan B nếu vượt quota:**
- Chuyển sang Demo Tiles tạm thời (https://demotiles.maplibre.org/style.json)
- Hoặc implement caching layer (Redis) để giảm tile requests
- Hoặc upgrade lên paid plan ($49/tháng cho 500k loads)

**So sánh với các options khác:**
- Demo Tiles: Miễn phí không giới hạn nhưng không customize được
- Self-hosted: Chi phí cố định nhưng phức tạp, phù hợp khi >10k users


**Custom Styling (Dark Mode Example):**

**Advanced Features:**

---

### 1.3 UI Components & Styling

**Quyết định:** Flowbite + TailwindCSS

**Lý do chọn Flowbite:**
- 🎨 Component library đầy đủ (buttons, cards, modals, forms)
- 🚀 Built on TailwindCSS - không conflict
- 📱 Responsive design sẵn
- 🆓 Open source, miễn phí
- 📚 Documentation tốt
- ⚡ Không cần runtime JS (pure CSS)

**Modal Component (Flowbite):**

**Button Components:**

### 1.4 State Management

**SolidJS Stores (Built-in)**

---

## 2. BACKEND - SELF-HOSTED

### 2.1 Application Server: Python + FastAPI

**Quyết định:** Python + FastAPI

**Lý do chọn Python + FastAPI:**
- 🚀 Hiệu năng cao: Nhanh ngang Node.js (nhờ async/await)
- 📚 Ecosystem GIS mạnh: GeoAlchemy2, Shapely, PostGIS integration tốt
- 🔧 Dễ xử lý spatial data: Python có nhiều thư viện GIS mature
- 📖 Auto-generated API docs: Swagger UI và ReDoc tự động
- ✅ Type hints: Validation tự động với Pydantic
- 🐍 Syntax đơn giản: Dễ học, dễ maintain
- 🔄 Async support: Xử lý concurrent requests tốt
- 🆓 Hoàn toàn miễn phí, MIT license


**Features tự động của FastAPI:**
- Request validation: Tự động validate query params, body
- Response serialization: Tự động convert Python objects sang JSON
- API documentation: Swagger UI và ReDoc tự động generate
- Error handling: Tự động format error responses
- Dependency injection: Quản lý database connections, auth

**Spatial queries với GeoAlchemy2:**

FastAPI tích hợp tốt với GeoAlchemy2 để query PostGIS:
- ST_DWithin: Tìm items trong bán kính
- ST_Distance: Tính khoảng cách
- ST_MakePoint: Tạo point từ lat/lng
- ST_AsGeoJSON: Export GeoJSON

**Performance optimization:**
- Async/await: Xử lý concurrent requests không block
- Connection pooling: Tái sử dụng database connections
- Response caching: Cache với Redis
- Background tasks: Upload ảnh, send notifications async

**Docker configuration:**

Multi-stage build để giảm image size:
- Stage 1: Build dependencies
- Stage 2: Copy chỉ những gì cần thiết
- Final image: ~200MB (có thể giảm xuống ~150MB với Alpine)

**Environment variables:**
- DATABASE_URL: PostgreSQL connection string
- SECRET_KEY: JWT secret (nếu có auth)
- UPLOAD_DIR: Thư mục lưu ảnh
- MAX_FILE_SIZE: Giới hạn file upload
- CORS_ORIGINS: Allowed origins

**Development workflow:**
- Hot reload: Uvicorn tự động reload khi code thay đổi
- Type checking: MyPy để check types
- Linting: Ruff hoặc Black để format code
- Testing: Pytest với async support

---

### 2.2 Database: PostgreSQL + PostGIS

**Cài đặt trên Windows:**
1. Download PostgreSQL từ https://www.postgresql.org/download/windows/
2. Cài đặt với Stack Builder → chọn PostGIS extension

**Hoặc dùng Docker:**
```bash
docker run --name satvach-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=satvach \
  -p 5432:5432 \
  -v satvach-data:/var/lib/postgresql/data \
  -d postgis/postgis:15-3.3
```

**Schema SQL:**
```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tạo bảng items
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo spatial index (QUAN TRỌNG!)
CREATE INDEX idx_items_location ON items USING GIST(location);

-- Tạo index cho timestamp
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- Insert dữ liệu mẫu
INSERT INTO items (title, description, price, location) VALUES
('Xe đạp cũ', 'Xe đạp thể thao, còn mới 90%', 500000, ST_MakePoint(106.6297, 10.8231)),
('Laptop Dell', 'Dell Inspiron 15, i5 gen 10', 5000000, ST_MakePoint(106.6310, 10.8250)),
('Bàn học gỗ', 'Bàn học gỗ tự nhiên, 1m2', 800000, ST_MakePoint(106.6285, 10.8220));
```

**Database Connection với Python:**

FastAPI sử dụng SQLAlchemy với async support để kết nối PostgreSQL + PostGIS:
- AsyncEngine: Async database engine
- AsyncSession: Async session management
- Connection pooling: Tự động quản lý connections
- GeoAlchemy2: Extension để làm việc với PostGIS spatial types

**Configuration:**
- Lưu connection string trong `.env`
- Sử dụng environment variables
- Pool size: 20 connections (có thể điều chỉnh)
- Timeout: 30 seconds
- Echo SQL: Bật trong development để debug

---

### 2.2 Database: PostgreSQL + PostGIS

**Quyết định:** Sử dụng Docker để chạy PostgreSQL + PostGIS

**Lý do chọn Docker:**
- ✅ Setup nhanh: 1 lệnh là có database sẵn sàng
- ✅ Không cần cài đặt trên Windows: Tránh conflict với software khác
- ✅ Dễ backup và restore: Chỉ cần copy volume
- ✅ Dễ migrate: Chuyển sang VPS chỉ cần copy docker-compose.yml
- ✅ Consistent environment: Dev và Production giống nhau
- ✅ Dễ upgrade: Đổi version trong docker-compose.yml
- ✅ Isolation: Database chạy riêng, không ảnh hưởng hệ thống

**Docker Image: postgis/postgis**

Official image từ PostGIS team:
- Base: PostgreSQL official image
- PostGIS extension: Pre-installed và configured
- Versions: Hỗ trợ PostgreSQL 12-16 + PostGIS 3.x
- Size: ~300MB (compressed), ~800MB (extracted)
- Updates: Thường xuyên, security patches nhanh

**Recommended version:**
- PostgreSQL 15 + PostGIS 3.3: `postgis/postgis:15-3.3`
- Stable, mature, performance tốt
- Long-term support

**Docker run command:**

Chạy PostgreSQL + PostGIS container:
- Port: 5432 (map ra host)
- Volume: Persist data vào folder local
- Environment: Set password, database name
- Restart policy: Always restart khi server reboot

**Environment variables:**
- POSTGRES_DB: Tên database (satvach)
- POSTGRES_USER: Username (admin hoặc postgres)
- POSTGRES_PASSWORD: Password (đổi trong production!)
- POSTGRES_INITDB_ARGS: Init arguments (optional)

**Volume mounting:**

Data persistence:
- Container path: /var/lib/postgresql/data
- Host path: ./data/postgres hoặc named volume
- Backup: Chỉ cần copy folder này
- Restore: Copy folder vào và start container

**PostGIS Extension:**

Tự động enabled trong postgis/postgis image:
- CREATE EXTENSION postgis: Đã chạy sẵn
- Spatial functions: ST_Distance, ST_DWithin, ST_MakePoint
- Spatial indexes: GIST index support
- Geography type: Tính toán trên sphere (Earth)

**Items table structure:**
- id: Primary key (SERIAL)
- title: Tiêu đề (VARCHAR 255)
- description: Mô tả (TEXT)
- price: Giá (DECIMAL)
- location: Vị trí (GEOGRAPHY POINT)
- image_url: Link ảnh (TEXT)
- created_at: Timestamp
- updated_at: Timestamp

**Spatial Indexes (QUAN TRỌNG!):**

GIST index cho location column:
- Tăng tốc spatial queries lên 1000x
- Bắt buộc phải có cho production
- Syntax: CREATE INDEX USING GIST(location)

**Sample data:**

Insert test data:
- 3-5 items ở các vị trí khác nhau
- Dùng ST_MakePoint(lng, lat) để tạo location
- Test spatial queries

**Common Spatial Queries:**

ST_DWithin: Tìm items trong bán kính
- Input: Point, radius (meters)
- Output: Boolean
- Use case: Tìm items gần user

ST_Distance: Tính khoảng cách
- Input: 2 points
- Output: Distance (meters)
- Use case: Sắp xếp theo khoảng cách

ST_MakePoint: Tạo point từ coordinates
- Input: longitude, latitude
- Output: POINT geometry
- Use case: Insert location

**Performance Tips:**

Optimization strategies:
- Spatial indexes: Bắt buộc
- Analyze tables: Chạy ANALYZE sau khi insert nhiều data
- Vacuum: Chạy VACUUM định kỳ
- Connection pooling: Giới hạn max connections
- Query optimization: Chỉ SELECT columns cần thiết

**Backup Strategy:**

Backup methods:
- pg_dump: Export SQL file
- Volume copy: Copy data folder
- Continuous backup: WAL archiving (advanced)

Backup frequency:
- Daily: Automated backup
- Before deploy: Manual backup
- After major changes: Manual backup

**Monitoring:**

Metrics cần theo dõi:
- Connection count: Tránh exceed max_connections
- Query performance: Slow query log
- Disk usage: Database size growth
- Cache hit ratio: Tune shared_buffers

**Docker Compose Integration:**

PostgreSQL service trong docker-compose.yml:
- Service name: postgres
- Image: postgis/postgis:15-3.3
- Ports: 5432:5432
- Volumes: postgres-data
- Environment: DB credentials
- Networks: Backend network
- Health check: pg_isready command
- Restart: always

**Connection từ FastAPI:**

Database URL format:
- postgresql+asyncpg://user:pass@postgres:5432/satvach
- Host: postgres (service name trong docker-compose)
- Port: 5432 (internal port)
- Driver: asyncpg (async PostgreSQL driver)

**Database Migration & Auto Table Creation:**

**Quyết định:** Sử dụng Alembic để tự động tạo tables khi chạy Backend

**Alembic - Database Migration Tool:**

Alembic là công cụ migration chính thức của SQLAlchemy:
- Tự động generate migration scripts từ models
- Version control cho database schema
- Rollback support (undo migrations)
- Team collaboration: Mọi người cùng schema version
- Production safe: Test migrations trước khi deploy

**Lý do dùng Alembic thay vì chạy SQL file:**
- ✅ Tự động: Không cần viết SQL thủ công
- ✅ Type-safe: Sync với Python models
- ✅ Version control: Track schema changes trong Git
- ✅ Rollback: Undo changes nếu có lỗi
- ✅ Team-friendly: Merge migrations dễ dàng
- ✅ Production-ready: Chạy migrations trong CI/CD

**Workflow:**

1. Define models trong Python (SQLAlchemy)
2. Alembic auto-generate migration script
3. Review migration script
4. Run migration khi start backend
5. Tables tự động được tạo

**Auto-run migrations on startup:**

FastAPI có thể tự động chạy migrations khi start:
- Lifespan events: Run migrations trước khi accept requests
- Health check: Verify database ready
- Idempotent: Chạy nhiều lần không bị lỗi

**Migration strategies:**

Development:
- Auto-generate migrations từ model changes
- Run migrations locally
- Commit migration files vào Git

Production:
- Run migrations trong Docker entrypoint
- Hoặc run manual trước khi deploy
- Backup database trước khi migrate

**Alternative: SQLAlchemy create_all()**

Đơn giản hơn Alembic nhưng ít features:
- Base.metadata.create_all(): Tạo tất cả tables
- Chỉ tạo, không update existing tables
- Không có version control
- Không rollback được
- Phù hợp cho MVP/prototype

**Khi nào dùng create_all():**
- MVP nhanh, chưa cần migration phức tạp
- Database schema chưa stable
- Team nhỏ, ít người

**Khi nào dùng Alembic:**
- Production application
- Team nhiều người
- Schema thay đổi thường xuyên
- Cần rollback support

**Khuyến nghị cho Sát Vách:**

Phase 1 (MVP): Dùng create_all()
- Nhanh, đơn giản
- Schema còn thay đổi nhiều
- Chưa có users thật

Phase 2 (Production): Migrate sang Alembic
- Khi có users và data thật
- Cần version control schema
- Cần rollback safety

**Setup Alembic:**

Installation:
- pip install alembic
- alembic init alembic (tạo folder config)

Configuration:
- alembic.ini: Database URL
- env.py: Import models
- versions/: Migration scripts

Commands:
- alembic revision --autogenerate: Generate migration
- alembic upgrade head: Run migrations
- alembic downgrade -1: Rollback 1 version

**Auto-run on FastAPI startup:**

Lifespan event:
- Async context manager
- Run migrations before app starts
- Handle errors gracefully
- Log migration status

**Docker integration:**

Entrypoint script:
- Wait for PostgreSQL ready
- Run Alembic migrations
- Start FastAPI server

Benefits:
- Zero manual steps
- Consistent deployments
- No forgotten migrations

**Migration best practices:**

1. Always review auto-generated migrations
2. Test migrations on staging first
3. Backup before production migrations
4. Keep migrations small and focused
5. Never edit old migrations (create new ones)
6. Document complex migrations

**Spatial indexes in migrations:**

Alembic hỗ trợ tạo GIST indexes:
- op.create_index() với postgresql_using='gist'
- Tự động tạo spatial indexes
- Rollback cũng xóa indexes

**Initial Setup Steps:**

1. Start container với docker-compose
2. Wait for health check pass
3. Backend auto-run Alembic migrations
4. Tables và indexes tự động được tạo
5. Verify PostGIS extension enabled
6. Ready to accept requests
4. Run migration scripts (create tables)
5. Create spatial indexes
6. Insert sample data
7. Test spatial queries

**Troubleshooting:**

Common issues:
- Port 5432 already in use: Stop local PostgreSQL
- Permission denied: Check volume permissions
- Connection refused: Check container logs
- Slow queries: Missing spatial index

---

### 2.3 File Upload (Ảnh sản phẩm)

**Python file upload với FastAPI:**

FastAPI có built-in support cho file upload:
- UploadFile type: Async file handling
- File validation: Size, type checking
- Streaming: Không load toàn bộ file vào memory
- Multiple files: Upload nhiều files cùng lúc

**Storage options:**

**Quyết định:** Sử dụng MinIO - S3-compatible Object Storage (Self-hosted)

**MinIO - Open Source Object Storage:**

MinIO là object storage server tương thích 100% với Amazon S3 API:
- S3-compatible: Dùng được với mọi S3 client libraries
- Self-hosted: Chạy trong Docker, không phụ thuộc AWS
- High performance: Throughput cao, latency thấp
- Lightweight: Docker image chỉ ~100MB
- Free & Open Source: Apache License 2.0
- Production-ready: Được dùng bởi nhiều công ty lớn

**Lý do chọn MinIO thay vì local storage:**
- ✅ Scalable: Dễ scale khi cần (add more nodes)
- ✅ S3 API: Dễ migrate lên AWS S3 sau này
- ✅ CDN-ready: Có thể dùng với CloudFlare R2, Backblaze B2
- ✅ Versioning: Hỗ trợ file versioning
- ✅ Access control: Bucket policies, IAM
- ✅ Web UI: Quản lý files qua browser
- ✅ Backup: Dễ backup/restore với mc (MinIO Client)

**MinIO Docker Setup:**

Docker Compose service:
- Service name: minio
- Image: minio/minio:latest
- Ports: 9000 (API), 9001 (Console UI)
- Volumes: minio-data (persist files)
- Environment: Root user/password
- Command: server /data --console-address ":9001"

**MinIO Console UI:**

Web interface tại http://localhost:9001:
- Upload/download files
- Create buckets
- Manage access policies
- View storage metrics
- User management

**Buckets structure:**

Tạo các buckets cho từng loại file:
- satvach-items: Ảnh sản phẩm
- satvach-avatars: Avatar users
- satvach-thumbnails: Thumbnails (auto-generated)
- satvach-temp: Temporary uploads

**Access policies:**

Public read cho item images:
- Bucket policy: Allow GetObject
- Users có thể xem ảnh không cần auth
- Upload vẫn cần auth

**FastAPI integration:**

Python S3 client libraries:
- boto3: AWS official SDK (works với MinIO)
- aioboto3: Async version của boto3
- minio-py: MinIO official client

Recommended: aioboto3 (async, S3-compatible)

**Upload workflow:**

1. User upload file qua FastAPI endpoint
2. FastAPI validate file (size, type)
3. Generate unique filename (UUID + extension)
4. Upload to MinIO bucket
5. Get public URL
6. Save URL vào PostgreSQL
7. Return URL to frontend

**Image processing pipeline:**

Before upload to MinIO:
- Resize: Max 1920x1080 cho full size
- Compress: JPEG quality 85%, WebP quality 80%
- Thumbnail: 300x300 crop
- Watermark: Optional logo overlay

**CDN integration (Future):**

MinIO có thể làm origin cho CDN:
- CloudFlare R2: S3-compatible, free egress
- Backblaze B2: Rẻ hơn S3, S3-compatible
- CloudFlare CDN: Cache MinIO files

Workflow:
- Upload to MinIO
- CDN pull from MinIO
- Users download from CDN (fast, cached)

**Backup strategy:**

MinIO Client (mc) commands:
- mc mirror: Sync to another MinIO/S3
- mc cp: Copy files
- Scheduled backups: Cron job

Backup targets:
- Another MinIO instance (different server)
- AWS S3 (cold storage)
- Backblaze B2 (cheap backup)

**Storage costs comparison:**

Local storage (1TB):
- Cost: $0 (dùng disk có sẵn)
- Bandwidth: Free (local network)
- Backup: Manual

MinIO self-hosted (1TB):
- Cost: $0 (dùng disk có sẵn)
- Bandwidth: Free (local network)
- Backup: Easy với mc mirror
- Scalable: Add more disks

AWS S3 (1TB):
- Storage: $23/month
- Bandwidth: $90/TB egress
- Total: ~$113/month (nếu 1TB download)

CloudFlare R2 (1TB):
- Storage: $15/month
- Bandwidth: $0 (free egress!)
- Total: $15/month

**Migration path:**

Phase 1 (MVP): MinIO self-hosted
- Chi phí $0
- Đủ cho 0-5k users
- Dễ setup

Phase 2 (Growth): MinIO + CDN
- Add CloudFlare CDN
- Cache static files
- Giảm load cho MinIO

Phase 3 (Scale): Migrate to CloudFlare R2
- Chỉ đổi endpoint URL
- Code không cần thay đổi (S3-compatible)
- Free egress bandwidth

**Docker Compose integration:**

Services:
- minio: Object storage
- backend: FastAPI (connect to MinIO)
- postgres: Database (store file URLs)

Volumes:
- minio-data: Persist uploaded files

Networks:
- Internal network: Backend <-> MinIO
- External: Users <-> MinIO (public URLs)

**Environment variables:**

MinIO configuration:
- MINIO_ROOT_USER: Admin username
- MINIO_ROOT_PASSWORD: Admin password
- MINIO_DOMAIN: Domain for public URLs
- MINIO_SERVER_URL: API endpoint

FastAPI configuration:
- S3_ENDPOINT: http://minio:9000
- S3_ACCESS_KEY: MinIO access key
- S3_SECRET_KEY: MinIO secret key
- S3_BUCKET: Default bucket name

**Security best practices:**

1. Separate access keys: Mỗi service có key riêng
2. Bucket policies: Chỉ allow cần thiết
3. HTTPS: Dùng reverse proxy (Nginx)
4. Signed URLs: Temporary access cho private files
5. Rate limiting: Tránh abuse upload
6. Virus scanning: ClamAV integration (optional)

**Monitoring:**

MinIO metrics:
- Storage usage: Disk space used
- Request rate: Uploads/downloads per second
- Bandwidth: Network I/O
- Error rate: Failed requests

Alerts:
- Disk space >80%: Add more storage
- High error rate: Check logs
- Slow uploads: Check network

**Use cases:**

Item images:
- Upload khi đăng tin
- Public read access
- Thumbnail auto-generated
- Watermark optional

User avatars:
- Upload khi update profile
- Private access (signed URLs)
- Resize to 200x200
- Default avatar nếu không có

Thumbnails:
- Auto-generated từ full images
- 300x300 crop
- WebP format (smaller size)
- Cache-friendly

**Performance optimization:**

Upload optimization:
- Multipart upload: Files >5MB
- Parallel uploads: Multiple files
- Resume support: Continue failed uploads
- Client-side compression: Before upload

Download optimization:
- CDN caching: CloudFlare
- Browser caching: Cache-Control headers
- Image optimization: WebP, AVIF
- Lazy loading: Load images on scroll

**File validation:**
- Allowed types: JPEG, PNG, WebP
- Max size: 5MB per file
- Filename sanitization: Tránh path traversal attacks
- Virus scanning: ClamAV integration (optional)

**Image optimization:**
- Resize: Tự động resize về max width/height
- Compress: Giảm quality để tiết kiệm storage
- WebP conversion: Convert sang WebP để giảm size
- Thumbnail generation: Tạo thumbnail cho list view

---

## 3. DEPLOYMENT - TẠI NHÀ

### 3.1 Docker Compose Setup

**Docker Compose cho Python + FastAPI:**

Services cần thiết:
- PostgreSQL + PostGIS: Database
- FastAPI backend: Application server
- Nginx: Reverse proxy và serve static files
- Redis (optional): Caching layer

**Environment variables:**
- DATABASE_URL: Connection string
- SECRET_KEY: App secret
- UPLOAD_DIR: Upload directory
- CORS_ORIGINS: Allowed origins
- DEBUG: Debug mode (False in production)

**Volumes:**
- postgres-data: Database persistence
- uploads: File uploads persistence
- logs: Application logs

**Networks:**
- Backend network: Internal communication
- Frontend network: External access

**Health checks:**
- PostgreSQL: pg_isready
- FastAPI: /health endpoint
- Nginx: HTTP check

**docker-compose.yml structure:**

Services configuration:
- postgres: PostGIS image, port 5432
- backend: FastAPI app, port 8000
- nginx: Reverse proxy, port 80

**Dockerfile cho FastAPI:**

Multi-stage build strategy:
- Stage 1 (builder): Install dependencies
- Stage 2 (runtime): Copy only necessary files
- Base image: python:3.11-slim hoặc python:3.11-alpine
- Final size: ~200MB (slim) hoặc ~150MB (alpine)

**Optimization tips:**
- Use .dockerignore: Exclude __pycache__, .git, tests
- Layer caching: Copy requirements.txt first
- Minimal base image: Alpine Linux
- Remove build dependencies: Multi-stage build
- Use gunicorn + uvicorn workers: Production ASGI server

**Production ASGI server:**
- Gunicorn: Process manager
- Uvicorn workers: ASGI workers
- Worker count: (CPU cores * 2) + 1
- Worker class: uvicorn.workers.UvicornWorker
- Timeout: 30 seconds
- Keepalive: 5 seconds

**docker-compose.yml:**

Services:
- postgres: PostGIS database
- backend: FastAPI application  
- nginx: Reverse proxy

Volumes:
- postgres-data: Database persistence
- uploads: File storage

Networks:
- Internal network cho services

**Dockerfile cho Backend:**

Base: python:3.11-slim
Working dir: /app
Install: requirements.txt
Copy: application code
Expose: 8000
CMD: gunicorn with uvicorn workers

**Dockerfile cho Frontend:**

Base: node:18-alpine (build stage)
Build: npm run build
Runtime: nginx:alpine
Copy: dist files to nginx html
Expose: 80

---

### 3.2 Expose ra Internet: Cloudflare Tunnel

**Cài đặt:**
    image: postgis/postgis:15-3.3
    container_name: satvach-db
    environment:
      POSTGRES_DB: satvach
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build: ./satvach-backend
    container_name: satvach-api
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: satvach
      DB_USER: admin
      DB_PASSWORD: ${DB_PASSWORD}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  frontend:
    build: ./satvach-web
    container_name: satvach-web
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres-data:
```

**Dockerfile cho Backend:**
```dockerfile
# satvach-backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**Dockerfile cho Frontend:**
```dockerfile
# satvach-web/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 3.2 Expose ra Internet: Cloudflare Tunnel

**Quyết định:** Sử dụng Cloudflare Tunnel để expose server tại nhà ra internet

**Cloudflare Tunnel (Cloudflared):**

Cloudflare Tunnel tạo một kết nối bảo mật từ server tại nhà đến Cloudflare edge network:
- Không cần IP tĩnh
- Không cần mở port trên router
- HTTPS tự động (SSL certificate free)
- DDoS protection miễn phí
- Unlimited bandwidth (không giới hạn traffic)
- Zero Trust security
- Multiple services trên 1 tunnel

**Lý do chọn Cloudflare Tunnel:**
- ✅ Hoàn toàn miễn phí: Không giới hạn bandwidth
- ✅ Bảo mật cao: Không expose IP thật
- ✅ Setup đơn giản: 5 phút là xong
- ✅ HTTPS tự động: Không cần mua SSL certificate
- ✅ DDoS protection: Cloudflare chặn attacks
- ✅ Global CDN: Low latency toàn cầu
- ✅ Không cần IP tĩnh: Dynamic IP OK
- ✅ Không cần port forwarding: Không động vào router


**Cloudflare Tunnel Architecture:**

Flow:
1. User request → Cloudflare edge
2. Cloudflare edge → Tunnel (encrypted)
3. Tunnel → Local server
4. Response ngược lại

Benefits:
- Server không cần public IP
- Traffic đi qua Cloudflare (cached, protected)
- Encrypted tunnel (TLS)

**Requirements:**

Software:
- cloudflared: Tunnel client (Windows/Linux/Mac)
- Docker (optional): Chạy cloudflared trong container

Cloudflare account:
- Free account
- Domain đã add vào Cloudflare (free)
- DNS managed by Cloudflare

**Multiple Services Routing:**

Một tunnel có thể route nhiều services:
- satvach.com → Frontend (port 80)
- api.satvach.com → Backend API (port 8000)
- minio.satvach.com → MinIO Console (port 9001)
- admin.satvach.com → Admin panel (port 3000)

**DNS Configuration:**

Cloudflare DNS records:
- Type: CNAME
- Name: satvach (hoặc subdomain)
- Target: tunnel-id.cfargotunnel.com
- Proxy: Enabled (orange cloud)

Benefits of proxied DNS:
- Hide origin IP
- DDoS protection
- CDN caching
- SSL/TLS encryption

**Running as Service:**

Windows Service:
- Command: cloudflared service install
- Auto-start on boot
- Run in background

Linux Systemd:
- Service file: /etc/systemd/system/cloudflared.service
- Enable: systemctl enable cloudflared
- Start: systemctl start cloudflared

Docker Compose:
- Service: cloudflared
- Image: cloudflare/cloudflared:latest
- Command: tunnel run
- Volumes: Mount config.yml và credentials
- Restart: always

**Docker Compose Integration:**

Add cloudflared service:
- Service name: cloudflared
- Image: cloudflare/cloudflared:latest
- Volumes: config.yml, credentials.json
- Network: Connect to backend network
- Depends on: backend, frontend services

Benefits:
- All services trong 1 docker-compose
- Auto-start khi server reboot
- Easy management

**Security Features:**

Zero Trust Access:
- Cloudflare Access: Add authentication layer
- Protect admin panels
- SSO integration (Google, GitHub)

WAF (Web Application Firewall):
- Block malicious requests
- Rate limiting
- Bot protection

DDoS Protection:
- Automatic mitigation
- Unlimited protection (free)
- No configuration needed

**Performance:**

Latency:
- Cloudflare edge: <50ms globally
- Tunnel overhead: ~10-20ms
- Total: Acceptable cho web app

Bandwidth:
- Unlimited (free tier)
- No throttling
- Global CDN caching

Caching:
- Static files: Cached at edge
- API responses: Configurable
- Cache rules: Customize per path

**Monitoring:**

Cloudflare Dashboard:
- Traffic analytics
- Request count
- Bandwidth usage
- Error rates
- Geographic distribution

Tunnel logs:
- Connection status
- Request logs
- Error logs
- Performance metrics

Alerts:
- Tunnel down: Email notification
- High error rate: Alert
- DDoS attack: Automatic mitigation

Technical limits:
- WebSocket: Supported
- HTTP/2: Supported
- gRPC: Supported
- Max upload size: 100MB per request (configurable)

**Best Practices:**

1. Use separate tunnels for dev/staging/production
2. Rotate credentials periodically
3. Enable Cloudflare Access for admin panels
4. Configure cache rules for static assets
5. Monitor tunnel health regularly
6. Keep cloudflared updated
7. Backup credentials và config files

**Advanced Features:**

Load Balancing:
- Multiple origins
- Health checks
- Automatic failover

Access Control:
- IP whitelist/blacklist
- Geo-blocking
- Authentication required

Custom Rules:
- Redirect rules
- Header modifications
- Rate limiting per path

**Migration Path:**

Phase 1 (MVP): Cloudflare Tunnel tại nhà
- Chi phí: $0
- Setup: 30 phút
- Đủ cho 0-10k users

Phase 2 (Growth): Cloudflare Tunnel + CDN optimization
- Enable caching rules
- Optimize images
- Add rate limiting

Phase 3 (Scale): Migrate to VPS (optional)
- Khi cần 99.99% uptime
- Khi home internet không đủ bandwidth
- Vẫn dùng Cloudflare Tunnel (không cần public IP)

**Conclusion:**

Cloudflare Tunnel là lựa chọn tốt nhất cho self-hosted tại nhà:
- Hoàn toàn miễn phí
- Bảo mật cao
- Setup đơn giản
- Production-ready
- Không vendor lock-in (có thể chuyển VPS bất cứ lúc nào)

---

## 4. FEATURES IMPLEMENTATION

### 4.1 Geolocation Tự Động

**Browser Geolocation API:**

HTML5 Geolocation API cho phép web app lấy vị trí người dùng:
- navigator.geolocation: Built-in browser API
- getCurrentPosition(): Lấy vị trí hiện tại
- watchPosition(): Theo dõi vị trí real-time
- Yêu cầu HTTPS: Bắt buộc cho security
- User permission: User phải cho phép

**Implementation Strategy:**

Frontend (SolidJS):
- Tạo custom hook: useGeolocation()
- Reactive signals: position, error, loading states
- Error handling: Permission denied, timeout, unavailable
- Options: enableHighAccuracy, timeout, maximumAge

**Geolocation Options:**

enableHighAccuracy:
- true: Sử dụng GPS (chính xác ~5-10m)
- false: Sử dụng WiFi/IP (chính xác ~50-100m)
- Trade-off: Accuracy vs battery life

timeout:
- Thời gian chờ tối đa (milliseconds)
- Recommended: 5000ms (5 seconds)
- Tránh user chờ quá lâu

maximumAge:
- Cache vị trí cũ (milliseconds)
- 0: Luôn lấy vị trí mới
- >0: Dùng cache nếu còn fresh

**User Experience:**

Permission request:
- Browser hiển thị popup xin phép
- User có thể Allow hoặc Block
- Lưu choice cho lần sau

Loading state:
- Hiển thị spinner khi đang lấy vị trí
- Timeout message nếu quá lâu
- Retry button nếu failed

Error handling:
- Permission denied: Hướng dẫn user enable location
- Position unavailable: Suggest manual input
- Timeout: Retry hoặc fallback

**Fallback Strategies:**

IP Geolocation:
- Nếu user không cho phép GPS
- Sử dụng IP address để ước lượng
- Độ chính xác thấp (~city level)
- Free services: ipapi.co, ip-api.com

Manual input:
- User tự nhập địa chỉ
- Geocoding: Convert address → coordinates
- Sử dụng Goong API hoặc OSM Nominatim

Map click:
- User click vào bản đồ để chọn vị trí
- Lấy coordinates từ click event
- Hiển thị marker tại vị trí đã chọn

**Use Cases:**

Đăng tin mới:
- Auto-fill location khi user click "Đăng tin"
- User có thể adjust marker trên map
- Lưu coordinates vào database

Tìm kiếm gần tôi:
- Lấy vị trí hiện tại
- Query items trong bán kính
- Sort theo khoảng cách

Check-in:
- Verify user thực sự ở location
- Anti-fraud cho giao dịch
- Tính khoảng cách đến seller

**Privacy Considerations:**

Không lưu vị trí chính xác:
- Chỉ lưu vị trí item, không lưu vị trí user
- User location chỉ dùng cho search
- Không track user movement

Opt-in:
- User phải explicitly cho phép
- Có thể disable bất cứ lúc nào
- Clear explanation tại sao cần location

**Performance:**

Caching:
- Cache vị trí trong session
- Không query lại mỗi lần search
- Refresh khi user di chuyển xa (>500m)

Debouncing:
- Không update quá thường xuyên
- Debounce 1-2 seconds
- Tránh spam API

---

### 4.2 Tìm Kiếm Theo Bán Kính

**Spatial Query với PostGIS:**

ST_DWithin function:
- Tìm items trong bán kính (meters)
- Input: Point, radius
- Output: Boolean (trong/ngoài bán kính)
- Performance: Sử dụng spatial index (GIST)

**Search Parameters:**

Center point:
- Latitude, Longitude
- Từ user location hoặc map center
- Validate: -90 to 90 (lat), -180 to 180 (lng)

Radius:
- Default: 2000m (2km)
- Min: 500m (0.5km)
- Max: 5000m (5km)
- Unit: Meters

Filters (optional):
- Category: Loại sản phẩm
- Price range: Min/max price
- Date: Mới nhất, cũ nhất
- Sort: Distance, price, date

**UI Components:**

Radius slider:
- Range input: 500m - 5km
- Step: 500m
- Visual feedback: Circle overlay trên map
- Real-time update: Debounced

Search button:
- Trigger search với radius hiện tại
- Loading state khi đang search
- Result count display

Map interaction:
- Drag map → Update center point
- Zoom → Suggest radius adjustment
- Click item marker → Show details

**Search Flow:**

1. User mở app → Auto-detect location
2. Default search: 2km radius
3. Display items trên map
4. User adjust radius slider
5. Re-search với radius mới
6. Update markers trên map

**Result Display:**

Map view:
- Markers cho mỗi item
- Cluster markers khi zoom out
- Color-code theo category
- Click marker → Show popup

List view:
- Sorted by distance
- Show distance, price, thumbnail
- Infinite scroll hoặc pagination
- Click item → Navigate to detail

**Performance Optimization:**

Spatial index:
- GIST index trên location column
- Query time: <10ms cho 10k items
- Bắt buộc phải có

Limit results:
- Max 100 items per query
- Pagination cho more results
- Prevent overload map

Caching:
- Cache search results (Redis)
- TTL: 5 minutes
- Invalidate khi có item mới

**Advanced Features:**

Saved searches:
- User save favorite search areas
- Quick access từ sidebar
- Notifications khi có item mới

Search alerts:
- Email/push notification
- Khi có item match criteria
- Frequency: Instant, daily, weekly

Heatmap:
- Visualize item density
- Identify hot areas
- Help users find best locations

**Mobile Optimization:**

Touch-friendly:
- Large slider thumb
- Easy to drag map
- Tap markers (not click)

Responsive:
- Adjust UI cho screen size
- Stack filters vertically
- Collapsible sidebar

Offline support:
- Cache last search results
- Show cached data khi offline
- Sync khi online again

---

## 5. LEARNING RESOURCES

### SolidJS
- https://www.solidjs.com/tutorial
- https://docs.solidjs.com/
- https://www.youtube.com/watch?v=hw3Bx5vxKl0

### MapLibre
- https://maplibre.org/maplibre-gl-js/docs/
- https://maplibre.org/maplibre-gl-js/docs/examples/

### FastAPI
- https://fastapi.tiangolo.com/
- https://fastapi.tiangolo.com/tutorial/

### PostGIS
- https://postgis.net/workshops/postgis-intro/
- https://www.crunchydata.com/developers/tutorials

### Cloudflare Tunnel
- https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

### MinIO
- https://min.io/docs/minio/linux/index.html
- https://min.io/docs/minio/linux/developers/python/API.html

---

## KẾT LUẬN

**Tech Stack Cuối Cùng:**
- ✅ Frontend: SolidJS + Vite + MapLibre GL JS + Flowbite + TailwindCSS
- ✅ Backend: Python + FastAPI + SQLAlchemy
- ✅ Database: PostgreSQL + PostGIS (Docker)
- ✅ Storage: MinIO (S3-compatible, self-hosted)
- ✅ Deployment: Docker Compose + Cloudflare Tunnel
- ✅ Map Tiles: Maptiler Free Tier (100k loads/tháng)

**Ưu điểm chính:**
- Chi phí gần như $0 (chỉ domain)
- Self-hosted tại nhà với Cloudflare Tunnel
- Scalable architecture
- Modern tech stack
- Production-ready

Bắt đầu ngay! 🚀
