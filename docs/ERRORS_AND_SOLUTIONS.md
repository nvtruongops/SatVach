# Báo Cáo Lỗi - Dự Án Sát Vách

## Sprint 2: Database Migrations (DB-2.1 → DB-2.4)

| Lỗi                 | Root Cause              | Giải pháp                    |
| :------------------ | :---------------------- | :--------------------------- |
| Docker not running  | Docker Desktop tắt      | Khởi động Docker Desktop     |
| ENUM already exists | Partial migration state | Dùng `DO $$ IF NOT EXISTS`   |
| Line too long       | Ruff lint rule          | Tách thành nhiều dòng        |
| Service not found   | Wrong service name      | Dùng `postgres` thay vì `db` |
| Browser unavailable | Playwright config       | Dùng HTTP request            |

---

## Sprint 3: Backend Services & API (BE-3.x, BE-4.x)

| Lỗi                                        | Root Cause                                               | Giải pháp                                               |
| :----------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------ |
| `ModuleNotFoundError: bleach`              | `restart` không rebuild image khi đổi `requirements.txt` | Dùng `docker compose up -d --build backend`             |
| `ImportError: cannot import name 'router'` | Tên biến `api_router` lệch với old cache/import          | Đổi tên biến về `router` trong `router.py` và `main.py` |
| `Unable to connect to remote server`       | Container crash do lỗi code (ImportError)                | Fix code lỗi và check logs bằng `docker compose logs`   |
| `Invoke-WebRequest` Script Warning         | PowerShell parsing response content                      | Dùng `-UseBasicParsing` hoặc `N` để skip                |
| `500 Internal Server Error` (Create)       | Enum Mismatch (Python `CAFE` vs Postgres `cafe`)         | Refactor Python Enums về lowercase để khớp DB           |
| `NameError: name 'limiter' is not defined` | Missing import in `locations.py`                         | Thêm `from src.core.rate_limit import limiter`          |
| Logic regression (Search Status)           | Search filter ignoring `params.status`                   | Revert logic `search_service` về `params.status`        |

---

---

## Sprint 6: Testing & Polish (TEST-1.1 → TEST-1.3)

| Lỗi                                             | Root Cause                                       | Giải pháp                                                        |
| :---------------------------------------------- | :----------------------------------------------- | :--------------------------------------------------------------- |
| `CommandNotFoundException` (pytest)             | Chưa cài package testing                         | Thêm `pytest`, `pytest-asyncio` vào `requirements.txt` & install |
| `TypeError: StorageService.__init__()`          | Singleton/DI initialization in testing           | Sử dụng `patch` để mock `settings` và `_get_client`              |
| `AttributeError: ... has no attribute 'coffee'` | Typo in Test Data Enums                          | Sửa `LocationCategory.coffee` thành `LocationCategory.cafe`      |
| `AssertionError: Longitude must be...`          | Pydantic v2 triggers `le`/`ge` before custom val | Cập nhật assert check cả message mặc định của Pydantic           |

_Cập nhật: 2026-02-05_

### Backend Integration Tests (Sprint 6)

| Error Message                                                                                       | Cause                                                                                                                                                 | Solution                                                                                                                                                                   |
| :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RuntimeWarning: coroutine 'Connection._cancel' was never awaited` via `pytest`                     | `pytest-asyncio` loop handling conflict with global engine or custom `event_loop` fixture.                                                            | Removed custom `event_loop` fixture. Refactored `conftest.py` to create a fresh `AsyncEngine` (test_engine) per test to ensure correct loop binding.                       |
| `asyncpg.exceptions.UndefinedColumnError: column "latitude" of relation "locations" does not exist` | Test used raw SQL inserting `latitude` column, but proper method (PostGIS) uses `ST_MakePoint` to `geom` column using `ST_SetSRID`.                   | Updated `test_api_workflow.py` to remove `latitude/longitude` columns from raw INSERT and use `ST_SetSRID(ST_MakePoint(0,0), 4326)` for `geom`.                            |
| `invalid input value for enum moderation_action: "SUBMITTED"`                                       | Python Enum member was uppercase (`SUBMITTED`), but Postgres Enum type expects lowercase (`submitted`). SQLAlchemy sends Member Name by default.      | Refactored `ModerationAction` Enum in `src/models/moderation_log.py` to use lowercase members (`submitted = "submitted"`). Updated usages in Service.                      |
| `pydantic.error_wrappers.ValidationError` (implied 500) on `LocationResponse`                       | `LocationResponse` schema requires `latitude` and `longitude`, but `Location` ORM model only has `geom` (PostGIS). Pydantic couldn't extract lat/lng. | Added `latitude` and `longitude` computed properties to `Location` model using `column_property(func.ST_Y/X(func.cast(geom, Geometry)))` to expose them for serialization. |

### E2E Tests (Playwright)

| Error Message                                                                   | Cause                                                                                             | Solution                                                                                                                                                      |
| :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GL_INVALID_OPERATION: glDrawElements: Must have element array buffer bound`    | Headless Chromium in docker/CI environment often lacks full WebGL support required by MapLibreGL. | Adjusted tests to verify "Application Logic" (DOM elements, API calls via Network Mocking) instead of relying on Canvas pixel interaction (clicking markers). |
| `Error: expect(received).toHaveTitle(expected) ... Expected pattern: /SatVach/` | Page title in `index.html` was "Sát Vách - Local Place Map" but test expected `/SatVach/`.        | Updated `visitor.spec.ts` to match the actual Vietnamese title `/Sát Vách/`.                                                                                  |
| `TimeoutError: page.waitForResponse` in Search Test                             | Search input debounce (500ms) or Event Loop delay caused test to timeout before API call.         | Added explicit `await page.waitForTimeout(1000)` after typing keys before clicking search, or ensured assertions waited for the mock `route` to fulfill.      |
