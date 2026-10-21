<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.255

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.255** was hardened automatically. 7 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

action.yml step 'Setup Custom Bun Path': the directory name of inputs.path_to_bun_executable (BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")) is written to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. It is not passed through printf '%s' | tr -d '\n\r' first, so a newline in the input could add extra entries to PATH.

Locations:

- `action.yml:217`

### script-injection (severity: high)

action.yml step 'Revoke app token' breaks sub-rule (a): an expression is placed directly in the run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The step output should be passed in through an env: variable and referenced as "$VAR".

Locations:

- `action.yml:456`

### script-injection (severity: high)

agent-approval-check/action.yml breaks sub-rule (a): an expression is placed directly in the run: script: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Use "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

base-action/action.yml step 'Setup Custom Bun Path': the dirname of inputs.path_to_bun_executable is written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` and is not sanitized with printf '%s' | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

base-action/action.yml step 'Install Claude Code': the dirname of inputs.path_to_claude_code_executable (CLAUDE_DIR) is written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` and is not sanitized with printf '%s' | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:174`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' pipes a remote script straight into a shell (the fallback path when timeout is not available): `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

- action.yml: In 'Setup Custom Bun Path', BUN_DIR now has CR/LF stripped (printf '%s' | tr -d '\n\r') before it is written to GITHUB_PATH. In 'Revoke app token', steps.run.outputs.github_token now comes in through env APP_TOKEN and is used as "$APP_TOKEN".
- agent-approval-check/action.yml: "${{ github.action_path }}" is replaced with "$GITHUB_ACTION_PATH".
- base-action/action.yml: BUN_DIR and CLAUDE_DIR now have CR/LF stripped before the GITHUB_PATH writes. The claude.ai/install.sh installer is now downloaded to a mktemp file (curl --max-time 60, checked to be non-empty) and run as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"', still wrapped in the same timeout when that is available. I dropped the '-s --' so the version stays the script's $1. The retry loop is unchanged, and the temp file is deleted after a successful install.

