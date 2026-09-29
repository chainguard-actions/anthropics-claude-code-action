<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.217

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.217** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): The run: block directly interpolates ${{ github.action_path }} in the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression inside a run: block flows through YAML template substitution before the shell sees it, making it a script-injection risk regardless of whether the context appears GitHub-controlled.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Rule (a): The 'Revoke app token' run: block directly interpolates ${{ steps.run.outputs.github_token }} inside a shell command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Step outputs flow through YAML template substitution before the shell processes them and must not appear directly inside run: blocks.

Locations:

- `action.yml:388`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `bash -c` wrapper). This allows the remote server to execute arbitrary code on the runner without any integrity check.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The input is placed in the env var PATH_TO_BUN_EXECUTABLE, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed, and `echo "$BUN_DIR" >> "$GITHUB_PATH"` is executed. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, so a newline-containing input value could inject additional entries into PATH.

Locations:

- `action.yml:233`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The input is placed in PATH_TO_CLAUDE_CODE_EXECUTABLE, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed, and `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` is executed without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:162`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` out of the run: shell string into an env: variable ACTION_PATH to prevent script-injection.

2. action.yml (Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of the run: shell string into an env: variable APP_TOKEN to prevent script-injection.

3. base-action/action.yml (Install Claude Code step): Replaced both curl-pipe-to-bash patterns with download-then-execute using mktemp. The '--' separator was dropped (per instructions) since it was the shell's own option terminator, not the script's. The temp file is cleaned up after use.

4. action.yml (Setup Custom Bun Path step): Added `printf '%s' ... | tr -d '\n\r'` sanitization of BUN_DIR before writing to $GITHUB_PATH.

5. base-action/action.yml (Setup Custom Bun Path step): Same sanitization fix as #4.

6. base-action/action.yml (Install Claude Code step, else branch): Added `printf '%s' ... | tr -d '\n\r'` sanitization of CLAUDE_DIR before writing to $GITHUB_PATH.

