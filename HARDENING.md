<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **anthropics--claude-code-action/v1** was hardened automatically. 4 finding(s) were identified and resolved across 5 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string. The `steps.*.outputs.*` context is a workflow-controllable value that flows through YAML template substitution before the shell sees it, making this a script injection risk. The offending line: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:490`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. An attacker-controlled input containing newlines can inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:237`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps `inputs.path_to_claude_code_executable` into `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. An attacker-controlled input containing newlines can inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This executes whatever the remote server returns without first downloading and verifying the script. Both the `timeout`-wrapped form and the fallback form are affected.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:154`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all four findings: (1) script-injection in action.yml 'Revoke app token' step - moved ${{ steps.run.outputs.github_token }} to env: block as APP_TOKEN; (2) github-env-injection in action.yml 'Setup Custom Bun Path' - added printf/tr sanitization before writing BUN_DIR to GITHUB_PATH; (3) github-env-injection in base-action/action.yml 'Setup Custom Bun Path' and 'Install Claude Code' steps - added printf/tr sanitization before writing BUN_DIR and CLAUDE_DIR to GITHUB_PATH; (4) unsafe-shell in base-action/action.yml 'Install Claude Code' - replaced curl|bash pipe with download-to-tempfile then execute pattern, with cleanup.

### Iteration 2

**Fixes applied:** unpinned-uses, permissions, script-injection, unsafe-shell

**Notes:**

Fixed all four findings:

1. unpinned-uses: Pinned all tag-based action references to full commit SHAs:
   - actions/checkout@v6 → @df4cb1c069e1874edd31b4311f1884172cec0e10 # v6
   - oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6 # v2
   - oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7 # v1
   - anthropics/claude-code-action@main → @37b464ce72700f7b2c5ff8d2db7fa7b15df792f5 # main
   - anthropics/claude-code-action@v1 → @37b464ce72700f7b2c5ff8d2db7fa7b15df792f5 # v1
   Applied to: ci.yml, claude.yml, claude-review.yml, issue-triage.yml, release.yml

2. permissions: Added top-level `permissions: contents: read` block to ci.yml (minimum needed for checkout-only jobs)

3. script-injection: Moved all ${{ }} expressions from run: shell strings to env: blocks:
   - release.yml: Fixed 5 steps (Calculate next version, Display dry run info, Create and push tag, Create Release, Update major version tag)
   - test-base-action.yml: Fixed 2 steps (Verify inline prompt output, Verify prompt file output)
   - test-structured-output.yml: Fixed 5 steps (Verify outputs, Verify JSON stringification, Verify edge cases, Verify sanitized names work, Verify execution file contains structured_output)
   - test-custom-executables.yml: Fixed 1 step (Verify custom executables worked)

4. unsafe-shell: Fixed both curl-pipe-to-bash patterns in test-custom-executables.yml:
   - `curl -fsSL https://bun.sh/install | bash` → download to /tmp/bun-install.sh then `bash /tmp/bun-install.sh`
   - `curl -fsSL https://claude.ai/install.sh | bash -s latest` → download to /tmp/claude-install.sh then `bash /tmp/claude-install.sh latest`

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all four script-injection findings:
1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` to env var ACTION_PATH, updated run command to use `$ACTION_PATH/agent_approval_check.py`.
2. .github/workflows/sync-base-action.yml: Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` to env var DEPLOY_KEY, updated run command to use `$DEPLOY_KEY`.
3. .github/workflows/test-settings.yml: Moved all four `${{ steps.inline-settings-test.outputs.* }}` and `${{ steps.file-settings-test.outputs.* }}` expressions to env: blocks (OUTPUT_FILE and CONCLUSION) in their respective verify steps.
4. .github/workflows/test-structured-output.yml: Moved all five `${{ needs.*.result }}` expressions to env: variables (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE) and rewrote the shell logic to use those env vars with a pass_or_fail helper function.

### Iteration 4

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Create test prompt file' step in .github/workflows/test-base-action.yml. Replaced the unquoted heredoc (`cat > test-prompt.txt << EOF ... ${PROMPT} ... EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The PROMPT env var (sourced from the workflow_dispatch user-controlled input) is kept in the `env:` block and referenced as a double-quoted shell variable, preventing any shell interpretation of attacker-controlled content.

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Calculate next version' step in .github/workflows/release.yml. Added sanitization of the next_version value before writing to $GITHUB_OUTPUT: `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` and then used `$safe_next_version` in the echo to $GITHUB_OUTPUT. Also quoted $GITHUB_OUTPUT for best practice.

