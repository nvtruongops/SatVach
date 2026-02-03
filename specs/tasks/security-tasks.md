# Security Tasks

**Role**: Security Engineer / Backend Developer
**Focus**: Authentication, Data Protection, Compliance, Vulnerability Management.

---

## Phase 1: API Security (MVP)

### 1.1 Rate Limiting
- [ ] Implement `slowapi` or custom middleware.
- [ ] Limit: 100 req/min read, 10 req/min write.

### 1.2 Input Sanitization
- [ ] Pydantic models strip whitespace.
- [ ] Escape HTML/Script tags in text fields.
- [ ] Verify SolidJS output escaping.

### 1.3 CORS & Headers
- [ ] Configure strict CORS.
- [ ] Security Headers: `X-Content-Type-Options`, `X-Frame-Options`, `CSP`.

---

## Phase 2: Data Protection (MVP)

### 2.1 Image Validation
- [ ] Verify Magic Bytes of uploaded files.
- [ ] Strip EXIF metadata (Privacy).

### 2.2 Environment Secrets
- [ ] Audit `.env` usage.
- [ ] Strict separation of Prod/Dev keys.

---

## Phase 3: Auditing (MVP)

### 3.1 Basic Audit
- [ ] Ensure `ModerationLog` captures Who, When, What.
- [ ] Disable Swagger UI in Production (or protect with auth).

---

## Phase 4: Production Hardening 🔴

### 4.1 Full OAuth2/OIDC Implementation
- [ ] Implement **OAuth2 Password Flow** for internal auth.
- [ ] Integrate **Google/Facebook OAuth** for social login.
- [ ] Use **python-jose** or **PyJWT** for JWT handling.
- [ ] Token refresh mechanism.
- [ ] Role-Based Access Control (RBAC): Guest, User, Moderator, Admin.

### 4.2 Two-Factor Authentication (2FA)
- [ ] Integrate TOTP (e.g., Google Authenticator) using `pyotp`.
- [ ] Backup codes generation.
- [ ] Enforce 2FA for Admin/Moderator roles.

### 4.3 API Key Management
- [ ] API Key generation for third-party integrations.
- [ ] Key rotation policy.
- [ ] Key revocation mechanism.
- [ ] Rate limiting per API key.

### 4.4 Penetration Testing Plan
- [ ] **OWASP ZAP** automated scan (CI integration).
- [ ] Manual penetration test: Quarterly.
- [ ] Bug bounty program consideration.
- [ ] Remediation SLA: Critical < 24h, High < 7 days.

### 4.5 Security Incident Response Plan
- [ ] Define Incident Severity Levels (P1-P4).
- [ ] Incident Commander role assignment.
- [ ] Communication templates (internal, external).
- [ ] Post-mortem process.
- [ ] Breach notification procedure (PDPA compliance).

### 4.6 Compliance Checklist (PDPA Vietnam)
- [ ] Privacy Policy document.
- [ ] Cookie consent banner.
- [ ] Data Subject Access Request (DSAR) process.
- [ ] Data Processing Agreement (if third-party processors).
- [ ] Data retention policy documentation.

### 4.7 Vulnerability Scanning
- [ ] **Trivy** for container image scanning (CI integration).
- [ ] **Snyk** for dependency vulnerability scanning.
- [ ] **Bandit** for Python static analysis.
- [ ] Automated PRs for vulnerable dependencies.

### 4.8 Secret Rotation Automation
- [ ] Define rotation schedule: DB passwords (90 days), API keys (180 days).
- [ ] HashiCorp Vault integration (optional for advanced setup).
- [ ] Automated rotation scripts with zero-downtime.
- [ ] Secret access logging.

### 4.9 Web Application Firewall (WAF)
- [ ] Cloudflare WAF rules for common attacks.
- [ ] Custom rules for application-specific threats.
- [ ] Rate limiting at edge.
- [ ] Bot protection.
