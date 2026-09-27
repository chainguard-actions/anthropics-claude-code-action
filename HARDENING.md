<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.177

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.177** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In agent-approval-check/action.yml, the run: block contains `python "${{ github.action_path }}/agent_approval_check.py"` — the expression is substituted by the YAML template engine before the shell ever sees it. Even though github.action_path is GitHub-controlled, any ${{ ... }} directly in a run: block is a script-injection finding per the check rules. The value should be passed via an env: variable and referenced as $GITHUB_ACTION_PATH instead.

Locations:

- `agent-approval-check/action.yml:54`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In the 'Revoke app token' step of action.yml, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — the steps.*.outputs.* context value is substituted by the YAML template engine before the shell executes, bypassing shell quoting. This should be passed via an env: variable (e.g., `GITHUB_TOKEN: ${{ steps.run.outputs.github_token }}`) and referenced as `$GITHUB_TOKEN` in the shell command.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }} (an attacker-controllable input). The script then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`). A newline-embedded input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:237`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }} (an attacker-controllable input). When the input is non-empty, the script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`). A newline-embedded input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:158`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash without first downloading and inspecting it: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant inside a `timeout` wrapper). If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner. The script should be downloaded to a temporary file, its integrity verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml: Replaced `${{ github.action_path }}` in run: block with `$GITHUB_ACTION_PATH` built-in env var.
2. action.yml (Revoke app token): Moved `${{ steps.run.outputs.github_token }}` to env: block as REVOKE_TOKEN, referenced as $REVOKE_TOKEN in curl command.
3. action.yml (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.
4. base-action/action.yml (Setup Custom Bun Path): Same sanitization fix for BUN_DIR before writing to GITHUB_PATH.
5. base-action/action.yml (Install Claude Code): Replaced curl-pipe-to-bash with download-then-execute pattern (temp file, dropped -s and -- per rules), and added sanitization for CLAUDE_DIR before writing to GITHUB_PATH.

