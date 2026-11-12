<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.273

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.273** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable, and newlines are not stripped first. dirname keeps embedded newlines, so a multi-line input could add extra PATH entries. Fix: sanitize with printf '%s' "$BUN_DIR" | tr -d '\n\r' before the write.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH (echo "$CLAUDE_DIR" >> "$GITHUB_PATH"). The value comes from inputs.path_to_claude_code_executable and is not passed through printf '%s' ... | tr -d '\n\r' first, so a newline in it could inject extra PATH entries.

Locations:

- `action.yml:174`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an inherited env var without quotes: `cd ${GITHUB_ACTION_PATH}`. A composite action inherits env from the calling workflow, so this expansion must be double-quoted: cd "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an inherited env var without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be quoted: bun run "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:186`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes remote content straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file first, checked, then run.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' fallback branch pipes remote content straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

Changes in action.yml: (1) The BUN_DIR and CLAUDE_DIR values have newlines and carriage returns removed with printf '%s' | tr -d '\n\r' before they are written to $GITHUB_PATH. (2) ${GITHUB_ACTION_PATH} is now double-quoted in the 'cd' and 'bun run' lines. (3) The Claude installer is saved to a mktemp file, checked to be non-empty, then run as bash "$file" "$CLAUDE_CODE_VERSION". Both the '-s' and '--' from the old pipe form were dropped, so the script still gets the version as $1. The timeout path still wraps the download and the run in one timeout, passing the file path and version as positional arguments to bash -c, so nothing is interpolated into the command string.

