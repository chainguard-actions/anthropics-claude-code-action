<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.260

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.260** was hardened automatically. 7 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step takes the directory of inputs.path_to_bun_executable (passed in through the PATH_TO_BUN_EXECUTABLE env var) and writes it to $GITHUB_PATH without first running printf '%s' ... | tr -d '\n\r': `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` followed by `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input could add extra PATH entries.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Sub-rule (a): the 'Revoke app token' step puts an expression directly in its run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Pass the value through an env: variable and quote it, e.g. "Authorization: Bearer $APP_TOKEN".

Locations:

- `action.yml:457`

### github-env-injection (severity: high)

In base-action, the 'Setup Custom Bun Path' step writes the directory of inputs.path_to_bun_executable to $GITHUB_PATH without the newline-stripping step: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`; `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

In base-action, the 'Install Claude Code' step writes the directory of inputs.path_to_claude_code_executable to $GITHUB_PATH without the newline-stripping step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`; `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:174`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a downloaded script straight into bash: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. Download the script to a file, check it, then run it.

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

The 'Install Claude Code' step's fallback branch also pipes a downloaded script straight into bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `base-action/action.yml:158`

### script-injection (severity: high)

Sub-rule (a): a run: script in agent-approval-check puts an expression directly in the shell command: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Use the runner-provided "$GITHUB_ACTION_PATH" env var instead.

Locations:

- `agent-approval-check/action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

- action.yml and base-action/action.yml: the custom Bun and Claude directories now go through printf '%s' | tr -d '\n\r' before being written to $GITHUB_PATH.
- action.yml: the 'Revoke app token' step now gets the token through env (APP_TOKEN) and uses "Bearer $APP_TOKEN".
- base-action: the Claude installer is now saved to a mktemp file, checked to be non-empty, and run with 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. The '-s --' is gone, so the version is the script's $1. Both the timeout and no-timeout branches still retry up to 3 times, and the timeout limits still apply.
- agent-approval-check: the run line now uses "$GITHUB_ACTION_PATH" instead of the inline expression.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

base-action/action.yml 'Install Claude Code' step: CLAUDE_DIR is now passed through printf '%s' | tr -d '\n\r' into SAFE_CLAUDE_DIR before it is written to $GITHUB_PATH. This is the same pattern the Setup Custom Bun Path step already uses. I checked the other GITHUB_PATH writes in both manifests: they are either literal paths or already sanitized.

