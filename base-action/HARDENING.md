<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.259

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.259** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step reads the input path_to_bun_executable (passed in as env var PATH_TO_BUN_EXECUTABLE), runs dirname on it, and writes the result to $GITHUB_PATH with no sanitization: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` followed by `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A value containing newlines could add arbitrary directories to PATH. Fix: strip newlines first with `printf '%s' ... | tr -d '\n\r'`.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step does the same with the input path_to_claude_code_executable (env var PATH_TO_CLAUDE_CODE_EXECUTABLE): `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` followed by `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. There is no `printf '%s' ... | tr -d '\n\r'` before the write.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

The 'Install Claude Code' step downloads a remote script and pipes it straight into bash: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`. The script should be saved to a file, checked, and then run as a separate command.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

The fallback branch of the 'Install Claude Code' step also pipes remote content into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

All changes are in action.yml. I edited the file but have not run it.

**github-env-injection (2 findings):** the directory taken from `dirname` of `path_to_bun_executable` and `path_to_claude_code_executable` now has newlines and carriage returns removed (`printf '%s' | tr -d '\n\r'`) before it is appended to `$GITHUB_PATH`.

**unsafe-shell (2 findings):** the Claude installer script is now downloaded to a temp file made with `mktemp` and only run if it downloaded and is not empty. It runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. I dropped the `-s --` from the old piped form so the script still gets the version as its first argument. The 3-attempt retry is unchanged and the temp file is deleted after each attempt.

**One behaviour change:** where `timeout` is available, the download now has its own 60s limit and the install keeps the 120s limit. Before, a single 120s limit covered both together.

