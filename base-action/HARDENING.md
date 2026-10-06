<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.243

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.243** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern appears twice — once inside a `timeout` wrapper and once in the else branch. If the remote URL is compromised or redirected, arbitrary code executes on the runner.

Locations:

- `action.yml:158`
- `action.yml:161`

### github-env-injection (severity: high)

Two steps write values derived from untrusted inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

(1) 'Setup Custom Bun Path': `inputs.path_to_bun_executable` is placed into env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no newline stripping.

(2) 'Install Claude Code': `inputs.path_to_claude_code_executable` is placed into env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no newline stripping.

An attacker-controlled input containing embedded newlines could inject additional entries into $GITHUB_PATH, enabling PATH hijacking.

Locations:

- `action.yml:138`
- `action.yml:178`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed three issues in hardened/action/action.yml:

1. unsafe-shell: The 'Install Claude Code' step previously piped remote content directly to bash in two places (`curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`). Fixed by downloading the script to a temp file with `mktemp` first, then executing it separately as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was correctly dropped (it was the shell's option terminator in the pipe form, not an argument to the installer script). The temp file is cleaned up after use in both success and failure paths.

2. github-env-injection (two locations):
   - 'Setup Custom Bun Path' step: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write `$safe_bun_dir` to GITHUB_PATH instead of raw `$BUN_DIR`.
   - 'Install Claude Code' step (else branch for custom executable): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and write `$safe_claude_dir` to GITHUB_PATH instead of raw `$CLAUDE_DIR`.

