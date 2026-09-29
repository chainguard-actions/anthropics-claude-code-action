<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.218

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.218** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the user-controlled input `inputs.path_to_bun_executable` (via env var PATH_TO_BUN_EXECUTABLE → shell variable BUN_DIR) to $GITHUB_PATH without sanitization. An attacker-controlled newline in the input could inject arbitrary entries into the runner's PATH. The required sanitization (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`) is absent before the write: `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:143`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the user-controlled input `inputs.path_to_claude_code_executable` (via env var PATH_TO_CLAUDE_CODE_EXECUTABLE → shell variable CLAUDE_DIR) to $GITHUB_PATH without sanitization. An attacker-controlled newline in the input could inject arbitrary entries into the runner's PATH. The required sanitization (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`) is absent before the write: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:178`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern allows a compromised or MITM'd remote server to execute arbitrary code on the runner. The script should be downloaded to a file, verified (e.g., checksum), and then executed separately.

Locations:

- `action.yml:163`
- `action.yml:165`

### script-injection (severity: high)

Rule (a) violation: The 'Create triage prompt' run: block in examples/issue-triage.yml directly interpolates the GitHub Actions expression `${{ github.event.issue.number }}` inside a shell heredoc. This expression is substituted by the Actions runner before the shell executes the script, allowing an attacker to inject shell metacharacters via a crafted issue number. The value should be passed via an env: variable and referenced as `$ENV_VAR` instead.

Locations:

- `examples/issue-triage.yml:35`

### unpinned-uses (severity: high)

The workflow in examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) as the ref. This means the action code can change at any time without notice, creating a supply-chain risk. The ref should be pinned to a full 40-character commit SHA (e.g., `anthropics/claude-code-base-action@<sha> # beta`).

Locations:

- `examples/issue-triage.yml:91`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection, unpinned-uses

**Notes:**

Fixed all 5 findings across action.yml and examples/issue-triage.yml:
1. action.yml 'Setup Custom Bun Path': Sanitized BUN_DIR with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.
2. action.yml 'Install Claude Code': Sanitized CLAUDE_DIR with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.
3. action.yml 'Install Claude Code': Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` (it was the shell's option terminator in the pipe form, not the script's argument).
4. examples/issue-triage.yml 'Create triage prompt': Moved `${{ github.event.issue.number }}` to env block as `ISSUE_NUMBER`, changed heredoc from `'EOF'` (no-expansion) to `EOF` (expansion) so `${ISSUE_NUMBER}` is resolved from the env var.
5. examples/issue-triage.yml 'Run Claude Code for Issue Triage': Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

