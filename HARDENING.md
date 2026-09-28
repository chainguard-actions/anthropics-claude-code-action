<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.192

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.192** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string. The expression appears verbatim in a curl `-H` argument: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value, allowing an attacker-controlled value to inject shell metacharacters.

Locations:

- `action.yml:399`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. A compromised or MITM'd remote script would execute arbitrary code on the runner. The script should be downloaded to a file, verified (e.g., checksum), and then executed separately.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

### github-env-injection (severity: high)

Multiple 'Setup Custom Bun/Claude Path' steps write values derived from untrusted `inputs.*` directly to `$GITHUB_PATH` without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). Specifically: (1) In action.yml, `$BUN_DIR` is computed from `$PATH_TO_BUN_EXECUTABLE` (which holds `${{ inputs.path_to_bun_executable }}`) and written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. (2) In base-action/action.yml, the same pattern exists for `$BUN_DIR`. (3) In base-action/action.yml, `$CLAUDE_DIR` is computed from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (which holds `${{ inputs.path_to_claude_code_executable }}`) and written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline embedded in the input value could inject arbitrary entries into PATH.

Locations:

- `action.yml:253`
- `base-action/action.yml:131`
- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed three security findings:

1. script-injection (action.yml ~line 399): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` curl command into the step's `env:` block as `GITHUB_APP_TOKEN`, then referenced it as `$GITHUB_APP_TOKEN` in the shell script.

2. unsafe-shell (base-action/action.yml lines 148/150): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with a download-then-execute pattern: script is saved to a `mktemp` file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's stdin-option terminator in the pipe form, not an argument to the install script). Temp file is cleaned up after use.

3. github-env-injection (action.yml line 253, base-action/action.yml lines 131 and 163): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing directory paths to `$GITHUB_PATH` in all three affected locations.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/agent-approval-check/action.yml: moved `${{ github.action_path }}` from the `run:` shell command string into the step's `env:` block as `ACTION_PATH`, and updated the shell command to reference it as `"$ACTION_PATH/agent_approval_check.py"`. This ensures the value is passed through the environment rather than being interpolated directly into the shell command by the GitHub Actions template engine.

