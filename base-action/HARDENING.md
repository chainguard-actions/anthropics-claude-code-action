<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.217

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.217** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash without first downloading and verifying it. Two occurrences: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or subject to a MITM attack, arbitrary code would execute on the runner. The script should be downloaded to a file, verified (e.g., checksum), and then executed separately.

Locations:

- `action.yml:163`
- `action.yml:165`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) 'Setup Custom Bun Path': `inputs.path_to_bun_executable` is mapped to env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. (2) 'Install Claude Code': `inputs.path_to_claude_code_executable` is mapped to env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled newline in either input could inject arbitrary entries into PATH, enabling path-hijacking attacks.

Locations:

- `action.yml:143`
- `action.yml:178`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 163, 165): The 'Install Claude Code' step previously piped a remote script directly to bash (`curl ... | bash -s -- $VERSION`). Fixed both the `timeout` path and the fallback path by: (a) creating a temp file with `mktemp`, (b) downloading the script to the temp file with `curl ... -o "$INSTALL_SCRIPT"`, (c) executing it separately as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator, not the script's), and (d) cleaning up the temp file afterward.

2. github-env-injection (lines 143, 178): Two steps wrote user-controlled directory paths to $GITHUB_PATH without sanitization. Fixed by adding `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH in both the 'Setup Custom Bun Path' step (BUN_DIR) and the 'Install Claude Code' step (CLAUDE_DIR).

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed examples/issue-triage.yml:
1. script-injection (line 38): Moved `${{ secrets.GITHUB_TOKEN }}` into an `env:` block as `GITHUB_TOKEN_VALUE` on the 'Setup GitHub MCP Server' step. Changed the heredoc from quoted `'EOF'` to unquoted `EOF` so the shell expands `$GITHUB_TOKEN_VALUE` at runtime.
2. script-injection (line 55): Moved `${{ github.event.issue.number }}` into the `env:` block as `ISSUE_NUMBER` on the 'Create triage prompt' step. The prompt is written with a quoted `'EOF'` heredoc (preventing premature expansion), then `sed` substitutes `${ISSUE_NUMBER}` and `${GITHUB_REPOSITORY}` into the file using the env vars.
3. unpinned-uses (line 96): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

