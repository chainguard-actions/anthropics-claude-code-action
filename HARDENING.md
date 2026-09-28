<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.193

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.193** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ steps.run.outputs.github_token }} expression is directly interpolated inside a run: shell command in the 'Revoke app token' step. The curl Authorization header contains the raw expression: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any ${{ ... }} expression directly in a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value.

Locations:

- `action.yml:499`

### script-injection (severity: high)

Sub-rule (a): A ${{ github.action_path }} expression is directly interpolated inside a run: shell command: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression directly in a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value. The value should be passed via an env: variable instead.

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever the remote server returns without any integrity verification. The script should be downloaded to a file first, verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:133`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newline characters could inject arbitrary entries into GITHUB_PATH. The value must be sanitized with `printf '%s' ... | tr -d '\n\r'` before the write.

Locations:

- `action.yml:237`
- `base-action/action.yml:118`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }}, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newline characters could inject arbitrary entries into GITHUB_PATH. The value must be sanitized with `printf '%s' ... | tr -d '\n\r'` before the write.

Locations:

- `base-action/action.yml:148`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files: (1) action.yml Revoke app token step: moved ${{ steps.run.outputs.github_token }} to env: block as APP_TOKEN; (2) agent-approval-check/action.yml: moved ${{ github.action_path }} to env: block as ACTION_PATH; (3) base-action/action.yml Install Claude Code: converted both curl|bash pipe forms to download-then-execute (curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"), dropping the '--' shell option terminator; (4) action.yml Setup Custom Bun Path: sanitized BUN_DIR with printf|tr -d '\n\r' before writing to GITHUB_PATH; (5) base-action/action.yml Setup Custom Bun Path and Install Claude Code: sanitized BUN_DIR and CLAUDE_DIR with printf|tr -d '\n\r' before writing to GITHUB_PATH.

