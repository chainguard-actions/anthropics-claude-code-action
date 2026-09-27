<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.179

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.179** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command in the 'Revoke app token' step. The expression is substituted by the GitHub Actions template engine before the shell sees the string, allowing any newlines or shell metacharacters in the token value to be interpreted by the shell. Offending line: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:403`

### script-injection (severity: high)

Rule (a): `${{ github.action_path }}` is directly interpolated inside a `run:` shell command in agent-approval-check/action.yml. Any `${{ ... }}` expression directly inside a `run:` script is a script-injection finding regardless of which context it reads from. Offending line: `run: python "${{ github.action_path }}/agent_approval_check.py"`

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern (and its `timeout ... bash -c "curl ... | bash ..."` variant) executes whatever the remote server returns without first downloading and verifying the script. A compromised or MITM'd server could execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from `inputs.path_to_bun_executable` (an attacker-controllable input) to `$GITHUB_PATH` without sanitization. The value flows: `inputs.path_to_bun_executable` → env var `PATH_TO_BUN_EXECUTABLE` → `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` → `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The `dirname` command does not strip newlines, so a crafted input containing a newline can inject arbitrary entries into `$GITHUB_PATH`. The required sanitization (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:189`
- `base-action/action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from `inputs.path_to_claude_code_executable` (an attacker-controllable input) to `$GITHUB_PATH` without sanitization. The value flows: `inputs.path_to_claude_code_executable` → env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` → `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` → `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A crafted input containing a newline can inject arbitrary entries into `$GITHUB_PATH`. The required sanitization (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`) is absent.

Locations:

- `base-action/action.yml:168`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (Revoke app token, line 403): Moved `${{ steps.run.outputs.github_token }}` to env block as APP_TOKEN, referenced as $APP_TOKEN in shell.

2. agent-approval-check/action.yml (line 55): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` using the built-in env var.

3. base-action/action.yml (lines 155/157): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` (both the timeout variant and the plain variant) with download-then-execute pattern using a temp file. Dropped the `--` shell option terminator as instructed.

4. action.yml (line 189) and base-action/action.yml (line 136): Sanitized BUN_DIR before writing to $GITHUB_PATH using `printf '%s' "$BUN_DIR" | tr -d '\n\r'`.

5. base-action/action.yml (line 168): Sanitized CLAUDE_DIR before writing to $GITHUB_PATH using `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`.

