<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.248

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.248** was hardened automatically. 6 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string. Any `${{ ... }}` expression in a run: block is a script-injection risk regardless of the context it reads from. Offending line: `run: python "${{ github.action_path }}/agent_approval_check.py"`

Locations:

- `agent-approval-check/action.yml:53`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string in the 'Revoke app token' step. Offending line: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:499`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. An attacker-controlled input value containing newlines can inject arbitrary entries into PATH.

Locations:

- `action.yml:228`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. An attacker-controlled input value containing newlines can inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. An attacker-controlled input value containing newlines can inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

Remote content is piped directly to bash without first downloading and verifying the script. Pattern matched: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This allows the remote server to execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:154`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` out of run: into env: as ACTION_PATH, referenced as $ACTION_PATH in shell.

2. action.yml (Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of run: into env: as APP_TOKEN, referenced as $APP_TOKEN in curl command.

3. base-action/action.yml (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (Install Claude Code - custom executable path): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

5. base-action/action.yml (Install Claude Code - curl|bash): Replaced pipe-to-bash pattern with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped per instructions (it was the shell's option terminator in the pipe form, not the script's argument). Applied to both the timeout-wrapped and non-timeout code paths.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Setup Custom Bun Path' step in action.yml (line ~226) by adding newline sanitization before writing BUN_DIR to $GITHUB_PATH. Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and changed the echo to use `$safe_bun_dir` instead of `$BUN_DIR`. This matches the correct pattern already present in base-action/action.yml.

