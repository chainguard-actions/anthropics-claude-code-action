<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.218

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.218** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote shell script directly to bash without downloading it first. Two occurrences: (1) inside a `timeout` wrapper: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`, and (2) directly: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner.

Locations:

- `action.yml:156`
- `action.yml:158`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`), enabling newline injection attacks that could add arbitrary entries to PATH or inject additional environment variable assignments.

(1) 'Setup Custom Bun Path' step: `inputs.path_to_bun_executable` is placed into env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no sanitization applied.

(2) 'Install Claude Code' step: `inputs.path_to_claude_code_executable` is placed into env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no sanitization applied.

Locations:

- `action.yml:136`
- `action.yml:174`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 156, 158): Replaced both `curl ... | bash -s -- $VERSION` pipe patterns with a download-then-execute approach. The script is now downloaded to a mktemp file first, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator, not the script's). Both the `timeout` and non-`timeout` code paths were fixed. The temp file is cleaned up after use.

2. github-env-injection (lines 136, 174): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing user-input-derived directory paths to $GITHUB_PATH in both the 'Setup Custom Bun Path' step and the custom-executable branch of the 'Install Claude Code' step.

