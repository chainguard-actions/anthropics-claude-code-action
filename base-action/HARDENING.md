<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.276

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.276** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. That value comes from inputs.path_to_bun_executable and is written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without first stripping newlines (printf '%s' ... | tr -d '\n\r'). A value containing newlines could add arbitrary PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH. That value comes from inputs.path_to_claude_code_executable and is written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without first stripping newlines. Line 169 also writes the inherited $HOME ("$HOME/.local/bin") to $GITHUB_PATH without sanitization.

Locations:

- `action.yml:174`
- `action.yml:169`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file first and then run separately.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Rule (b), unquoted env var expansion in step 'Install Dependencies': `cd ${GITHUB_ACTION_PATH}`. It should be quoted as "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b), unquoted env var expansion in step 'Run Claude Code Action': `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be quoted as "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All changes are in action.yml.

- **github-env-injection:** The three values written to $GITHUB_PATH (the Bun directory, the Claude Code directory and $HOME/.local/bin) now have newlines removed with `printf '%s' | tr -d '\n\r'` before they are written.
- **unsafe-shell:** The installer from claude.ai/install.sh is now saved to a temp file made with mktemp and then run as `bash "$file" "$CLAUDE_CODE_VERSION"`. I dropped the `-s --` because the version is now passed straight to the script as its first argument. The 120s timeout still covers both the download and the install (they run inside a `bash -c` with positional arguments), the 3-attempt retry loop is unchanged, and the temp file is deleted once the install succeeds.
- **script-injection:** `${GITHUB_ACTION_PATH}` is now double-quoted in both the `cd` step and the `bun run` step.

