<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.244

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.244** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash without first downloading and verifying it. Two occurrences: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. An attacker who can intercept or compromise the remote URL could execute arbitrary code on the runner.

Locations:

- `action.yml:156`
- `action.yml:158`

### github-env-injection (severity: high)

Two steps write values derived from action inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). (1) In 'Setup Custom Bun Path' (line 136): `echo "$BUN_DIR" >> "$GITHUB_PATH"` where $BUN_DIR is computed from $PATH_TO_BUN_EXECUTABLE, which is set from `inputs.path_to_bun_executable`. A newline in the input value could inject an arbitrary path entry. (2) In 'Install Claude Code' (line 174): `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` where $CLAUDE_DIR is computed from $PATH_TO_CLAUDE_CODE_EXECUTABLE, which is set from `inputs.path_to_claude_code_executable`. Both writes are missing the sanitization step before the write.

Locations:

- `action.yml:136`
- `action.yml:174`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two findings in hardened/action/action.yml:

1. unsafe-shell (lines 156, 158): Replaced both `curl ... | bash -s -- $VERSION` patterns with a download-then-execute approach. The script is downloaded to a mktemp file, then executed with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The '--' was dropped (it was the shell's own option terminator, not the script's argument). The temp file is cleaned up after the loop.

2. github-env-injection (lines 136, 174): Added sanitization before writing to $GITHUB_PATH in both locations:
   - Setup Custom Bun Path: `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` then `echo "$safe_bun_dir" >> "$GITHUB_PATH"`
   - Install Claude Code: `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` then `echo "$safe_claude_dir" >> "$GITHUB_PATH"`

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed three issues in examples/issue-triage.yml: (1) Moved ${{ secrets.GITHUB_TOKEN }} out of the heredoc in the 'Setup GitHub MCP Server' step into an env var (GITHUB_TOKEN_VALUE), changed heredoc delimiter from 'EOF' to EOF to allow shell variable expansion. (2) Moved ${{ github.event.issue.number }} out of the heredoc in the 'Create triage prompt' step into an env var (ISSUE_NUMBER), changed heredoc delimiter from 'EOF' to EOF to allow shell variable expansion, and removed the duplicate env block that was at the bottom of the step. (3) Pinned anthropics/claude-code-base-action@beta to the full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with a '# beta' comment.

