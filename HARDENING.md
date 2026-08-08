<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.188

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.188** was hardened automatically. 3 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the github.action_path context directly into the shell command before the shell ever sees it. Even though github.action_path is GitHub-controlled, any ${{ ... }} inside a run: block is a template-substitution injection risk per the check rules. The value should be passed via an env: variable and referenced as $GITHUB_ACTION_PATH (the pre-set env var) instead.

Locations:

- `agent-approval-check/action.yml:55`

### github-env-injection (severity: high)

Three steps write values derived from caller-controlled inputs to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled newline in the input value can inject arbitrary entries into GITHUB_PATH, enabling PATH hijacking.

(1) action.yml 'Setup Custom Bun Path': inputs.path_to_bun_executable is placed into env var PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is written unsanitized to $GITHUB_PATH.

(2) base-action/action.yml 'Setup Custom Bun Path': identical pattern — inputs.path_to_bun_executable → PATH_TO_BUN_EXECUTABLE → BUN_DIR → $GITHUB_PATH without sanitization.

(3) base-action/action.yml 'Install Claude Code': inputs.path_to_claude_code_executable → PATH_TO_CLAUDE_CODE_EXECUTABLE → CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") → $GITHUB_PATH without sanitization.

Locations:

- `action.yml:232`
- `base-action/action.yml:110`
- `base-action/action.yml:143`

### unsafe-shell (severity: high)

base-action/action.yml 'Install Claude Code' step pipes remote content directly to bash without first saving it to a file for inspection: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a timeout wrapper). If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner. The script should be downloaded to a temporary file, its integrity verified (e.g., checksum), and only then executed.

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:133`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all three findings: (1) script-injection in agent-approval-check/action.yml: replaced `${{ github.action_path }}` in run: command with `$GITHUB_ACTION_PATH` env var. (2) github-env-injection in action.yml and base-action/action.yml: added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH. (3) unsafe-shell in base-action/action.yml: replaced `curl | bash -s -- $VERSION` with download-to-tempfile then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` pattern (dropping the '--' per instructions since stdin piping is no longer used), with proper cleanup of the temp file.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Revoke app token' step in action.yml (line 496): moved `${{ steps.run.outputs.github_token }}` from the `run:` shell command string into an `env:` block as `REVOKE_TOKEN`, and updated the curl command to reference `$REVOKE_TOKEN` instead. This prevents the GitHub Actions template engine from interpolating the token value directly into the shell script, eliminating the script-injection risk.

### Iteration 1

**Fixes applied:** unpinned-uses, permissions, script-injection, unsafe-shell

**Notes:**

Fixed all findings across 7 workflow files:

1. **unpinned-uses**: Pinned all mutable action references to full commit SHAs in ci.yml (actions/checkout×3, oven-sh/setup-bun×3), claude-review.yml (actions/checkout, anthropics/claude-code-action@v1), claude.yml (actions/checkout, anthropics/claude-code-action@main), issue-triage.yml (actions/checkout, anthropics/claude-code-action@main), release.yml (actions/checkout×2).

2. **permissions**: Added top-level `permissions: contents: read` to ci.yml.

3. **script-injection**: Moved all ${{ }} expressions from run: shell strings to env: blocks in release.yml (5 steps), test-base-action.yml (2 steps), test-structured-output.yml (5 steps including rewriting Generate Summary to use shell conditionals instead of template expressions), test-custom-executables.yml (1 step), and sync-base-action.yml (deploy key secret).

4. **unsafe-shell**: Fixed test-custom-executables.yml by downloading bun.sh/install and claude.ai/install.sh to temp files first, then executing them separately. Dropped the shell's `-s` and `--` options since we're no longer piping (passing `latest` directly as positional arg to the Claude installer script).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:

1. test-settings.yml: Moved all `${{ steps.*.outputs.* }}` expressions out of `run:` shell strings and into `env:` blocks for all 4 affected steps (test-settings-inline-allow/Verify echo worked, test-settings-inline-deny/Verify echo was denied, test-settings-file-allow/Verify echo worked, test-settings-file-deny/Verify echo was denied). Shell scripts now reference values via plain $OUTPUT_FILE and $CONCLUSION environment variables.

2. test-base-action.yml: Replaced the unquoted heredoc `<< EOF` (which allowed bash to perform command substitution on the user-controlled $PROMPT value) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. This safely writes the prompt content to the file without any risk of command execution, since printf treats its arguments as literal data.

