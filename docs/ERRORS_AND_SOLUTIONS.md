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

_Cập nhật: 2026-02-04_
