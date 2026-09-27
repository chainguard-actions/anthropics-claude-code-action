<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.209

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.209** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote install script directly to bash without first downloading and verifying it. Two occurrences: (1) inside a `bash -c` string: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`, and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This allows the remote server to execute arbitrary code on the runner.

Locations:

- `action.yml:172`
- `action.yml:174`

### github-env-injection (severity: high)

Two steps write attacker-controlled input values to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) 'Setup Custom Bun Path' step: `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (sourced from `inputs.path_to_bun_executable`) and written directly to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A caller-supplied path containing embedded newlines could inject arbitrary entries into GITHUB_PATH. (2) 'Install Claude Code' step: `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (sourced from `inputs.path_to_claude_code_executable`) and written directly to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

Locations:

- `action.yml:152`
- `action.yml:190`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 172, 174): The 'Install Claude Code' step previously piped the remote install script directly to bash (`curl ... | bash -s -- $VERSION`). Fixed by downloading the script to a mktemp file first, then executing it as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The '--' was dropped (it was the shell's option terminator in the pipe form, not the script's argument). The temp file is cleaned up after use (including on failure).

2. github-env-injection (lines 152, 190): Two steps wrote attacker-controlled input-derived values to $GITHUB_PATH without sanitizing embedded newlines. Fixed by adding `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH in both the 'Setup Custom Bun Path' step (BUN_DIR) and the 'Install Claude Code' step (CLAUDE_DIR).

