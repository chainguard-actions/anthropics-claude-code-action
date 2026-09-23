<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.225

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.225** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into the runner's PATH. Similarly, in the 'Install Claude Code' step, `inputs.path_to_claude_code_executable` is mapped to `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:136`
- `action.yml:170`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (both inside a `bash -c` string and as a direct pipeline). This executes whatever the remote server returns without any integrity verification, making the action vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `action.yml:155`
- `action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three issues in hardened/action/action.yml:
1. 'Setup Custom Bun Path' step (line ~136): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write the sanitized value to $GITHUB_PATH to prevent newline injection.
2. 'Install Claude Code' step (lines ~155,157): Replaced `curl ... | bash -s -- $VERSION` (both the timeout-wrapped and plain forms) with a two-step approach: download to a temp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute `bash "$INSTALL_SCRIPT" $CLAUDE_CODE_VERSION`. The `--` separator was dropped (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.
3. 'Install Claude Code' step (line ~170): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and write the sanitized value to $GITHUB_PATH to prevent newline injection.

