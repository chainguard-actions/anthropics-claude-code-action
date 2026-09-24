<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.220

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.220** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes the output of curl directly to bash without first downloading the script to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes remotely-fetched content immediately, preventing any opportunity to inspect or verify the script before execution. This occurs twice — once inside a `timeout ... bash -c "..."` wrapper and once in the else branch.

Locations:

- `action.yml:163`
- `action.yml:165`

### script-injection (severity: high)

Rule (a): Two `run:` blocks in examples/issue-triage.yml directly interpolate GitHub Actions expressions inside shell command strings. (1) The 'Setup GitHub MCP Server' step interpolates `${{ secrets.GITHUB_TOKEN }}` directly inside a heredoc run: block — GitHub Actions template substitution occurs before the shell runs, even with a single-quoted heredoc delimiter. (2) The 'Create triage prompt' step interpolates `${{ github.event.issue.number }}` (attacker-controlled via issue events) directly inside a run: block heredoc. An attacker could craft an issue number containing shell metacharacters or newlines to inject arbitrary commands.

Locations:

- `examples/issue-triage.yml:38`
- `examples/issue-triage.yml:55`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `uses: anthropics/claude-code-base-action@beta`, which uses a mutable branch/tag ref (`beta`) instead of a pinned 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks if the referenced branch is compromised or updated with malicious code.

Locations:

- `examples/issue-triage.yml:107`

### github-env-injection (severity: high)

Two steps in action.yml write values derived from untrusted inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from `${{ inputs.path_to_bun_executable }}`, computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no newline sanitization. (2) The 'Install Claude Code' step sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `${{ inputs.path_to_claude_code_executable }}`, computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, then writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no newline sanitization. An attacker-controlled input containing newlines could inject additional entries into PATH.

Locations:

- `action.yml:140`
- `action.yml:172`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, script-injection, unpinned-uses, github-env-injection

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced `curl -fsSL ... | bash -s -- $VERSION` (both occurrences - in the timeout wrapper and the else branch) with a two-step pattern: download to a temp file via `mktemp`, then execute separately. Dropped the `--` as it was the shell's option terminator, not the script's. Temp file is cleaned up after use.

2. script-injection (examples/issue-triage.yml): (a) Setup GitHub MCP Server step: moved `${{ secrets.GITHUB_TOKEN }}` to env block as `GITHUB_TOKEN_VALUE`, changed heredoc delimiter from single-quoted `'EOF'` to unquoted `EOF` so the shell variable expands. (b) Create triage prompt step: moved `${{ github.event.issue.number }}` to env block as `ISSUE_NUMBER`, changed heredoc delimiter to unquoted `EOF`, referenced `${ISSUE_NUMBER}` in shell.

3. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

4. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR to $GITHUB_PATH (Setup Custom Bun Path step) and CLAUDE_DIR to $GITHUB_PATH (Install Claude Code step).

