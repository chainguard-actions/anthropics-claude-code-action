<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.224

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.224** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r').

1. "Setup Custom Bun Path" step: PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is written directly to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no newline sanitization applied.

2. "Install Claude Code" step: PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }}, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is written directly to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no newline sanitization applied.

An attacker who controls these inputs could inject newlines to add arbitrary entries to GITHUB_PATH, enabling PATH hijacking attacks.

Locations:

- `action.yml:140`
- `action.yml:170`

### unsafe-shell (severity: high)

The "Install Claude Code" step pipes remote content directly to bash in two places:
1. `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`
2. `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`

This pattern executes whatever content is served at the remote URL without first downloading and verifying it. A compromised or man-in-the-middle'd response from claude.ai would execute arbitrary code on the runner.

Locations:

- `action.yml:155`
- `action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. github-env-injection (lines ~140 and ~170): Added newline sanitization before writing to $GITHUB_PATH in both the 'Setup Custom Bun Path' step (BUN_DIR) and the 'Install Claude Code' step (CLAUDE_DIR). Used `printf '%s' "$VAR" | tr -d '\n\r'` pattern to strip newlines before writing.

2. unsafe-shell (lines ~155 and ~157): Replaced both `curl ... | bash -s -- $VERSION` patterns with a download-then-execute approach: curl downloads the install script to a mktemp file, then bash executes the file directly. The '--' was dropped since it was the shell's option terminator for 'bash -s' (stdin mode) and is not needed when executing a file. The temp file is cleaned up after use.

