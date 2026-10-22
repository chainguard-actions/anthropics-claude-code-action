<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.257

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.257** was hardened automatically. 7 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Nothing runs printf '%s' | tr -d '\n\r' on it first, so a newline in the input can add extra PATH entries.

Locations:

- `action.yml:214`

### script-injection (severity: high)

Sub-rule (a): in the 'Revoke app token' step, the run script puts a GitHub expression straight into the shell: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Pass the step output through an env: variable and reference it as "$VAR" instead.

Locations:

- `action.yml:454`

### github-env-injection (severity: high)

base-action 'Setup Custom Bun Path' step: BUN_DIR is computed from inputs.path_to_bun_executable and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is not passed through printf '%s' | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

base-action 'Install Claude Code' step: CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") comes from inputs.path_to_claude_code_executable and is written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The value is not passed through printf '%s' | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:174`

### unsafe-shell (severity: high)

base-action 'Install Claude Code' step pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. Download the script to a file first, then run it as a separate command.

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

base-action 'Install Claude Code' step pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Download the script to a file first, then run it as a separate command.

Locations:

- `base-action/action.yml:158`

### script-injection (severity: high)

Sub-rule (a): the run script contains a GitHub expression: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Use "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

action.yml: Revoke app token now reads steps.run.outputs.github_token from env APP_TOKEN. The Bun dir has \n and \r stripped before it is written to GITHUB_PATH. base-action/action.yml: the Bun and Claude dirs are stripped the same way before going to GITHUB_PATH. The Claude installer is now downloaded to a mktemp file (curl -fsSL with timeouts, checked to be non-empty), then run as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. When the timeout command exists it still wraps the run as before. The '-s --' is dropped so the version arrives as $1, and the 3-attempt retry loop is kept. agent-approval-check/action.yml now uses "$GITHUB_ACTION_PATH" instead of ${{ github.action_path }}.

