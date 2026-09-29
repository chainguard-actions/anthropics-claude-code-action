<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (inside a curl -H Authorization header). Any expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it. Fix: pass the token via an env: variable and reference it as `$ENV_VAR` in the shell script.

Locations:

- `action.yml:470`

### script-injection (severity: high)

Rule (a) violation: In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` directly interpolates `${{ github.action_path }}` inside the run: shell command string. Any ${{ }} expression in a run: block is a script-injection risk. Fix: set `AGENT_ACTION_PATH: ${{ github.action_path }}` in an env: block and use `python "$AGENT_ACTION_PATH/agent_approval_check.py"` in the run script.

Locations:

- `agent-approval-check/action.yml:47`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remotely fetched script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout ... bash -c "..."` wrapper). This is unsafe because the script is never inspected before execution. Fix: download the script to a temporary file, verify its integrity (e.g., checksum), then execute it separately.

Locations:

- `base-action/action.yml:147`
- `base-action/action.yml:150`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes an attacker-controlled value to $GITHUB_PATH without sanitization. `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` (untrusted input), then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into GITHUB_PATH. Fix: sanitize with `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing.

Locations:

- `action.yml:237`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes an attacker-controlled value to $GITHUB_PATH without sanitization. `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` (untrusted input), then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. Fix: sanitize with `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing.

Locations:

- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes an attacker-controlled value to $GITHUB_PATH without sanitization. `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable` (untrusted input), then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. Fix: sanitize with `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing.

Locations:

- `base-action/action.yml:170`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 6 findings across 3 files:

1. action.yml (Revoke app token, line 470): Moved `${{ steps.run.outputs.github_token }}` out of the curl -H Authorization header into an `env: APP_TOKEN:` block; shell now references `$APP_TOKEN`.

2. agent-approval-check/action.yml (line 47): Moved `${{ github.action_path }}` out of the `run:` python command into `env: AGENT_ACTION_PATH:`; shell now references `$AGENT_ACTION_PATH`.

3. base-action/action.yml (Install Claude Code, lines 147/150): Replaced `curl ... | bash -s -- $VERSION` pipe pattern with download-to-tempfile then execute: `curl ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). Tempfile is cleaned up after use.

4. action.yml (Setup Custom Bun Path, line 237): Added `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

5. base-action/action.yml (Setup Custom Bun Path, line 130): Added `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

6. base-action/action.yml (Install Claude Code, line 170): Added `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

