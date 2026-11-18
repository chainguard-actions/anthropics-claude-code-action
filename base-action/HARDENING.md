<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.282

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.282** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR to $GITHUB_PATH without stripping newlines first. BUN_DIR is computed as $(dirname "$PATH_TO_BUN_EXECUTABLE"), and PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable. The line is: echo "$BUN_DIR" >> "$GITHUB_PATH". If the input contains a newline, extra PATH entries can be injected. $GITHUB_PATH has no heredoc form, so the value must go through printf '%s' ... | tr -d '\n\r' before the write.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR to $GITHUB_PATH without stripping newlines first. CLAUDE_DIR is computed as $(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), and PATH_TO_CLAUDE_CODE_EXECUTABLE comes from inputs.path_to_claude_code_executable. The line is: echo "$CLAUDE_DIR" >> "$GITHUB_PATH". If the input contains a newline, extra PATH entries can be injected.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". The script should be downloaded to a file, checked, and then run as a separate command.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (the fallback path) pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION". The script should be downloaded to a file, checked, and then run as a separate command.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Rule (b), unquoted env var expansion in a composite run block. Step 'Install Dependencies' runs: cd ${GITHUB_ACTION_PATH}. The expansion should be double-quoted: cd "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b), unquoted env var expansion in a composite run block. Step 'Run Claude Code Action' runs: bun run ${GITHUB_ACTION_PATH}/src/index.ts. The expansion should be double-quoted: bun run "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:190`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

I fixed all six findings in action.yml.

1. Writes to $GITHUB_PATH: the Bun and Claude Code directory values now have newlines and carriage returns stripped (printf '%s' | tr -d '\n\r') before they are written.
2. Claude Code installer: install.sh is now downloaded to a temp file made with mktemp under RUNNER_TEMP. The step checks the file is not empty, then runs `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. I dropped the '-s --' from the old piped form so the script still gets the version as $1. The retry loop, both timeout paths and their timeout settings work as before. The download now has its own timeout, separate from the install's.
3. Unquoted paths: GITHUB_ACTION_PATH is now double-quoted in `cd` and in `bun run`.

Nothing has been run yet.

