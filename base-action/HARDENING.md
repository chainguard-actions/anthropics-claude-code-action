<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.250

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.250** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing embedded newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:162`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the input `inputs.path_to_claude_code_executable` is mapped to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing embedded newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:196`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside a `bash -c` timeout wrapper). The install script is fetched and executed in a single pipeline without first downloading to a file for inspection or integrity verification.

Locations:

- `action.yml:183`
- `action.yml:185`

### script-injection (severity: high)

Sub-rule (a): In examples/issue-triage.yml, the 'Create triage prompt' run block directly interpolates `${{ github.event.issue.number }}` into the shell script text. Although the heredoc delimiter is quoted (`<< 'EOF'`), GitHub Actions performs `${{ ... }}` template substitution before the shell executes, so a maliciously crafted issue number (e.g., containing shell metacharacters or heredoc-breaking sequences) is injected directly into the shell command string. The value should be passed via an `env:` variable and referenced as `$ISSUE_NUMBER` inside the heredoc instead.

Locations:

- `examples/issue-triage.yml:40`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `uses: anthropics/claude-code-base-action@beta`, which uses the mutable tag/branch `beta` rather than a pinned 40-character SHA commit hash. This is vulnerable to supply-chain attacks if the `beta` ref is updated with malicious code.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection, unpinned-uses

**Notes:**

Fixed 5 findings across action.yml and examples/issue-triage.yml:

1. action.yml - Setup Custom Bun Path (github-env-injection): Sanitized BUN_DIR with `printf '%s' ... | tr -d '\n\r'` before writing to GITHUB_PATH.

2. action.yml - Install Claude Code (github-env-injection): Sanitized CLAUDE_DIR with `printf '%s' ... | tr -d '\n\r'` before writing to GITHUB_PATH.

3. action.yml - Install Claude Code (unsafe-shell): Replaced both `curl | bash -s -- $VERSION` patterns with download-then-execute: curl downloads to a mktemp file, then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` executes it. The '--' was dropped (it was the shell's option terminator in the pipe form). Temp file is cleaned up after use.

4. examples/issue-triage.yml - Create triage prompt (script-injection): Moved `${{ github.event.issue.number }}` to the step's env: block as ISSUE_NUMBER, changed heredoc delimiter from quoted 'EOF' to unquoted EOF to allow shell variable expansion, and referenced ${ISSUE_NUMBER} inside the heredoc. Merged GITHUB_REPOSITORY into the same env: block.

5. examples/issue-triage.yml - Run Claude Code for Issue Triage (unpinned-uses): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In examples/issue-triage.yml, moved `${{ secrets.GITHUB_TOKEN }}` out of the `run:` shell block and into the step's `env:` block as `GITHUB_TOKEN_VALUE`. Changed the heredoc delimiter from single-quoted `'EOF'` to unquoted `EOF` so the shell can expand `$GITHUB_TOKEN_VALUE`. This prevents GitHub Actions from substituting the expression directly into the script text before the shell runs, eliminating the script-injection risk.

