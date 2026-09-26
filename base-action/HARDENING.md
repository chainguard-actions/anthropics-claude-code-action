<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.235

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.235** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes the output of a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This executes arbitrary remote content without first downloading and verifying it, allowing a compromised or hijacked URL to execute malicious code on the runner.

Locations:

- `action.yml:163`

### github-env-injection (severity: high)

Two steps write input-derived values to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step):

1. 'Setup Custom Bun Path': `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (which is set from `inputs.path_to_bun_executable`) and written directly to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input could inject arbitrary entries into PATH.

2. 'Install Claude Code': `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (set from `inputs.path_to_claude_code_executable`) and written directly to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk.

Locations:

- `action.yml:148`
- `action.yml:183`

### script-injection (severity: high)

The 'Create triage prompt' run: block in examples/issue-triage.yml directly interpolates GitHub Actions expressions inside shell commands (inside a heredoc):

(a) `${{ github.event.issue.number }}` is attacker-controlled (supplied via the issue event) and interpolated directly into the shell script before the shell processes it. An attacker could craft an issue number containing shell metacharacters to inject commands.

(a) `${{ secrets.GITHUB_TOKEN }}` in the 'Setup GitHub MCP Server' run: block is also interpolated directly inside a run: heredoc. Any ${{ ... }} expression inside a run: block is a script-injection risk as it flows through YAML template substitution before the shell ever sees it.

Locations:

- `examples/issue-triage.yml:46`
- `examples/issue-triage.yml:28`

### unpinned-uses (severity: high)

The file examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) as the ref instead of a full 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:68`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all 4 findings:

1. unsafe-shell (action.yml): Replaced `curl | bash -s -- VERSION` with download-then-execute pattern: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` shell option terminator as required. Applied to both timeout and non-timeout code paths. Temp file is cleaned up after use.

2. github-env-injection (action.yml): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in the 'Setup Custom Bun Path' and 'Install Claude Code' steps respectively.

3. script-injection (examples/issue-triage.yml): Moved `${{ secrets.GITHUB_TOKEN }}` to env var `GH_TOKEN_VALUE` in 'Setup GitHub MCP Server' step (changed heredoc from quoted 'EOF' to unquoted EOF). Moved `${{ github.event.issue.number }}` to env var `ISSUE_NUMBER` in 'Create triage prompt' step (also changed to unquoted EOF heredoc). Escaped the backtick in the prompt text to prevent shell interpretation.

4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

