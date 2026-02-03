---
description: Workflow for executing MVP tasks from specs/tasks/mvp-master-tasks.md
---

# MVP Task Execution Workflow

This workflow guides the agent on how to execute tasks from `specs/tasks/mvp-master-tasks.md`.

## Before Starting Any Task

1. **Read the task file first**:
   ```
   View file: specs/tasks/mvp-master-tasks.md
   ```

2. **Identify the task by ID** (e.g., `BE-1.1`, `FE-2.3`, `DB-1.1`)

3. **Check dependencies** - Look for `_depends_on_` under the task

---

## Task ID to Reference Mapping

### DevOps Tasks (DEV-*)
| Task Pattern | Reference Files |
|--------------|-----------------|
| DEV-1.* (Docker) | `.agent/skills/db-management/SKILL.md` (Docker section) |
| DEV-2.* (CI/CD) | `.github/workflows/` |
| DEV-3.* (Infra) | `docker-compose.yml`, `cloudflared/` |

**Output locations:**
- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `.github/workflows/`

---

### Database Tasks (DB-*)
| Task Pattern | Reference Files |
|--------------|-----------------|
| DB-1.* (Setup) | `.agent/skills/db-management/SKILL.md` |
| DB-2.* (Migrations) | `.agent/skills/db-management/SKILL.md` (Alembic section) |
| DB-4.* (Seed) | `database/seed.sql` |

**Output locations:**
- `database/init.sql`
- `backend/alembic/versions/`
- `backend/alembic/env.py`

---

### Backend Tasks (BE-*)
| Task Pattern | Reference Files |
|--------------|-----------------|
| BE-1.* (Setup) | `.agent/skills/backend-dev/SKILL.md` |
| BE-2.* (Models) | `.agent/skills/backend-dev/SKILL.md` (Models section) |
| BE-3.* (Services) | `.agent/skills/backend-dev/SKILL.md` (Services section) |
| BE-4.* (API) | `.agent/skills/backend-dev/SKILL.md` (FastAPI section) |

**Output locations:**
- `backend/src/app/models/`
- `backend/src/app/schemas/`
- `backend/src/app/services/`
- `backend/src/app/api/v1/endpoints/`
- `backend/src/app/core/`

---

### Frontend Tasks (FE-*)
| Task Pattern | Reference Files |
|--------------|-----------------|
| FE-1.* (Setup) | `.agent/skills/frontend-dev/SKILL.md` |
| FE-2.* (Components) | `.agent/skills/frontend-dev/SKILL.md` (Map, Components) |
| FE-3.* (API/State) | `.agent/skills/frontend-dev/SKILL.md` (API, State) |
| FE-4.* (Responsive) | `.agent/skills/frontend-dev/SKILL.md` (Styling) |
| FE-5.* (Build) | `.agent/skills/frontend-dev/SKILL.md` (Build section) |

**Output locations:**
- `frontend/src/components/`
- `frontend/src/pages/`
- `frontend/src/stores/`
- `frontend/src/lib/`

---

### Security Tasks (SEC-*)
| Task Pattern | Reference Files |
|--------------|-----------------|
| SEC-1.* (API) | `specs/tasks/security-tasks.md` |
| SEC-2.* (Data) | `specs/tasks/security-tasks.md` |

**Output locations:**
- `backend/src/app/core/security.py`
- `backend/src/app/middleware/`

---

### Testing Tasks (TEST-*)
| Task Pattern | Reference Files |
|--------------|-----------------|
| TEST-1.* (Unit) | `specs/tasks/testing-tasks.md` |
| TEST-2.* (Integration) | `specs/tasks/testing-tasks.md` |
| TEST-3.* (E2E) | `specs/tasks/testing-tasks.md` |
| TEST-4.* (Perf) | `specs/tasks/testing-tasks.md` |

**Output locations:**
- `backend/tests/`
- `frontend/tests/`
- `e2e/`

---

### External Tasks (EXT-*)
| Task Pattern | Reference Files |
|--------------|-----------------|
| EXT-1.* (Maptiler) | `.env.example`, `frontend/src/lib/mapUtils.ts` |

**Output locations:**
- `.env`
- `.env.example`

---

## Execution Steps

// turbo-all

1. **Read the skill file** for the task category:
   ```bash
   # Example for BE-* tasks
   cat .agent/skills/backend-dev/SKILL.md
   ```

2. **Check if output directory exists**, create if not:
   ```bash
   # Example
   mkdir -p backend/src/app/models
   ```

3. **Implement the task** following the skill guidelines

4. **Update mvp-master-tasks.md** - Mark task as complete:
   - Change `[ ]` to `[x]` for the completed task

5. **Verify with checkpoint** - If at end of sprint, run checkpoint validations

---

## Quick Reference: Skill Files

| Category | Skill File Path |
|----------|-----------------|
| Backend (BE-*) | `.agent/skills/backend-dev/SKILL.md` |
| Frontend (FE-*) | `.agent/skills/frontend-dev/SKILL.md` |
| Database (DB-*) | `.agent/skills/db-management/SKILL.md` |
| DevOps (DEV-*) | Use db-management skill for Docker |
| Security (SEC-*) | `specs/tasks/security-tasks.md` |
| Testing (TEST-*) | `specs/tasks/testing-tasks.md` |

---

## Example: Executing Task BE-2.1

```
Task: BE-2.1 - Create Location SQLAlchemy model with PostGIS Geometry

1. Read skill: .agent/skills/backend-dev/SKILL.md
2. Check dependency: BE-1.3 (AsyncSession), DB-1.4 (PostGIS verified)
3. Create file: backend/src/app/models/location.py
4. Follow skill patterns for GeoAlchemy2
5. Mark [x] BE-2.1 in mvp-master-tasks.md
```
