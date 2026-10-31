<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.266

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.266** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' takes the directory of the untrusted input inputs.path_to_bun_executable (via env PATH_TO_BUN_EXECUTABLE -> BUN_DIR=$(dirname ...)) and writes it to $GITHUB_PATH with no sanitization step (printf '%s' ... | tr -d '\n\r'). Offending line: echo "$BUN_DIR" >> "$GITHUB_PATH"

Locations:

- `action.yml:137`

### github-env-injection (severity: high)

Step 'Install Claude Code' takes the directory of the untrusted input inputs.path_to_claude_code_executable (via env PATH_TO_CLAUDE_CODE_EXECUTABLE -> CLAUDE_DIR=$(dirname ...)) and writes it to $GITHUB_PATH with no sanitization step (printf '%s' ... | tr -d '\n\r'). Offending line: echo "$CLAUDE_DIR" >> "$GITHUB_PATH". The same step also writes the inherited $HOME value with no sanitization: echo "$HOME/.local/bin" >> "$GITHUB_PATH" (line 170).

Locations:

- `action.yml:175`
- `action.yml:170`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script straight into a shell inside timeout: timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"

Locations:

- `action.yml:157`

### unsafe-shell (severity: high)

The 'Install Claude Code' step's fallback path pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"

Locations:

- `action.yml:159`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed in action.yml. (1) github-env-injection: the 'Setup Custom Bun Path' and 'Install Claude Code' steps write three directories to $GITHUB_PATH: dirname of path_to_bun_executable, dirname of path_to_claude_code_executable, and $HOME/.local/bin. Each now has newlines removed first with printf '%s' ... | tr -d '\n\r' and is written with printf '%s\n'. (2) unsafe-shell: both install paths (with and without timeout) now save https://claude.ai/install.sh to a mktemp file, check that it isn't empty, and then run it with 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. The pipe's '-s --' is gone, so the version arrives as $1. The 3-attempt retry loop is kept, and the temp file is deleted on both success and final failure. Behaviour change: with timeout available, the download and the install now each get their own 120s limit, where before one 120s limit covered both. One problem along the way: an edit_file call mangled the end of the step (it deleted the loop's closing lines and left duplicate text). I repaired it and re-read the final file to confirm it is correct.

