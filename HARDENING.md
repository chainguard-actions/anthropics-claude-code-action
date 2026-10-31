<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.266

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.266** was hardened automatically. 7 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

action.yml step 'Setup Custom Bun Path' writes a path built from inputs.path_to_bun_executable to $GITHUB_PATH without sanitizing it first: BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"); echo "$BUN_DIR" >> "$GITHUB_PATH". There is no printf '%s' ... | tr -d '\n\r' step, so a newline in the input could add extra PATH entries.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Rule (a): in action.yml, the 'Revoke app token' step puts an expression directly inside its run: script: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}". Pass the value through an env: variable instead and reference it in double quotes.

Locations:

- `action.yml:457`

### github-env-injection (severity: high)

base-action/action.yml step 'Setup Custom Bun Path' writes dirname of inputs.path_to_bun_executable to $GITHUB_PATH without the printf '%s' | tr -d '\n\r' sanitization: echo "$BUN_DIR" >> "$GITHUB_PATH".

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

base-action/action.yml step 'Install Claude Code' writes dirname of inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization: CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"); echo "$CLAUDE_DIR" >> "$GITHUB_PATH".

Locations:

- `base-action/action.yml:174`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' (the fallback branch used when timeout is unavailable) pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:158`

### script-injection (severity: high)

Rule (a): in agent-approval-check/action.yml, a run: block uses an expression directly: run: python "${{ github.action_path }}/agent_approval_check.py". Use "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:76`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

- github-env-injection: In the two 'Setup Custom Bun Path' steps (action.yml and base-action/action.yml) and the custom-executable branch of 'Install Claude Code', the dirname value now goes through printf '%s' | tr -d '\n\r' into a SAFE_* variable before it is written to $GITHUB_PATH.
- script-injection: The 'Revoke app token' step now gets steps.run.outputs.github_token through env APP_TOKEN and uses "Bearer $APP_TOKEN". agent-approval-check now runs python "$GITHUB_ACTION_PATH/agent_approval_check.py".
- unsafe-shell: 'Install Claude Code' now downloads claude.ai/install.sh to a mktemp file with curl -fsSL (connect/max timeouts added) and checks the file isn't empty. It then runs bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION", inside the original timeout wrapper when timeout exists and without it otherwise. I dropped '-s --' so the installer still gets the version as $1. The 3-attempt retry loop is unchanged.

