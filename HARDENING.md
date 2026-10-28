<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.263

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.263** was hardened automatically. 7 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

action.yml step 'Setup Custom Bun Path': BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") comes from inputs.path_to_bun_executable and is written with echo "$BUN_DIR" >> "$GITHUB_PATH". Newlines are not stripped first (no printf '%s' ... | tr -d '\n\r'), so a crafted input can add extra PATH entries.

Locations:

- `action.yml:217`

### script-injection (severity: high)

action.yml step 'Revoke app token', sub-rule (a): an expression is placed directly in the run: script: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}". Pass the value through an env: variable and reference it quoted.

Locations:

- `action.yml:457`

### github-env-injection (severity: high)

base-action/action.yml step 'Setup Custom Bun Path': BUN_DIR comes from inputs.path_to_bun_executable (through the PATH_TO_BUN_EXECUTABLE env var) and is written with echo "$BUN_DIR" >> "$GITHUB_PATH". Newlines are not stripped with printf '%s' ... | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

base-action/action.yml step 'Install Claude Code': CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") comes from inputs.path_to_claude_code_executable and is written with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". Newlines are not stripped with printf '%s' ... | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:174`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". Download the script to a file, verify it, then run it.

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' (fallback branch) pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:158`

### script-injection (severity: high)

agent-approval-check/action.yml, sub-rule (a): an expression is placed directly in the run: script: run: python "${{ github.action_path }}/agent_approval_check.py". Use the $GITHUB_ACTION_PATH env var, quoted, instead.

Locations:

- `agent-approval-check/action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

- **PATH writes:** The bun and claude directories are now written to $GITHUB_PATH only after removing newlines with tr -d '\n\r'. This covers the custom bun path in action.yml, the custom bun path in base-action/action.yml and the custom Claude Code path in base-action/action.yml.
- **Revoke app token step (action.yml):** The token expression now comes in through the env var APP_TOKEN, and the script uses "$APP_TOKEN".
- **agent-approval-check:** The script path now uses "$GITHUB_ACTION_PATH" instead of the ${{ github.action_path }} expression.
- **Claude Code installer (base-action):** The script is now downloaded to a temp file first. It only runs if the file is not empty and its first line is a #! line. It runs as bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION", with the old '-s --' dropped. This check is weak: claude.ai publishes no checksum to compare against, so it only catches a missing or garbled download.
- **Retries and timeout:** The 3-attempt loop is unchanged. Running the installer still has the 120s timeout. The download now has its own 60s timeout, which wasn't there before; the old 120s covered download and install together.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

base-action/action.yml 'Install Claude Code' step: replaced `echo "$HOME/.local/bin" >> "$GITHUB_PATH"` with `safe=$(printf '%s' "$HOME/.local/bin" | tr -d '\n\r'); echo "$safe" >> "$GITHUB_PATH"`. Other GITHUB_PATH writes are constant literals (/usr/bin, /bin) or already sanitized.

