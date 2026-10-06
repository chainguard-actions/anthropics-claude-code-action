<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.243

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.243** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the github.action_path context directly in the shell command. While github.action_path is GitHub-controlled, any ${{ ... }} expression inside a run: block is a script-injection finding per the check rules. The value should be passed via an env: variable and referenced as $GITHUB_ACTION_PATH instead.

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

Remote content is piped directly to bash without first downloading to a file. Two occurrences of `curl -fsSL https://claude.ai/install.sh | bash` (one inside a `timeout ... bash -c "..."` wrapper and one direct) pipe the install script from a remote URL directly into bash. If the remote server is compromised or the URL is hijacked, arbitrary code executes on the runner. The script should be downloaded to a temporary file, its integrity verified (e.g., checksum), and then executed separately.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:158`

### github-env-injection (severity: high)

User-controlled inputs are written to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). In the 'Setup Custom Bun Path' step, `inputs.path_to_bun_executable` is mapped to the env var PATH_TO_BUN_EXECUTABLE, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and `echo "$BUN_DIR" >> "$GITHUB_PATH"` writes it to GITHUB_PATH without stripping newlines. A newline in the input could inject arbitrary entries into PATH. The same pattern occurs in base-action/action.yml for both `inputs.path_to_bun_executable` (BUN_DIR → GITHUB_PATH) and `inputs.path_to_claude_code_executable` (CLAUDE_DIR → GITHUB_PATH).

Locations:

- `action.yml:250`
- `base-action/action.yml:130`
- `base-action/action.yml:168`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 3 security findings across 3 files:

1. script-injection (agent-approval-check/action.yml): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` to avoid embedding a ${{ }} expression in a run: shell command.

2. unsafe-shell (base-action/action.yml): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` occurrences (one in a timeout wrapper, one direct) with a two-step approach: download to a temp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped `-s` and `--` since the script is now run from a file, not stdin.

3. github-env-injection (3 locations): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR to $GITHUB_PATH in action.yml (line 250) and base-action/action.yml (line 130), and before writing CLAUDE_DIR to $GITHUB_PATH in base-action/action.yml (line 168). This prevents newline injection into PATH via user-controlled path_to_bun_executable and path_to_claude_code_executable inputs.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection finding in the 'Revoke app token' step of hardened/action/action.yml. Moved `${{ steps.run.outputs.github_token }}` from the curl command's Authorization header (where it was directly interpolated in the shell string) into an `env:` block as `APP_TOKEN`. The shell command now safely references it as `$APP_TOKEN`.

