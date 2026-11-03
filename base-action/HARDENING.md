<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.267

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.267** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable, and no `printf '%s' ... | tr -d '\n\r'` step runs first. If the value contains a newline, extra PATH entries can be injected.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH. PATH_TO_CLAUDE_CODE_EXECUTABLE comes from inputs.path_to_claude_code_executable, and the newline-stripping step `printf '%s' ... | tr -d '\n\r'` is missing.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes remote content straight into a shell inside `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file and checked before it runs.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' fallback branch runs `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`, which pipes remote content straight into bash.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Sub-rule (b): an environment variable is expanded without quotes in a composite run: block. Offending lines: `cd ${GITHUB_ACTION_PATH}` (step 'Install Dependencies') and `bun run ${GITHUB_ACTION_PATH}/src/index.ts` (step 'Run Claude Code Action'). Quote them as "${GITHUB_ACTION_PATH}". This is a low-risk, conservative finding: the runner sets GITHUB_ACTION_PATH, but the check treats any env var in a composite step as untrusted when in doubt.

Locations:

- `action.yml:141`
- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All three finding types are fixed in action.yml. I have not run the action.

- **github-env-injection:** In the 'Setup Custom Bun Path' and 'Install Claude Code' steps, the custom executable paths now go through `printf '%s' | tr -d '\n\r'` to strip newlines. The directory from `dirname` is stripped again before it is written to $GITHUB_PATH.
- **unsafe-shell:** The installer is now downloaded with `curl` into a `mktemp` file under $RUNNER_TEMP. If the file is empty, the attempt counts as failed. It then runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`, with the pipe's `-s --` removed so the installer gets the version as `$1`. The 3-attempt retry loop is unchanged.
- **Timeout change:** Upstream ran the download and the install together under one 120s timeout. Now each gets its own 120s limit, so one attempt can take up to about 240s.
- **script-injection:** `${GITHUB_ACTION_PATH}` is now quoted in `cd` (Install Dependencies) and in `bun run` (Run Claude Code Action).

### Iteration 2

**Fixes applied:** github-env-injection, script-injection

**Notes:**

github-env-injection: in the 'Install Claude Code' step, "$HOME/.local/bin" now goes through printf '%s' | tr -d '\n\r' and is written to $GITHUB_PATH from a variable. script-injection: the 'Run Claude Code Action' step now runs bun run "${GITHUB_ACTION_PATH}/src/index.ts" with quotes. I also repaired a broken line in the custom-executable branch: an earlier edit had merged the SAFE_CLAUDE_PATH assignment with the bun run text. It is back to SAFE_CLAUDE_PATH=$(printf '%s' "$PATH_TO_CLAUDE_CODE_EXECUTABLE" | tr -d '\n\r').

