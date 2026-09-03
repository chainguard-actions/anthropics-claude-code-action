<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.213

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.213** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote install script directly to bash without first downloading and verifying it. Two occurrences: (1) inside a `timeout` wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`, and (2) a direct fallback: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner.

Locations:

- `action.yml:168`
- `action.yml:170`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable`, computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` — a newline in the input could inject additional PATH entries. (2) The 'Install Claude Code' step similarly sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `inputs.path_to_claude_code_executable`, computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, then writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

Locations:

- `action.yml:151`
- `action.yml:181`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` inside a shell heredoc. Although the heredoc delimiter is quoted (`<< 'EOF'`), the expression is expanded by GitHub Actions template substitution before the shell ever sees the script, allowing an attacker to craft an issue number containing shell metacharacters or newlines to inject arbitrary commands. Offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:47`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch/tag ref instead of a full 40-character commit SHA. This means the action code can change at any time without notice, creating a supply-chain risk. It should be pinned to a specific commit SHA (e.g., `anthropics/claude-code-base-action@<40-char-sha> # beta`).

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings: (1) unsafe-shell: Replaced curl|bash pipe with download-then-execute pattern using mktemp, dropping the '--' separator since bash -s is no longer used; (2) github-env-injection: Added printf+tr sanitization before both GITHUB_PATH writes in Setup Custom Bun Path and Install Claude Code steps; (3) script-injection: Moved ${{ github.event.issue.number }} to the step's env: block as ISSUE_NUMBER, changed heredoc delimiter from quoted 'EOF' to unquoted EOF so the shell safely expands ${ISSUE_NUMBER} from the environment, and merged GITHUB_REPOSITORY into the same env block; (4) unpinned-uses: Pinned anthropics/claude-code-base-action@beta to SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with # beta comment.

