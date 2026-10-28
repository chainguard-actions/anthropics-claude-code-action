<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.261

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.261** was hardened automatically. 7 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

action.yml step 'Setup Custom Bun Path' (line 208): BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") comes from inputs.path_to_bun_executable and is written with echo "$BUN_DIR" >> "$GITHUB_PATH". There is no printf '%s' ... | tr -d '\n\r' step first, so a newline in the input can add extra PATH entries.

Locations:

- `action.yml:216`

### script-injection (severity: high)

action.yml step 'Revoke app token' (line 448) breaks sub-rule (a): an expression is placed directly in the run script: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}". Pass it through an env var (e.g. APP_TOKEN) and use "$APP_TOKEN" instead.

Locations:

- `action.yml:457`

### script-injection (severity: high)

agent-approval-check/action.yml breaks sub-rule (a): an expression is placed directly in the run script: run: python "${{ github.action_path }}/agent_approval_check.py". Use "$GITHUB_ACTION_PATH/agent_approval_check.py" instead.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

base-action/action.yml step 'Setup Custom Bun Path' (line 127): BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") comes from inputs.path_to_bun_executable and is written with echo "$BUN_DIR" >> "$GITHUB_PATH". It is not sanitized with printf '%s' | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:136`

### github-env-injection (severity: high)

base-action/action.yml step 'Install Claude Code' (line 144): CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") comes from inputs.path_to_claude_code_executable and is written with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". It is not sanitized with printf '%s' | tr -d '\n\r' first.

Locations:

- `base-action/action.yml:174`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". Download it to a file, verify it, then run it.

Locations:

- `base-action/action.yml:156`

### unsafe-shell (severity: high)

base-action/action.yml step 'Install Claude Code' (fallback path) pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

Locations:

- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

action.yml & base-action/action.yml: Bun/Claude custom dirs sanitized with printf '%s' | tr -d '\n\r' before writing to GITHUB_PATH. action.yml 'Revoke app token': token moved to env APP_TOKEN. agent-approval-check: uses $GITHUB_ACTION_PATH. base-action Install Claude Code: install.sh downloaded to mktemp file, checked non-empty, then executed as 'bash "$file" "$CLAUDE_CODE_VERSION"' (dropped -s and --); timeout path keeps the timeout wrapper with positional args passed to bash -c instead of string interpolation; retry loop preserved.

### Iteration 2

**Fixes applied:** script-injection, invalid-yaml

**Notes:**

The 'Revoke app token' step in action.yml had a second shell:/env:/run: block pasted into the middle of its if: line, so action.yml would not parse. Fixes: (1) The if: condition is whole again and ends with '&& steps.run.outputs.skipped_due_to_workflow_validation_mismatch != 'true''. That output name is the one set in src/entrypoints/run.ts. (2) The step has one shell: bash, one env: (APP_TOKEN: ${{ steps.run.outputs.github_token }}) and one run: block. (3) The ${{ steps.run.outputs.github_token }} expression is gone from the curl command, which now sends -H "Authorization: Bearer $APP_TOKEN". (4) I removed the stray '-H "Bearer $APP_TOKEN"' header. The rest of the curl command is unchanged from upstream, including '|| true'. I read the edited file but did not run a parser or the tests, so it is not confirmed to load.

