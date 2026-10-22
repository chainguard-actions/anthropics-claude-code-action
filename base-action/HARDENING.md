<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.258

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.258** was hardened automatically. 6 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step takes the directory of inputs.path_to_bun_executable (BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")) and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No printf '%s' | tr -d '\n\r' step removes newlines first, so a value containing a newline can add extra entries to PATH.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step takes the directory of inputs.path_to_claude_code_executable (CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")) and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No printf '%s' | tr -d '\n\r' step removes newlines first. The same step also writes the inherited $HOME into $GITHUB_PATH (line 169) without that step.

Locations:

- `action.yml:174`
- `action.yml:169`

### unsafe-shell (severity: high)

Remote script piped straight into a shell inside a timeout wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The installer should be saved to a file, checked, and then run as a separate command.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Remote script piped straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. The installer should be saved to a file, checked, and then run as a separate command.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Sub-rule (b), unquoted variable expansion. The inherited env var GITHUB_ACTION_PATH is expanded without quotes in the 'Install Dependencies' step (`cd ${GITHUB_ACTION_PATH}`). The check says to treat env vars in composite run blocks as untrusted when in doubt, so this should be `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:141`

### script-injection (severity: high)

Sub-rule (b), unquoted variable expansion. The 'Run Claude Code Action' step expands the inherited GITHUB_ACTION_PATH without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. This should be `bun run "${GITHUB_ACTION_PATH}/src/index.ts"`.

Locations:

- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All changes are in action.yml. Nothing has been run or re-scanned yet.

- **github-env-injection:** Before anything is written to $GITHUB_PATH, newlines are now removed with printf '%s' | tr -d '\n\r'. This covers the custom Bun directory, the custom Claude Code directory and $HOME/.local/bin.
- **unsafe-shell:** The Claude Code installer is no longer piped into bash. It is downloaded with curl into a mktemp file (with --max-time 120), then checked: the file must be non-empty and start with '#!'. It is then run as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`, with the original timeout --foreground --kill-after=10 120 wrapper when timeout is available. The old '-s --' was dropped so the version arrives as $1. The 3-attempt retry loop is unchanged and the temp file is deleted after every attempt.
- **script-injection:** GITHUB_ACTION_PATH is now quoted in both places: `cd "${GITHUB_ACTION_PATH}"` and `bun run "${GITHUB_ACTION_PATH}/src/index.ts"`.

### Iteration 2

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Rebuilt the 'Install Claude Code' step in action.yml. Earlier edits had overlapped and corrupted it. Changes: put back the 'Installing...' echo and the missing 'for attempt in 1 2 3; do' loop header; removed the leftover 'aude.ai/install.sh | bash -s -- ...' pipe and a stray 'fi', so the installer is now only downloaded to a temp file, checked, and run as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"' (no '-s --'); fixed the broken '# Add ~/.local/bin to PATH' comment line; removed the leftover 'fiDE_CODE_EXECUTABLE")' line, the unsanitized 'echo "$CLAUDE_DIR" >> "$GITHUB_PATH"', and the duplicate 'fi'. Every write to $GITHUB_PATH now strips newlines first with printf|tr.

