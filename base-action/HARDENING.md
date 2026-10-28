<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.263

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.263** was hardened automatically. 6 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' takes inputs.path_to_bun_executable (through env PATH_TO_BUN_EXECUTABLE), runs dirname on it, and writes the result to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is not passed through `printf '%s' ... | tr -d '\n\r'` first, so a value containing a newline could inject extra PATH entries.

Locations:

- `action.yml:137`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes values to $GITHUB_PATH without the `printf '%s' ... | tr -d '\n\r'` sanitization step: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`, where CLAUDE_DIR is dirname of inputs.path_to_claude_code_executable, and `echo "$HOME/.local/bin" >> "$GITHUB_PATH"`, where HOME is an inherited process env var.

Locations:

- `action.yml:175`
- `action.yml:170`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be downloaded to a file first, checked, and then run.

Locations:

- `action.yml:157`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (fallback branch) pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:159`

### script-injection (severity: high)

Sub-rule (b): step 'Install Dependencies' expands an env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be quoted as `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:142`

### script-injection (severity: high)

Sub-rule (b): step 'Run Claude Code Action' expands an env var without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be quoted as `bun run "${GITHUB_ACTION_PATH}/src/index.ts"`.

Locations:

- `action.yml:187`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection

**Notes:**

Changes to action.yml:
- Every value written to $GITHUB_PATH (custom Bun directory, custom Claude directory, $HOME/.local/bin) now has newlines removed with printf '%s' | tr -d '\n\r' before it is written.
- The Claude installer is no longer piped into a shell. It is downloaded to a temp file made by mktemp, checked to be non-empty, then run as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. The '-s --' is dropped so the version still arrives as $1.
- The timeout path now times the download and the install separately, each with the original 120s limit and the same --foreground/--kill-after flags. In the worst case the step can take about twice as long as before.
- The 3-try retry loop is unchanged, and the temp file is deleted after a successful install.
- ${GITHUB_ACTION_PATH} is now double-quoted in the 'cd' command and in the 'bun run' command.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

In action.yml's 'Install Claude Code' step, CLAUDE_DIR is now passed through printf '%s' | tr -d '\n\r' before it is written to $GITHUB_PATH with printf. This is the same pattern the 'Setup Custom Bun Path' step uses.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

In action.yml 'Install Claude Code', the $HOME/.local/bin value now goes through printf '%s' ... | tr -d '\n\r' before it is written to $GITHUB_PATH with printf '%s\n'. The other GITHUB_PATH writes were already sanitized.

