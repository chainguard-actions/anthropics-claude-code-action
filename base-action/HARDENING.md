<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a directory derived from inputs.path_to_bun_executable to $GITHUB_PATH without the newline strip: BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"); echo "$BUN_DIR" >> "$GITHUB_PATH". Nothing like printf '%s' "$BUN_DIR" | tr -d '\n\r' runs first, so a value containing a newline can add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes a directory derived from inputs.path_to_claude_code_executable to $GITHUB_PATH without the newline strip: CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"); echo "$CLAUDE_DIR" >> "$GITHUB_PATH". Nothing like printf '%s' ... | tr -d '\n\r' runs first.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"

Locations:

- `action.yml:158`

### script-injection (severity: high)

Sub-rule (b): step 'Install Dependencies' expands an inherited environment variable without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be quoted as "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`

### script-injection (severity: high)

Sub-rule (b): step 'Run Claude Code Action' expands an inherited environment variable without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be quoted as "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All six findings are fixed in action.yml. Nothing has been run to test them.

- **github-env-injection (2):** Before the custom Bun and Claude Code directories are written to $GITHUB_PATH, newlines are now stripped with printf '%s' | tr -d '\n\r'.
- **unsafe-shell (2):** The installer is no longer piped from curl into bash. Each attempt now downloads https://claude.ai/install.sh to a mktemp file and checks it isn't empty, then runs it as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The version is passed as the script's first argument, and the pipe form's `-s --` was dropped. The 120s timeout (with --foreground and --kill-after=10) now wraps only the install run. The download has its own 60s limit (curl --max-time). The 3-attempt retry is unchanged.
- **script-injection (2):** `${GITHUB_ACTION_PATH}` is now quoted in the `cd` command and in the `bun run .../src/index.ts` path.

