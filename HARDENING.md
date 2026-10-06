<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.244

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.244** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A github.* context expression is directly interpolated inside a run: shell command string. The line `- run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. While github.action_path is GitHub-controlled, any ${{ ... }} expression inside a run: block is a script-injection risk because the value flows through YAML template substitution before the shell ever sees it. It should be passed via an env: variable instead.

Locations:

- `agent-approval-check/action.yml:56`

### script-injection (severity: high)

Sub-rule (a): A steps.*.outputs.* expression is directly interpolated inside a run: shell command string. In the 'Revoke app token' step, the line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` embeds a step output directly into the curl command. This value should be passed via an env: variable (e.g., `TOKEN: ${{ steps.run.outputs.github_token }}`) and referenced as `$TOKEN` in the shell script.

Locations:

- `action.yml:537`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The flow is: `PATH_TO_BUN_EXECUTABLE: ${{ inputs.path_to_bun_executable }}` → `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` → `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The value should be sanitized with `printf '%s' "$PATH_TO_BUN_EXECUTABLE" | tr -d '\n\r'` before use.

Locations:

- `action.yml:248`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The flow is: `PATH_TO_BUN_EXECUTABLE: ${{ inputs.path_to_bun_executable }}` → `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` → `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The value should be sanitized with `printf '%s' "$PATH_TO_BUN_EXECUTABLE" | tr -d '\n\r'` before use.

Locations:

- `base-action/action.yml:138`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The flow is: `PATH_TO_CLAUDE_CODE_EXECUTABLE: ${{ inputs.path_to_claude_code_executable }}` → `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` → `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The value should be sanitized with `printf '%s' "$PATH_TO_CLAUDE_CODE_EXECUTABLE" | tr -d '\n\r'` before use.

Locations:

- `base-action/action.yml:157`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification. The script should be downloaded to a file first, its integrity verified (e.g., via checksum), and then executed separately. This pattern appears twice in the same step (with and without the `timeout` wrapper).

Locations:

- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 6 findings across 3 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` into env var ACTION_PATH and used `$ACTION_PATH` in the run command.

2. action.yml (line 537, Revoke app token): Moved `${{ steps.run.outputs.github_token }}` into env var GITHUB_APP_TOKEN and used `$GITHUB_APP_TOKEN` in the curl Authorization header.

3. action.yml (line 248, Setup Custom Bun Path): Sanitized PATH_TO_BUN_EXECUTABLE with `printf '%s' "$PATH_TO_BUN_EXECUTABLE" | tr -d '\n\r'` before writing dirname to $GITHUB_PATH.

4. base-action/action.yml (line 138, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (line 157, Install Claude Code - github-env-injection): Sanitized PATH_TO_CLAUDE_CODE_EXECUTABLE with `printf '%s' | tr -d '\n\r'` before writing dirname to $GITHUB_PATH.

6. base-action/action.yml (line 157, Install Claude Code - unsafe-shell): Replaced `curl ... | bash -s -- $VERSION` (both timeout-wrapped and plain forms) with download-then-execute pattern: `curl -fsSL ... -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` as it was the shell's option terminator, not the script's argument.

