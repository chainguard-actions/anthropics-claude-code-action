<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.186

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.186** was hardened automatically. 4 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): In the 'Revoke app token' step, the expression `${{ steps.run.outputs.github_token }}` is directly interpolated inside the `run:` shell command string — specifically in the curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` line. Any `${{ steps.*.outputs.* }}` expression directly inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing shell metacharacters to be injected. The token should be passed via an `env:` variable and referenced as `$GITHUB_TOKEN` (double-quoted) instead.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var PATH_TO_BUN_EXECUTABLE is set from `inputs.path_to_bun_executable` (an untrusted input). The script then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline embedded in the input value could inject an arbitrary path entry into GITHUB_PATH. The same pattern appears in base-action/action.yml.

Locations:

- `action.yml:213`
- `base-action/action.yml:122`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from `inputs.path_to_claude_code_executable` (an untrusted input). The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline embedded in the input value could inject an arbitrary path entry into GITHUB_PATH.

Locations:

- `base-action/action.yml:155`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash without first downloading and inspecting it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern (and its timeout-wrapped variant `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`) executes whatever the remote server returns without any integrity check. The script should be downloaded to a temporary file, its checksum verified, and then executed separately.

Locations:

- `base-action/action.yml:143`
- `base-action/action.yml:145`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 security findings across action.yml and base-action/action.yml:

1. script-injection (action.yml): Moved `${{ steps.run.outputs.github_token }}` from the 'Revoke app token' run: block to an env: block as APP_GITHUB_TOKEN; shell now references $APP_GITHUB_TOKEN.

2. github-env-injection (action.yml): In 'Setup Custom Bun Path', added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

3. github-env-injection (base-action/action.yml): Same fix for 'Setup Custom Bun Path' (BUN_DIR sanitization), and in 'Install Claude Code' added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. unsafe-shell (base-action/action.yml): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern: script is downloaded to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator). The temp file is cleaned up after use. Both the timeout-wrapped and direct variants were fixed.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml: moved `${{ github.action_path }}` out of the `run:` shell command and into the `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now references `$ACTION_PATH` instead of the direct expression interpolation.

### Iteration 3

**Fixes applied:** script-injection, unpinned-uses, permissions, unsafe-shell

**Notes:**

Fixed all 14 findings across 8 workflow files:

1. script-injection (release.yml): Moved all ${{ steps.*.outputs.* }}, ${{ github.sha }}, and ${{ needs.*.outputs.* }} expressions from run: shell strings into env: blocks.

2. script-injection (sync-base-action.yml): Moved ${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }} into an env: block (DEPLOY_KEY) and used printf '%s' to write it safely.

3. script-injection (test-base-action.yml): Moved ${{ steps.inline-test.outputs.* }} and ${{ steps.prompt-file-test.outputs.* }} into env: blocks.

4. script-injection (test-custom-executables.yml): Moved ${{ steps.custom-test.outputs.* }} into env: blocks.

5. script-injection (test-settings.yml): Moved all ${{ steps.*.outputs.* }} expressions into env: blocks across all four verify steps.

6. script-injection (test-structured-output.yml): Moved all ${{ steps.test.outputs.* }} and ${{ needs.*.result }} expressions into env: blocks; replaced Actions ternary expressions in the summary with shell conditionals.

7. unpinned-uses (ci.yml): Pinned actions/checkout@v6→SHA, oven-sh/setup-bun@v2→SHA, oven-sh/setup-bun@v1→SHA.

8. unpinned-uses (claude-review.yml): Pinned actions/checkout@v6 and anthropics/claude-code-action@v1 to full SHAs.

9. unpinned-uses (claude.yml): Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

10. unpinned-uses (issue-triage.yml): Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

11. unpinned-uses (release.yml): Pinned both actions/checkout@v6 occurrences to full SHA.

12. missing-permissions (ci.yml): Added top-level permissions: contents: read block.

13. unsafe-shell (test-custom-executables.yml, bun): Downloaded bun install script to temp file before executing.

14. unsafe-shell (test-custom-executables.yml, claude): Downloaded claude.ai install script to temp file before executing; dropped the '--' shell option terminator (was the shell's, not the script's argument).

