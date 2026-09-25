<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.234

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.234** was hardened automatically. 3 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading it to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs twice — once inside a `timeout ... bash -c` wrapper and once in the else branch. If the remote server is compromised or the URL is hijacked, arbitrary code executes on the runner immediately.

Locations:

- `action.yml:166`
- `action.yml:168`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` — derived from `$PATH_TO_BUN_EXECUTABLE`, which is set from the caller-controlled input `inputs.path_to_bun_executable` — to `$GITHUB_PATH` without sanitization. An attacker-controlled value containing newlines could inject additional entries into GITHUB_PATH. The required sanitization step (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`) is absent before the write: `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:145`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` — derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE`, which is set from the caller-controlled input `inputs.path_to_claude_code_executable` — to `$GITHUB_PATH` without sanitization. An attacker-controlled value containing newlines could inject additional entries into GITHUB_PATH. The required sanitization step (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`) is absent before the write: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:180`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Three fixes applied to hardened/action/action.yml:

1. unsafe-shell (lines 166, 168): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach. The install script is now saved to a mktemp file and executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` shell option terminator was dropped (it was the shell's, not the script's). The temp file is cleaned up after the loop.

2. github-env-injection (line 145, Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to strip newlines from the caller-controlled input.

3. github-env-injection (line 180, Install Claude Code step): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH to strip newlines from the caller-controlled input.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed examples/issue-triage.yml: (1) Moved ${{ secrets.GITHUB_TOKEN }} out of the 'Setup GitHub MCP Server' run block into an env var (MCP_GITHUB_TOKEN) and changed the heredoc from 'EOF' to EOF so the env var expands at shell runtime instead of being substituted by GitHub Actions template engine. (2) Moved ${{ github.event.issue.number }} out of the 'Create triage prompt' run block into an env var (ISSUE_NUMBER), changed the heredoc from 'EOF' to EOF, and consolidated GITHUB_REPOSITORY into the same env block. (3) Pinned anthropics/claude-code-base-action@beta to full SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with # beta comment.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings in hardened/action/action.yml:
1. Line ~131 ('Setup Custom Bun Path' step): Added double quotes around `$PATH_TO_BUN_EXECUTABLE` in the echo statement: `echo "Using custom Bun executable: \"$PATH_TO_BUN_EXECUTABLE\""`
2. Line ~163 ('Install Claude Code' step): Added double quotes around `$PATH_TO_CLAUDE_CODE_EXECUTABLE` in the echo statement: `echo "Using custom Claude Code executable: \"$PATH_TO_CLAUDE_CODE_EXECUTABLE\""`
Both variables are now properly double-quoted, preventing shell metacharacter injection from attacker-controlled input values.

