<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.220

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.220** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading to a file. Two occurrences: (1) inside a `timeout` wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`, and (2) in the fallback else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or redirected, arbitrary code executes on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable tag (`@beta`) instead of a full 40-character commit SHA. A tag can be silently moved to point to a different (potentially malicious) commit, enabling a supply-chain attack.

Locations:

- `examples/issue-triage.yml:103`

### script-injection (severity: high)

Sub-rule (a): examples/issue-triage.yml 'Create triage prompt' step interpolates `${{ github.event.issue.number }}` directly inside a `run:` shell command string. GitHub Actions performs YAML template substitution before the shell runs, so even though the expression appears inside a heredoc body, it is expanded into the shell script. An attacker who can craft an issue with a malicious number/title could inject arbitrary shell commands.

Locations:

- `examples/issue-triage.yml:47`

### github-env-injection (severity: high)

Two steps in action.yml write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`): (1) 'Setup Custom Bun Path' step: `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (which comes from `inputs.path_to_bun_executable`) and written directly to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. (2) 'Install Claude Code' step: `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (which comes from `inputs.path_to_claude_code_executable`) and written directly to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject additional entries into PATH.

Locations:

- `action.yml:137`
- `action.yml:161`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, unpinned-uses, script-injection, github-env-injection

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $VERSION` patterns with a two-step approach: download to a temp file via `mktemp`, then execute the file directly. The `--` separator was dropped (it was the shell's stdin option terminator, not a script argument). Applied to both the `timeout` wrapper branch and the fallback else branch.

2. unpinned-uses (examples/issue-triage.yml line 103): Pinned `anthropics/claude-code-base-action@beta` to the resolved full commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

3. script-injection (examples/issue-triage.yml line 47): Moved `${{ github.event.issue.number }}` into the step's `env:` block as `ISSUE_NUMBER`. Changed heredoc delimiter from `'EOF'` (quoted, no expansion) to `EOF` (unquoted, allows shell variable expansion). Also consolidated `GITHUB_REPOSITORY` into the same env block and removed the duplicate trailing env block.

4. github-env-injection (action.yml lines 137, 161): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization for both `BUN_DIR` (Setup Custom Bun Path step) and `CLAUDE_DIR` (Install Claude Code step) before writing to `$GITHUB_PATH`.

