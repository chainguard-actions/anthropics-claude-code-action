<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.202

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.202** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ steps.run.outputs.github_token }}` is interpolated directly inside a `run:` shell command in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`  This causes the expression to be substituted into the shell command string before the shell parses it, enabling injection if the output value contains shell metacharacters.

Locations:

- `action.yml:393`

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ github.action_path }}` is interpolated directly inside a `run:` shell command: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Per the check rules, any `${{ ... }}` expression directly inside a `run:` block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:47`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. The install script is fetched from a remote URL and executed immediately without first downloading and verifying it. This pattern appears twice (once inside a `timeout` wrapper and once in the fallback `else` branch).

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` (an attacker-controllable input). The script then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without any sanitization (`printf '%s' ... | tr -d '\n\r'`). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:231`
- `base-action/action.yml:127`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}` (an attacker-controllable input). The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization. A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files:

1. action.yml (Revoke app token, line 393): Moved `${{ steps.run.outputs.github_token }}` to env block as GITHUB_TOKEN_TO_REVOKE; referenced as $GITHUB_TOKEN_TO_REVOKE in curl command.

2. agent-approval-check/action.yml (line 47): Moved `${{ github.action_path }}` to env block as ACTION_PATH; referenced as $ACTION_PATH in python command. Merged into existing env: block to avoid duplicate keys.

3. base-action/action.yml (lines 148/150, Install Claude Code): Converted both curl-pipe-to-bash patterns to download-then-execute: curl saves to a mktemp file, bash executes the file. Dropped the '--' shell option terminator (it was the shell's, not the script's). Added cleanup of temp file.

4. action.yml (line 231, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

5. base-action/action.yml (line 127, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

6. base-action/action.yml (line 163, Install Claude Code else branch): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

