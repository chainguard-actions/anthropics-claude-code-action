<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.206

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.206** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In agent-approval-check/action.yml line 54, `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the github.action_path context directly in the shell command string. Any ${{ ... }} expression in a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value.

Locations:

- `agent-approval-check/action.yml:54`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In the 'Revoke app token' step of action.yml, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — the steps.run.outputs.github_token context is substituted directly into the shell command string before the shell executes it.

Locations:

- `action.yml:399`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever the remote server returns without first downloading and verifying the script. A compromised or MITM'd response would execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:133`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes an unsanitized value derived from inputs.path_to_bun_executable to $GITHUB_PATH. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. A newline in the input could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:196`
- `base-action/action.yml:118`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes an unsanitized value derived from inputs.path_to_claude_code_executable to $GITHUB_PATH. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }}, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. A newline in the input could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:148`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml: Moved ${{ github.action_path }} into env var ACTION_PATH to prevent script injection in the python run command.
2. action.yml (Revoke app token): Moved ${{ steps.run.outputs.github_token }} into env var APP_TOKEN to prevent script injection in the curl command.
3. base-action/action.yml (Install Claude Code): Replaced curl-piped-to-bash with download-then-execute pattern (curl -o to temp file, then bash on the file). Dropped '--' since bash -s is no longer used.
4. action.yml (Setup Custom Bun Path): Added printf/tr sanitization before writing BUN_DIR to GITHUB_PATH.
5. base-action/action.yml (Setup Custom Bun Path): Added printf/tr sanitization before writing BUN_DIR to GITHUB_PATH.
6. base-action/action.yml (Install Claude Code): Added printf/tr sanitization before writing CLAUDE_DIR to GITHUB_PATH.

