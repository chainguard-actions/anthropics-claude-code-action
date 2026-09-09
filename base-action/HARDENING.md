<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.219

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.219** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then used to compute `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, and the result is written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A caller-controlled path containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:129`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the input `inputs.path_to_claude_code_executable` is mapped to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then used to compute `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, and the result is written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A caller-controlled path containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:164`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash in two places: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Piping remote content directly to a shell interpreter without first downloading and verifying the script is a supply-chain risk — a compromised or MITM'd response would execute arbitrary code on the runner.

Locations:

- `action.yml:148`
- `action.yml:151`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three findings in hardened/action/action.yml:

1. **github-env-injection (Setup Custom Bun Path, line 129)**: Added sanitization `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

2. **github-env-injection (Install Claude Code, line 164)**: Added sanitization `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

3. **unsafe-shell (Install Claude Code, lines 148 & 151)**: Replaced both `curl ... | bash -s -- $VERSION` patterns with a download-then-execute approach using a mktemp file. The script is downloaded with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` and then executed with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). The temp file is cleaned up after installation.

