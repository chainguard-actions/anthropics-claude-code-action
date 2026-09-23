<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.231

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.231** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes the output of curl directly to bash without first saving to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs twice (once inside a `timeout ... bash -c "..."` wrapper and once in the else branch). If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner.

Locations:

- `action.yml:161`
- `action.yml:163`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps the user-controlled input `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled newline in the input can inject arbitrary entries into the PATH used by subsequent steps.

Locations:

- `action.yml:145`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps the user-controlled input `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then derives `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled newline in the input can inject arbitrary entries into the PATH used by subsequent steps.

Locations:

- `action.yml:175`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed three security findings in hardened/action/action.yml:

1. unsafe-shell (lines 161, 163): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach. The script is downloaded to a temp file via `mktemp`, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `-- ` separator (which was the shell's stdin-mode option terminator) was dropped since the script is now run from a file, not stdin. The temp file is cleaned up after use (both on success and on final failure).

2. github-env-injection (line 145, Setup Custom Bun Path): Added sanitization `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to prevent newline injection.

3. github-env-injection (line 175, Install Claude Code): Added sanitization `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to prevent newline injection.

