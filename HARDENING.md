<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.232

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.232** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The `run:` block in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ }}` expression interpolated directly in a `run:` block is a script-injection risk, as the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside the `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This expression is substituted by the template engine before the shell executes, allowing a malicious token value containing shell metacharacters to inject commands.

Locations:

- `action.yml:336`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from `inputs.path_to_bun_executable` (an attacker-controllable input) to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `action.yml:222`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes a value derived from `inputs.path_to_bun_executable` (an attacker-controllable input) to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:116`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from `inputs.path_to_claude_code_executable` (an attacker-controllable input) to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:160`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and also inside `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). The install script is downloaded and executed in a single pipeline without first saving it to a file for inspection.

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:133`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` from the run command into an `ACTION_PATH` env var; shell now uses `$ACTION_PATH`.

2. action.yml (script-injection, Revoke app token): Moved `${{ steps.run.outputs.github_token }}` into an `APP_GITHUB_TOKEN` env var; curl now uses `$APP_GITHUB_TOKEN`.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (github-env-injection, Install Claude Code): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

6. base-action/action.yml (unsafe-shell, Install Claude Code): Replaced both curl-pipe-to-bash patterns with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` as it was the shell's option terminator in the pipe form. Temp file is cleaned up after use.

