<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.229

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.229** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (in the curl Authorization header). Any `${{ ... }}` expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing embedded shell metacharacters to be interpreted. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:490`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from `inputs.path_to_bun_executable` (via `PATH_TO_BUN_EXECUTABLE` env var) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A caller-controlled newline in the input could inject additional entries into GITHUB_PATH.

Locations:

- `action.yml:237`
- `base-action/action.yml:124`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from `inputs.path_to_claude_code_executable` (via `PATH_TO_CLAUDE_CODE_EXECUTABLE` env var) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and then writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A caller-controlled newline in the input could inject additional entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:162`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever the remote server returns without first downloading and verifying the script. A compromised or MitM'd server could deliver malicious code that executes immediately in the runner context.

Locations:

- `base-action/action.yml:149`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 security findings across action.yml and base-action/action.yml:
1. script-injection (action.yml line 490): Moved `${{ steps.run.outputs.github_token }}` from the curl Authorization header in the 'Revoke app token' run: block to the step's env: block as APP_GITHUB_TOKEN, referenced as $APP_GITHUB_TOKEN in the shell.
2. github-env-injection (action.yml line 237): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH in the 'Setup Custom Bun Path' step.
3. github-env-injection (base-action/action.yml line 124): Same BUN_DIR sanitization fix applied to the 'Setup Custom Bun Path' step in base-action/action.yml.
4. github-env-injection (base-action/action.yml line 162): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH in the 'Install Claude Code' step.
5. unsafe-shell (base-action/action.yml line 149): Replaced `curl ... | bash -s -- "$CLAUDE_CODE_VERSION"` with download-then-execute pattern: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` as required since the script is now executed as a file (not from stdin), so the shell's option-parsing terminator is no longer needed. Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml line 55: moved `${{ github.action_path }}` out of the `run:` shell command string and into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now references it as `$ACTION_PATH` instead of the inline expression.

