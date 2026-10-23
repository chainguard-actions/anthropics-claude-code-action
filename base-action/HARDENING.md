<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.260

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.260** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' takes inputs.path_to_bun_executable (passed in as PATH_TO_BUN_EXECUTABLE), computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), and runs `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is not passed through printf '%s' ... | tr -d '\n\r' first, so an input containing a newline can add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' takes inputs.path_to_claude_code_executable (passed in as PATH_TO_CLAUDE_CODE_EXECUTABLE), computes CLAUDE_DIR=$(dirname ...), and runs `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The value is not passed through printf '%s' ... | tr -d '\n\r' first.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (fallback when timeout is not available) pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Setup Custom Bun Path and Install Claude Code: dirname-derived paths now pass through printf '%s' | tr -d '\n\r' before going to $GITHUB_PATH. Install Claude Code: claude.ai/install.sh is now saved to a mktemp file and run as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"' (the '-s --' is dropped, so the version is still $1). The timeout wrapper now applies to the download and to the run separately, and the 3-attempt retry loop still works. The temp file is removed after each attempt.

### Iteration 2

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Install Claude Code step: the install script is now downloaded to a mktemp file and checked to be non-empty, then run with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The '-s --' is dropped. When `timeout` is available it still wraps the run (120s), and the download now has its own 60s timeout. The retry loop and temp-file cleanup still work. $HOME/.local/bin is cleaned with printf | tr -d '\n\r' before it is written to GITHUB_PATH.

