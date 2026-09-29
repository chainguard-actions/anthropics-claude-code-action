<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.219

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.219** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In action.yml's 'Revoke app token' step, ${{ steps.run.outputs.github_token }} is embedded directly in a curl -H header string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This allows the value to be parsed by the YAML template engine before the shell sees it, enabling injection if the output contains shell metacharacters.

Locations:

- `action.yml:497`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds ${{ github.action_path }} directly in the shell command string. Any ${{ ... }} expression in a run: block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:48`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the value of inputs.path_to_bun_executable is placed into the PATH_TO_BUN_EXECUTABLE env var, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A newline in the input could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:233`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the value of inputs.path_to_claude_code_executable is placed into the PATH_TO_CLAUDE_CODE_EXECUTABLE env var, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A newline in the input could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, remote content is piped directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and verifying the script. The pattern appears twice (once inside a timeout wrapper and once in the else branch).

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (script-injection, line 497): Moved `${{ steps.run.outputs.github_token }}` to env block as GITHUB_APP_TOKEN in the 'Revoke app token' step.

2. agent-approval-check/action.yml (script-injection, line 48): Moved `${{ github.action_path }}` to env block as ACTION_PATH, merged with existing env block, and referenced as $ACTION_PATH in the run command.

3. action.yml (github-env-injection, line 233): Sanitized BUN_DIR with `printf '%s' | tr -d '\n\r'` before writing to GITHUB_PATH in 'Setup Custom Bun Path'.

4. base-action/action.yml (github-env-injection, lines 131 and 163): Sanitized BUN_DIR and CLAUDE_DIR with `printf '%s' | tr -d '\n\r'` before writing to GITHUB_PATH in both 'Setup Custom Bun Path' and 'Install Claude Code' steps.

5. base-action/action.yml (unsafe-shell, lines 148/150): Replaced `curl | bash -s -- VERSION` with download-then-execute pattern using a mktemp file. Dropped the `--` (it was the shell's option terminator, not the script's). The temp file is cleaned up after installation.

