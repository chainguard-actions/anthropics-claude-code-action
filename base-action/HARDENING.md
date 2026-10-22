<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.257

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.257** was hardened automatically. 6 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_bun_executable, and the write is `echo "$BUN_DIR" >> "$GITHUB_PATH"` with no `printf '%s' ... | tr -d '\n\r'` step first. A newline in the input would add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_claude_code_executable, and the write is `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` with no newline sanitization. The same step also writes the inherited `$HOME/.local/bin` to $GITHUB_PATH without sanitization (line 169).

Locations:

- `action.yml:174`
- `action.yml:169`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Sub-rule (b): step 'Install Dependencies' expands an inherited env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:141`

### script-injection (severity: high)

Sub-rule (b): step 'Run Claude Code Action' expands an inherited env var without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be `bun run "${GITHUB_ACTION_PATH}/src/index.ts"`.

Locations:

- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

Every value written to $GITHUB_PATH (BUN_DIR, $HOME/.local/bin, CLAUDE_DIR) now has newlines and carriage returns stripped with printf '%s' | tr -d '\n\r' before it is written. The two curl | bash installs now save install.sh to a mktemp file first and then run it as bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION", dropping the -s and --. The 120s timeout and the 3-attempt retry are still there, and the temp file is deleted after a successful install. Every use of ${GITHUB_ACTION_PATH} is now in double quotes (cd and bun run).

### Iteration 2

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Install Claude Code step: the installer is now downloaded to a mktemp file (curl -fsSL --max-time 120 -o). Before it runs, the step checks that the file is non-empty and starts with a shebang. It then runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`, under timeout --foreground --kill-after=10 120 when timeout is available. The pipe-form '-s --' was dropped, so the version stays $1. The 3-attempt retry loop is kept, and the temp file is removed after a successful install. Custom executable branch: CLAUDE_DIR is stripped of newlines with tr -d '\n\r' before it is written to $GITHUB_PATH.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

Install Claude Code step: CLAUDE_DIR is now sanitized with printf '%s' | tr -d '\n\r' into SAFE_CLAUDE_DIR, and written with printf '%s\n' to $GITHUB_PATH, matching the existing Setup Custom Bun Path step.

### Iteration 4

**Fixes applied:** github-env-injection

**Notes:**

In the 'Install Claude Code' step, the path "$HOME/.local/bin" now has newline and carriage-return characters stripped before it is added to $GITHUB_PATH (`printf '%s' ... | tr -d '\n\r'`, written with `printf '%s\n'`). The two other places in action.yml that write to $GITHUB_PATH already did this. No test was run.

