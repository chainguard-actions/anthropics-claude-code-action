<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.241

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.241** was hardened automatically. 3 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string — specifically in the curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` header. Any `${{ ... }}` expression interpolated directly into a run block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing a malicious value to break out of the string context.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from `inputs.path_to_bun_executable` (an attacker-controlled input) to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into GITHUB_PATH. This issue appears in both action.yml and base-action/action.yml.

Locations:

- `action.yml:208`
- `base-action/action.yml:121`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to a shell interpreter: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant wrapped in `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). This executes whatever script the remote server returns without first downloading and inspecting it, making the action vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:147`
- `base-action/action.yml:149`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

1. script-injection (action.yml ~line 399): Moved `${{ steps.run.outputs.github_token }}` from the curl `-H "Authorization: Bearer ..."` header into an `env:` block as `GITHUB_APP_TOKEN`, referenced as `$GITHUB_APP_TOKEN` in the shell script.

2. github-env-injection (action.yml ~line 208, base-action/action.yml ~line 121): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH` in both files to strip newlines from the attacker-controlled `path_to_bun_executable` input.

3. unsafe-shell (base-action/action.yml ~lines 147/149): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the timeout-wrapped variant) with a two-step approach: download to a temp file via `mktemp`, then execute `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped since it was the shell's stdin-mode option terminator (`-s --`), not an argument to the install script itself. Temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml line 47, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `GITHUB_ACTION_PATH` environment variable is automatically set by GitHub Actions for composite actions and is equivalent to `github.action_path`, so no env: mapping is needed. This removes the ${{ }} expression from the run: shell string, eliminating the script-injection risk.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

Fixed the github-env-injection finding in hardened/action/base-action/action.yml at the 'Install Claude Code' step. Added sanitization of CLAUDE_DIR before writing to $GITHUB_PATH: `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` followed by `echo "$safe_claude_dir" >> "$GITHUB_PATH"`. This matches the pattern already used in the adjacent 'Setup Custom Bun Path' step, preventing an attacker-controlled value containing newlines from injecting arbitrary entries into $GITHUB_PATH.

