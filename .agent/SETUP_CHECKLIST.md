# 🚀 Setup Checklist - Fullstack Developer

## 1. Environment Setup

### 1.1 Copy & Configure Environment

- [x] Copy `.env.example` → `.env`

  ```bash
  # Windows PowerShell
  copy .env.example .env

  # Linux/Mac
  # cp .env.example .env
  ```

- [x] Set real values:
  ```bash
  POSTGRES_PASSWORD=<strong_password>
  MINIO_ROOT_PASSWORD=<strong_password>
  MAPTILER_API_KEY=<get_from_maptiler.com>
  TUNNEL_TOKEN=<if_using_cloudflare>
  ```

### 1.2 Start Docker Services

```bash
docker compose up -d
```

- [x] Verify PostgreSQL: `docker exec satvach-db psql -U admin -d satvach -c "SELECT PostGIS_Version();"`
- [x] Verify MinIO Console: http://localhost:9001
- [x] Verify Backend: http://localhost:8000/docs
- [x] Verify Frontend: http://localhost:80

---

## 2. VS Code Configuration

> **⚠️ Lưu ý**: `.gitignore` đã set ignore `.vscode/`, nhưng nên commit các file config này cho team.
> Xóa dòng `.vscode/` trong `.gitignore` hoặc dùng `git add -f .vscode/*`

### 2.1 Create `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.codeActionsOnSave": {
      "source.fixAll": "explicit",
      "source.organizeImports": "explicit"
    }
  },
  "python.analysis.typeCheckingMode": "basic",
  "files.associations": {
    "*.sql": "sql"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### 2.2 Create `.vscode/extensions.json`

```json
{
  "recommendations": [
    "ms-python.python",
    "charliermarsh.ruff",
    "ms-azuretools.vscode-docker",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg",
    "humao.rest-client"
  ]
}
```

### 2.3 Create `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI Debug",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "cwd": "${workspaceFolder}/src/backend",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "name": "Vite Dev Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/src/frontend"
    }
  ]
}
```

### 2.4 Create `.vscode/settings.json` - SQLTools Connection (Optional)

```json
{
  "sqltools.connections": [
    {
      "name": "SatVach Local DB",
      "driver": "PostgreSQL",
      "server": "localhost",
      "port": 5432,
      "database": "satvach",
      "username": "admin",
      "password": "admin",
      "connectionTimeout": 15
    }
  ]
}
```

> Merge config này vào `.vscode/settings.json` hoặc tạo connection qua UI.

---

## 3. Backend Setup (Python)

### 3.1 Initialize Project Structure

```bash
cd src/backend
mkdir -p src/{api/v1/endpoints,core,db,models,schemas,services}
touch src/__init__.py src/api/__init__.py src/core/__init__.py
```

### 3.2 Setup Virtual Environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
# source .venv/bin/activate

pip install -r requirements.txt
```

### 3.3 Initialize Alembic

```bash
pip install alembic
alembic init alembic
# Configure alembic.ini with DATABASE_URL
```

### 3.4 Create `pyproject.toml`

```toml
[project]
name = "satvach-api"
version = "0.1.0"
requires-python = ">=3.11"

[tool.ruff]
line-length = 100
select = ["E", "F", "I", "UP"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

---

## 4. Frontend Setup (SolidJS)

### 4.1 Initialize SolidJS Project

```bash
cd src/frontend
npm create vite@latest . -- --template solid-ts
npm install
```

### 4.2 Install Dependencies

```bash
# Core
npm install maplibre-gl @solidjs/router

# UI
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Flowbite (optional)
npm install flowbite
```

### 4.3 Configure TailwindCSS

Edit `tailwind.config.js`:

```js
export default {
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: { extend: {} },
  plugins: [],
};
```

### 4.4 Create Test Config `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
  },
});
```

---

## 5. Pre-commit Hooks (Optional but Recommended)

### 5.1 Create `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.4
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v9.0.0
    hooks:
      - id: eslint
        files: \.[jt]sx?$
        types: [file]
```

### 5.2 Install Pre-commit

```bash
pip install pre-commit
pre-commit install
```

---

## 6. MCP Verification

### 6.1 Test MCP Servers

- [x] **Postgres MCP**: Query database via agent
- [x] **Filesystem MCP**: Read/write files via agent
- [x] **GitHub MCP**: Check repo operations
- [x] **Memory MCP**: Store/retrieve context

### 6.2 Verify Agent Skills

- [x] Open any `.agent/skills/*/SKILL.md` and confirm syntax highlighting
- [x] Test workflow: Ask agent to "execute task BE-1.1"

---

## 7. First Task Execution

### Ready to Start?

Follow the workflow in `.agent/workflows/execute-mvp-task.md`:

1. **Read task file**: `specs/tasks/mvp-master-tasks.md`
2. **Start with Sprint 1**: DEV-1.x tasks first
3. **Check dependencies** before each task
4. **Mark completed** tasks with `[x]`

### Recommended First Commands:

```bash
# Start all services
docker compose up -d

# Check logs
docker compose logs -f backend

# Access API docs (Windows)
start http://localhost:8000/docs

# Or manually open browser
# explorer http://localhost:8000/docs
```

---

## ✅ Ready When:

- [x] All Docker services healthy
- [x] `.env` configured with real values
- [x] VS Code extensions installed
- [x] Backend virtual environment activated
- [x] Frontend `npm install` completed
- [x] MCP servers responding

**Happy Coding! 🎉**
