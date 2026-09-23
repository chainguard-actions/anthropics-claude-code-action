<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.232

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.232** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote install script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This executes arbitrary remote content without first downloading and verifying it, allowing a compromised or hijacked install.sh to run malicious code on the runner.

Locations:

- `action.yml:155`
- `action.yml:156`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`):

1. 'Setup Custom Bun Path' step: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The env var `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`, which is caller-controlled. A newline in the input can inject arbitrary entries into $GITHUB_PATH.

2. 'Install Claude Code' step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`, which is caller-controlled. Same injection risk.

Locations:

- `action.yml:138`
- `action.yml:170`

### script-injection (severity: high)

examples/issue-triage.yml interpolates GitHub Actions expressions directly inside `run:` shell blocks (sub-rule a):

1. 'Setup GitHub MCP Server' step: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"` is written inside a heredoc in a `run:` block. Any expression inside a run: block is subject to template substitution before the shell sees it.

2. 'Create triage prompt' step: `- ISSUE_NUMBER: ${{ github.event.issue.number }}` is written inside a heredoc in a `run:` block. `github.event.issue.number` is attacker-controlled (issue title/body can influence event context) and is interpolated directly into the shell script before execution.

Locations:

- `examples/issue-triage.yml:28`
- `examples/issue-triage.yml:44`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta` which uses a mutable branch name (`beta`) instead of a full 40-character commit SHA. This means the action can be silently updated to a different (potentially malicious) version without any change to the workflow file, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. **unsafe-shell** (action.yml line 155-156): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` with a two-step approach: download to a temp file with `curl -fsSL ... -o "$INSTALL_SCRIPT"`, then execute `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). Applied to both the `timeout` branch and the fallback branch. Temp file is cleaned up after use.

2. **github-env-injection** (action.yml lines 138, 170): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both the 'Setup Custom Bun Path' and 'Install Claude Code' steps.

3. **script-injection** (examples/issue-triage.yml lines 28, 44): Moved `${{ secrets.GITHUB_TOKEN }}` to an `env: GH_TOKEN:` block and referenced it as `$GH_TOKEN` in the heredoc. Moved `${{ github.event.issue.number }}` and `${{ github.repository }}` to `env:` blocks, sanitized both with `tr -d '\n\r'`, and used the sanitized variables in the heredoc. Changed heredocs from single-quoted `'EOF'` to unquoted `EOF` to allow shell variable expansion.

4. **unpinned-uses** (examples/issue-triage.yml line 97): Pinned `anthropics/claude-code-base-action@beta` to `anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

