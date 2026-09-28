<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.189

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.189** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ github.action_path }} is directly interpolated inside a run: shell command string. Any ${{ }} expression in a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`

Locations:

- `agent-approval-check/action.yml:53`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.run.outputs.github_token }} is directly interpolated inside a run: shell command string in the 'Revoke app token' step. steps.*.outputs.* is a workflow-controllable context and must never appear directly in a run: block. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:350`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification, enabling supply-chain attacks if the URL is compromised.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:155`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the value of PATH_TO_BUN_EXECUTABLE (sourced from inputs.path_to_bun_executable) is passed through dirname and written to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH. The offending lines are: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:245`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the value of PATH_TO_CLAUDE_CODE_EXECUTABLE (sourced from inputs.path_to_claude_code_executable) is passed through dirname and written to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH. The offending lines are: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml: Moved ${{ github.action_path }} into env var ACTION_PATH to prevent script injection.
2. action.yml (Revoke app token step): Moved ${{ steps.run.outputs.github_token }} into env var APP_TOKEN to prevent script injection.
3. base-action/action.yml (Install Claude Code): Replaced curl|bash pipe with download-then-execute pattern using mktemp; dropped the '--' separator as the script now receives the version as a direct positional argument.
4. action.yml (Setup Custom Bun Path): Added printf '%s' | tr -d '\n\r' sanitization before writing BUN_DIR to GITHUB_PATH.
5. base-action/action.yml: Added sanitization for both BUN_DIR (Setup Custom Bun Path) and CLAUDE_DIR (Install Claude Code) before writing to GITHUB_PATH.

