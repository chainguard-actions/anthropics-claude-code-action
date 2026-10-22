<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.258

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.258** was hardened automatically. 7 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Root action.yml, step 'Setup Custom Bun Path': BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") comes from inputs.path_to_bun_executable and is written with echo "$BUN_DIR" >> "$GITHUB_PATH". The value is not passed through printf '%s' ... | tr -d '\n\r' first, so a newline in the input could add arbitrary entries to PATH.

Locations:

- `action.yml:217`

### github-env-injection (severity: high)

base-action/action.yml, step 'Setup Custom Bun Path': BUN_DIR, which comes from inputs.path_to_bun_executable, is written with echo "$BUN_DIR" >> "$GITHUB_PATH". It is not sanitized with printf '%s' ... | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

base-action/action.yml, step 'Install Claude Code': CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") comes from inputs.path_to_claude_code_executable and is written with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". It is not sanitized with printf '%s' ... | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:174`

### script-injection (severity: high)

Root action.yml, step 'Revoke app token', sub-rule (a): the line -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" puts an expression straight into the run: script. Move the value into an env: variable and use "$VAR" instead. Sub-rule (b): on the same step, ${GITHUB_API_URL:-https://api.github.com}/installation/token is expanded without double quotes.

Locations:

- `action.yml:457`
- `action.yml:459`

### script-injection (severity: high)

agent-approval-check/action.yml, sub-rule (a): the line run: python "${{ github.action_path }}/agent_approval_check.py" puts an expression directly in the run: script. Use "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:57`

### unsafe-shell (severity: high)

base-action/action.yml, step 'Install Claude Code': the script pipes remote content straight into a shell with timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

base-action/action.yml, step 'Install Claude Code' (fallback branch): the script pipes remote content straight into a shell with curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION". Download the script to a file, verify it, then run it as a separate step.

Locations:

- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

- github-env-injection: In action.yml and base-action/action.yml, the custom Bun and Claude Code directories (BUN_DIR, CLAUDE_DIR) now go through printf '%s' | tr -d '\n\r' and are stored in SAFE_* variables before being written to $GITHUB_PATH.
- script-injection: In the root 'Revoke app token' step, steps.run.outputs.github_token now comes in through env APP_TOKEN, and the API URL is in double quotes. agent-approval-check now uses "$GITHUB_ACTION_PATH" instead of ${{ github.action_path }}.
- unsafe-shell: base-action 'Install Claude Code' now downloads install.sh to a mktemp file, checks the file is not empty, then runs 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. The '-s --' from the old piped form was dropped so the version is the script's $1. The 3-attempt retry and the 120s timeout on the install are kept. One change from upstream: in the timeout path the download now has its own 60s timeout (upstream timed download and install together under one 120s limit), so the worst case is longer than before.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the broken else-branch of the 'Install Claude Code' step in base-action/action.yml. It again runs CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), the SAFE_CLAUDE_DIR assignment that strips newlines with tr is back on its own line, only "$SAFE_CLAUDE_DIR" is written to $GITHUB_PATH, and the leftover unsanitized echo of $CLAUDE_DIR is deleted.

