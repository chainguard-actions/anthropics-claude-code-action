<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.212

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.212** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the user-controlled input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then used to compute `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, and the result is written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without any newline-stripping sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled path containing embedded newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:137`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the user-controlled input `inputs.path_to_claude_code_executable` is mapped to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then used to compute `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, and the result is written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without any newline-stripping sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled path containing embedded newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:169`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern (and its variant inside `timeout ... bash -c "curl ... | bash ..."`) executes whatever the remote server returns without integrity checking, making it vulnerable to supply-chain attacks or MITM if the remote URL is compromised.

Locations:

- `action.yml:155`
- `action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three findings in hardened/action/action.yml:

1. github-env-injection (Setup Custom Bun Path, line ~137): Added newline stripping via `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

2. github-env-injection (Install Claude Code, line ~169): Added newline stripping via `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

3. unsafe-shell (Install Claude Code, lines ~155, ~157): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach using a mktemp file. The script is downloaded with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` and then executed with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator, not the script's argument). The temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed all three findings in hardened/action/examples/issue-triage.yml:
1. script-injection (line 38): Moved `${{ secrets.GITHUB_TOKEN }}` out of the heredoc into an `env:` block. The heredoc writes a placeholder, then a python3 snippet reads the env var and injects it into the JSON config file programmatically.
2. script-injection (line 55): Moved `${{ github.event.issue.number }}` and `${{ github.repository }}` into `env:` block variables. The heredoc uses static placeholders (REPO_PLACEHOLDER, ISSUE_NUMBER_PLACEHOLDER), which are replaced via `sed` after sanitizing with `tr -d '\n\r'`.
3. unpinned-uses (line 100): Pinned `anthropics/claude-code-base-action@beta` to the full commit SHA `@e8132bc5e637a42c27763fc757faa37e1ee43b34` with a `# beta` comment for readability.

