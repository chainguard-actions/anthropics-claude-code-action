<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.238

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.238** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly embeds `${{ steps.run.outputs.github_token }}` inside the run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any ${{ }} expression interpolated directly into a shell command is a script-injection risk — the value is substituted by the Actions runner before the shell ever sees it, bypassing quoting.

Locations:

- `action.yml:440`

### script-injection (severity: high)

Sub-rule (a): In agent-approval-check/action.yml, the run: block directly embeds `${{ github.action_path }}` inside the shell command: `python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ }} expression interpolated directly into a run: shell command string is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:58`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var PATH_TO_BUN_EXECUTABLE is set from `inputs.path_to_bun_executable` (attacker-controlled). The script then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:238`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from `inputs.path_to_claude_code_executable` (attacker-controlled). The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to a shell interpreter: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the timeout-wrapped variant `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). This pattern executes whatever the remote server returns without first downloading and verifying the script.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 security findings across 3 files:

1. action.yml (Revoke app token, line ~440): Moved `${{ steps.run.outputs.github_token }}` out of the shell command into an env var `GITHUB_APP_TOKEN`, referenced as `$GITHUB_APP_TOKEN` in the curl command.

2. agent-approval-check/action.yml (line ~58): Moved `${{ github.action_path }}` into an env var `ACTION_PATH` in the same step's env: block, referenced as `$ACTION_PATH` in the python command. Consolidated all env vars into the single run step.

3. action.yml (Setup Custom Bun Path, line ~238): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path, line ~130): Same sanitization fix as above.

5. base-action/action.yml (Install Claude Code, lines ~155 and ~175): Fixed unsafe-shell by downloading the install script to a temp file via `mktemp` and executing it separately (dropping the `--` shell option terminator that was only needed in the pipe form). Fixed github-env-injection by adding `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

