<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.223

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.223** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file. Two occurrences: (1) inside a `timeout` wrapper: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`, and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or redirected, arbitrary code executes on the runner immediately.

Locations:

- `action.yml:151`
- `action.yml:153`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`).

(1) 'Setup Custom Bun Path' step: `inputs.path_to_bun_executable` is placed into the `PATH_TO_BUN_EXECUTABLE` env var, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written unsanitized to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value can inject arbitrary entries into PATH.

(2) 'Install Claude Code' step: `inputs.path_to_claude_code_executable` is placed into `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written unsanitized to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk applies.

Locations:

- `action.yml:131`
- `action.yml:168`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 151, 153): Replaced both `curl ... | bash -s -- $VERSION` patterns with a download-then-execute approach. The script is downloaded to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator). The temp file is cleaned up after the loop.

2. github-env-injection (lines 131, 168): Added sanitization before writing to $GITHUB_PATH in both affected steps. In 'Setup Custom Bun Path': `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` then write `$safe_bun_dir`. In 'Install Claude Code' else branch: `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` then write `$safe_claude_dir`.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed examples/issue-triage.yml:
1. 'Setup GitHub MCP Server' step: Moved ${{ secrets.GITHUB_TOKEN }} into an env: block as GITHUB_TOKEN_VALUE, then referenced it via shell variable interpolation in the run: block (breaking out of the single-quoted heredoc with '"$GITHUB_TOKEN_VALUE"').
2. 'Create triage prompt' step: Moved ${{ github.event.issue.number }} into an env: block as ISSUE_NUMBER, changed the heredoc delimiter from quoted 'EOF' to unquoted EOF to allow shell variable expansion, and replaced the ${{ }} expression with ${ISSUE_NUMBER}.
3. Pinned anthropics/claude-code-base-action@beta to the full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with a # beta comment for readability.

