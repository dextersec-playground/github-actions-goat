# Repository Compromised — PRT Scan Research Demo

**Nonce**: PRT-SCAN-RESEARCH-NONCE-FULLCHAIN-GOAT-SIM-001
**Timestamp**: 2026-04-13T02:32:24.636Z
**Attack Vector**: pull_request_target + persist-credentials (PRT-001 + PRT-002)

## What Happened

1. An attacker opened a fork PR against this repository
2. `PRTargetWorkflow.yml` triggered automatically (no approval required)
3. The workflow checked out the attacker's PR code with `ref: github.event.pull_request.head.sha`
4. `actions/checkout` persisted the GITHUB_TOKEN to `.git/config` (default behavior)
5. `npm install` ran the attacker's `preinstall` script from `package.json`
6. The script extracted the token from `.git/config` and used it to push this file

## Remediation

- Use `pull_request` instead of `pull_request_target`
- Set `persist-credentials: false` on all checkout steps
- Add explicit `permissions: contents: read`
- Enable branch protection on `main`

---
*This file was created by an authorized security research simulation.*
*PRT-SCAN-RESEARCH-NONCE-FULLCHAIN-GOAT-SIM-001*
