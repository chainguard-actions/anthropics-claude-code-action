<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.256

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.256** was hardened automatically. 6 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with echo "$BUN_DIR" >> "$GITHUB_PATH". It never runs printf '%s' ... | tr -d '\n\r' first, so newlines in the input can inject extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") from inputs.path_to_claude_code_executable and writes it with echo "$CLAUDE_DIR" >> "$GITHUB_PATH" without sanitizing it first (printf '%s' | tr -d '\n\r'). The same step also writes the inherited $HOME env var to GITHUB_PATH unsanitized (echo "$HOME/.local/bin" >> "$GITHUB_PATH", line 169).

Locations:

- `action.yml:174`
- `action.yml:169`

### unsafe-shell (severity: high)

Step 'Install Claude Code' downloads a remote script and pipes it straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION".

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' fallback branch downloads a remote script and pipes it straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

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

All six findings are fixed in action.yml. Nothing has been run or re-checked yet.

- **PATH writes:** Before writing to $GITHUB_PATH, newlines are now stripped from BUN_DIR, CLAUDE_DIR and $HOME/.local/bin using printf '%s' | tr -d '\n\r'.
- **Claude Code install (both branches):** The script is now downloaded with curl -o into a temp file from mktemp. It must be non-empty, then runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `-s --` from the piped form is gone, so the version is still the script's first argument.
- **Install timeout:** In the timeout branch, the download and the run now each get their own 120-second limit. Upstream had one limit around both, so the worst case is now about twice as long.
- **Retry and cleanup:** The 3-attempt retry is unchanged. The temp file is deleted after a successful install.
- **Quoting:** `cd` now uses "${GITHUB_ACTION_PATH}" and `bun run` uses "${GITHUB_ACTION_PATH}/src/index.ts", both double-quoted.

### Iteration 2

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed the 'Install Claude Code' step in action.yml. Split the broken line into two: CLAUDE_CODE_VERSION="2.1.306" and INSTALL_SCRIPT="$(mktemp)". Removed the leftover 'finstall.sh | bash -s -- ...' line, so the step now only downloads the script to a file and then runs it with bash, using the same arguments as before and no '--'. The else branch now strips newlines from CLAUDE_DIR with printf '%s' | tr -d '\n\r' before writing it to $GITHUB_PATH. The 'Run Claude Code Action' script was also broken, which the findings did not mention: the CLAUDE_WORKING_DIR echo line had run into other text and the cd line was gone. I restored the echo and cd "$CLAUDE_WORKING_DIR" and added quotes around the bun run path. Two of the edits reported success the first time but did not save, so I made them again and checked the file afterwards. Nothing was run or tested.

