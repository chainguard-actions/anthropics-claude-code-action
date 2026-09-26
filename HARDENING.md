<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.235

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.235** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml interpolates `${{ steps.run.outputs.github_token }}` directly inside a `run:` shell command string (in the `Authorization: Bearer` header of a curl command). This value flows through YAML template substitution before the shell sees it, enabling script injection if the token value contains shell metacharacters.

Locations:

- `action.yml:497`

### script-injection (severity: high)

Sub-rule (a): In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` interpolates `${{ github.action_path }}` directly inside a `run:` shell command string. Any `${{ ... }}` expression directly in a run: block is a script-injection risk as it passes through YAML template substitution before the shell processes it.

Locations:

- `agent-approval-check/action.yml:55`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes a value derived from `inputs.path_to_bun_executable` (an untrusted input) to `$GITHUB_PATH` without sanitization. The input is placed in env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `action.yml:278`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes a value derived from `inputs.path_to_bun_executable` (an untrusted input) to `$GITHUB_PATH` without sanitization. The input is placed in env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:152`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from `inputs.path_to_claude_code_executable` (an untrusted input) to `$GITHUB_PATH` without sanitization. The input is placed in env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:192`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant wrapped in `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). The install script is fetched and executed in a single pipeline without first downloading and verifying it.

Locations:

- `base-action/action.yml:175`
- `base-action/action.yml:173`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 6 findings across 3 files:

1. action.yml (Revoke app token, line 497): Moved `${{ steps.run.outputs.github_token }}` into env var `GITHUB_APP_TOKEN` and referenced it as `$GITHUB_APP_TOKEN` in the curl Authorization header.

2. agent-approval-check/action.yml (line 55): Moved `${{ github.action_path }}` into env var `ACTION_PATH` and merged all env vars into a single `env:` block, referencing `"$ACTION_PATH/agent_approval_check.py"` in the run command.

3. action.yml (Setup Custom Bun Path, line 278): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. base-action/action.yml (Setup Custom Bun Path, line 152): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

5. base-action/action.yml (Install Claude Code, line 192): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

6. base-action/action.yml (Install Claude Code, lines 173/175): Replaced `curl | bash -s -- $VERSION` pipe pattern with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` (it was the shell's option terminator, not the script's). Applied to both the timeout-wrapped and plain variants. Temp file is cleaned up after use.

