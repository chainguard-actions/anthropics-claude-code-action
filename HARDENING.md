<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.169

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.169** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command. In the 'run: python "${{ github.action_path }}/agent_approval_check.py"' line, the github.action_path context is expanded by the template engine before the shell sees it. While github.action_path is GitHub-controlled, any ${{ }} expression directly in a run: block is a script-injection finding per the check rules.

Locations:

- `agent-approval-check/action.yml:52`

### script-injection (severity: high)

Sub-rule (a): In the 'Revoke app token' step, the expression ${{ steps.run.outputs.github_token }} is directly interpolated inside the run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The steps.*.outputs.* context is listed as an untrusted-input expression and must not appear directly in run: blocks.

Locations:

- `action.yml:325`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input inputs.path_to_bun_executable is mapped to the env var PATH_TO_BUN_EXECUTABLE, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled path containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:176`
- `base-action/action.yml:140`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the input inputs.path_to_claude_code_executable is mapped to the env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled path containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:170`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern appears twice (once inside a timeout wrapper and once in the else branch). If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 security findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` out of the run: command into the env: block as ACTION_PATH, referenced as $ACTION_PATH in the shell.

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` into the env: block as APP_TOKEN, referenced as $APP_TOKEN in the curl Authorization header.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (github-env-injection, Install Claude Code): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

6. base-action/action.yml (unsafe-shell, Install Claude Code): Replaced `curl ... | bash -s -- $VERSION` with downloading the script to a mktemp file first, then executing `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the '--' shell option terminator as required). Temp file is cleaned up after use.

