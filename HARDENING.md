<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.259

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.259** was hardened automatically. 7 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

action.yml step 'Setup Custom Bun Path': BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") comes from inputs.path_to_bun_executable. It is written with echo "$BUN_DIR" >> "$GITHUB_PATH" without running printf '%s' ... | tr -d '\n\r' first.

Locations:

- `action.yml:248`

### github-env-injection (severity: high)

base-action/action.yml step 'Setup Custom Bun Path': BUN_DIR comes from inputs.path_to_bun_executable. It is written with echo "$BUN_DIR" >> "$GITHUB_PATH" with no newline stripping.

Locations:

- `base-action/action.yml:153`

### github-env-injection (severity: high)

base-action/action.yml step 'Install Claude Code': CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") comes from inputs.path_to_claude_code_executable. It is written with echo "$CLAUDE_DIR" >> "$GITHUB_PATH" with no newline stripping.

Locations:

- `base-action/action.yml:197`

### script-injection (severity: high)

Rule (a): action.yml step 'Revoke app token' puts an expression straight into the run script: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}". Pass it through an env var and use "$VAR" instead.

Locations:

- `action.yml:520`

### script-injection (severity: high)

Rule (a): agent-approval-check/action.yml puts an expression straight into the run script: run: python "${{ github.action_path }}/agent_approval_check.py". Use "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:57`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' pipes remote content into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:179`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' (the path taken when timeout is unavailable) pipes remote content into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:181`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

github-env-injection: the BUN_DIR and CLAUDE_DIR values are now cleaned with printf '%s' | tr -d '\n\r' before being written to $GITHUB_PATH (in action.yml and base-action/action.yml). script-injection: the Revoke app token step now gets the token through an env var, APP_TOKEN, used as "$APP_TOKEN". agent-approval-check now runs "$GITHUB_ACTION_PATH/agent_approval_check.py". unsafe-shell: install.sh is now downloaded to a mktemp file and then run with 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. The pipe-only '-s --' was dropped. When the timeout command is available, the download and the install each get their own 120s timeout.

