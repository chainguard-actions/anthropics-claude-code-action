<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.214

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.214** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. The step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the GitHub Actions expression directly in the shell command. While github.action_path is not attacker-controlled, any ${{ ... }} expression inside a run: block is a script-injection violation per the check rules.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside the run: block shell command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This is a direct expression interpolation in a shell command string, which is a script-injection vulnerability. The value should be passed via an env: variable instead.

Locations:

- `action.yml:499`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remotely fetched script directly to bash without first downloading and inspecting it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification.

Locations:

- `base-action/action.yml:163`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets env var PATH_TO_BUN_EXECUTABLE from `${{ inputs.path_to_bun_executable }}` (an untrusted input) and then writes a value derived from it (`BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`) to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:237`
- `base-action/action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step sets env var PATH_TO_CLAUDE_CODE_EXECUTABLE from `${{ inputs.path_to_claude_code_executable }}` (an untrusted input) and then writes a value derived from it (`CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`) to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:178`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 security findings across 3 files:
1. agent-approval-check/action.yml (line 55): Moved ${{ github.action_path }} to env var ACTION_PATH to fix script-injection.
2. action.yml (line 499, Revoke app token): Moved ${{ steps.run.outputs.github_token }} to env var APP_TOKEN to fix script-injection.
3. base-action/action.yml (line 163, Install Claude Code): Fixed unsafe-shell by downloading the install script to a temp file with curl -o, then executing it directly (bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"), dropping the '--' that was only needed for the pipe form.
4. action.yml (line 237, Setup Custom Bun Path): Added sanitization (printf '%s' | tr -d '\n\r') before writing BUN_DIR to $GITHUB_PATH to fix github-env-injection.
5. base-action/action.yml (lines 148 and 178): Added sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH to fix github-env-injection.

