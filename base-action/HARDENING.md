<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.287

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.287** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR, which is dirname of PATH_TO_BUN_EXECUTABLE (from inputs.path_to_bun_executable), to $GITHUB_PATH without stripping newlines first (printf '%s' ... | tr -d '\n\r'): `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A value containing newlines can add arbitrary PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR, which is dirname of PATH_TO_CLAUDE_CODE_EXECUTABLE (from inputs.path_to_claude_code_executable), to $GITHUB_PATH without stripping newlines first: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Remote script is piped straight to a shell: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. Download it to a file, verify it, then run it as a separate step.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Remote script is piped straight to a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an inherited env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be double-quoted: `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an inherited env var without quotes: `exec bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be double-quoted: `"${GITHUB_ACTION_PATH}/src/index.ts"`.

Locations:

- `action.yml:189`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All six findings are fixed in action.yml. Nothing was run or tested here.

- github-env-injection: before BUN_DIR and CLAUDE_DIR are written to $GITHUB_PATH, newlines are stripped from them with printf '%s' | tr -d '\n\r'.
- unsafe-shell: the claude.ai install script is no longer piped into bash. It is downloaded to a temp file made with mktemp, checked to be non-empty, then run as bash "$file" "$CLAUDE_CODE_VERSION". The '-s --' was dropped so the script gets the version as $1. The only check is that the file is not empty: the script is not pinned to a checksum, since claude.ai can change it at any time.
- Upstream's behaviour is kept: the 120s timeout still covers both the download and the install, the 3-attempt retry loop is unchanged, and the temp file is deleted after each attempt.
- script-injection: ${GITHUB_ACTION_PATH} is now double-quoted in both 'cd' and 'exec bun run'.

