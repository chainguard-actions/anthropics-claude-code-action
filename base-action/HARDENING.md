<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.270

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.270** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from the untrusted input inputs.path_to_bun_executable. It then writes the value with echo "$BUN_DIR" >> "$GITHUB_PATH" without stripping newlines (printf '%s' ... | tr -d '\n\r'). A value containing a newline can add arbitrary entries to PATH.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") from the untrusted input inputs.path_to_claude_code_executable. It then writes the value with echo "$CLAUDE_DIR" >> "$GITHUB_PATH" without stripping newlines (printf '%s' ... | tr -d '\n\r').

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". The script should be downloaded to a file, checked, and then run separately.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' fallback branch pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

All changes are in action.yml. Nothing was run or tested.

- **github-env-injection:** The custom bun and claude executable paths now have newlines removed (printf '%s' ... | tr -d '\n\r') before dirname runs, and carriage returns are stripped again before each directory is added to GITHUB_PATH.
- **unsafe-shell:** In both the timeout branch and the fallback branch, install.sh is now downloaded to a temp file from mktemp. The only check is that the file isn't empty; then it runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `-s --` from the pipe form was dropped, so the version is still the script's $1. In the timeout branch, the download and the run both stay inside the 120-second timeout, with the file path and version passed as positional arguments to `bash -c`.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

In action.yml, the 'Install Claude Code' step used to write $HOME/.local/bin straight to GITHUB_PATH. It now removes newline and carriage-return characters first (printf '%s' ... | tr -d '\n\r'), then writes the result with printf '%s\n'. This matches how the custom-path branches already handle it. Nothing else changed. No tests or re-scan were run after the edit.

