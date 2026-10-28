<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.261

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.261** was hardened automatically. 6 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path': BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") comes from inputs.path_to_bun_executable. It is written with echo "$BUN_DIR" >> "$GITHUB_PATH" and is not first cleaned with printf '%s' ... | tr -d '\n\r'. A value containing newlines could add extra entries to PATH.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code': CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") comes from inputs.path_to_claude_code_executable. It is written with echo "$CLAUDE_DIR" >> "$GITHUB_PATH" and is not first cleaned with printf '%s' ... | tr -d '\n\r'. The inherited $HOME is also written to $GITHUB_PATH (echo "$HOME/.local/bin") without cleaning.

Locations:

- `action.yml:174`
- `action.yml:169`

### script-injection (severity: high)

Sub-rule (b), step 'Install Dependencies': an inherited env var is expanded without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be quoted as "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`

### script-injection (severity: high)

Sub-rule (b), step 'Run Claude Code Action': an inherited env var is expanded without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be quoted as "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:186`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file, checked, and then run.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. The script should be downloaded to a file, checked, and then run.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

The installer at claude.ai/install.sh is now saved to a temp file made with mktemp. Before running it, the step checks that the file is not empty and starts with a '#!' line, then runs `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The '-s --' from the old pipe was dropped, so the version is still the script's first argument. The 3-attempt retry and the timeout on the install are unchanged. One addition: the download now has its own 60-second timeout. Every path written to GITHUB_PATH is cleaned first with printf '%s' | tr -d '\n\r': BUN_DIR, CLAUDE_DIR and $HOME/.local/bin. GITHUB_ACTION_PATH is now in quotes in `cd` and in `bun run`.

### Iteration 2

**Fixes applied:** github-env-injection, script-injection

**Notes:**

All three findings are fixed in action.yml. Nothing has been run or tested yet.

- 'Setup Custom Bun Path' and the custom-path branch of 'Install Claude Code' now remove newlines and carriage returns from the dirname result (printf '%s' ... | tr -d '\n\r') before writing it to $GITHUB_PATH. An input containing a newline can no longer add extra entries to PATH.
- The dirname call still runs as its own assignment, and the cleanup happens in a separate step. So if dirname fails, the step still stops as it did before.
- In 'Install Dependencies', the variable in `cd ${GITHUB_ACTION_PATH}` is now quoted.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

In the 'Setup Custom Bun Path' step, newlines and carriage returns are now stripped from BUN_DIR (printf '%s' | tr -d '\n\r') before it is written to $GITHUB_PATH. dirname still runs on its own line, so errexit still applies to it.

### Iteration 4

**Fixes applied:** github-env-injection

**Notes:**

In action.yml, the 'Install Claude Code' step no longer writes $HOME/.local/bin to GITHUB_PATH as-is. It now strips \n and \r with printf | tr into SAFE_LOCAL_BIN first, then writes that with printf '%s\n'. The other two GITHUB_PATH writes (bun dir and custom claude dir) were already sanitized.

