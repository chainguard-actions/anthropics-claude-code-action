<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.225

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.225** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash via `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification, making it vulnerable to supply-chain attacks if the remote URL is compromised. This pattern appears twice (once inside a `timeout` wrapper and once in the else branch).

Locations:

- `action.yml:149`
- `action.yml:152`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step):

1. 'Setup Custom Bun Path' step: `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (which comes from `inputs.path_to_bun_executable`) via `dirname`. The result is written directly to $GITHUB_PATH: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input could inject additional entries into PATH.

2. 'Install Claude Code' step: `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (which comes from `inputs.path_to_claude_code_executable`) via `dirname`. The result is written directly to $GITHUB_PATH: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk.

Locations:

- `action.yml:130`
- `action.yml:163`

### script-injection (severity: high)

The 'Create triage prompt' step in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` inside a `run:` shell command string. This is attacker-controlled data (an issue opener can influence the issue number context) that flows through YAML template substitution before the shell processes it, enabling script injection. The offending line is: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:55`

### unpinned-uses (severity: high)

The file examples/issue-triage.yml references `uses: anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) as the ref instead of a full 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to the workflow file, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell: Replaced curl|bash pipe patterns in 'Install Claude Code' step with download-to-tempfile then execute approach. Used mktemp, curl -o to download, then bash script_file version (dropping the '--' shell option terminator as required). Cleanup of temp file added.
2. github-env-injection: Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR (line 130) and CLAUDE_DIR (line 163) to $GITHUB_PATH.
3. script-injection: Moved `${{ github.event.issue.number }}` into the step's env: block as ISSUE_NUMBER, changed heredoc from 'EOF' (quoted, no expansion) to EOF (unquoted, allows variable expansion), and merged with existing GITHUB_REPOSITORY env: block.
4. unpinned-uses: Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

