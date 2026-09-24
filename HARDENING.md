<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.233

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.233** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a `run:` shell command string. In `agent-approval-check/action.yml`, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Per the check rules, any `${{ ... }}` expression directly inside a `run:` block is a script-injection finding regardless of which context it reads from. The safe pattern is to pass the value via an `env:` variable and reference `$GITHUB_ACTION_PATH` (the pre-set env var) or a quoted `"$ENV_VAR"` instead.

Locations:

- `agent-approval-check/action.yml:53`

### github-env-injection (severity: high)

Unsanitized input-derived values are written to $GITHUB_PATH without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. In `action.yml`, the 'Setup Custom Bun Path' step sets `PATH_TO_BUN_EXECUTABLE` from `inputs.path_to_bun_executable`, computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` with no newline sanitization. The same pattern appears in `base-action/action.yml` for both `BUN_DIR` (from `inputs.path_to_bun_executable`) and `CLAUDE_DIR` (from `inputs.path_to_claude_code_executable`). A caller-supplied path containing a newline could inject arbitrary entries into PATH.

Locations:

- `action.yml:255`
- `base-action/action.yml:138`
- `base-action/action.yml:165`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in `base-action/action.yml` pipes a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This is the classic unsafe-shell pattern — the script is not downloaded to a file first and verified before execution. If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes on the runner. The pattern appears twice (once inside a `timeout` wrapper and once in the else branch).

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

1. agent-approval-check/action.yml line 53: Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` to eliminate the ${{ }} expression from the run: block.
2. action.yml ~line 255 (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and wrote `$safe_bun_dir` to $GITHUB_PATH instead of the raw `$BUN_DIR`.
3. base-action/action.yml ~line 138 (Setup Custom Bun Path): Same sanitization applied for BUN_DIR.
4. base-action/action.yml ~lines 152/155 (Install Claude Code): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute pattern using a mktemp file. The `--` was dropped (it was the shell's option terminator, not the script's). Also sanitized CLAUDE_DIR before writing to $GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection in the 'Revoke app token' step of action.yml (line 538). Moved `${{ steps.run.outputs.github_token }}` from the inline curl `-H "Authorization: Bearer ${{ ... }}"` header into an `env:` block as `APP_TOKEN: ${{ steps.run.outputs.github_token }}`, and updated the shell command to reference it as `$APP_TOKEN`. This eliminates the risk of shell metacharacter injection via the token value.

