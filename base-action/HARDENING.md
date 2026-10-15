<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.251

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.251** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the user-controlled input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-supplied value containing embedded newlines could inject arbitrary entries into GITHUB_PATH, enabling PATH hijacking in subsequent steps.

Locations:

- `action.yml:119`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the user-controlled input `inputs.path_to_claude_code_executable` is mapped to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-supplied value containing embedded newlines could inject arbitrary entries into GITHUB_PATH, enabling PATH hijacking in subsequent steps.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash without any integrity verification: `curl -fsSL https://claude.ai/install.sh | bash`. If the remote server is compromised or the connection is intercepted, arbitrary code will be executed on the runner. The script should be downloaded to a file first, its integrity verified (e.g., via checksum), and then executed separately.

Locations:

- `action.yml:138`
- `action.yml:140`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three findings in hardened/action/action.yml:
1. github-env-injection (Setup Custom Bun Path, line 119): Added sanitization `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.
2. github-env-injection (Install Claude Code, line 156): Added sanitization `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.
3. unsafe-shell (Install Claude Code, lines 138/140): Replaced `curl ... | bash -s -- $VERSION` with downloading the script to a mktemp file first, then executing `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's stdin-mode option terminator, not a script argument). The temp file is cleaned up after installation.

