<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.204

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.204** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ ... }} expression is directly interpolated inside a run: shell command string in the 'Revoke app token' step. The line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` embeds the steps context value directly into the shell command before the shell ever sees it, allowing injection if the token value contains shell metacharacters. The value should be passed via an env: variable and referenced as `$ENV_VAR` instead.

Locations:

- `action.yml:379`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification. The script should be downloaded to a temporary file, verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:143`
- `base-action/action.yml:145`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

1. script-injection (action.yml, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of the run: shell string into an env: block as GITHUB_TOKEN_TO_REVOKE, then referenced it as $GITHUB_TOKEN_TO_REVOKE in the curl command.
2. unsafe-shell (base-action/action.yml, Install Claude Code step): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach: curl downloads to a mktemp file, then bash executes the file directly with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The '--' was dropped per instructions (it was the shell's stdin-option terminator, not the script's argument). The temp file is cleaned up on both success and failure paths.

### Iteration 2

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Fixed three security findings:
1. action.yml (Setup Custom Bun Path, ~line 180): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and used `$safe_bun_dir` when writing to $GITHUB_PATH to prevent newline injection.
2. base-action/action.yml (Setup Custom Bun Path, ~line 131): Same BUN_DIR sanitization applied.
3. base-action/action.yml (Install Claude Code, ~line 163): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and used `$safe_claude_dir` when writing to $GITHUB_PATH.
4. agent-approval-check/action.yml (line 57): Moved `${{ github.action_path }}` out of the run: shell command into an env var `ACTION_PATH: ${{ github.action_path }}`, then referenced it as `"$ACTION_PATH/agent_approval_check.py"` in the shell command.

