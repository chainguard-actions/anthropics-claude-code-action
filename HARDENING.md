<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.213

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.213** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is interpolated directly inside a `run:` shell command string. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly in a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` is interpolated directly inside a `run:` shell command string in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The expression is substituted by the YAML template engine before the shell processes it, enabling injection if the output value contains shell metacharacters.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step derives `BUN_DIR` from the `inputs.path_to_bun_executable` input (via env var `PATH_TO_BUN_EXECUTABLE`) and writes it to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into PATH. Pattern: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:232`
- `base-action/action.yml:107`

### github-env-injection (severity: high)

The 'Install Claude Code' step derives `CLAUDE_DIR` from the `inputs.path_to_claude_code_executable` input (via env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`) and writes it to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into PATH. Pattern: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:143`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever the remote server returns without any integrity verification, making it vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:130`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 security findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` to env var `ACTION_PATH` and referenced it as `$ACTION_PATH` in the run command.

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` to env var `REVOKE_TOKEN` and referenced it as `$REVOKE_TOKEN` in the curl command.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (unsafe-shell + github-env-injection, Install Claude Code): Replaced `curl ... | bash -s -- "$CLAUDE_CODE_VERSION"` with download-then-execute pattern using a temp file. Dropped the `--` shell option terminator as required. Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing CLAUDE_DIR to GITHUB_PATH.

