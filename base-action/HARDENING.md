<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.239

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.239** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns, making the action vulnerable to supply-chain attacks if the remote URL is compromised. There are two occurrences — one inside a `timeout` wrapper and one in the else branch.

Locations:

- `action.yml:163`
- `action.yml:165`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`; the script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — a newline in the input could inject arbitrary entries into PATH. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`; similarly `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:148`
- `action.yml:185`

### script-injection (severity: high)

In examples/issue-triage.yml, the 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` into the shell script. Although the heredoc uses a single-quoted delimiter (`<< 'EOF'`), GitHub Actions expression substitution (`${{ }}`) occurs before the shell executes, so the issue number value is injected verbatim into the script text. An attacker who can control the issue number field (or craft a malicious issue) could inject shell metacharacters. The offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:52`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch/tag ref (`beta`) instead of a pinned 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks. It should be pinned to a full SHA digest, e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`.

Locations:

- `examples/issue-triage.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced both `curl | bash` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" $CLAUDE_CODE_VERSION`. The `--` shell option terminator was dropped as required (it was the shell's, not the script's). Temp file is cleaned up after use.
2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization for both BUN_DIR (line ~148) and CLAUDE_DIR (line ~185) before writing to $GITHUB_PATH.
3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` to the step's `env:` block as `ISSUE_NUMBER`, merged with the existing `GITHUB_REPOSITORY` env var. Changed heredoc delimiter from `'EOF'` (no-expansion) to `EOF` (with expansion) so `${ISSUE_NUMBER}` is resolved by the shell rather than by GitHub Actions expression evaluation.
4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

