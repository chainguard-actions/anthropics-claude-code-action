<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.205

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.205** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing newlines or shell metacharacters to break out of the quoted string.

Locations:

- `action.yml:330`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written directly to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into PATH. The same pattern appears in base-action/action.yml for both `$BUN_DIR` (from `inputs.path_to_bun_executable`) and `$CLAUDE_DIR` (from `inputs.path_to_claude_code_executable`).

Locations:

- `action.yml:175`
- `base-action/action.yml:120`
- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout` wrapper). If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes on the runner immediately.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

1. script-injection (action.yml ~line 330): Moved `${{ steps.run.outputs.github_token }}` from the curl Authorization header in the run: block into the step's env: block as APP_TOKEN; the shell now references $APP_TOKEN.

2. github-env-injection (action.yml ~line 175, base-action/action.yml ~lines 120 and 175): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in action.yml and base-action/action.yml (BUN_DIR path). Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing CLAUDE_DIR to $GITHUB_PATH in base-action/action.yml.

3. unsafe-shell (base-action/action.yml ~lines 155/157): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with a two-step approach: download to a temp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping `-s` and `--` which were shell stdin/option-terminator flags, not script arguments). Applied to both the timeout-wrapped and non-timeout code paths. Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml line 52: moved `${{ github.action_path }}` out of the `run:` shell command and into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now uses the quoted shell variable `"$ACTION_PATH/agent_approval_check.py"` instead of the inline expression.

