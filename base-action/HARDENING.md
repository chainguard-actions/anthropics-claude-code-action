<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.214

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.214** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without downloading to a file first. Two occurrences: (1) inside a `timeout` wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Both patterns fetch and execute remote scripts in a single pipeline, allowing a compromised or MitM'd remote server to execute arbitrary code on the runner.

Locations:

- `action.yml:153`
- `action.yml:155`

### github-env-injection (severity: high)

Two steps write values derived from untrusted action inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step).

(1) 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newlines could inject arbitrary entries into PATH.

(2) 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

Locations:

- `action.yml:138`
- `action.yml:165`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' step in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` inside a `run:` shell heredoc. Although the heredoc uses `'EOF'` (single-quoted, preventing shell expansion of the outer script), the GitHub Actions expression `${{ github.event.issue.number }}` is substituted by the Actions runner before the shell ever sees the script. An attacker who controls the issue number field (e.g. via a crafted webhook) could inject arbitrary content into the heredoc that is written to the prompt file and subsequently processed.

Locations:

- `examples/issue-triage.yml:42`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which is a mutable branch/tag ref rather than a pinned 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks if the ref is compromised or updated with malicious code.

Locations:

- `examples/issue-triage.yml:93`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. **unsafe-shell** (action.yml): Replaced both `curl | bash` patterns with download-then-execute. The install script is now saved to a mktemp file and executed separately as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` separator was dropped (it was the shell's option terminator in the pipe form, not the script's argument). Temp file is cleaned up after use.

2. **github-env-injection** (action.yml): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both the 'Setup Custom Bun Path' and 'Install Claude Code' steps.

3. **script-injection** (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` into the step's `env:` block as `ISSUE_NUMBER`. Changed heredoc delimiter from `'EOF'` to `EOF` to allow shell variable expansion, and replaced the expression with `${ISSUE_NUMBER}`. Removed the duplicate `env:` block that was at the bottom of the step.

4. **unpinned-uses** (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

