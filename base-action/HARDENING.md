<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.213

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.213** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote script directly to bash without first downloading and inspecting it. Two occurrences: (1) inside a timeout wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) directly: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or redirected, arbitrary code executes on the runner. The script should be downloaded to a file first, verified, then executed.

Locations:

- `action.yml:158`
- `action.yml:159`

### github-env-injection (severity: high)

Two steps write attacker-controlled input values (via env vars) to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to $GITHUB_PATH — a newline in the input could inject additional PATH entries. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to $GITHUB_PATH — same risk.

Locations:

- `action.yml:138`
- `action.yml:170`

### script-injection (severity: high)

Two `run:` blocks in examples/issue-triage.yml directly interpolate GitHub Actions expressions inside shell heredocs. (1) 'Setup GitHub MCP Server' step: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"` is interpolated directly into a shell heredoc — any `${{ }}` expression in a run: block is a script-injection risk per rule (a). (2) 'Create triage prompt' step: `- ISSUE_NUMBER: ${{ github.event.issue.number }}` is interpolated directly into a shell heredoc — an attacker-controlled issue number could inject shell metacharacters. Both should be passed via `env:` variables and referenced as `$VAR` in the shell.

Locations:

- `examples/issue-triage.yml:30`
- `examples/issue-triage.yml:51`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `uses: anthropics/claude-code-base-action@beta` which is pinned to a mutable branch name (`beta`) rather than a full 40-character commit SHA. If the branch is force-pushed or compromised, the action will silently execute different code. It should be pinned to a specific commit SHA (e.g., `anthropics/claude-code-base-action@<40-char-sha> # beta`).

Locations:

- `examples/issue-triage.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced both `curl | bash` patterns with download-to-tempfile-then-execute approach using `mktemp`. Removed the `--` argument (it was the shell's stdin option terminator, not the script's). Temp file is cleaned up after use.
2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both the 'Setup Custom Bun Path' and 'Install Claude Code' steps.
3. script-injection (examples/issue-triage.yml): Moved `${{ secrets.GITHUB_TOKEN }}` to env var `GH_TOKEN` and `${{ github.event.issue.number }}` to env var `ISSUE_NUMBER`; changed heredocs from single-quoted `'EOF'` to unquoted `EOF` so the env vars expand in the shell.
4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

