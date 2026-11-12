<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.272

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.272** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' takes the directory of inputs.path_to_bun_executable (BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")) and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`, without first running printf '%s' ... | tr -d '\n\r'. If the input contains newlines, extra PATH entries get injected.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' takes the directory of inputs.path_to_claude_code_executable (CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")) and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`, without stripping newlines first.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file (and ideally checksum-verified) before it is run.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' fallback branch pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Rule (b): an environment variable inherited by a composite run block is expanded without quotes: `cd ${GITHUB_ACTION_PATH}` in step 'Install Dependencies'. The runner sets this variable, but it should be double-quoted ("${GITHUB_ACTION_PATH}") so word splitting and glob expansion can't apply.

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b): an environment variable is expanded without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts` in step 'Run Claude Code Action'. It should be double-quoted: "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All six findings were fixed in action.yml. Nothing has been run to test the changes yet.

- **github-env-injection (2 findings):** Before the Bun and Claude Code directories are written to $GITHUB_PATH, newlines are now stripped from them with printf '%s' | tr -d '\n\r'.
- **unsafe-shell (2 findings):** The Claude Code installer is no longer piped into bash. Each attempt downloads it into a temp file made with mktemp, then runs `bash "$file" "$CLAUDE_CODE_VERSION"`. The '-s --' from the pipe form was dropped so the installer gets the version as its first argument. In the branch that uses timeout, both the download and the install stay inside the 120-second timeout as before: `bash -c '...' _ "$file" "$ver"`. The retry loop works as it did before. The installer is still not checked against a checksum, because the action has no known hash to compare it to.
- **script-injection (2 findings):** `cd "${GITHUB_ACTION_PATH}"` and `bun run "${GITHUB_ACTION_PATH}/src/index.ts"` are now double-quoted.

