<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.262

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.262** was hardened automatically. 7 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): in the 'Revoke app token' step, an expression is put straight into the run script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Pass the value through an env: variable and quote it, e.g. "$APP_TOKEN".

Locations:

- `action.yml:330`

### script-injection (severity: high)

Rule (a): in the composite step, an expression is put straight into the run script: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Use the runner-provided env var "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value built from inputs.path_to_bun_executable to $GITHUB_PATH without sanitizing it: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Run printf '%s' ... | tr -d '\n\r' on the value before the write.

Locations:

- `action.yml:276`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action writes a value built from inputs.path_to_bun_executable to $GITHUB_PATH without sanitizing it: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Run printf '%s' ... | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action writes to $GITHUB_PATH without sanitizing: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. CLAUDE_DIR comes from inputs.path_to_claude_code_executable. `echo "$HOME/.local/bin" >> "$GITHUB_PATH"` is also unsanitized, and HOME is inherited from the environment. Run printf '%s' ... | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:176`

### unsafe-shell (severity: high)

Remote script piped straight into a shell: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. Download the installer to a file, verify it, then run it.

Locations:

- `base-action/action.yml:160`

### unsafe-shell (severity: high)

Remote script piped straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Download the installer to a file, verify it, then run it.

Locations:

- `base-action/action.yml:162`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

- action.yml, 'Revoke app token' step: steps.run.outputs.github_token now goes through env APP_TOKEN, and the header uses "Bearer $APP_TOKEN".
- agent-approval-check/action.yml: the python step now calls "$GITHUB_ACTION_PATH/agent_approval_check.py" instead of the inline github.action_path expression.
- action.yml and base-action/action.yml, 'Setup Custom Bun Path' step: BUN_DIR goes through printf '%s' | tr -d '\n\r' before it is written to $GITHUB_PATH.
- base-action/action.yml, 'Install Claude Code' step: CLAUDE_DIR and $HOME/.local/bin are sanitized the same way. The installer is no longer piped into bash. It is downloaded with curl -o to a mktemp file under RUNNER_TEMP and checked (the file is not empty and its first line starts with #!). It then runs as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"', with '-s --' dropped so the version arrives as $1. The 3-attempt retry loop and the timeout path are unchanged: the run still has a 120s timeout, and the download now has its own 60s timeout. The temp file is deleted after install.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

In base-action/action.yml, the 'Install Claude Code' step's else branch took CLAUDE_DIR from dirname of the path_to_claude_code_executable input and wrote it to $GITHUB_PATH as is. It now strips newlines and carriage returns first (SAFE_CLAUDE_DIR=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')) and writes SAFE_CLAUDE_DIR instead, the same way the Bun path step already does. I checked every other $GITHUB_PATH write in the root and base action.yml: each one is a constant string or already sanitized.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

base-action/action.yml 'Install Claude Code': the $HOME/.local/bin value now goes through printf '%s' | tr -d '\n\r' before it is written to $GITHUB_PATH. Behavior is unchanged.

