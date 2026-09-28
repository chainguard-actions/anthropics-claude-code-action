<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.199

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.199** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside the `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing shell metacharacters to be injected. The token should be passed via an `env:` variable and referenced as `$GITHUB_TOKEN` in the shell.

Locations:

- `action.yml:538`

### script-injection (severity: high)

Sub-rule (a): The step `run: python "${{ github.action_path }}/agent_approval_check.py"` directly interpolates `${{ github.action_path }}` inside the `run:` shell command string. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk. The path should be passed via an `env:` variable (e.g., `ACTION_PATH: ${{ github.action_path }}`) and referenced as `"$ACTION_PATH"` in the shell.

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes arbitrary remote code without first downloading and verifying the script. The script should be downloaded to a file, its integrity verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:153`
- `base-action/action.yml:155`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `$PATH_TO_BUN_EXECUTABLE`, which is set from `inputs.path_to_bun_executable`) to `$GITHUB_PATH` without sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input value containing newlines could inject additional entries into `$GITHUB_PATH`. The value should be sanitized with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing.

Locations:

- `action.yml:272`
- `base-action/action.yml:120`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` (derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE`, which is set from `inputs.path_to_claude_code_executable`) to `$GITHUB_PATH` without sanitization: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input value containing newlines could inject additional entries into `$GITHUB_PATH`. The value should be sanitized with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing.

Locations:

- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (script-injection, line 538): Moved `${{ steps.run.outputs.github_token }}` out of the 'Revoke app token' run: shell string into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the curl command.

2. agent-approval-check/action.yml (script-injection, line 55): Moved `${{ github.action_path }}` out of the python run: command into an `env:` block as `ACTION_PATH`, referenced as `$ACTION_PATH` in the shell.

3. base-action/action.yml (unsafe-shell, lines 153/155): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach using a temp file (`mktemp`). The `--` separator was dropped as required (it was the shell's option terminator, not the script's). The temp file is cleaned up after use.

4. action.yml (github-env-injection, line 272): Added sanitization of `BUN_DIR` using `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to `$GITHUB_PATH`.

5. base-action/action.yml (github-env-injection, line 120): Same BUN_DIR sanitization applied to the Setup Custom Bun Path step.

6. base-action/action.yml (github-env-injection, line 163): Added sanitization of `CLAUDE_DIR` using `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing to `$GITHUB_PATH` in the Install Claude Code step.

