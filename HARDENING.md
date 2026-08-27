<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.207

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.207** was hardened automatically. 6 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. In `agent-approval-check/action.yml`, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Any ${{ ... }} expression inside a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. In the 'Revoke app token' step of `action.yml`, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly in the run: block. `steps.*.outputs.*` is an untrusted-input source and must not be interpolated directly into shell commands.

Locations:

- `action.yml:480`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (set from `inputs.path_to_bun_executable`) and written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled newline in the input value could inject arbitrary entries into PATH.

Locations:

- `action.yml:237`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (set from `inputs.path_to_bun_executable`) and written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled newline in the input value could inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:130`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (set from `inputs.path_to_claude_code_executable`) and written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled newline in the input value could inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step, remote content is piped directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever the remote server returns without first downloading and verifying the script. The script should be downloaded to a file, verified, and then executed separately.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 6 findings across 3 files:

1. **agent-approval-check/action.yml** (script-injection): Moved `${{ github.action_path }}` out of the `run:` shell command into the step's `env:` block as `ACTION_PATH`, then referenced it as `$ACTION_PATH` in the shell script.

2. **action.yml** (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` curl command into the step's `env:` block as `APP_TOKEN`, then referenced it as `$APP_TOKEN` in the shell script.

3. **action.yml** (github-env-injection, Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. **base-action/action.yml** (github-env-injection, Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

5. **base-action/action.yml** (github-env-injection, Install Claude Code step): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

6. **base-action/action.yml** (unsafe-shell, Install Claude Code step): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` with download-then-execute pattern: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped as required (it was the shell's option terminator, not the script's). The temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** unpinned-uses, permissions, script-injection, unsafe-shell

**Notes:**

Fixed all four findings across multiple workflow files:

1. unpinned-uses: Pinned all mutable action references to full SHA hashes in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6, oven-sh/setup-bun@v2, oven-sh/setup-bun@v1, anthropics/claude-code-action@v1, and anthropics/claude-code-action@main.

2. permissions: Added top-level `permissions: contents: read` block to ci.yml which had no permissions block.

3. script-injection: Moved all ${{ }} expressions from run: shell strings to env: blocks in release.yml (LATEST_TAG, NEXT_VERSION, COMMIT_SHA), sync-base-action.yml (DEPLOY_KEY), test-base-action.yml (OUTPUT_FILE, CONCLUSION), test-custom-executables.yml (OUTPUT_FILE, CONCLUSION), test-settings.yml (OUTPUT_FILE, CONCLUSION for all 4 verify steps), and test-structured-output.yml (OUTPUT for 4 structured_output steps, FILE for execution_file step).

4. unsafe-shell: Replaced both curl-pipe-to-bash patterns in test-custom-executables.yml with download-to-tempfile-then-execute patterns. For the claude.ai installer, dropped the shell's -s and -- option terminators (which were only needed for stdin piping) and passed 'latest' directly as a positional argument to the script.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in the 'Generate Summary' step of the test-summary job in .github/workflows/test-structured-output.yml. Moved all five ${{ needs.*.result }} expressions and the multi-condition ALL_PASSED ${{ }} expression from the run: shell block into the step's env: block as RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, and RESULT_EXECUTION_FILE environment variables. The run: block now uses shell functions for pass/fail labels and a multi-condition if statement instead of ${{ }} ternary expressions.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Create test prompt file' step in the 'test-prompt-file' job of .github/workflows/test-base-action.yml. Replaced the unquoted heredoc (`cat > test-prompt.txt << EOF` / `${PROMPT}` / `EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc allowed shell command substitution on attacker-controlled input; the printf form safely passes the env var value as a quoted argument with no expansion of its contents.

