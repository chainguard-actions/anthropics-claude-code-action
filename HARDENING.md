<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.201

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.201** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): The 'Revoke app token' step in action.yml directly interpolates ${{ steps.run.outputs.github_token }} inside a run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The steps.*.outputs.* context is an untrusted-input source per the check rules, and any ${{ }} expression directly inside a run: block is a script-injection finding regardless of context.

Locations:

- `action.yml:490`

### script-injection (severity: high)

Rule (a): The run: block in agent-approval-check/action.yml directly interpolates ${{ github.action_path }} inside a shell command string: `python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ }} expression directly inside a run: script is a script-injection finding.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes an untrusted input-derived value to $GITHUB_PATH without sanitization. PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable (caller-controlled), then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written directly: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `action.yml:232`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes an untrusted input-derived value to $GITHUB_PATH without sanitization. PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable (caller-controlled), then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written directly: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:148`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant inside a timeout wrapper). The install script is fetched from the network and executed immediately without first downloading to a file for inspection.

Locations:

- `base-action/action.yml:175`
- `base-action/action.yml:176`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. action.yml (Revoke app token, line 490): Moved `${{ steps.run.outputs.github_token }}` to env block as GITHUB_APP_TOKEN; referenced as $GITHUB_APP_TOKEN in the curl -H Authorization header.

2. agent-approval-check/action.yml (line 57): Moved `${{ github.action_path }}` to the env block as ACTION_PATH; referenced as $ACTION_PATH in the python command. Merged into the existing env block.

3. action.yml (Setup Custom Bun Path, line 232): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path, line 148): Same sanitization fix as #3.

5. base-action/action.yml (Install Claude Code, lines 175-176): Replaced `curl ... | bash -s -- "$CLAUDE_CODE_VERSION"` with download-then-execute pattern: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` (it was the shell's option terminator in the pipe form, not a script argument). Applied to both the timeout-wrapped and plain variants. Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the github-env-injection finding in hardened/action/base-action/action.yml. In the 'Install Claude Code' step, added sanitization of CLAUDE_DIR before writing to $GITHUB_PATH. The fix adds `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and then writes `$safe_claude_dir` instead of `$CLAUDE_DIR` to $GITHUB_PATH. This matches the existing pattern used in the 'Setup Custom Bun Path' step which already correctly sanitizes its BUN_DIR value.

