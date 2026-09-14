<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.221

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.221** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The run: block in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression directly inside a run: script is a script-injection finding per the check rules, regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:54`

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' run: block in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside the shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. steps.*.outputs.* is an untrusted-input source and must not be interpolated directly into run: scripts.

Locations:

- `action.yml:388`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via `dirname "$PATH_TO_BUN_EXECUTABLE"`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `action.yml:209`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via `dirname "$PATH_TO_BUN_EXECUTABLE"`) to `$GITHUB_PATH` without sanitization. Additionally, the 'Install Claude Code' step writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable` via `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"`) to `$GITHUB_PATH` without sanitization. Neither write is preceded by `printf '%s' ... | tr -d '\n\r'`.

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:163`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes remotely-fetched content without first downloading and inspecting it, creating a supply-chain risk if the remote URL is compromised.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml: Moved ${{ github.action_path }} out of run: block into env: block (ACTION_PATH), referenced as $ACTION_PATH in shell.
2. action.yml (Revoke app token step): Moved ${{ steps.run.outputs.github_token }} out of run: block into env: block (APP_GITHUB_TOKEN), referenced as $APP_GITHUB_TOKEN in shell.
3. action.yml (Setup Custom Bun Path): Added printf '%s' "$BUN_DIR" | tr -d '\n\r' sanitization before writing to $GITHUB_PATH.
4. base-action/action.yml (Setup Custom Bun Path): Added printf '%s' "$BUN_DIR" | tr -d '\n\r' sanitization before writing to $GITHUB_PATH.
5. base-action/action.yml (Install Claude Code): Replaced curl|bash pipe with download-to-tempfile-then-execute pattern (dropping the '--' shell option terminator per the rules since we're no longer piping to bash), and added tr -d '\n\r' sanitization for both $HOME/.local/bin and $CLAUDE_DIR before writing to $GITHUB_PATH.

