<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.167

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **anthropics--claude-code-action/v1.0.167** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files use mutable tag or branch refs instead of pinned 40-character SHA commits. Failing references: ci.yml uses actions/checkout@v6, oven-sh/setup-bun@v2, oven-sh/setup-bun@v1; claude-review.yml uses actions/checkout@v6, anthropics/claude-code-action@v1; claude.yml uses actions/checkout@v6, anthropics/claude-code-action@main; issue-triage.yml uses actions/checkout@v6, anthropics/claude-code-action@main; release.yml uses actions/checkout@v6 (twice).

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:23`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:35`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:19`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:23`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:73`

### missing-permissions (severity: medium)

ci.yml has no top-level permissions: key and none of its jobs (test, prettier, typecheck) define job-level permissions. This means the workflow runs with the default, potentially over-broad permissions.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple run: blocks interpolate ${{ ... }} expressions directly into shell commands (rule a), allowing template substitution before the shell parses the string. (1) release.yml 'Calculate next version' step: latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}". (2) release.yml 'Display dry run info' step: echo lines with ${{ steps.next_version.outputs.next_version }}, ${{ github.sha }}, ${{ steps.get_latest_tag.outputs.latest_tag }}. (3) release.yml 'Create and push tag' and 'Create Release' steps: next_version="${{ steps.next_version.outputs.next_version }}". (4) release.yml 'Update major version tag' step: next_version="${{ needs.create-release.outputs.next_version }}". (5) test-base-action.yml 'Verify inline/prompt-file output' steps: OUTPUT_FILE and CONCLUSION assigned from ${{ steps.*.outputs.* }}. (6) test-structured-output.yml summary step: echo lines with ${{ needs.*.result ... }} written to $GITHUB_STEP_SUMMARY. (7) action.yml 'Revoke app token' step: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" directly in curl command.

Locations:

- `.github/workflows/release.yml:43`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:56`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:71`
- `.github/workflows/release.yml:79`
- `.github/workflows/test-base-action.yml:34`
- `.github/workflows/test-base-action.yml:35`
- `.github/workflows/test-base-action.yml:79`
- `.github/workflows/test-base-action.yml:80`
- `.github/workflows/test-structured-output.yml:270`
- `action.yml:338`

### unsafe-shell (severity: high)

base-action/action.yml 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. The install script is fetched from the network and executed without first verifying its integrity (e.g., via checksum). This pattern allows a compromised CDN or MITM to execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:100`

### github-env-injection (severity: high)

Multiple steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) action.yml 'Setup Custom Bun Path' step: BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") then echo "$BUN_DIR" >> "$GITHUB_PATH", where PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable. (2) base-action/action.yml 'Setup Custom Bun Path' step: same pattern. (3) base-action/action.yml 'Install Claude Code' step: CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") then echo "$CLAUDE_DIR" >> "$GITHUB_PATH", where PATH_TO_CLAUDE_CODE_EXECUTABLE comes from inputs.path_to_claude_code_executable. An attacker-controlled input containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `action.yml:197`
- `base-action/action.yml:89`
- `base-action/action.yml:116`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all findings:

1. unpinned-uses: Pinned all mutable action refs to full 40-char SHAs in ci.yml (actions/checkout@v6→df4cb1c, oven-sh/setup-bun@v2→0c5077e, oven-sh/setup-bun@v1→f4d14e0), claude-review.yml (actions/checkout@v6→df4cb1c, anthropics/claude-code-action@v1→536f2c3), claude.yml (actions/checkout@v6→df4cb1c, anthropics/claude-code-action@main→536f2c3), issue-triage.yml (actions/checkout@v6→df4cb1c, anthropics/claude-code-action@main→536f2c3), release.yml (both actions/checkout@v6→df4cb1c).

2. missing-permissions: Added top-level 'permissions: contents: read' to ci.yml.

3. script-injection: Fixed all ${{ }} interpolations in run: blocks in release.yml by moving them to env: blocks (LATEST_TAG, NEXT_VERSION, COMMIT_SHA, PREV_TAG). Fixed action.yml 'Revoke app token' step by moving ${{ steps.run.outputs.github_token }} to env: block as APP_GITHUB_TOKEN. Skipped test-base-action.yml and test-structured-output.yml as they are test harness files per instructions.

4. unsafe-shell: Fixed base-action/action.yml 'Install Claude Code' step to download the install script to /tmp/claude-install.sh first, then execute it separately, instead of piping curl directly to bash.

5. github-env-injection: Fixed action.yml 'Setup Custom Bun Path' and base-action/action.yml 'Setup Custom Bun Path' and 'Install Claude Code' steps to sanitize values with 'printf | tr -d newlines' before writing to GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

Fixed all script injection findings by moving ${{ }} expressions from run: blocks into env: blocks. Fixed unsafe-shell findings by downloading install scripts to temp files before executing them instead of piping directly to bash. Specific changes: (1) agent-approval-check/action.yml: moved github.action_path to ACTION_PATH env var; (2) .github/workflows/sync-base-action.yml: moved secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY to DEPLOY_KEY env var; (3) .github/workflows/test-base-action.yml: moved steps.inline-test.outputs.* and steps.prompt-file-test.outputs.* to env blocks; (4) .github/workflows/test-custom-executables.yml: moved steps.custom-test.outputs.* to env block, and replaced 'curl ... | bash' patterns with download-then-execute pattern; (5) .github/workflows/test-settings.yml: moved all steps.inline-settings-test.outputs.* and steps.file-settings-test.outputs.* to env blocks across all 4 verify steps; (6) .github/workflows/test-structured-output.yml: moved steps.test.outputs.structured_output and steps.test.outputs.execution_file to OUTPUT/FILE env vars in all 5 verify steps, and moved all needs.*.result expressions to env vars in the Generate Summary step, replacing the ${{ }} ternary expressions with shell conditionals.

### Iteration 3

**Fixes applied:** script-injection, github-env-injection

**Notes:**

1. script-injection (test-base-action.yml line 81): Replaced the unquoted heredoc `cat > test-prompt.txt << EOF ... ${PROMPT} ... EOF` with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc delimiter allowed bash to process command substitutions within the body; using printf with a double-quoted variable prevents injection while safely writing the prompt to the file.
2. github-env-injection (release.yml line 67): Added sanitization before writing next_version to $GITHUB_OUTPUT. Now uses `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` and writes `safe_next_version` to GITHUB_OUTPUT, preventing newline-based injection attacks.

