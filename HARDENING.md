<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.239

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.239** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The `run:` block in the 'agent-approval-check/action.yml' step directly interpolates a `github.*` context expression inside the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it. The fix is to use the `$GITHUB_ACTION_PATH` environment variable instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `agent-approval-check/action.yml:57`

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' `run:` block in `action.yml` directly interpolates a `steps.*.outputs.*` context expression inside the shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The `steps.*.outputs.*` context is listed as an untrusted-input source; its value is substituted by the YAML template engine before the shell sees it, enabling injection. The fix is to pass the value via an `env:` variable and reference `$GITHUB_TOKEN_VALUE` in the shell command.

Locations:

- `action.yml:340`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in `base-action/action.yml` pipes remote content directly to bash in two places: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Piping a remote script directly to a shell interpreter means any compromise of the remote server or a MITM attack could execute arbitrary code. The fix is to download the script to a temporary file, verify its integrity (e.g., checksum), and then execute it separately.

Locations:

- `base-action/action.yml:163`
- `base-action/action.yml:165`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in `action.yml` writes a value derived from the untrusted input `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newlines could inject additional entries into `$GITHUB_PATH`. The fix is to sanitize before writing: `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` then `echo "$safe" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:182`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in `base-action/action.yml` writes a value derived from the untrusted input `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newlines could inject additional entries into `$GITHUB_PATH`. The fix is to sanitize before writing: `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` then `echo "$safe" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:143`

### github-env-injection (severity: high)

The 'Install Claude Code' step in `base-action/action.yml` writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newlines could inject additional entries into `$GITHUB_PATH`. The fix is to sanitize before writing: `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` then `echo "$safe" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:172`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 6 findings across 3 files:
1. agent-approval-check/action.yml: Replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` to eliminate script-injection risk.
2. action.yml (Revoke app token): Moved `${{ steps.run.outputs.github_token }}` into env block as `GITHUB_TOKEN_VALUE` and referenced it as `$GITHUB_TOKEN_VALUE` in the curl command.
3. action.yml (Setup Custom Bun Path): Added `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.
4. base-action/action.yml (Setup Custom Bun Path): Added same sanitization before writing to `$GITHUB_PATH`.
5. base-action/action.yml (Install Claude Code): Replaced both `curl -fsSL ... | bash -s -- $VERSION` patterns with download-to-tempfile then execute pattern. Dropped the `--` separator per instructions since it was the shell's option terminator, not the script's.
6. base-action/action.yml (Install Claude Code): Added `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing `CLAUDE_DIR` to `$GITHUB_PATH`.

