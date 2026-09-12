<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.222

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.222** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote shell script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). If the remote URL is compromised or redirected, arbitrary code executes on the runner. The script should be downloaded to a file, verified (e.g., checksum), and then executed separately.

Locations:

- `action.yml:152`
- `action.yml:155`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The fix is to apply `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before the write.

Locations:

- `action.yml:145`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline in the input value could inject arbitrary entries into PATH. The fix is to apply `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before the write.

Locations:

- `action.yml:170`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run: block directly interpolates `${{ secrets.GITHUB_TOKEN }}` inside a heredoc shell command. GitHub Actions expands `${{ }}` expressions before the shell runs, so the token value is substituted verbatim into the shell script text. If the token value contains shell metacharacters, it could alter the command. The value should be passed via an `env:` variable and referenced as `$ENV_VAR` inside the heredoc. Offending line: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"`

Locations:

- `examples/issue-triage.yml:35`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` inside a heredoc shell command. This value is attacker-controlled (an issue number from a newly opened issue) and is substituted verbatim into the shell script before the shell runs it. A malicious issue number could inject shell metacharacters. The value should be passed via an `env:` variable and referenced as `$ENV_VAR` inside the heredoc. Offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:50`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' references `anthropics/claude-code-base-action@beta`, which uses a mutable tag (`@beta`) instead of a full 40-character commit SHA. A mutable tag can be silently updated to point to different (potentially malicious) code, creating a supply-chain risk. Pin to a specific commit SHA, e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`.

Locations:

- `examples/issue-triage.yml:96`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all 6 findings across action.yml and examples/issue-triage.yml:

1. unsafe-shell (action.yml): Replaced `curl ... | bash -s -- $VERSION` (both the timeout-wrapped and plain variants) with: download script to a mktemp file, then execute `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the '--' as it was the shell's option terminator (not the script's). Temp file is cleaned up after use.

2. github-env-injection (action.yml - Setup Custom Bun Path): Sanitized BUN_DIR with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to GITHUB_PATH.

3. github-env-injection (action.yml - Install Claude Code): Sanitized CLAUDE_DIR with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing to GITHUB_PATH.

4. script-injection (examples/issue-triage.yml - Setup GitHub MCP Server): Moved `secrets.GITHUB_TOKEN` to env block as `GH_TOKEN`, replaced heredoc JSON construction with `jq -n --arg token "$GH_TOKEN"` to safely embed the token value.

5. script-injection (examples/issue-triage.yml - Create triage prompt): Moved `github.event.issue.number` to env block as `ISSUE_NUMBER`, consolidated `github.repository` into same env block. Changed heredoc delimiter from quoted `'EOF'` to unquoted `EOF` so env vars expand. Escaped the backtick in prompt text.

6. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to `anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

