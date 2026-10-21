<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.256

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.256** was hardened automatically. 7 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR, which comes from inputs.path_to_bun_executable via dirname, to $GITHUB_PATH without the printf '%s' ... | tr -d '\n\r' sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' puts an expression directly inside the run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Pass the value in through an env: variable and expand it double-quoted.

Locations:

- `action.yml:457`

### script-injection (severity: high)

Sub-rule (a): a run: block puts an expression directly inside the script: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Use "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR, which comes from inputs.path_to_bun_executable, to $GITHUB_PATH without the printf '%s' ... | tr -d '\n\r' sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR, which comes from inputs.path_to_claude_code_executable via dirname, to $GITHUB_PATH without the printf '%s' ... | tr -d '\n\r' sanitization: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:174`

### unsafe-shell (severity: high)

Remote script is piped straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

Remote script is piped straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

- action.yml: In 'Setup Custom Bun Path', BUN_DIR now has newlines stripped with printf '%s' | tr -d '\n\r' before it is written to GITHUB_PATH. In 'Revoke app token', the steps.run.outputs.github_token expression moved into env as APP_TOKEN, and the script uses "$APP_TOKEN".
- agent-approval-check/action.yml: The python step now uses "$GITHUB_ACTION_PATH" instead of the github.action_path expression.
- base-action/action.yml: BUN_DIR and CLAUDE_DIR are sanitized the same way before being written to GITHUB_PATH. The Claude installer is no longer piped into bash. Each attempt downloads install.sh to a mktemp file, checks the file isn't empty, then runs 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. I dropped the '-s --' so the script still gets the version as $1. The temp file is deleted after each attempt.
- Behaviour change: when timeout is available, the download now has its own 60s limit and the installer keeps the 120s limit. Before, one 120s limit covered both. The 3-attempt retry loop is unchanged.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

base-action/action.yml 'Setup Custom Bun Path': BUN_DIR is now stripped of \n/\r via printf|tr before being appended to $GITHUB_PATH, matching the root action.yml and the Claude executable path step.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

In base-action/action.yml, the 'Install Claude Code' step now removes newline and carriage-return characters from "$HOME/.local/bin" (printf '%s' ... | tr -d '\n\r') before writing it to $GITHUB_PATH. A search found no other writes of HOME-based values to GITHUB_PATH, GITHUB_ENV or GITHUB_OUTPUT.

