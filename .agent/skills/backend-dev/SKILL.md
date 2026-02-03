---
name: backend-dev
description: Guidelines for SatVach Backend Development (FastAPI + PostGIS + MinIO)
---

# Backend Development Guidelines - Dự Án Sát Vách

## Tech Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15 + PostGIS 3.3 (via SQLAlchemy + GeoAlchemy2)
- **ORM**: SQLAlchemy 2.0 (async)
- **Serialization**: Pydantic v2
- **Concurrency**: Asyncio (async/await)
- **Object Storage**: MinIO (S3-compatible) via aioboto3
- **Migration**: Alembic

## Core Principles

### 1. FastAPI Patterns
- **Dependency Injection**: Use `Depends()` for DB sessions, Auth, and Configuration.
  ```python
  from fastapi import Depends
  from sqlalchemy.ext.asyncio import AsyncSession
  
  @app.get("/items")
  async def get_items(db: AsyncSession = Depends(get_db)):
      ...
  ```
- **Pydantic Models**: Separate `schemas` (validation) from `models` (database).
  - `schemas/item.py`: Pydantic models (ItemCreate, ItemResponse, ItemUpdate).
  - `models/item.py`: SQLAlchemy models.
- **Auto-generated Docs**: FastAPI tự động tạo Swagger UI tại `/docs` và ReDoc tại `/redoc`.

### 2. Database & Spatial Queries (PostGIS)
- **GeoAlchemy2**: Use `Geography` type cho location columns.
  ```python
  from geoalchemy2 import Geography
  from sqlalchemy import Column, Integer, String, DECIMAL, Text, TIMESTAMP
  
  class Item(Base):
      __tablename__ = "items"
      id = Column(Integer, primary_key=True)
      location = Column(Geography(geometry_type='POINT', srid=4326), nullable=False)
  ```
- **Spatial Queries**: Sử dụng PostGIS functions qua GeoAlchemy2.
  ```python
  from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_MakePoint
  
  # Tìm items trong bán kính
  stmt = select(Item).where(
      ST_DWithin(Item.location, ST_MakePoint(lng, lat), radius_meters)
  )
  
  # Sắp xếp theo khoảng cách
  stmt = select(Item).order_by(
      ST_Distance(Item.location, ST_MakePoint(lng, lat))
  )
  ```
- **Type Handling**: Convert geometry sang GeoJSON khi trả về frontend.
  ```python
  from geoalchemy2.shape import to_shape
  from shapely.geometry import mapping
  
  # Convert WKBElement to GeoJSON
  geom = to_shape(item.location)
  geojson = mapping(geom)
  ```
- **Async Session**: Luôn dùng async/await.
  ```python
  async with AsyncSession(engine) as session:
      result = await session.execute(stmt)
      items = result.scalars().all()
      await session.commit()
  ```

### 3. File Upload & MinIO Integration
- **Upload Endpoint**: Sử dụng `UploadFile` từ FastAPI.
  ```python
  from fastapi import UploadFile, File
  
  @app.post("/upload")
  async def upload_image(file: UploadFile = File(...)):
      # Validate file type
      if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
          raise HTTPException(400, "Invalid file type")
      
      # Upload to MinIO
      s3_client = get_s3_client()
      filename = f"{uuid4()}.{file.filename.split('.')[-1]}"
      await s3_client.upload_fileobj(file.file, "satvach-items", filename)
      
      return {"url": f"http://minio:9000/satvach-items/{filename}"}
  ```
- **S3 Client**: Sử dụng aioboto3 cho async operations.
  ```python
  import aioboto3
  
  session = aioboto3.Session()
  async with session.client('s3', endpoint_url='http://minio:9000') as s3:
      await s3.upload_fileobj(file, bucket, key)
  ```

### 4. File Structure
```
src/backend/
  ├── app/
  │   ├── api/
  │   │   └── v1/
  │   │       ├── endpoints/
  │   │       │   ├── items.py      # CRUD items
  │   │       │   ├── search.py     # Spatial search
  │   │       │   └── upload.py     # File upload
  │   │       └── router.py
  │   ├── core/
  │   │   ├── config.py             # Settings (Pydantic BaseSettings)
  │   │   └── deps.py               # Dependencies (get_db, get_s3)
  │   ├── db/
  │   │   ├── base.py               # SQLAlchemy Base
  │   │   └── session.py            # AsyncSession factory
  │   ├── models/
  │   │   └── item.py               # SQLAlchemy models
  │   ├── schemas/
  │   │   └── item.py               # Pydantic schemas
  │   ├── services/
  │   │   ├── item_service.py       # Business logic
  │   │   └── s3_service.py         # MinIO operations
  │   └── main.py                   # FastAPI app entry
  ├── alembic/                      # Migrations
  │   ├── versions/
  │   └── env.py
  ├── requirements.txt
  └── Dockerfile
```

### 5. Error Handling
- **HTTPException**: Sử dụng status codes chuẩn.
  ```python
  from fastapi import HTTPException, status
  
  if not item:
      raise HTTPException(
          status_code=status.HTTP_404_NOT_FOUND,
          detail="Item not found"
      )
  ```
- **Validation**: Pydantic tự động validate, FastAPI trả 422 Unprocessable Entity.
- **Database Errors**: Catch SQLAlchemy exceptions.
  ```python
  from sqlalchemy.exc import IntegrityError
  
  try:
      await session.commit()
  except IntegrityError:
      raise HTTPException(400, "Duplicate entry")
  ```

### 6. Environment Variables
- **Pydantic Settings**: Quản lý config qua environment variables.
  ```python
  from pydantic_settings import BaseSettings
  
  class Settings(BaseSettings):
      DATABASE_URL: str
      S3_ENDPOINT: str
      S3_ACCESS_KEY: str
      S3_SECRET_KEY: str
      S3_BUCKET: str = "satvach-items"
      
      class Config:
          env_file = ".env"
  ```

### 7. CORS Configuration
- **Allow Frontend**: Configure CORS cho SolidJS frontend.
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000", "https://satvach.com"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

### 8. Performance Best Practices
- **Connection Pooling**: SQLAlchemy tự động quản lý pool.
- **Async Everywhere**: Tất cả DB operations phải async.
- **Limit Results**: Luôn có pagination.
  ```python
  @app.get("/items")
  async def get_items(skip: int = 0, limit: int = 100):
      stmt = select(Item).offset(skip).limit(limit)
  ```
- **Spatial Index**: Đảm bảo GIST index tồn tại (xem db-management skill).

### 9. Testing
- **Pytest**: Sử dụng pytest với async support.
  ```python
  import pytest
  from httpx import AsyncClient
  
  @pytest.mark.asyncio
  async def test_get_items():
      async with AsyncClient(app=app, base_url="http://test") as client:
          response = await client.get("/items")
          assert response.status_code == 200
  ```

### 10. Docker Best Practices
- **Multi-stage Build**: Giảm image size.
- **Non-root User**: Chạy app với user không phải root.
- **Health Check**: Thêm health check endpoint.
  ```python
  @app.get("/health")
  async def health_check():
      return {"status": "ok"}
  ```
