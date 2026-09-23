<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.229

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.229** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (two occurrences — one inside a `timeout ... bash -c "..."` wrapper and one in the else branch). This allows a compromised or MITM'd remote server to execute arbitrary code on the runner.

Locations:

- `action.yml:155`
- `action.yml:158`

### github-env-injection (severity: high)

Two steps write values derived from action inputs into $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to $GITHUB_PATH — a newline in the input can inject arbitrary paths. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to $GITHUB_PATH with the same risk.

Locations:

- `action.yml:140`
- `action.yml:170`

### script-injection (severity: high)

Two `run:` blocks in examples/issue-triage.yml interpolate GitHub Actions expressions directly inside shell scripts. (a) The 'Setup GitHub MCP Server' step embeds `${{ secrets.GITHUB_TOKEN }}` inside a heredoc — GitHub Actions interpolates `${{ }}` expressions before the shell runs, even inside single-quoted heredoc delimiters, so the token value is injected verbatim into the JSON written to disk. (b) The 'Create triage prompt' step embeds `${{ github.event.issue.number }}` inside a heredoc — an attacker who controls the issue number field (e.g. via a crafted API call) could inject shell metacharacters into the script.

Locations:

- `examples/issue-triage.yml:28`
- `examples/issue-triage.yml:47`

### unpinned-uses (severity: high)

The 'Run Claude Code for Issue Triage' step in examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which is a mutable branch/tag reference rather than a pinned 40-character commit SHA. A compromised or updated tag could silently change the code executed by this action.

Locations:

- `examples/issue-triage.yml:96`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $VERSION` occurrences (in the timeout wrapper and else branch) with download-to-tempfile-then-execute pattern. Script is downloaded via `curl -fsSL ... -o "$INSTALL_SCRIPT"` then run as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped as it was the shell's option terminator. Temp file is cleaned up after use.

2. github-env-injection (action.yml): Both GITHUB_PATH writes now sanitize the directory path with `safe_X=$(printf '%s' "$X" | tr -d '\n\r')` before writing to $GITHUB_PATH — applied to both BUN_DIR (Setup Custom Bun Path step) and CLAUDE_DIR (Install Claude Code step).

3. script-injection (examples/issue-triage.yml): (a) 'Setup GitHub MCP Server': moved `${{ secrets.GITHUB_TOKEN }}` to env block as GITHUB_TOKEN_VALUE, changed heredoc to unquoted EOF, used $GITHUB_TOKEN_VALUE shell variable. (b) 'Create triage prompt': moved `${{ github.event.issue.number }}` and `${{ github.repository }}` to a merged env block, changed heredoc to unquoted EOF, used $ISSUE_NUMBER and $GITHUB_REPOSITORY shell variables.

4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

