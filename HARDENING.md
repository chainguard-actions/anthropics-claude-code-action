<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.209

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.209** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The expression `${{ steps.run.outputs.github_token }}` is interpolated directly inside the `run:` shell command string in the 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression directly in a `run:` block is substituted by the YAML template engine before the shell sees it, bypassing shell quoting and enabling injection if the value contains shell metacharacters.

Locations:

- `action.yml:476`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived via `dirname` from `$PATH_TO_BUN_EXECUTABLE`, which is set from `inputs.path_to_bun_executable`) to `$GITHUB_PATH` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A caller-supplied value containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `action.yml:233`
- `base-action/action.yml:133`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` (derived via `dirname` from `$PATH_TO_CLAUDE_CODE_EXECUTABLE`, which is set from `inputs.path_to_claude_code_executable`) to `$GITHUB_PATH` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A caller-supplied value containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:168`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote server is compromised or the connection is intercepted, arbitrary code executes on the runner. The script should be downloaded to a temporary file, verified (e.g., checksum), and then executed separately.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:153`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across action.yml and base-action/action.yml:
1. script-injection (action.yml ~line 476): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` block into an `env:` var `GITHUB_APP_TOKEN`, referenced as `$GITHUB_APP_TOKEN` in the curl command.
2. github-env-injection (action.yml ~line 233): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in the 'Setup Custom Bun Path' step.
3. github-env-injection (base-action/action.yml ~line 133): Same BUN_DIR sanitization in the base-action's 'Setup Custom Bun Path' step.
4. github-env-injection + unsafe-shell (base-action/action.yml ~lines 152-168): Rewrote the 'Install Claude Code' step to download install.sh to a mktemp file before executing it (dropping `-s` and `--` from the original pipe form), and added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing CLAUDE_DIR to $GITHUB_PATH. Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` command of `agent-approval-check/action.yml` (line 55) with the `$GITHUB_ACTION_PATH` environment variable. GitHub Actions always sets this variable for composite action steps, so the behavior is identical but the value is no longer interpolated via YAML template substitution before reaching the shell.

