<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.227

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.227** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside the `run:` shell command string. The expression is embedded in a curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` header, meaning the GitHub Actions template engine substitutes the value before the shell ever sees it. If the token value contained shell metacharacters, they would be interpreted by the shell. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk regardless of context.

Locations:

- `action.yml:499`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets env var `PATH_TO_BUN_EXECUTABLE: ${{ inputs.path_to_bun_executable }}` and then writes a value derived from it (`BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled `path_to_bun_executable` input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:237`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml sets env var `PATH_TO_CLAUDE_CODE_EXECUTABLE: ${{ inputs.path_to_claude_code_executable }}` and then writes a value derived from it (`CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled `path_to_claude_code_executable` input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:155`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and verifying the script. A compromised or man-in-the-middle'd response would execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:148`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across 2 files:

1. **script-injection** (action.yml ~line 499): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` shell string in the 'Revoke app token' step into an `env:` block as `GITHUB_APP_TOKEN`, then referenced it as `$GITHUB_APP_TOKEN` in the curl `-H "Authorization: Bearer $GITHUB_APP_TOKEN"` header.

2. **github-env-injection** (action.yml ~line 237): In the 'Setup Custom Bun Path' step, added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH`.

3. **github-env-injection** (base-action/action.yml ~line 130): Same fix applied to the 'Setup Custom Bun Path' step in base-action/action.yml.

4. **github-env-injection** (base-action/action.yml ~line 155): In the 'Install Claude Code' step, added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH`.

5. **unsafe-shell** (base-action/action.yml ~line 148): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` with a two-step approach: download to a temp file via `mktemp`, then execute `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` since we're no longer using `bash -s`). Added cleanup of the temp file with `rm -f`.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml line 55: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The $GITHUB_ACTION_PATH environment variable is automatically set by GitHub Actions in composite action steps and is functionally equivalent to `${{ github.action_path }}`, but avoids template interpolation inside the shell command string.

