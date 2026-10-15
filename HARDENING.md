<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.251

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.251** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A ${{ }} expression is directly interpolated inside a run: shell command string in the 'Revoke app token' step. The line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` embeds the expression directly into the shell command before the shell ever sees it, allowing injection if the value contains shell metacharacters. This should be passed via an env: variable instead.

Locations:

- `action.yml:491`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is placed into env var PATH_TO_BUN_EXECUTABLE, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled path containing newlines could inject arbitrary entries into $GITHUB_PATH. The same pattern appears in both action.yml and base-action/action.yml.

Locations:

- `action.yml:248`
- `base-action/action.yml:143`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step, remote content is piped directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout ... bash -c "curl ... | bash -s -- $CLAUDE_CODE_VERSION"`). This executes whatever the remote server returns without any integrity verification. The script should be downloaded to a file, verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:175`
- `base-action/action.yml:178`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed three security findings: (1) script-injection in action.yml 'Revoke app token' step - moved ${{ steps.run.outputs.github_token }} to env: block as APP_GITHUB_TOKEN; (2) github-env-injection in both action.yml and base-action/action.yml 'Setup Custom Bun Path' steps - added sanitization via printf '%s' | tr -d '\n\r' before writing BUN_DIR to $GITHUB_PATH; (3) unsafe-shell in base-action/action.yml 'Install Claude Code' step - replaced curl|bash pipe with download-then-execute pattern using a temp file, dropping the -s and -- shell options that were only needed for stdin-based execution.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

1. agent-approval-check/action.yml (line 56): Moved `${{ github.action_path }}` from the `run:` shell string into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`, and updated the shell command to use `$ACTION_PATH` instead. 2. base-action/action.yml (line 177): Added sanitization of `$CLAUDE_DIR` before writing to `$GITHUB_PATH` — now uses `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and writes `$safe_claude_dir` instead of the raw `$CLAUDE_DIR`, consistent with the existing pattern in the 'Setup Custom Bun Path' step.

