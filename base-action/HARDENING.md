<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.211

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.211** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash`. This occurs twice — once inside a `timeout ... bash -c "curl ... | bash ..."` wrapper and once as a direct pipe. If the remote URL is compromised or redirected, arbitrary code executes on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which is a mutable branch ref rather than an immutable 40-character commit SHA. A supply-chain attacker who pushes to the `beta` branch can inject arbitrary code into any workflow using this reference.

Locations:

- `examples/issue-triage.yml:97`

### script-injection (severity: high)

Two `run:` blocks in examples/issue-triage.yml directly interpolate GitHub Actions expressions, violating rule (a):

1. 'Setup GitHub MCP Server' step (line 38): `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"` — the expression is expanded by the YAML template engine before the shell sees it, embedding the token value literally in the shell script.

2. 'Create triage prompt' step (line 55): `- ISSUE_NUMBER: ${{ github.event.issue.number }}` — an attacker-controlled issue number is interpolated directly into the shell heredoc. A crafted issue number containing shell metacharacters or newlines could break out of the heredoc context.

Locations:

- `examples/issue-triage.yml:38`
- `examples/issue-triage.yml:55`

### github-env-injection (severity: high)

Two steps in action.yml write values derived from user-controlled inputs to `$GITHUB_PATH` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`):

1. 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` in the env: block, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline-containing input value could inject additional entries into PATH.

2. 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}` in the env: block, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk applies.

Locations:

- `action.yml:130`
- `action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, unpinned-uses, script-injection, github-env-injection

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced `curl ... | bash` pattern with download-then-execute: script is downloaded to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the '--' which was the shell's option terminator in the pipe form, not a script argument). Temp file is cleaned up after use. Both the timeout-wrapped and direct forms were fixed.

2. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

3. script-injection (examples/issue-triage.yml): (a) 'Setup GitHub MCP Server': moved `${{ secrets.GITHUB_TOKEN }}` to env block as `GITHUB_TOKEN_VALUE`, changed heredoc delimiter from `'EOF'` to `EOF` so the shell substitutes `$GITHUB_TOKEN_VALUE`. (b) 'Create triage prompt': moved `${{ github.event.issue.number }}` to env block as `ISSUE_NUMBER`, used a placeholder in the quoted heredoc, then safely substituted it via `sed` after sanitizing with `tr -d '\n\r'`.

4. github-env-injection (action.yml): Both GITHUB_PATH writes now sanitize the directory path with `printf '%s' "$VAR" | tr -d '\n\r'` before writing via `printf '%s\n'` to prevent newline injection.

