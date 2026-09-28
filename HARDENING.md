<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): In the 'Revoke app token' step, the expression `${{ steps.run.outputs.github_token }}` (a steps.*.outputs.* value) is directly interpolated inside a `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This allows the value to be parsed by the shell before it is quoted, enabling script injection if the output contains shell metacharacters.

Locations:

- `action.yml:399`

### script-injection (severity: high)

Sub-rule (a): In the agent-approval-check action, the expression `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ }}` expression directly inside a `run:` block is a script-injection risk as the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:47`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This executes arbitrary remote content without first downloading and verifying it, making the action vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:152`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the variable `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (which is set from `inputs.path_to_bun_executable`, a caller-controlled input) and written to `$GITHUB_PATH` without sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `action.yml:224`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the variable `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (which is set from `inputs.path_to_claude_code_executable`, a caller-controlled input) and written to `$GITHUB_PATH` without sanitization: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 security findings across 3 files:

1. action.yml (Revoke app token, line 399) - script-injection: Moved `${{ steps.run.outputs.github_token }}` to env var `APP_TOKEN` and referenced as `$APP_TOKEN` in the curl command.

2. agent-approval-check/action.yml (line 47) - script-injection: Moved `${{ github.action_path }}` to env var `ACTION_PATH` and referenced as `$ACTION_PATH` in the python command.

3. base-action/action.yml (line 152) - unsafe-shell: Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern using `mktemp`. Dropped the `--` (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

4. action.yml (line 224) - github-env-injection: Sanitized `BUN_DIR` with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to `$GITHUB_PATH`.

5. base-action/action.yml (lines 131 and 163) - github-env-injection: Sanitized `BUN_DIR` and `CLAUDE_DIR` with `printf '%s' | tr -d '\n\r'` before writing to `$GITHUB_PATH`.

