<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.221

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.221** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes the output of a remote script directly to bash in two places: (1) inside a timeout wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Piping remote content directly to a shell interpreter means any compromise of the remote URL (claude.ai/install.sh) would result in arbitrary code execution on the runner without any integrity verification.

Locations:

- `action.yml:144`
- `action.yml:146`

### github-env-injection (severity: high)

Two steps write values derived from untrusted action inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

(1) 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` in the env: block, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A caller-controlled newline in the input could inject arbitrary entries into PATH.

(2) 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable` in the env: block, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk applies.

Locations:

- `action.yml:123`
- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 144, 146): Replaced both `curl ... | bash -s -- $VERSION` patterns with a download-then-execute approach. The script is now downloaded to a temp file via `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` and then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` separator was dropped since it was the shell's option terminator for stdin mode (`-s`), not an argument to the install script. The temp file is cleaned up after use.

2. github-env-injection (lines 123, 158): Added sanitization before writing to $GITHUB_PATH in both affected steps. In 'Setup Custom Bun Path': `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` is used before the echo. In 'Install Claude Code' else branch: `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` is used before the echo. This prevents newline injection attacks that could add arbitrary entries to PATH.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed examples/issue-triage.yml: (1) Moved ${{ secrets.GITHUB_TOKEN }} out of the 'Setup GitHub MCP Server' heredoc into an env: variable (GITHUB_TOKEN_VALUE) and changed the heredoc delimiter from single-quoted 'EOF' to unquoted EOF so the shell variable expands. (2) Moved ${{ github.event.issue.number }} out of the 'Create triage prompt' heredoc into an env: variable (ISSUE_NUMBER), changed that heredoc to unquoted EOF, and removed the duplicate env: block that was at the bottom of the step. (3) Pinned anthropics/claude-code-base-action@beta to the full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta.

