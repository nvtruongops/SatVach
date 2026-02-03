# DevOps Tasks (Docker, CI/CD, Monitoring)

**Role**: DevOps Engineer
**Focus**: Infrastructure, Deployment, Reliability, Automation, Cost Management.

---

## Phase 1: Containerization (Docker)

### 1.1 Dockerfiles
- [ ] **Backend**: Multi-stage build (Python Slim/Alpine). Optimize layer caching.
- [ ] **Frontend**: Multi-stage build (Node Build -> Nginx Alpine).
- [ ] **Database**: Use official `postgis/postgis` image.

### 1.2 Docker Compose (Development & Staging)
- [ ] Define services: `backend`, `frontend`, `db`, `minio`.
- [ ] Configure Health Checks.
- [ ] Configure Networks and Volumes (Persistence).
- [ ] Setup `.env` file handling.

---

## Phase 2: CI/CD Pipeline (GitHub Actions)

### 2.1 CI - Backend
- [ ] Trigger on Pull Request.
- [ ] Run `pytest` with AsyncIO.
- [ ] Run code linting (`ruff`).

### 2.2 CI - Frontend
- [ ] Trigger on Pull Request.
- [ ] Run `npm test` (Vitest).
- [ ] Run `npm run build`.

### 2.3 CD - Production
- [ ] Auto-deploy on merge to `main`.
- [ ] Build and push Docker images to GHCR/DockerHub.
- [ ] Trigger deployment to target environment.

---

## Phase 3: Infrastructure & Networking

### 3.1 Cloudflare Tunnel
- [ ] Setup `cloudflared` container.
- [ ] Configure Ingress rules.
- [ ] Automate Tunnel Token injection.

### 3.2 Reverse Proxy (Nginx/Caddy)
- [ ] Gzip, Brotli compression.
- [ ] Cache headers for static assets.

---

## Phase 4: Monitoring & Maintenance

### 4.1 Logging
- [ ] Centralized logging (stdout driver).
- [ ] Optional: Loki/Promtail or ELK.

### 4.2 Backup Strategy
- [ ] `backup_db.sh` script (pg_dump to MinIO).
- [ ] Daily cron job for backups.

---

## Phase 5: Production Hardening 🔴

### 5.1 Kubernetes Deployment Configs (Optional/Future)
- [ ] Create `Deployment`, `Service`, `Ingress` manifests.
- [ ] ConfigMaps for environment variables.
- [ ] Secrets management (Sealed Secrets or External Secrets).
- [ ] Namespace separation: `satvach-dev`, `satvach-prod`.

### 5.2 Auto-Scaling Policies (HPA)
- [ ] Define **Horizontal Pod Autoscaler** for backend.
- [ ] Metrics: CPU > 70%, Request count.
- [ ] Min/Max replicas configuration.
- [ ] Load testing to validate scaling behavior.

### 5.3 Blue-Green / Canary Deployment
- [ ] Implement Blue-Green using Nginx upstream switching or K8s Service selector.
- [ ] Canary: Route 10% traffic to new version, monitor, then full rollout.
- [ ] Rollback procedure documented.

### 5.4 Infrastructure as Code (IaC)
- [ ] **Terraform** or **Pulumi** for reproducible infrastructure.
- [ ] Define: VPC, Load Balancer, Database (if cloud-hosted), MinIO/S3.
- [ ] State management (S3 backend with locking).
- [ ] Version control IaC configs.

### 5.5 Cost Monitoring & Alerting
- [ ] If Cloud: Use AWS Cost Explorer / GCP Billing Alerts.
- [ ] Self-hosted: Monitor resource usage (CPU, RAM, Disk).
- [ ] Alerts: Disk > 80%, CPU sustained > 90%.
- [ ] Monthly cost reports.

### 5.6 Incident Response Runbooks
- [ ] Runbook: Database Connection Failure.
- [ ] Runbook: MinIO Unavailable.
- [ ] Runbook: High Error Rate (> 5xx).
- [ ] Runbook: DDoS Mitigation (Cloudflare).
- [ ] On-call rotation schedule.

### 5.7 Uptime Monitoring
- [ ] Setup **Uptime Robot** or **Better Uptime**.
- [ ] Monitor: `/health` endpoint, Frontend homepage.
- [ ] Alert channels: Email, Slack, SMS.
- [ ] SLA tracking dashboard.

### 5.8 Dependency Updates
- [ ] Integrate **Dependabot** or **Renovate** for automated PRs.
- [ ] Security patch policy: Critical within 24h.
