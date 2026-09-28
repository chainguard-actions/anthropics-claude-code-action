<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.182

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.182** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. In the 'Revoke app token' step, the value ${{ steps.run.outputs.github_token }} is embedded directly in the curl command: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}". The steps.*.outputs.* context is workflow-controllable and must not appear directly in run: blocks; it should be passed via an env: variable instead.

Locations:

- `action.yml:490`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, inputs.path_to_bun_executable is mapped to env var PATH_TO_BUN_EXECUTABLE, then used to compute BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), and the result is written to $GITHUB_PATH with 'echo "$BUN_DIR" >> "$GITHUB_PATH"' without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:233`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, inputs.path_to_bun_executable is mapped to env var PATH_TO_BUN_EXECUTABLE, then used to compute BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), and the result is written to $GITHUB_PATH with 'echo "$BUN_DIR" >> "$GITHUB_PATH"' without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, inputs.path_to_claude_code_executable is mapped to env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then used to compute CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), and the result is written to $GITHUB_PATH with 'echo "$CLAUDE_DIR" >> "$GITHUB_PATH"' without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:168`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: 'curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION'. This pattern executes whatever the remote server returns without first downloading and verifying the script. This appears twice (once inside a timeout wrapper and once in the else branch).

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across action.yml and base-action/action.yml:
1. script-injection (action.yml): Moved `${{ steps.run.outputs.github_token }}` to env block as GITHUB_APP_TOKEN in the 'Revoke app token' step.
2. github-env-injection (action.yml): Sanitized BUN_DIR with `printf '%s' | tr -d '\n\r'` before writing to GITHUB_PATH in 'Setup Custom Bun Path'.
3. github-env-injection (base-action/action.yml): Same BUN_DIR sanitization fix in 'Setup Custom Bun Path'.
4. github-env-injection (base-action/action.yml): Sanitized CLAUDE_DIR with `printf '%s' | tr -d '\n\r'` before writing to GITHUB_PATH in 'Install Claude Code'.
5. unsafe-shell (base-action/action.yml): Replaced `curl | bash -s -- $VERSION` with download-then-execute pattern: `curl -fsSL ... -o "$INSTALL_SCRIPT"` then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` in hardened/action/agent-approval-check/action.yml. The $GITHUB_ACTION_PATH environment variable is automatically set by GitHub Actions and is always available in composite steps, so no other changes were needed. This eliminates the YAML template substitution that caused the script-injection finding.

