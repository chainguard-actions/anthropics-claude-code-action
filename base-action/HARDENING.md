<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.274

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.274** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR from inputs.path_to_bun_executable (passed in as the env var PATH_TO_BUN_EXECUTABLE) and writes it to $GITHUB_PATH without the newline-stripping step (printf '%s' ... | tr -d '\n\r'): `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A value containing a newline can add extra, attacker-chosen PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR from inputs.path_to_claude_code_executable (passed in as the env var PATH_TO_CLAUDE_CODE_EXECUTABLE) and writes it to $GITHUB_PATH without the newline-stripping step: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The same step also writes the inherited $HOME (`echo "$HOME/.local/bin" >> "$GITHUB_PATH"`) without stripping newlines.

Locations:

- `action.yml:174`
- `action.yml:169`

### unsafe-shell (severity: high)

Remote script piped straight into a shell inside a timeout wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. Download the script to a file, verify it, then run it.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Remote script piped straight into a shell (fallback branch): `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Download the script to a file, verify it, then run it.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Rule (b): in step 'Install Dependencies', the inherited env var is expanded without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:141`

### script-injection (severity: high)

Rule (b): in step 'Run Claude Code Action', the inherited env var is expanded without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be `bun run "${GITHUB_ACTION_PATH}/src/index.ts"`.

Locations:

- `action.yml:186`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

All changes are in action.yml. Nothing has been run or tested yet.

- **github-env-injection:** The three paths written to $GITHUB_PATH (BUN_DIR, CLAUDE_DIR and $HOME/.local/bin) now have newlines removed first with `printf '%s' ... | tr -d '\n\r'`, then are written with `printf '%s\n'`.
- **unsafe-shell:** Both `curl | bash` forms are gone. Each attempt now downloads https://claude.ai/install.sh to a mktemp file under $RUNNER_TEMP. The "verify" step is only a basic check: the download must succeed, the file must not be empty, and its first line must start with `#!`. There is no checksum or signature check. If it passes, the script runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`, under the same `timeout --foreground --kill-after=10 120` wrapper when `timeout` exists. I dropped both `-s` and `--`, so the installer gets the version as $1. The 3-attempt retry loop works as before, and the temp file is deleted after each attempt.
- **script-injection:** Quoted `cd "${GITHUB_ACTION_PATH}"` and `bun run "${GITHUB_ACTION_PATH}/src/index.ts"`.

One behaviour change: the download now has a 60-second limit (`curl --max-time 60`). Before, the download sat inside the 120-second `timeout` wrapper, which doesn't exist on runners without `timeout`.

