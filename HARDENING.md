<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.168

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.168** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside the run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any ${{ ... }} expression in a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing newlines or shell metacharacters to break out of the string context.

Locations:

- `action.yml:399`

### script-injection (severity: high)

Sub-rule (a): The agent-approval-check step directly interpolates `${{ github.action_path }}` inside the run: shell command string: `python "${{ github.action_path }}/agent_approval_check.py"`. Even though github.action_path is GitHub-controlled, any ${{ ... }} expression directly inside a run: block is a script-injection finding per the check rules. The value should be passed via an env: variable and referenced as `"$ACTION_PATH"` in the script.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` to the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:233`
- `base-action/action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps `inputs.path_to_claude_code_executable` to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote install script directly to bash without first downloading and inspecting it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern appears twice (once inside a `timeout` wrapper and once in the else branch). If the remote URL is compromised or redirected, arbitrary code executes on the runner immediately.

Locations:

- `base-action/action.yml:163`
- `base-action/action.yml:165`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml - 'Revoke app token' step (script-injection): Moved `${{ steps.run.outputs.github_token }}` to env var `GITHUB_APP_TOKEN`, referenced as `$GITHUB_APP_TOKEN` in the shell script.

2. agent-approval-check/action.yml - python run step (script-injection): Moved `${{ github.action_path }}` to env var `ACTION_PATH`, referenced as `$ACTION_PATH` in the shell script.

3. action.yml - 'Setup Custom Bun Path' step (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

4. base-action/action.yml - 'Setup Custom Bun Path' step (github-env-injection): Same sanitization fix as above.

5. base-action/action.yml - 'Install Claude Code' step (github-env-injection): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

6. base-action/action.yml - 'Install Claude Code' step (unsafe-shell): Replaced both `curl | bash` patterns with download-then-execute. Script is downloaded to a mktemp file, then executed with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's stdin-mode option terminator, not an argument to the install script). Temp file is cleaned up after installation.

