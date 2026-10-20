<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.254

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.254** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the user-controlled input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The input is mapped to the env var PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The required sanitization step (`printf '%s' ... | tr -d '\n\r'`) is absent before the write.

Locations:

- `action.yml:118`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the user-controlled input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The input is mapped to the env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The required sanitization step (`printf '%s' ... | tr -d '\n\r'`) is absent before the write.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash`. This pattern appears twice — once inside a `timeout ... bash -c "curl ... | bash"` wrapper (line 138) and once in the else branch (line 140). If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner immediately.

Locations:

- `action.yml:138`
- `action.yml:140`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three findings in hardened/action/action.yml:

1. Setup Custom Bun Path (line 118) - github-env-injection: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to strip newlines from the user-controlled input.

2. Install Claude Code (line 156) - github-env-injection: Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to strip newlines from the user-controlled input.

3. Install Claude Code (lines 138, 140) - unsafe-shell: Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the timeout-wrapped variant) with a download-then-execute pattern: download to a mktemp file, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped per instructions (it was the shell's option terminator in the pipe form, not the script's argument). Temp file is cleaned up after the loop.

