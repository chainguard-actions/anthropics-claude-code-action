<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.191

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.191** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml interpolates ${{ steps.run.outputs.github_token }} directly inside a run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any ${{ ... }} expression in a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value.

Locations:

- `action.yml:499`

### script-injection (severity: high)

Sub-rule (a): The run: step in agent-approval-check/action.yml interpolates ${{ github.action_path }} directly inside a shell command string: `python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression in a run: block is a script-injection risk regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `action.yml:234`
- `base-action/action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from the untrusted input inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }}, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:167`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first saving it to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout bash -c "..."` wrapper). This allows the remote server to execute arbitrary code on the runner without any integrity verification.

Locations:

- `base-action/action.yml:156`
- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (Revoke app token): Moved ${{ steps.run.outputs.github_token }} to env: block as APP_TOKEN, referenced as $APP_TOKEN in curl command.

2. agent-approval-check/action.yml: Moved ${{ github.action_path }} to env: block as ACTION_PATH, merged with existing env block, referenced as "$ACTION_PATH/agent_approval_check.py" in run.

3. action.yml (Setup Custom Bun Path): Added printf/tr sanitization before writing BUN_DIR to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path): Added printf/tr sanitization before writing BUN_DIR to $GITHUB_PATH.

5. base-action/action.yml (Install Claude Code): (a) Fixed unsafe-shell: replaced both curl-pipe-to-bash patterns with download-to-tempfile then execute; dropped '--' (was shell's option terminator from 'bash -s --', not the script's argument); cleaned up temp file after use. (b) Fixed github-env-injection: added printf/tr sanitization before writing CLAUDE_DIR to $GITHUB_PATH.

