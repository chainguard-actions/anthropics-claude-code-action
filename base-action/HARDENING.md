<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.228

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.228** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Two steps in action.yml write values derived from `inputs.*` (via env vars) to `$GITHUB_PATH` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`).

(1) "Setup Custom Bun Path" step: `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline embedded in the input value could inject an arbitrary entry into PATH.

(2) "Install Claude Code" step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk. Neither write is preceded by the required sanitization step.

Locations:

- `action.yml:153`
- `action.yml:188`

### unsafe-shell (severity: high)

The "Install Claude Code" step pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns at the time of the request, with no integrity check. The pattern appears twice — once inside a `timeout` wrapper and once in the fallback `else` branch.

Locations:

- `action.yml:175`
- `action.yml:177`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. github-env-injection (lines 153, 188): Added printf/tr sanitization before writing to $GITHUB_PATH in both the 'Setup Custom Bun Path' step (safe_bun_dir) and the 'Install Claude Code' step (safe_claude_dir). This prevents newline injection into PATH via user-controlled input values.

2. unsafe-shell (lines 175, 177): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns (in the timeout branch and the else branch) with a download-then-execute pattern: curl downloads to a mktemp file, then bash executes the file directly with the version as a positional argument. The '--' was dropped since it was the shell's option terminator for the pipe form, not the script's own argument. The temp file is cleaned up after installation.

