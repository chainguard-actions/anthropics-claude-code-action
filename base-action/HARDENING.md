<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.214

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.214** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote install script directly to bash without first downloading it to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears twice — once inside a `timeout bash -c "..."` invocation and once as a direct pipeline). This allows arbitrary code execution from a remote URL without integrity verification.

Locations:

- `action.yml:155`
- `action.yml:157`

### github-env-injection (severity: high)

Two steps write user-controlled input values (derived from `inputs.path_to_bun_executable` and `inputs.path_to_claude_code_executable`) to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step before the write). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` (from `inputs.path_to_bun_executable`) is passed through `dirname` into `$BUN_DIR`, then written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` (from `inputs.path_to_claude_code_executable`) is passed through `dirname` into `$CLAUDE_DIR`, then written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline in the input could inject arbitrary entries into PATH.

Locations:

- `action.yml:138`
- `action.yml:168`

### script-injection (severity: high)

The file examples/issue-triage.yml contains ${{ }} expressions directly interpolated inside run: shell blocks. (a) 'Setup GitHub MCP Server' step: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"` is interpolated directly into a shell heredoc run: block — any ${{ }} in a run: block is a script-injection risk as the value is substituted before the shell sees it. (b) 'Create triage prompt' step: `- ISSUE_NUMBER: ${{ github.event.issue.number }}` is interpolated directly into a shell heredoc run: block — an attacker-controlled issue number could inject shell metacharacters.

Locations:

- `examples/issue-triage.yml:27`
- `examples/issue-triage.yml:44`

### unpinned-uses (severity: high)

The file examples/issue-triage.yml references `anthropics/claude-code-base-action@beta` — a mutable branch/tag ref rather than a pinned 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns (inside timeout bash -c and as direct pipeline) with a two-step approach: download to a mktemp file first, then execute. The '--' was dropped as it was the shell's option terminator. Temp file is cleaned up after use.

2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH in both 'Setup Custom Bun Path' (BUN_DIR_SAFE) and 'Install Claude Code' (CLAUDE_DIR_SAFE) steps.

3. script-injection (examples/issue-triage.yml): Moved ${{ secrets.GITHUB_TOKEN }} into the 'Setup GitHub MCP Server' step's env block as GITHUB_TOKEN_VALUE; moved ${{ github.event.issue.number }} and ${{ github.repository }} into the 'Create triage prompt' step's env block as ISSUE_NUMBER and GITHUB_REPOSITORY. Changed heredocs from single-quoted 'EOF' to unquoted EOF to allow variable expansion.

4. unpinned-uses (examples/issue-triage.yml): Replaced anthropics/claude-code-base-action@beta with the pinned SHA anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta.

