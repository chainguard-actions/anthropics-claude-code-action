<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.234

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.234** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (in the curl -H Authorization header). Any `${{ ... }}` expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing newlines or shell metacharacters to break out of the quoted string.

Locations:

- `action.yml:488`

### script-injection (severity: high)

Sub-rule (a): The step `run: python "${{ github.action_path }}/agent_approval_check.py"` in agent-approval-check/action.yml directly interpolates a `${{ github.action_path }}` expression inside a `run:` shell command string. Any `${{ ... }}` expression inside a run: block is a script-injection risk regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:56`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via the env var `PATH_TO_BUN_EXECUTABLE`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a value containing newlines to inject arbitrary entries into PATH.

Locations:

- `action.yml:235`

### github-env-injection (severity: high)

Two steps in base-action/action.yml write unsanitized input-derived values to `$GITHUB_PATH`: (1) The 'Setup Custom Bun Path' step writes `$BUN_DIR` (from `inputs.path_to_bun_executable`) without sanitization. (2) The 'Install Claude Code' step writes `$CLAUDE_DIR` (from `inputs.path_to_claude_code_executable`) without sanitization. Neither write is preceded by `printf '%s' ... | tr -d '\n\r'`, so a newline in the input can inject arbitrary PATH entries.

Locations:

- `base-action/action.yml:140`
- `base-action/action.yml:172`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and verifying the script. If the remote URL is compromised or redirected, arbitrary code runs on the runner.

Locations:

- `base-action/action.yml:157`
- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. action.yml (Revoke app token): Moved `${{ steps.run.outputs.github_token }}` to env var `GITHUB_APP_TOKEN` and referenced it as `$GITHUB_APP_TOKEN` in the curl command.

2. agent-approval-check/action.yml: Moved `${{ github.action_path }}` to env var `ACTION_PATH` and merged it into the existing env block (avoiding duplicate env: keys).

3. action.yml (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

5. base-action/action.yml (Install Claude Code): (a) Replaced `curl | bash` pipe with download-then-execute pattern using mktemp temp file, dropping the `--` shell option terminator as instructed. (b) Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

