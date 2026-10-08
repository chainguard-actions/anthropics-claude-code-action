<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.246

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.246** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from inputs.path_to_bun_executable (an untrusted input) to $GITHUB_PATH without sanitization. BUN_DIR is computed via `dirname "$PATH_TO_BUN_EXECUTABLE"` and then written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The required `printf '%s' ... | tr -d '\n\r'` sanitization step is absent. A newline in the input could inject arbitrary entries into PATH.

Locations:

- `action.yml:137`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from inputs.path_to_claude_code_executable (an untrusted input) to $GITHUB_PATH without sanitization. CLAUDE_DIR is computed via `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` and then written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The required `printf '%s' ... | tr -d '\n\r'` sanitization step is absent. A newline in the input could inject arbitrary entries into PATH.

Locations:

- `action.yml:173`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash in two places: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This executes whatever script is served at that URL without any integrity verification, making the action vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `action.yml:157`
- `action.yml:159`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run: block directly interpolates `${{ secrets.GITHUB_TOKEN }}` inside a heredoc shell script. GitHub Actions template substitution occurs before the shell processes the heredoc, so the token value is embedded literally in the shell script text. While secrets.GITHUB_TOKEN is not attacker-controlled, any ${{ }} expression directly in a run: block is a script-injection finding per the check rules.

Locations:

- `examples/issue-triage.yml:35`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` inside a heredoc shell script (cat << 'EOF'). Even though the heredoc delimiter is single-quoted (preventing shell variable expansion), GitHub Actions template substitution happens BEFORE the shell runs, so the expression is substituted directly into the shell script. github.event.issue.number is attacker-controlled — any user can open an issue. A crafted issue number could inject shell commands.

Locations:

- `examples/issue-triage.yml:50`

### unpinned-uses (severity: high)

The 'Run Claude Code for Issue Triage' step uses `anthropics/claude-code-base-action@beta`, which references a mutable branch name rather than a pinned 40-character commit SHA. This means the action can change at any time without notice, creating a supply-chain risk. It should be pinned to a full SHA, e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`.

Locations:

- `examples/issue-triage.yml:100`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection, unpinned-uses

**Notes:**

Fixed 6 findings across action.yml and examples/issue-triage.yml:

1. action.yml (Setup Custom Bun Path): Sanitized BUN_DIR with `printf '%s' ... | tr -d '\n\r'` before writing to $GITHUB_PATH.

2. action.yml (Install Claude Code - GITHUB_PATH): Sanitized CLAUDE_DIR with `printf '%s' ... | tr -d '\n\r'` before writing to $GITHUB_PATH.

3. action.yml (Install Claude Code - unsafe-shell): Replaced both `curl ... | bash -s -- $VERSION` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` separator (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

4. examples/issue-triage.yml (Setup GitHub MCP Server): Moved `${{ secrets.GITHUB_TOKEN }}` to env block as `GH_TOKEN`, changed heredoc to unquoted `EOF` to allow shell expansion, referenced `$GH_TOKEN` in the body.

5. examples/issue-triage.yml (Create triage prompt): Moved `${{ github.event.issue.number }}` to env block as `ISSUE_NUMBER`, changed heredoc to unquoted `EOF`, referenced `${ISSUE_NUMBER}` in the body. Escaped backtick in prompt text.

6. examples/issue-triage.yml (Run Claude Code for Issue Triage): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

