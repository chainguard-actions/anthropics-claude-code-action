<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.265

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.265** was hardened automatically. 7 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) is violated: a ${{ }} expression is put straight into the run: script. The 'Revoke app token' step contains: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}". Move the value into an env: variable and reference it as "$GITHUB_TOKEN_VALUE".

Locations:

- `action.yml:515`

### script-injection (severity: high)

Rule (a) is violated: a ${{ }} expression is put straight into the run: script: run: python "${{ github.action_path }}/agent_approval_check.py". Use "$GITHUB_ACTION_PATH/agent_approval_check.py" instead.

Locations:

- `agent-approval-check/action.yml:56`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step builds BUN_DIR from inputs.path_to_bun_executable (passed in via the PATH_TO_BUN_EXECUTABLE env var). It then writes it with echo "$BUN_DIR" >> "$GITHUB_PATH" without first running printf '%s' ... | tr -d '\n\r'.

Locations:

- `action.yml:290`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step builds BUN_DIR from inputs.path_to_bun_executable. It then writes it with echo "$BUN_DIR" >> "$GITHUB_PATH" without first running printf '%s' ... | tr -d '\n\r'.

Locations:

- `base-action/action.yml:150`

### github-env-injection (severity: high)

The 'Install Claude Code' step builds CLAUDE_DIR from inputs.path_to_claude_code_executable. It then writes it with echo "$CLAUDE_DIR" >> "$GITHUB_PATH" without first running printf '%s' ... | tr -d '\n\r'.

Locations:

- `base-action/action.yml:187`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:167`

### unsafe-shell (severity: high)

The 'Install Claude Code' step's fallback path also pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:169`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

- action.yml 'Revoke app token': moved steps.run.outputs.github_token into env GITHUB_TOKEN_VALUE and referenced "$GITHUB_TOKEN_VALUE" in the script.
- agent-approval-check/action.yml: replaced ${{ github.action_path }} with "$GITHUB_ACTION_PATH" (the shell is bash).
- action.yml and base-action/action.yml 'Setup Custom Bun Path', plus the CLAUDE_DIR write in base-action: newlines and carriage returns are now stripped (printf | tr -d '\n\r') before the value is written to $GITHUB_PATH.
- base-action 'Install Claude Code': install.sh is now downloaded to a file in $RUNNER_TEMP, checked to be non-empty, and run as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. I dropped the shell's '-s --', so the script still gets the version as $1. The timeout and retry behaviour stays: both the download and the run go through timeout.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the broken else-branch line in the 'Install Claude Code' step of base-action/action.yml (around line 178). The line had been mangled by an earlier edit. It now reads CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), followed by one write to $GITHUB_PATH that strips newlines first: printf '%s\n' "$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')" >> "$GITHUB_PATH". The old echo "$CLAUDE_DIR" line, which wrote the value without stripping newlines, is gone. I re-read the file after the edit to confirm the change. I haven't run the action or the analysis again.

