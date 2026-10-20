<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.254

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.254** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ github.action_path }} is interpolated directly inside a run: shell command string. GitHub Actions expressions in run: blocks flow through YAML template substitution before the shell sees them, enabling script injection. The line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The value should be passed via an env: variable and referenced as $GITHUB_ACTION_PATH (the pre-set env var) or a safe env: mapping instead.

Locations:

- `agent-approval-check/action.yml:49`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.run.outputs.github_token }} is interpolated directly inside a run: shell command string in the 'Revoke app token' step. The expression `${{ steps.run.outputs.github_token }}` is embedded in a curl -H "Authorization: Bearer ..." argument. steps.*.outputs.* is an untrusted-input source per the check scope. The token value should be passed via an env: variable and referenced as a shell variable instead.

Locations:

- `action.yml:310`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from inputs.path_to_bun_executable (an attacker-controllable input), derives BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), and writes it to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A newline-containing input value could inject arbitrary entries into PATH.

Locations:

- `action.yml:250`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from inputs.path_to_bun_executable (an attacker-controllable input), derives BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), and writes it to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A newline-containing input value could inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:115`

### github-env-injection (severity: high)

The 'Install Claude Code' step sets PATH_TO_CLAUDE_CODE_EXECUTABLE from inputs.path_to_claude_code_executable (an attacker-controllable input), derives CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), and writes it to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A newline-containing input value could inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:148`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and verifying the script. There are two occurrences in the same step (one inside a `timeout` wrapper and one in the else branch).

Locations:

- `base-action/action.yml:133`
- `base-action/action.yml:137`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:

1. agent-approval-check/action.yml (line 49): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` — uses the pre-set $GITHUB_ACTION_PATH env var instead of an inline expression.

2. action.yml (line 310): Moved `${{ steps.run.outputs.github_token }}` out of the curl -H argument into an `env: APP_TOKEN:` mapping, then referenced as `$APP_TOKEN` in the shell script.

3. action.yml (line 250): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and wrote `$safe_bun_dir` to $GITHUB_PATH instead of the raw `$BUN_DIR`.

4. base-action/action.yml (line 115): Same BUN_DIR sanitization fix as above.

5. base-action/action.yml (line 148): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and wrote `$safe_claude_dir` to $GITHUB_PATH.

6. base-action/action.yml (lines 133, 137): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The '--' was dropped (it was the shell's option terminator in the pipe form, not the script's argument). Temp file is cleaned up after use.

