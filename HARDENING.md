<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.212

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.212** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates ${{ steps.run.outputs.github_token }} inside a run: shell command string, specifically in a curl -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" header. Any ${{ ... }} expression directly inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing an attacker-controlled value to inject shell metacharacters.

Locations:

- `action.yml:499`

### script-injection (severity: high)

Sub-rule (a): The agent-approval-check action directly interpolates ${{ github.action_path }} inside a run: shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression directly inside a run: block is a script-injection risk regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant wrapped in `timeout ... bash -c "curl ... | bash -s -- ..."`). This allows a compromised or MitM'd remote server to execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:161`
- `base-action/action.yml:163`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes a value derived from the untrusted input inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The required sanitization step (printf '%s' ... | tr -d '\n\r') is absent.

Locations:

- `action.yml:248`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes a value derived from the untrusted input inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The required sanitization step (printf '%s' ... | tr -d '\n\r') is absent.

Locations:

- `base-action/action.yml:140`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from the untrusted input inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }}, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The required sanitization step (printf '%s' ... | tr -d '\n\r') is absent.

Locations:

- `base-action/action.yml:172`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 6 security findings across 3 files:

1. **script-injection (action.yml line 499)**: Moved `${{ steps.run.outputs.github_token }}` from the curl Authorization header in the `run:` block to an `env:` block as `GITHUB_APP_TOKEN`, referenced as `$GITHUB_APP_TOKEN` in the shell command.

2. **script-injection (agent-approval-check/action.yml line 55)**: Moved `${{ github.action_path }}` from the `run:` command string to an `env:` block as `ACTION_PATH`, referenced as `$ACTION_PATH` in the shell command. Merged all env vars into the single step.

3. **unsafe-shell (base-action/action.yml lines 161/163)**: Replaced both `curl | bash` patterns with download-then-execute: curl downloads to a temp file via `mktemp`, then bash executes the file directly. The `--` was dropped (it was the shell's option terminator, not the script's argument). Temp file cleanup added.

4. **github-env-injection (action.yml line 248)**: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH`.

5. **github-env-injection (base-action/action.yml line 140)**: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH`.

6. **github-env-injection (base-action/action.yml line 172)**: Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH`.

