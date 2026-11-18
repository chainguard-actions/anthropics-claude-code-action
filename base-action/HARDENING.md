<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.280

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.280** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") (from inputs.path_to_bun_executable) to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` and does not first run printf '%s' | tr -d '\n\r' on it. If the input contains a newline, extra PATH entries get added.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") (from inputs.path_to_claude_code_executable) to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` and does not strip newlines first. The same step also writes the inherited "$HOME/.local/bin" to $GITHUB_PATH without the printf '%s' | tr -d '\n\r' step (line 169).

Locations:

- `action.yml:174`
- `action.yml:169`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an inherited env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an inherited env var without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be `bun run "${GITHUB_ACTION_PATH}/src/index.ts"`.

Locations:

- `action.yml:190`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

I fixed all six findings in action.yml. Nothing was run or tested after the edits.

- **github-env-injection:** Newlines and carriage returns are now stripped (printf '%s' | tr -d '\n\r') before anything is written to $GITHUB_PATH. That covers the custom Bun directory, the custom Claude directory and $HOME/.local/bin.
- **script-injection:** ${GITHUB_ACTION_PATH} is now double-quoted in the 'Install Dependencies' step (cd) and the 'Run Claude Code Action' step (bun run).
- **unsafe-shell:** The Claude installer is no longer piped into bash. Each attempt downloads it to a mktemp file, checks the file isn't empty, then runs it as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`, so the version arrives as $1 (the `-s --` from the pipe form is gone). The temp file is deleted after a successful install.

Two behaviour changes:
- **Timeout:** Upstream's single 120s timeout covered download and install together. Now the download and the install each get their own 120s (same --foreground --kill-after=10), so one attempt can take up to about 240s.
- **Installer check:** The only check on the downloaded installer is that it isn't empty. It isn't verified against a checksum or signature, so this fix stops piping it into bash but doesn't prove the script is authentic.

