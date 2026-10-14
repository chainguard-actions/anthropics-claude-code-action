<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.249

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.249** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes the output of a remote script directly to bash without first downloading it to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever content the remote server returns without any integrity check, making it vulnerable to supply-chain attacks if the remote URL is compromised. This occurs in two branches of the same if/else block (with and without the `timeout` wrapper).

Locations:

- `action.yml:153`
- `action.yml:155`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step).

1. 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` and then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled newline in the input value could inject arbitrary entries into PATH.

2. 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}` and then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

Locations:

- `action.yml:137`
- `action.yml:167`

### script-injection (severity: high)

In examples/issue-triage.yml, the expression `${{ github.event.issue.number }}` is interpolated directly inside a `run:` shell command block (sub-rule a). The issue number is attacker-controlled data (an issue can be opened by any GitHub user), and embedding it directly in a shell heredoc via template substitution before the shell processes it creates a script injection risk. The value should be passed through an `env:` variable and referenced as `$ISSUE_NUMBER` instead.

Locations:

- `examples/issue-triage.yml:50`

### unpinned-uses (severity: high)

In examples/issue-triage.yml, the step 'Run Claude Code for Issue Triage' references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) as the ref instead of a full 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:101`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $VERSION` patterns with a download-then-execute approach: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` as it was the shell's option terminator (not the script's). Temp file is cleaned up after use.

2. github-env-injection (action.yml): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both the 'Setup Custom Bun Path' and 'Install Claude Code' steps.

3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` into the step's `env:` block as `ISSUE_NUMBER`, merged with existing `GITHUB_REPOSITORY` env var. Changed heredoc from quoted `'EOF'` to unquoted `EOF` to allow shell variable expansion of `${ISSUE_NUMBER}` and `${GITHUB_REPOSITORY}`. Escaped the backtick in the heredoc content.

4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to the full commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment for readability.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script injection findings in examples/issue-triage.yml:
1. 'Setup GitHub MCP Server' step: Moved `${{ secrets.GITHUB_TOKEN }}` to an env var (`MCP_GITHUB_TOKEN`) and used `jq -n --arg token "$MCP_GITHUB_TOKEN"` to safely construct the JSON config, preventing direct template substitution in the shell script.
2. 'Create triage prompt' step: Changed the heredoc delimiter from unquoted `EOF` to single-quoted `'EOF'` for static text (preventing shell expansion), and wrote the dynamic values `$GITHUB_REPOSITORY` and `$ISSUE_NUMBER` using `printf '%s\n'` to safely handle any shell metacharacters. The remaining static prompt text is appended with a second quoted `'EOF'` heredoc.

