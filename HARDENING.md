<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.196

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.196** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the github.action_path context value directly into the shell command string before the shell ever sees it. Any ${{ ... }} expression in a run: block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The Install Claude Code step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and inspecting the script. There are two occurrences (one inside a `timeout` wrapper and one fallback).

Locations:

- `base-action/action.yml:143`
- `base-action/action.yml:145`

### github-env-injection (severity: high)

Input-derived values are written to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). In the 'Setup Custom Bun Path' step, `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` derives a value from `inputs.path_to_bun_executable` (an attacker-controllable input), then `echo "$BUN_DIR" >> "$GITHUB_PATH"` writes it unsanitized. A newline in the input value could inject arbitrary entries into PATH. The same pattern appears in base-action/action.yml for both `inputs.path_to_bun_executable` (BUN_DIR) and `inputs.path_to_claude_code_executable` (CLAUDE_DIR).

Locations:

- `action.yml:280`
- `base-action/action.yml:130`
- `base-action/action.yml:162`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed three security findings: (1) script-injection in agent-approval-check/action.yml: moved `${{ github.action_path }}` into env block as ACTION_PATH and referenced it as $ACTION_PATH in the run command; (2) unsafe-shell in base-action/action.yml: replaced both curl-to-bash pipe patterns with download-to-tempfile-then-execute approach (curl -o INSTALL_SCRIPT then bash INSTALL_SCRIPT VERSION), dropping the '--' shell option terminator as required; (3) github-env-injection in action.yml and base-action/action.yml: added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in all three locations.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Revoke app token' step in action.yml (line 429): moved `${{ steps.run.outputs.github_token }}` from the `run:` shell string into an `env:` block as `REVOKE_TOKEN`, and updated the curl command to reference `$REVOKE_TOKEN` instead. This prevents attacker-controlled values from being interpolated directly into the shell command string.

