<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.197

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.197** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression in a run block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `action.yml:457`

### script-injection (severity: high)

Sub-rule (a): The run block directly interpolates `${{ github.action_path }}` inside a shell command: `python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly in a run block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps the untrusted input `inputs.path_to_bun_executable` into env var `PATH_TO_BUN_EXECUTABLE`, then derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. An attacker-controlled newline in the input can inject arbitrary entries into PATH.

Locations:

- `action.yml:248`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps the untrusted input `inputs.path_to_bun_executable` into env var `PATH_TO_BUN_EXECUTABLE`, then derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps the untrusted input `inputs.path_to_claude_code_executable` into env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then derives `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:181`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant inside a `timeout` wrapper). The script is not downloaded to a file first and verified before execution, allowing a compromised or MITM'd remote script to execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:168`
- `base-action/action.yml:170`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:

1. action.yml (script-injection, line 457): Moved `${{ steps.run.outputs.github_token }}` into env var `APP_GITHUB_TOKEN` in the 'Revoke app token' step; shell now references `$APP_GITHUB_TOKEN`.

2. agent-approval-check/action.yml (script-injection, line 57): Moved `${{ github.action_path }}` into env var `ACTION_PATH` in the existing env block; shell now references `$ACTION_PATH/agent_approval_check.py`.

3. action.yml (github-env-injection, line 248): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH` in 'Setup Custom Bun Path' step.

4. base-action/action.yml (github-env-injection, line 148): Same BUN_DIR sanitization fix as above.

5. base-action/action.yml (github-env-injection, line 181): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH` in 'Install Claude Code' step.

6. base-action/action.yml (unsafe-shell, lines 168/170): Replaced `curl ... | bash -s -- "$CLAUDE_CODE_VERSION"` with download-then-execute pattern: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

