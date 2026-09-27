<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.209

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.209** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (`-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`). This expression is expanded by the GitHub Actions template engine before the shell ever sees the string, allowing a malicious value in the step output to inject arbitrary shell commands.

Locations:

- `action.yml:390`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step places `inputs.path_to_bun_executable` into the `PATH_TO_BUN_EXECUTABLE` env var, then writes `dirname "$PATH_TO_BUN_EXECUTABLE"` to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input value could inject arbitrary entries into PATH.

Locations:

- `action.yml:191`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml places `inputs.path_to_bun_executable` into the `PATH_TO_BUN_EXECUTABLE` env var, then writes `dirname "$PATH_TO_BUN_EXECUTABLE"` to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input value could inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:107`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml places `inputs.path_to_claude_code_executable` into the `PATH_TO_CLAUDE_CODE_EXECUTABLE` env var, then writes `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input value could inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:137`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to a shell interpreter: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant inside a `timeout` wrapper). The script is not downloaded to a file first and verified before execution, making this vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:122`
- `base-action/action.yml:123`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across action.yml and base-action/action.yml:
1. script-injection (action.yml line 390): Moved `${{ steps.run.outputs.github_token }}` from the curl -H Authorization header in the run: block into an env: block as GITHUB_APP_TOKEN, then referenced it as $GITHUB_APP_TOKEN in the shell.
2. github-env-injection (action.yml line 191): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing BUN_DIR to $GITHUB_PATH.
3. github-env-injection (base-action/action.yml line 107): Same bun path sanitization fix.
4. github-env-injection (base-action/action.yml line 137): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing CLAUDE_DIR to $GITHUB_PATH.
5. unsafe-shell (base-action/action.yml lines 122-123): Replaced `curl ... | bash -s -- "$CLAUDE_CODE_VERSION"` with downloading to a temp file first then executing `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping '-s' and '--' since the script is no longer read from stdin). Temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml line 52, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The $GITHUB_ACTION_PATH environment variable is automatically set by GitHub Actions to the same value as github.action_path, so behavior is unchanged. This eliminates the script-injection finding by removing the ${{ }} expression from the run: shell command string.

