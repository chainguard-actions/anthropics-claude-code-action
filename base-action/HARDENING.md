<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.212

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.212** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading it to a file. Two occurrences: (1) inside a `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. An attacker who can intercept or tamper with the remote URL could execute arbitrary code on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). (1) In the 'Setup Custom Bun Path' step, `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` followed by `echo "$BUN_DIR" >> "$GITHUB_PATH"` — PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable. (2) In the 'Install Claude Code' step, `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` followed by `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — PATH_TO_CLAUDE_CODE_EXECUTABLE is set from inputs.path_to_claude_code_executable. A calling workflow can supply a value containing newlines to inject arbitrary entries into GITHUB_PATH, enabling PATH hijacking attacks.

Locations:

- `action.yml:133`
- `action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two findings in hardened/action/action.yml:

1. unsafe-shell (lines 148, 150): Replaced both curl-pipe-to-bash patterns with a download-then-execute pattern. The script is now downloaded to a mktemp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` and then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). The temp file is cleaned up after use.

2. github-env-injection (lines 133, 163): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing user-controlled directory paths to $GITHUB_PATH in both the 'Setup Custom Bun Path' step (BUN_DIR) and the 'Install Claude Code' step (CLAUDE_DIR).

