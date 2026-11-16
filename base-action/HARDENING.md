<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.277

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.277** was hardened automatically. 4 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value derived from inputs.path_to_bun_executable (via env PATH_TO_BUN_EXECUTABLE -> BUN_DIR=$(dirname ...)) to $GITHUB_PATH without the printf '%s' ... | tr -d '\n\r' sanitization step: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A value with embedded newlines can inject extra PATH entries.

Locations:

- `action.yml:135`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes a value derived from inputs.path_to_claude_code_executable (via env PATH_TO_CLAUDE_CODE_EXECUTABLE -> CLAUDE_DIR=$(dirname ...)) to $GITHUB_PATH without sanitization: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Newlines in the input can inject arbitrary PATH entries.

Locations:

- `action.yml:173`

### unsafe-shell (severity: high)

Remote script piped directly to a shell (with timeout): `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. Download to a file and verify before executing.

Locations:

- `action.yml:155`

### unsafe-shell (severity: high)

Remote script piped directly to a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Download to a file and verify before executing.

Locations:

- `action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Before writing the custom Bun and Claude Code executable directories to $GITHUB_PATH, newlines and carriage returns are now stripped with printf '%s' | tr -d '\n\r'. The Claude installer is no longer piped into a shell. Each attempt downloads claude.ai/install.sh into a mktemp file under RUNNER_TEMP, checks the file isn't empty, then runs it with 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. The '-s --' from the pipe form is dropped, so the script gets the version as $1. The 120s timeout on running the installer is kept, a new 60s timeout covers the download, and the 3-attempt retry loop still works. Nothing was run to test these changes. The 'verify' step is only a check that the download isn't empty, not a checksum or signature check.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

In the 'Install Claude Code' step of action.yml, the $HOME/.local/bin entry written to $GITHUB_PATH now has newlines and carriage returns stripped first (printf '%s' ... | tr -d '\n\r'), then is written with printf. This matches the two $GITHUB_PATH writes that were already sanitized. I didn't run the action or any tests after the change.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

In action.yml I put double quotes around the two unquoted ${GITHUB_ACTION_PATH} uses: `cd "${GITHUB_ACTION_PATH}"` in the Install Dependencies step, and `bun run "${GITHUB_ACTION_PATH}/src/index.ts"` in the Run Claude Code Action step. A path with spaces or glob characters in it now stays one argument. Nothing else changed. I didn't run anything to test it.

