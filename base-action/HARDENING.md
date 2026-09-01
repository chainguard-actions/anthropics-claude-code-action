<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.211

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.211** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the user-controlled input `inputs.path_to_bun_executable` (via env var PATH_TO_BUN_EXECUTABLE → BUN_DIR computed with dirname) to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A caller can inject newlines into the path to smuggle arbitrary entries into GITHUB_PATH. The offending line is: `echo "$BUN_DIR" >> "$GITHUB_PATH"`

Locations:

- `action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the user-controlled input `inputs.path_to_claude_code_executable` (via env var PATH_TO_CLAUDE_CODE_EXECUTABLE → CLAUDE_DIR computed with dirname) to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A caller can inject newlines into the path to smuggle arbitrary entries into GITHUB_PATH. The offending line is: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`

Locations:

- `action.yml:183`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes the output of a remote URL directly to bash in two places: (1) inside a timeout wrapper: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This executes whatever content is served at that URL without first downloading and inspecting it, making the action vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `action.yml:170`
- `action.yml:172`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three security findings in hardened/action/action.yml:

1. github-env-injection (line 148, Setup Custom Bun Path): Added sanitization `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to prevent newline injection.

2. unsafe-shell (lines 170, 172, Install Claude Code): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns (including the one inside the timeout wrapper) with a safe download-then-execute approach: download to a temp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped `-s` (no longer reading from stdin) and `--` (no longer needed as shell option terminator) as required. Added cleanup of the temp file.

3. github-env-injection (line 183, Install Claude Code): Added sanitization `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to prevent newline injection.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed all three findings in examples/issue-triage.yml: (1) Moved `${{ secrets.GITHUB_TOKEN }}` from the 'Setup GitHub MCP Server' run block into an env: block as GITHUB_TOKEN_VALUE, referencing it as $GITHUB_TOKEN_VALUE in the shell script; changed heredoc delimiter from 'EOF' to EOF to allow env var expansion. (2) Moved `${{ github.event.issue.number }}` from the 'Create triage prompt' run block into an env: block as ISSUE_NUMBER, referencing it as ${ISSUE_NUMBER} in the shell script; removed the duplicate env: block that was at the bottom of the step. (3) Pinned `anthropics/claude-code-base-action@beta` to its full commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with a `# beta` comment.

