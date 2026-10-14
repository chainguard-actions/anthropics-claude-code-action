<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.249

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.249** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the github.action_path context value directly into the shell command string before the shell ever sees it. Although github.action_path is not attacker-controlled in the same way as github.head_ref, any ${{ ... }} expression inside a run: block is a script-injection finding per the check rules, because the value flows through YAML template substitution before the shell quotes it.

Locations:

- `agent-approval-check/action.yml:53`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps the caller-controlled input `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — with no `printf '%s' ... | tr -d '\n\r'` sanitization step. A newline embedded in the input value would allow injecting arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:228`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps the caller-controlled input `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — with no `printf '%s' ... | tr -d '\n\r'` sanitization step. A newline embedded in the input value would allow injecting arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:158`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a second occurrence inside a `bash -c` wrapper). If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner without any integrity check.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` into env var `ACTION_PATH` and referenced it as `$ACTION_PATH` in the run: command.

2. action.yml (github-env-injection): Sanitized BUN_DIR with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

3. base-action/action.yml (github-env-injection x2): Sanitized both BUN_DIR and CLAUDE_DIR with tr -d '\n\r' before writing to $GITHUB_PATH.

4. base-action/action.yml (unsafe-shell x2): Replaced both curl-pipe-to-bash patterns with download-to-tempfile-then-execute. Used mktemp for the script file, dropped the '--' (it was the shell's option terminator in the pipe form, not a script argument), and cleaned up the temp file after use.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in the 'Revoke app token' step of action.yml (line 489). Moved `${{ steps.run.outputs.github_token }}` from the curl `-H 'Authorization: Bearer ...'` argument in the `run:` block into an `env:` block as `APP_TOKEN`, and updated the shell script to reference `$APP_TOKEN` instead. This prevents the GitHub Actions expression from being interpolated directly into the shell command string by the YAML template engine.

