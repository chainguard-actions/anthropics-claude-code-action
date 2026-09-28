<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs twice — once inside a `timeout ... bash -c "..."` wrapper and once in the else branch. An attacker who can intercept or tamper with the remote URL could execute arbitrary code on the runner.

Locations:

- `action.yml:155`
- `action.yml:158`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `$PATH_TO_BUN_EXECUTABLE`, which is set from `inputs.path_to_bun_executable`) to `$GITHUB_PATH` without sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A caller can supply a value containing newlines to inject arbitrary entries into PATH, potentially hijacking subsequent command resolution. The required sanitization (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:135`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` (derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE`, which is set from `inputs.path_to_claude_code_executable`) to `$GITHUB_PATH` without sanitization: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A caller can supply a value containing newlines to inject arbitrary entries into PATH. The required sanitization (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:172`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` into the shell command string inside a heredoc. GitHub Actions substitutes this expression before the shell runs, so an attacker who controls the issue number field (e.g. via a crafted issue) could inject shell metacharacters. The offending line is: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:52`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run: block directly interpolates `${{ secrets.GITHUB_TOKEN }}` into the shell command string inside a heredoc: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}". Any ${{ }} expression inside a run: block is substituted by GitHub Actions before the shell executes, making this a script-injection pattern regardless of the source context.

Locations:

- `examples/issue-triage.yml:30`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' references `uses: anthropics/claude-code-base-action@beta`, which is a mutable branch/tag reference rather than an immutable 40-character commit SHA. This means the action code can change at any time without notice, creating a supply-chain risk. It should be pinned to a full SHA, e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`.

Locations:

- `examples/issue-triage.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed 6 findings across action.yml and examples/issue-triage.yml:

1. unsafe-shell (action.yml): Both curl-pipe-to-bash patterns replaced with download-then-execute using mktemp. Script downloaded to temp file, then executed as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"' (dropping the '--' from the original 'bash -s -- $VERSION' as required). Temp file cleaned up after use.

2. github-env-injection (action.yml line 135): BUN_DIR sanitized with 'printf | tr -d' before writing to GITHUB_PATH.

3. github-env-injection (action.yml line 172): CLAUDE_DIR sanitized with 'printf | tr -d' before writing to GITHUB_PATH.

4. script-injection (examples/issue-triage.yml line 52): github.event.issue.number moved to env block as ISSUE_NUMBER; heredoc changed from quoted to unquoted delimiter to allow shell variable expansion.

5. script-injection (examples/issue-triage.yml line 30): secrets.GITHUB_TOKEN moved to env block as GH_TOKEN; heredoc changed from quoted to unquoted delimiter to allow shell variable expansion.

6. unpinned-uses (examples/issue-triage.yml line 88): anthropics/claude-code-base-action@beta pinned to SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta.

