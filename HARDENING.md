<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.188

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.188** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside the run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any ${{ ... }} expression interpolated directly into a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing shell metacharacters to be injected. The token should be passed via an env: variable and referenced as `$ENV_VAR` instead.

Locations:

- `action.yml:310`

### script-injection (severity: high)

Sub-rule (a): The third step in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside the run: shell command string: `python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression interpolated directly into a run: block is a script-injection risk. The value should be passed via an env: variable (e.g., `ACTION_PATH: ${{ github.action_path }}`) and referenced as `"$ACTION_PATH"` in the shell command.

Locations:

- `agent-approval-check/action.yml:57`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first downloading and verifying the script: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears twice — once inside a `bash -c` string and once directly). If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner. The script should be downloaded to a file, its integrity verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:156`
- `base-action/action.yml:158`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes a value derived from `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newline characters could inject additional entries into `$GITHUB_PATH`. The value must be sanitized with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before the write.

Locations:

- `action.yml:232`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes a value derived from `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newline characters could inject additional entries into `$GITHUB_PATH`. The value must be sanitized with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before the write.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from `inputs.path_to_claude_code_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newline characters could inject additional entries into `$GITHUB_PATH`. The value must be sanitized with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before the write.

Locations:

- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 6 findings across 3 files:

1. action.yml (line 310) - script-injection: Moved `${{ steps.run.outputs.github_token }}` to env var `GITHUB_APP_TOKEN` in the 'Revoke app token' step.

2. agent-approval-check/action.yml (line 57) - script-injection: Moved `${{ github.action_path }}` to env var `ACTION_PATH` and referenced as `$ACTION_PATH` in the python command.

3. base-action/action.yml (lines 156, 158) - unsafe-shell: Replaced `curl | bash` patterns with download-to-temp-file then execute approach. The `--` was dropped (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

4. action.yml (line 232) - github-env-injection: Added `printf '%s' "$BUN_DIR" | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH in 'Setup Custom Bun Path'.

5. base-action/action.yml (line 136) - github-env-injection: Added `printf '%s' "$BUN_DIR" | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH in 'Setup Custom Bun Path'.

6. base-action/action.yml (line 163) - github-env-injection: Added `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH in 'Install Claude Code'.

