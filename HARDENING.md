<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.230

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.230** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ }}` expression is interpolated directly inside a `run:` shell command string. In action.yml's 'Revoke app token' step, `${{ steps.run.outputs.github_token }}` is embedded directly in the curl command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This allows the value to be interpreted by the shell before quoting can protect it. In agent-approval-check/action.yml, `${{ github.action_path }}` is interpolated directly in `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk regardless of context.

Locations:

- `action.yml:399`
- `agent-approval-check/action.yml:52`

### github-env-injection (severity: high)

Unsanitized user-controlled input values are written to $GITHUB_PATH without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. In action.yml 'Setup Custom Bun Path': `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`, where PATH_TO_BUN_EXECUTABLE comes from `inputs.path_to_bun_executable`. The same pattern exists in base-action/action.yml for both the 'Setup Custom Bun Path' step (inputs.path_to_bun_executable → BUN_DIR → GITHUB_PATH) and the 'Install Claude Code' step (inputs.path_to_claude_code_executable → CLAUDE_DIR → GITHUB_PATH). An attacker-controlled newline in the input can inject arbitrary entries into PATH.

Locations:

- `action.yml:261`
- `base-action/action.yml:148`
- `base-action/action.yml:183`

### unsafe-shell (severity: high)

base-action/action.yml 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and verifying the script. If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner. The same pattern appears in a `timeout` wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `base-action/action.yml:172`
- `base-action/action.yml:174`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all three security findings across three files:

1. **script-injection** (action.yml, 'Revoke app token'): Moved `${{ steps.run.outputs.github_token }}` into an `env:` block as `APP_GITHUB_TOKEN` and referenced it as `$APP_GITHUB_TOKEN` in the curl command.

2. **script-injection** (agent-approval-check/action.yml): Moved `${{ github.action_path }}` into an `env:` block as `ACTION_PATH` and referenced it as `$ACTION_PATH` in the python command. Merged the env vars from the original step into the same step.

3. **github-env-injection** (action.yml, 'Setup Custom Bun Path'): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. **github-env-injection** (base-action/action.yml, 'Setup Custom Bun Path'): Same sanitization fix as above.

5. **github-env-injection** (base-action/action.yml, 'Install Claude Code'): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

6. **unsafe-shell** (base-action/action.yml, 'Install Claude Code'): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern using `mktemp`. The `-s` and `--` are dropped (they were shell pipe artifacts), and the version is passed directly as a positional argument to the script file. Temp file is cleaned up after use.

