<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.262

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.262** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR to $GITHUB_PATH without sanitizing it first. BUN_DIR comes from inputs.path_to_bun_executable (via env PATH_TO_BUN_EXECUTABLE) using `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` step comes before the write.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR to $GITHUB_PATH without sanitizing it first. CLAUDE_DIR comes from inputs.path_to_claude_code_executable via `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The same step also writes the inherited `$HOME/.local/bin` to $GITHUB_PATH unsanitized (line 169).

Locations:

- `action.yml:174`
- `action.yml:169`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file first and run as a separate step.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. The script should be downloaded to a file first and run as a separate step.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Sub-rule (b), unquoted variable expansion in a composite run block. Step 'Install Dependencies' has `cd ${GITHUB_ACTION_PATH}`, and step 'Run Claude Code Action' has `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. Both expansions should be double-quoted: "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`
- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

Fixed all three findings in action.yml. Nothing was run or tested after the edits.

- github-env-injection: the three paths written to $GITHUB_PATH (BUN_DIR, CLAUDE_DIR and $HOME/.local/bin) now have line breaks removed with printf '%s' | tr -d '\n\r' before being written with printf.
- unsafe-shell: the Claude installer is now saved to a file under $RUNNER_TEMP and then run as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Both '-s' and '--' are dropped, so the version still arrives as $1. The script only runs if the file is not empty. On the timeout branch, the download and the install each get their own 120s timeout using the same flags as before, so the worst case is now about 240s per attempt instead of 120s. The three-attempt retry loop is unchanged.
- script-injection: ${GITHUB_ACTION_PATH} is now double-quoted in both the `cd` line and the `bun run` line.

### Iteration 2

**Fixes applied:** github-env-injection, script-injection

**Notes:**

action.yml: (1) 'Setup Custom Bun Path' now strips newlines from BUN_DIR (SAFE_BUN_DIR via tr -d '\n\r') and writes it with printf before appending to $GITHUB_PATH. (2) 'Install Dependencies' now uses cd "${GITHUB_ACTION_PATH}" in quotes. (3) Fixed the broken YAML where the 'Install Claude Code' step had merged into the run_claude step. The '- name: Run Claude Code' / 'shell: bash' / 'id: run_claude' step header is back, and the step now runs bun run "${GITHUB_ACTION_PATH}/src/index.ts" in quotes. edit_file corrupted the file (the edits landed at the wrong offsets), so I rewrote the whole file from the original content and checked the result by reading it back.

