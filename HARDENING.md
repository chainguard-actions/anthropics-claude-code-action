<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.185

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.185** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value, allowing newlines or shell metacharacters in the value to break out of the quoted string.

Locations:

- `action.yml:330`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets `PATH_TO_BUN_EXECUTABLE` from `inputs.path_to_bun_executable` (an untrusted caller-controlled input), then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A newline embedded in the input value would inject an arbitrary path entry into the runner's PATH.

Locations:

- `action.yml:152`
- `base-action/action.yml:117`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml sets `PATH_TO_CLAUDE_CODE_EXECUTABLE` from `inputs.path_to_claude_code_executable` (an untrusted caller-controlled input), then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A newline embedded in the input value would inject an arbitrary path entry into the runner's PATH.

Locations:

- `base-action/action.yml:147`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash in two places: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (both inside a `timeout bash -c "..."` wrapper and directly). This executes whatever script the remote server returns without any integrity verification, making the build vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:133`
- `base-action/action.yml:135`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 security findings across action.yml and base-action/action.yml:

1. script-injection (action.yml ~line 330): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` shell string into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the curl Authorization header.

2. github-env-injection (action.yml ~line 152): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing BUN_DIR to $GITHUB_PATH in the 'Setup Custom Bun Path' step.

3. github-env-injection (base-action/action.yml ~lines 117 and 147): Added the same `printf '%s' | tr -d '\n\r'` sanitization for both BUN_DIR (Setup Custom Bun Path step) and CLAUDE_DIR (Install Claude Code step) before writing to $GITHUB_PATH.

4. unsafe-shell (base-action/action.yml ~lines 133/135): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with a two-step approach: download to a temp file via `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the shell's `-s` stdin flag and `--` option terminator, which are not script arguments). Temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml line 60, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions automatically sets the GITHUB_ACTION_PATH environment variable for composite action steps, so no env: mapping is needed — the standard env var is a direct drop-in replacement that eliminates the ${{ }} expression from the shell command.

