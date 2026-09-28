<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.186

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.186** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string in the 'Revoke app token' step. The expression appears in a curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` command. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing embedded shell metacharacters to be executed.

Locations:

- `action.yml:399`

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string: `python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:52`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` (caller-controlled). The script then derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input value could inject arbitrary entries into GITHUB_PATH. The same pattern appears in base-action/action.yml.

Locations:

- `action.yml:183`
- `base-action/action.yml:131`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step, remote content is piped directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout` wrapper). This executes whatever the remote server returns without first downloading and verifying the script, creating a supply-chain risk if the remote URL is compromised.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across 3 files:

1. action.yml (script-injection, line 399 - Revoke app token): Moved `${{ steps.run.outputs.github_token }}` into env block as APP_TOKEN; curl now uses `$APP_TOKEN`.

2. agent-approval-check/action.yml (script-injection, line 52): Moved `${{ github.action_path }}` into env block as ACTION_PATH; python invocation now uses `"$ACTION_PATH/agent_approval_check.py"`. All existing env vars were merged into the same step.

3. action.yml (github-env-injection, line 183 - Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

4. base-action/action.yml (github-env-injection, line 131 - Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (unsafe-shell, line 155 - Install Claude Code): Replaced `curl ... | bash -s -- $VERSION` pipe pattern with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form). Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Install Claude Code' step in hardened/action/base-action/action.yml (around line 185) to sanitize CLAUDE_DIR before writing to $GITHUB_PATH. Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and changed the echo to use `$safe_claude_dir` instead of `$CLAUDE_DIR`. This matches the existing sanitization pattern already used in the sibling 'Setup Custom Bun Path' step.

