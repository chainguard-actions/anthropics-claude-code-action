<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.168

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.168** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is interpolated directly inside a `run:` shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:52`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` (a `steps.*.outputs.*` context, which is workflow-controllable) is interpolated directly inside a `run:` shell command in the 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This allows the value to be parsed by the shell before any quoting takes effect.

Locations:

- `action.yml:368`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` — derived from `inputs.path_to_bun_executable` via the env var `PATH_TO_BUN_EXECUTABLE` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline injected into the input could add arbitrary entries to PATH. Pattern: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"); echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:175`
- `base-action/action.yml:116`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` — derived from `inputs.path_to_claude_code_executable` via the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline injected into the input could add arbitrary entries to PATH. Pattern: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"); echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:143`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout` wrapper). This pattern executes whatever the remote server returns without any integrity verification.

Locations:

- `base-action/action.yml:130`
- `base-action/action.yml:132`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. agent-approval-check/action.yml (line 52): Moved `${{ github.action_path }}` to env block as ACTION_PATH, referenced as $ACTION_PATH in run command.

2. action.yml (line 368, Revoke app token): Moved `${{ steps.run.outputs.github_token }}` to env block as APP_TOKEN, referenced as $APP_TOKEN in curl Authorization header.

3. action.yml (line 175, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (line 116, Setup Custom Bun Path): Same BUN_DIR sanitization fix as above.

5. base-action/action.yml (lines 130/132 and 143, Install Claude Code): (a) Replaced curl-pipe-to-bash with download-then-execute pattern using mktemp; dropped the '--' separator as it was the shell's option terminator; (b) Added CLAUDE_DIR sanitization before writing to $GITHUB_PATH.

