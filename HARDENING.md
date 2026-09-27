<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.210

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.210** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ github.action_path }}` expression is interpolated directly inside a `run:` shell command string. The offending line is: `- run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:57`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears twice — once inside a `bash -c` string and once as a direct pipe). This allows the remote server to execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:135`
- `base-action/action.yml:137`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The input is placed in the `PATH_TO_BUN_EXECUTABLE` env var, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The required sanitization (`printf '%s' ... | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:228`
- `base-action/action.yml:113`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to `$GITHUB_PATH` without sanitization. The input is placed in the `PATH_TO_CLAUDE_CODE_EXECUTABLE` env var, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The required sanitization (`printf '%s' ... | tr -d '\n\r'`) is absent.

Locations:

- `base-action/action.yml:143`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 4 findings across 3 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` from the `run:` shell string into an `env:` variable `ACTION_PATH`, referenced as `$ACTION_PATH` in the shell script.

2. base-action/action.yml (unsafe-shell): Replaced both curl-pipe-to-bash patterns with download-then-execute using a mktemp file. The `--` separator was dropped (per rules) since we're no longer piping to bash — the version argument is now passed directly as a positional argument to the downloaded script.

3. action.yml + base-action/action.yml (github-env-injection, BUN_DIR): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in both Setup Custom Bun Path steps.

4. base-action/action.yml (github-env-injection, CLAUDE_DIR): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in the Install Claude Code step.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Revoke app token' step in action.yml: moved `${{ steps.run.outputs.github_token }}` from the inline `run:` shell string into an `env:` block as `APP_TOKEN: ${{ steps.run.outputs.github_token }}`, and replaced the inline expression with `$APP_TOKEN` in the curl command. This prevents potential command injection if the token value contains shell metacharacters.

