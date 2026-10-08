<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.247

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.247** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the GitHub Actions expression directly in the shell command. While github.action_path is GitHub-controlled, any ${{ ... }} inside a run: block is a script-injection risk per the check rules.

Locations:

- `agent-approval-check/action.yml:52`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern appears twice (once wrapped in `timeout ... bash -c "curl ... | bash ..."` and once as a direct `curl ... | bash`). Remote content should be downloaded to a file, verified, and then executed separately.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the user-controlled input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The input is mapped to the env var PATH_TO_BUN_EXECUTABLE, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed from it, and `echo "$BUN_DIR" >> "$GITHUB_PATH"` writes it without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. An attacker-controlled newline in the input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:230`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from the user-controlled input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The input is mapped to PATH_TO_CLAUDE_CODE_EXECUTABLE, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed from it, and `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` writes it without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 4 findings across 3 files:
1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` from run: shell string into env: block as ACTION_PATH, referenced as `$ACTION_PATH` in the shell command.
2. base-action/action.yml (unsafe-shell): Replaced both curl-pipe-to-bash patterns with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the '--' separator as required (it was the shell's option terminator, not the script's).
3. action.yml (github-env-injection): Sanitized BUN_DIR with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to GITHUB_PATH.
4. base-action/action.yml (github-env-injection): Sanitized both BUN_DIR and CLAUDE_DIR with the same printf/tr pattern before writing to GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in the 'Revoke app token' step of action.yml (line 494). Moved `${{ steps.run.outputs.github_token }}` from the `run:` shell command string into the step's `env:` block as `REVOKE_TOKEN: ${{ steps.run.outputs.github_token }}`, and updated the curl command to reference `$REVOKE_TOKEN` instead of the inline expression. This prevents the steps output value from being interpolated directly into the shell command before the shell parses it.

