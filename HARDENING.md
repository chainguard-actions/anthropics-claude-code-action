<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.237

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.237** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string.

1. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` injects `github.action_path` directly into the shell command. Although `github.action_path` is GitHub-controlled, any `${{ }}` expression in a run: block is a script-injection risk per the check rules.

2. In action.yml, the 'Revoke app token' step injects `${{ steps.run.outputs.github_token }}` directly into a curl command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`.

Both should use env: variables instead of direct expression interpolation.

Locations:

- `agent-approval-check/action.yml:57`
- `action.yml:499`

### github-env-injection (severity: high)

Untrusted input values derived from action inputs are written to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

1. action.yml 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` comes from `inputs.path_to_bun_executable`. The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without sanitizing newlines. An attacker-controlled path containing newlines could inject arbitrary entries into PATH.

2. base-action/action.yml 'Setup Custom Bun Path' step: Same pattern — `BUN_DIR` derived from `inputs.path_to_bun_executable` written to `$GITHUB_PATH` without sanitization.

3. base-action/action.yml 'Install Claude Code' step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` (from `inputs.path_to_claude_code_executable`) written to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:175`
- `base-action/action.yml:131`
- `base-action/action.yml:163`

### unsafe-shell (severity: high)

In base-action/action.yml, the 'Install Claude Code' step pipes remote content directly to bash without first saving it to a file for inspection:

`curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`

This pattern (also wrapped in a `timeout ... bash -c "curl ... | bash ..."`) executes whatever the remote server returns without any integrity check. If the remote URL is compromised or the response is tampered with in transit, arbitrary code will execute on the runner.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 3 findings across 3 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` into env var ACTION_PATH; shell script now uses `$ACTION_PATH`.

2. action.yml 'Revoke app token': Moved `${{ steps.run.outputs.github_token }}` into env var APP_GITHUB_TOKEN; curl now uses `$APP_GITHUB_TOKEN`.

3. action.yml 'Setup Custom Bun Path': Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

4. base-action/action.yml 'Setup Custom Bun Path': Same BUN_DIR sanitization fix.

5. base-action/action.yml 'Install Claude Code': (a) Replaced `curl | bash -s -- $VERSION` with download-then-execute pattern using mktemp; dropped the `--` (it was the shell's option terminator); temp file cleaned up after use. (b) Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing CLAUDE_DIR to GITHUB_PATH.

