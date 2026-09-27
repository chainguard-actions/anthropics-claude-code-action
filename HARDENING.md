<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.167

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.167** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is interpolated directly inside a `run:` shell command string. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds a GitHub Actions expression directly into the shell command before the shell ever sees it, which is a script-injection risk regardless of whether the context is attacker-controlled.

Locations:

- `agent-approval-check/action.yml:57`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` is interpolated directly inside a `run:` shell command string in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The `steps.*.outputs.*` context is listed as an untrusted-input source and must not appear directly in a run: block.

Locations:

- `action.yml:374`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived via `dirname` from `$PATH_TO_BUN_EXECUTABLE`, which is set from `inputs.path_to_bun_executable`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newline characters could inject arbitrary entries into GITHUB_PATH. Offending line: `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:176`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` (derived via `dirname` from `$PATH_TO_CLAUDE_CODE_EXECUTABLE`, which is set from `inputs.path_to_claude_code_executable`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newline characters could inject arbitrary entries into GITHUB_PATH. Offending line: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside a `timeout` wrapper). This pattern executes whatever the remote server returns without first downloading and verifying the script.

Locations:

- `base-action/action.yml:148`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` to env block as ACTION_PATH; run command now uses `$ACTION_PATH`.

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` to env block as REVOKE_TOKEN; curl command now uses `$REVOKE_TOKEN`.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as above for BUN_DIR.

5. base-action/action.yml (unsafe-shell + github-env-injection, Install Claude Code): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern using mktemp; dropped `-s` and `--` from the execution (they were shell stdin-reading options, not script arguments); added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing CLAUDE_DIR to GITHUB_PATH.

