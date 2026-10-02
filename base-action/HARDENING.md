<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.240

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.240** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash`. This pattern executes whatever content the remote server returns, making the action vulnerable to supply-chain attacks if the remote URL is compromised or returns malicious content. The pattern appears twice — once inside a `timeout bash -c "curl ... | bash"` wrapper (line 156) and once in the else branch (line 158).

Locations:

- `action.yml:156`
- `action.yml:158`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the user-controlled input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` (line 136) without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing newlines could inject arbitrary entries into `$GITHUB_PATH`, potentially hijacking subsequent PATH lookups.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the user-controlled input `inputs.path_to_claude_code_executable` is mapped to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` (line 174) without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing newlines could inject arbitrary entries into `$GITHUB_PATH`.

Locations:

- `action.yml:174`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed three findings in hardened/action/action.yml:
1. unsafe-shell (lines 156, 158): Replaced both `curl | bash` patterns in 'Install Claude Code' with download-then-execute: script is saved to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` shell option terminator as required). Temp file is cleaned up after use.
2. github-env-injection (line 136): In 'Setup Custom Bun Path', sanitized BUN_DIR with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.
3. github-env-injection (line 174): In 'Install Claude Code', sanitized CLAUDE_DIR with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed three findings in hardened/action/examples/issue-triage.yml:

1. script-injection (line 27): Moved `${{ secrets.GITHUB_TOKEN }}` out of the heredoc into the step's `env:` block as `GITHUB_TOKEN_VALUE`. The JSON config now uses a PLACEHOLDER string that is replaced post-heredoc using a Python script that reads the token from the environment variable.

2. script-injection (line 47): Moved `${{ github.event.issue.number }}` out of the heredoc into the step's `env:` block as `ISSUE_NUMBER`. The prompt text now uses ISSUE_NUMBER_PLACEHOLDER and REPO_PLACEHOLDER strings that are replaced post-heredoc using `sed` with sanitized values (stripped of newlines via `printf | tr -d '\n\r'`).

3. unpinned-uses (line 75): Pinned `anthropics/claude-code-base-action@beta` to the full commit SHA `anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

