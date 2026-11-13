<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.275

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.275** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR from inputs.path_to_bun_executable using dirname "$PATH_TO_BUN_EXECUTABLE", then writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Newlines are not stripped first (no printf '%s' ... | tr -d '\n\r'). An input containing newlines can add any directories to PATH.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR from inputs.path_to_claude_code_executable using dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE", then writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Newlines are not stripped first (no printf '%s' ... | tr -d '\n\r').

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file, checked, and then run as a separate command.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (fallback branch) pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be quoted as "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an env var without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be quoted as "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All changes are in action.yml. Nothing was run or tested after the edits.

- **github-env-injection:** Before the custom Bun directory and the custom Claude Code directory are written to $GITHUB_PATH, newlines and carriage returns are now stripped with `printf '%s' ... | tr -d '\n\r'`.
- **unsafe-shell:** The installer is no longer piped into a shell. It is saved to a temp file made with mktemp, checked to be non-empty (`[ -s ]`), and then run as `bash "$file" "$CLAUDE_CODE_VERSION"`. The shell's `-s --` is gone, so the script gets the version as its first argument. In the branch that has `timeout`, the download and the run both happen inside that command, so the 120s limit and the retry loop work as before. The temp file is deleted when the step exits.
- **script-injection:** `${GITHUB_ACTION_PATH}` is now double-quoted in both `cd` and `bun run`.

