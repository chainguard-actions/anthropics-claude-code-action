<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.231

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.231** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ ... }}` expression is interpolated directly inside a `run:` shell script body. In the 'Revoke app token' step, `${{ steps.run.outputs.github_token }}` is embedded directly in the curl command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. GitHub Actions performs template substitution before the shell ever sees the string, so any newlines or shell metacharacters in the token value are not quoted by the shell.

Locations:

- `action.yml:560`

### script-injection (severity: high)

Sub-rule (a): A `${{ ... }}` expression is interpolated directly inside a `run:` shell command. In agent-approval-check/action.yml, the step `- run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command string. While `github.action_path` is not attacker-controlled, any `${{ ... }}` expression directly inside a `run:` block is a script-injection finding per the check rules.

Locations:

- `agent-approval-check/action.yml:49`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first downloading it to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and also inside a `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:154`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then used to compute `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, and finally written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. This write is not preceded by the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A caller-controlled value containing newlines could inject additional entries into GITHUB_PATH. This pattern appears in both action.yml and base-action/action.yml.

Locations:

- `action.yml:248`
- `base-action/action.yml:131`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 4 findings across 3 files:

1. **script-injection (action.yml, ~line 560)**: In the 'Revoke app token' step, moved `${{ steps.run.outputs.github_token }}` into the step's `env:` block as `GITHUB_TOKEN_TO_REVOKE` and referenced it as `$GITHUB_TOKEN_TO_REVOKE` in the curl command.

2. **script-injection (agent-approval-check/action.yml, line 49)**: Moved `${{ github.action_path }}` into the step's `env:` block as `ACTION_PATH` and referenced it as `$ACTION_PATH` in the python command. Merged the two env: blocks into one.

3. **unsafe-shell (base-action/action.yml, lines 152/154)**: Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns (including the one inside `timeout ... bash -c "..."`) with a download-then-execute approach: curl downloads to a temp file via `mktemp`, then bash executes the file directly with the version as a positional argument. The `--` was dropped (it was the shell's stdin-mode option terminator, not the script's own separator). The temp file is cleaned up after use.

4. **github-env-injection (action.yml line 248, base-action/action.yml line 131)**: Added sanitization of the `BUN_DIR` value before writing to `$GITHUB_PATH` in both files using `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and writing `$safe_bun_dir` instead.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Install Claude Code' step in hardened/action/base-action/action.yml at line 175. Added sanitization of CLAUDE_DIR before writing to $GITHUB_PATH: introduced `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and changed `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` to `echo "$safe_claude_dir" >> "$GITHUB_PATH"`. This matches the existing pattern used in the 'Setup Custom Bun Path' step for BUN_DIR, preventing newline injection via the attacker-controllable path_to_claude_code_executable input.

