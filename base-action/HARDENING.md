<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.247

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.247** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes the output of a remote `curl` request directly to `bash` without first saving the script to disk. This means any compromise of `claude.ai/install.sh` would result in arbitrary code execution on the runner. Two occurrences: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:163`
- `action.yml:165`

### github-env-injection (severity: high)

Two steps write values derived from action inputs to `$GITHUB_PATH` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`; `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is then written to `$GITHUB_PATH` unsanitized — a newline in the input could inject arbitrary entries into PATH. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`; `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` unsanitized.

Locations:

- `action.yml:148`
- `action.yml:183`

### script-injection (severity: high)

Two `run:` blocks in `examples/issue-triage.yml` directly interpolate GitHub Actions expressions inside shell heredocs, which are expanded by the Actions runner before the shell executes them. (a) 'Setup GitHub MCP Server' step interpolates `${{ secrets.GITHUB_TOKEN }}` directly inside the run: shell script (inside a heredoc writing JSON). (b) 'Create triage prompt' step interpolates `${{ github.event.issue.number }}` directly inside the run: shell script (inside a heredoc writing a prompt file). An attacker who can influence `github.event.issue.number` (e.g. via a crafted issue) could inject shell metacharacters. All `${{ ... }}` expressions in run: blocks are flagged per the script-injection check regardless of context.

Locations:

- `examples/issue-triage.yml:31`
- `examples/issue-triage.yml:55`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' in `examples/issue-triage.yml` uses `anthropics/claude-code-base-action@beta`, which references a mutable branch/tag rather than a full 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both curl-to-bash pipe patterns with download-then-execute. Script downloaded to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" $CLAUDE_CODE_VERSION` (dropping the '--' per instructions since it was the shell's option terminator in the pipe form, not an installer argument). Temp file cleaned up after use.

2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR (line 148) and CLAUDE_DIR (line 183) to $GITHUB_PATH.

3. script-injection (examples/issue-triage.yml): (a) 'Setup GitHub MCP Server': moved `${{ secrets.GITHUB_TOKEN }}` to env: as GITHUB_TOKEN_VALUE, wrote a placeholder in the heredoc, then used jq to safely inject the token value into the JSON. (b) 'Create triage prompt': moved `${{ github.event.issue.number }}` to env: as ISSUE_NUMBER, changed heredoc from quoted 'EOF' to unquoted EOF so shell variables expand, referenced as ${ISSUE_NUMBER}.

4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

