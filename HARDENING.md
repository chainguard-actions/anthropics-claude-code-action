<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.220

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.220** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (in the curl -H Authorization header). Any ${{ ... }} expression inside a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:484`

### script-injection (severity: high)

Sub-rule (a): The run step in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside a `run:` shell command string: `python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression inside a run: block is a script-injection finding regardless of which context it reads from. The value should be passed via an env: variable and referenced as `$GITHUB_ACTION_PATH` instead.

Locations:

- `agent-approval-check/action.yml:55`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `$PATH_TO_BUN_EXECUTABLE`, which is set from `inputs.path_to_bun_executable`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a path containing newlines to inject arbitrary entries into GITHUB_PATH. The offending lines are: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` followed by `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:233`
- `base-action/action.yml:122`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash`. This executes whatever the remote server returns without first downloading and verifying the script. If the remote URL is compromised or the connection is intercepted, arbitrary code will execute on the runner. The script should be downloaded to a file, verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:148`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 4 findings:
1. script-injection (action.yml:484 - Revoke app token): Moved `${{ steps.run.outputs.github_token }}` out of the curl -H Authorization header into an env: variable `APP_TOKEN`, referenced as `$APP_TOKEN` in the shell.
2. script-injection (agent-approval-check/action.yml:55): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` using the built-in GitHub Actions environment variable.
3. github-env-injection (action.yml:233 and base-action/action.yml:122): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in both Setup Custom Bun Path steps.
4. unsafe-shell (base-action/action.yml:148): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` with downloading to a temp file first (`curl -fsSL ... -o "$INSTALL_SCRIPT"`) then executing separately (`bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`), dropping the `-s` and `--` flags that were only needed for the pipe form.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

In base-action/action.yml, the 'Install Claude Code' step's else branch (for custom executables) now sanitizes CLAUDE_DIR before writing to $GITHUB_PATH. Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and changed the echo to use `$safe_claude_dir` instead of `$CLAUDE_DIR`. This matches the existing sanitization pattern used in the 'Setup Custom Bun Path' step and prevents newline injection via the caller-controlled `path_to_claude_code_executable` input.

