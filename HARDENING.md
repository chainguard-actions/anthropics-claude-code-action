<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.218

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.218** was hardened automatically. 4 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a run: shell script. The expression appears literally in the curl command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. GitHub Actions performs template substitution before the shell sees the string, so a malicious token value containing shell metacharacters could alter the command. The value should be passed via an env: variable and referenced as `$ENV_VAR` instead.

Locations:

- `action.yml:496`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via the env var `PATH_TO_BUN_EXECUTABLE`) to `$GITHUB_PATH` without sanitization. An attacker-controlled input value containing newlines could inject arbitrary entries into PATH. The write `echo "$BUN_DIR" >> "$GITHUB_PATH"` must be preceded by `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and use `$safe` instead.

Locations:

- `action.yml:241`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable` via the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`) to `$GITHUB_PATH` without sanitization. An attacker-controlled input value containing newlines could inject arbitrary entries into PATH. The write `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` must be preceded by `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and use `$safe` instead.

Locations:

- `base-action/action.yml:162`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and the timeout variant: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). This executes whatever the remote server returns without any integrity check. The script should be downloaded to a temporary file first, its integrity verified (e.g., via a checksum), and then executed separately.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across 2 files:

1. **script-injection** (action.yml, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` from inline in the curl `-H "Authorization: Bearer ..."` argument to an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the shell script.

2. **github-env-injection** (action.yml, Setup Custom Bun Path step): Added `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH`, using `$safe` instead of `$BUN_DIR`.

3. **github-env-injection** (base-action/action.yml, Setup Custom Bun Path step): Same fix as above for the identical step in base-action.

4. **github-env-injection** (base-action/action.yml, Install Claude Code step): Added `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH`, using `$safe` instead of `$CLAUDE_DIR`.

5. **unsafe-shell** (base-action/action.yml, Install Claude Code step): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's). The temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml line 55: moved `${{ github.action_path }}` out of the `run:` shell command and into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now uses `python "$ACTION_PATH/agent_approval_check.py"` instead of `python "${{ github.action_path }}/agent_approval_check.py"`.

### Iteration 3

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed script injection in examples/test-failure-analysis.yml by moving ${{ steps.detect.outputs.structured_output }} into STRUCTURED_OUTPUT env vars in all three run blocks, and ${{ github.event.workflow_run.html_url }} into WORKFLOW_RUN_URL env var. Fixed script injection in base-action/examples/issue-triage.yml by moving ${{ github.event.issue.number }} into ISSUE_NUMBER env var and changing the heredoc from single-quoted to unquoted (to allow shell variable expansion). Pinned all unpinned action references to full 40-character SHA digests: actions/checkout@v4→11d5960a, actions/checkout@v6→d23441a4, actions/github-script@v7→f28e40c7, anthropics/claude-code-action@v1/main→8ce9314f, anthropics/claude-code-action/agent-approval-check@main→8ce9314f, anthropics/claude-code-base-action@beta→e8132bc5. All 24 unpinned uses across 12 files are now pinned.

