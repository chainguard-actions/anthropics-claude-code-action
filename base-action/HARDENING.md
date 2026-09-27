<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.197

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.197** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading and verifying it. Two occurrences: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. An attacker who can intercept or tamper with the remote URL could execute arbitrary code on the runner.

Locations:

- `action.yml:155`
- `action.yml:157`

### script-injection (severity: high)

Sub-rule (a): GitHub Actions expressions are interpolated directly inside run: shell command strings. (1) In the 'Setup GitHub MCP Server' step, `${{ secrets.GITHUB_TOKEN }}` is embedded directly in the run: block inside a heredoc — GitHub Actions substitutes this before the shell runs. (2) In the 'Create triage prompt' step, `${{ github.event.issue.number }}` (attacker-controlled via the issue event) is interpolated directly into the shell script inside a heredoc. Even though the heredoc delimiter is quoted ('EOF'), the Actions runner performs template substitution before the shell executes the script, allowing injection.

Locations:

- `examples/issue-triage.yml:35`
- `examples/issue-triage.yml:50`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta` using a mutable branch name instead of a full 40-character commit SHA. This means the action can be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:97`

### github-env-injection (severity: high)

Two steps in action.yml write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via env var `PATH_TO_BUN_EXECUTABLE`) to $GITHUB_PATH: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. (2) The 'Install Claude Code' step writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable` via env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`) to $GITHUB_PATH: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled newline in these values could inject additional entries into PATH.

Locations:

- `action.yml:138`
- `action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, script-injection, unpinned-uses, github-env-injection

**Notes:**

Fixed all four findings:

1. **unsafe-shell** (action.yml): Both pipe-to-bash occurrences replaced with download-then-execute pattern. Script downloaded to mktemp file, executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (no '--' since that was the shell's option terminator in the pipe form, not a script argument). Temp file cleaned up after use.

2. **script-injection** (examples/issue-triage.yml): (a) `${{ secrets.GITHUB_TOKEN }}` moved to `env: GH_TOKEN_VALUE:` and referenced as `$GH_TOKEN_VALUE` in the heredoc (heredoc delimiter changed from quoted 'EOF' to unquoted EOF to allow env var expansion). (b) `${{ github.event.issue.number }}` moved to `env: ISSUE_NUMBER:` and referenced as `$ISSUE_NUMBER`. The pre-existing `env: GITHUB_REPOSITORY:` block was merged into the same single `env:` block to produce valid YAML.

3. **unpinned-uses** (examples/issue-triage.yml): `anthropics/claude-code-base-action@beta` pinned to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

4. **github-env-injection** (action.yml): Both `$BUN_DIR` and `$CLAUDE_DIR` are now sanitized with `printf '%s' "$VAR" | tr -d '\n\r'` before being written to `$GITHUB_PATH`.

