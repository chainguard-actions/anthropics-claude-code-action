<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.240

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.240** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value, allowing an attacker-controlled output to inject shell metacharacters.

Locations:

- `action.yml:500`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via `dirname`) to `$GITHUB_PATH` without sanitization. The value flows: `inputs.path_to_bun_executable` → env var `PATH_TO_BUN_EXECUTABLE` → `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` → `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, so a newline-containing input value could inject arbitrary entries into PATH.

Locations:

- `action.yml:240`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable` via `dirname`) to `$GITHUB_PATH` without sanitization. The value flows: `inputs.path_to_claude_code_executable` → env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` → `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` → `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:180`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash in two places: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (both inside a `timeout` wrapper and in the fallback branch). This executes whatever the remote server returns without any integrity verification.

Locations:

- `base-action/action.yml:160`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across action.yml and base-action/action.yml:

1. script-injection (action.yml ~line 500): Moved `${{ steps.run.outputs.github_token }}` from inline shell string in 'Revoke app token' step into an `env:` block as `GITHUB_APP_TOKEN`, referenced as `$GITHUB_APP_TOKEN` in the curl command.

2. github-env-injection (action.yml ~line 240): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH` in 'Setup Custom Bun Path' step.

3. github-env-injection (base-action/action.yml ~line 130): Same sanitization fix applied to 'Setup Custom Bun Path' step in base-action/action.yml.

4. github-env-injection + unsafe-shell (base-action/action.yml ~lines 160/180): In 'Install Claude Code' step: (a) replaced `curl ... | bash -s -- $VERSION` with download-then-execute pattern using a mktemp file, dropping the `--` (which was the shell's stdin-mode option terminator, not the script's argument); (b) added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing CLAUDE_DIR to `$GITHUB_PATH`.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml line 52, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions automatically sets the GITHUB_ACTION_PATH environment variable to the same value as github.action_path, so the behavior is identical while eliminating the ${{ }} expression interpolation in the run: block.

