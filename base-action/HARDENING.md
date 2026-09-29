<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.217

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.217** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs twice — once inside a `timeout ... bash -c "..."` wrapper and once in the else branch. If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes on the runner immediately.

Locations:

- `action.yml:143`
- `action.yml:145`

### github-env-injection (severity: high)

Two steps write values derived from user-supplied inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

1. 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline-containing input value could inject additional entries into PATH.

2. 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk applies.

Locations:

- `action.yml:126`
- `action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two high-severity findings in action.yml:

1. unsafe-shell (lines 143, 145): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with a download-then-execute pattern. The install script is now downloaded to a temp file via `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` and then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The '--' was dropped (it was the shell's option terminator in the pipe form, not the script's argument). This applies to both the timeout branch and the else branch. The temp file is cleaned up after use.

2. github-env-injection (lines 126, 155): Both BUN_DIR (in 'Setup Custom Bun Path') and CLAUDE_DIR (in 'Install Claude Code') are now sanitized with `printf '%s' "$VAR" | tr -d '\n\r'` before being written to $GITHUB_PATH, preventing newline injection attacks.

