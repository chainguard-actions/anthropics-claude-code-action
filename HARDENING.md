<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.166

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.166** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside the `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing newlines or shell metacharacters to break out of the string context.

Locations:

- `action.yml:399`

### script-injection (severity: high)

Sub-rule (a): The third step in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside the `run:` shell command string: `python "${{ github.action_path }}/agent_approval_check.py"`. Per the check rules, any `${{ ... }}` expression — including `github.*` context values — directly inside a `run:` block is a script-injection finding, as the value is substituted before the shell processes the command.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step places `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is derived from an untrusted input and is written to the special environment file without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input could inject arbitrary entries into PATH.

Locations:

- `action.yml:228`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml places `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is derived from an untrusted input and is written to the special environment file without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

Locations:

- `base-action/action.yml:134`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml places `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The value is derived from an untrusted input and is written to the special environment file without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

Locations:

- `base-action/action.yml:173`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first saving it to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout` wrapper). This is the classic unsafe-shell pattern — the script is downloaded and executed in a single pipeline, preventing any inspection or integrity verification before execution.

Locations:

- `base-action/action.yml:158`
- `base-action/action.yml:160`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 6 findings across 3 files:

1. action.yml 'Revoke app token' (script-injection): Moved `${{ steps.run.outputs.github_token }}` into env var `APP_TOKEN`, referenced as `$APP_TOKEN` in the curl command.

2. agent-approval-check/action.yml line 57 (script-injection): Moved `${{ github.action_path }}` into env var `ACTION_PATH`, referenced as `$ACTION_PATH` in the python command.

3. action.yml line 228 'Setup Custom Bun Path' (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

4. base-action/action.yml line 134 'Setup Custom Bun Path' (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

5. base-action/action.yml line 173 'Install Claude Code' (github-env-injection): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

6. base-action/action.yml lines 158/160 'Install Claude Code' (unsafe-shell): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` and the timeout-wrapped variant with downloading to a temp file (`curl -fsSL ... -o "$INSTALL_SCRIPT"`) then executing it (`bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`). Dropped the `--` per rules since it was the shell's option terminator, not the script's. Added cleanup of the temp file.

