<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.194

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.194** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ github.action_path }} expression is directly interpolated inside a run: shell command string. The line `- run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the GitHub Actions expression directly in the shell command rather than passing it through an env: variable. While github.action_path is GitHub-controlled, any ${{ ... }} expression directly inside a run: block is a script-injection finding per the check rules.

Locations:

- `agent-approval-check/action.yml:53`

### unsafe-shell (severity: high)

The Install Claude Code step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern wrapped in `timeout ... bash -c "curl ... | bash ..."`). The install script is fetched and executed in a single pipeline without first downloading and verifying it. This is an unsafe-shell pattern.

Locations:

- `base-action/action.yml:141`
- `base-action/action.yml:143`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps inputs.path_to_bun_executable to the PATH_TO_BUN_EXECUTABLE env var, then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes it to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:220`
- `base-action/action.yml:123`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps inputs.path_to_claude_code_executable to the PATH_TO_CLAUDE_CODE_EXECUTABLE env var, then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes it to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into $GITHUB_PATH.

Locations:

- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 4 findings across 3 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` from the run: shell string into the step's env: block as ACTION_PATH, referenced as $ACTION_PATH in the shell command.

2. base-action/action.yml (unsafe-shell): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the timeout-wrapped variant) with a two-step download-then-execute pattern using mktemp. The '--' was dropped as it was the shell's option terminator in the pipe form, not an argument to the install script itself.

3. action.yml (github-env-injection, line 220): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in the Setup Custom Bun Path step.

4. base-action/action.yml (github-env-injection, lines 123 and 157): Added sanitization for both BUN_DIR (Setup Custom Bun Path step) and CLAUDE_DIR (Install Claude Code step) before writing to $GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Revoke app token' step in action.yml (line 549): moved `${{ steps.run.outputs.github_token }}` from the inline curl `-H "Authorization: Bearer ${{ ... }}"` string into an `env:` block as `APP_TOKEN: ${{ steps.run.outputs.github_token }}`, and updated the shell command to reference `$APP_TOKEN` instead. This prevents shell metacharacters in the step output from being interpreted by the shell.

