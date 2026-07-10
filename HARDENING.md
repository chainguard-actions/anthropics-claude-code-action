<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.166

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **anthropics--claude-code-action/v1.0.166** was hardened automatically. 5 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds ${{ github.action_path }} directly in the shell command string. Any ${{ ... }} expression in a run: block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:56`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command. In the 'Revoke app token' step of action.yml, the line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` embeds a steps output expression directly in the shell command string, allowing injection via the output value.

Locations:

- `action.yml:408`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes a value derived from inputs.path_to_bun_executable (an untrusted input) to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is written via `echo "$BUN_DIR" >> "$GITHUB_PATH"` with no `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `action.yml:218`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes a value derived from inputs.path_to_bun_executable (an untrusted input) to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is written via `echo "$BUN_DIR" >> "$GITHUB_PATH"` with no sanitization. Additionally, the 'Install Claude Code' step writes CLAUDE_DIR (derived from inputs.path_to_claude_code_executable) to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

Locations:

- `base-action/action.yml:118`
- `base-action/action.yml:140`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes remotely-fetched content without first downloading and verifying it. The pattern appears twice (once inside a timeout wrapper and once in the else branch).

Locations:

- `base-action/action.yml:136`
- `base-action/action.yml:138`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved ${{ github.action_path }} out of the run: shell command into the step's env: block as ACTION_PATH, merged with the existing env vars into a single env: block.

2. action.yml (script-injection, Revoke app token step): Moved ${{ steps.run.outputs.github_token }} into an env: block as APP_GITHUB_TOKEN, referenced as $APP_GITHUB_TOKEN in the curl command.

3. action.yml (github-env-injection, Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path step): Same sanitization pattern for BUN_DIR.

5. base-action/action.yml (github-env-injection + unsafe-shell, Install Claude Code step): (a) Replaced both `curl ... | bash` patterns with download-to-tempfile then execute: `curl -fsSL -o "$INSTALL_SCRIPT" ... && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. (b) Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing CLAUDE_DIR to $GITHUB_PATH.

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell

**Notes:**

Fixed all findings: (1) Pinned all unpinned action references to full SHAs: actions/checkout@v6 → @df4cb1c069e1874edd31b4311f1884172cec0e10, oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → @536f2c32a39763739000b0e1ac69ca2647d97ce9. (2) Added top-level 'permissions: contents: read' block to ci.yml. (3) Fixed script injection in release.yml (moved steps outputs and github.sha to env blocks), sync-base-action.yml (moved secret to env block using printf), test-base-action.yml (moved execution_file and conclusion to env blocks), test-settings.yml (moved execution_file and conclusion to env blocks for all 4 verify steps), test-structured-output.yml (moved structured_output and execution_file to env blocks for all 5 verify steps), and test-custom-executables.yml (moved execution_file and conclusion to env block). (4) Fixed unsafe-shell in test-custom-executables.yml by replacing 'curl | bash' patterns with download-to-file-then-execute patterns.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in `.github/workflows/test-structured-output.yml` in the `test-summary` job's `Generate Summary` step. Moved all five `${{ needs.*.result }}` expressions out of the `run:` block into an `env:` block as RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, and RESULT_EXECUTION_FILE. Replaced inline `${{ ... && '✅ PASS' || '❌ FAIL' }}` ternary expressions with a `pass_or_fail()` shell function, and replaced the multi-line `ALL_PASSED=${{ ... }}` template expression with a proper shell `if` statement comparing each result variable against 'success'.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection vulnerability in the 'Create test prompt file' step of the test-prompt-file job in .github/workflows/test-base-action.yml. The original code used an unquoted heredoc (`<< EOF`) which allowed shell variable expansion and command substitution when writing ${PROMPT} to the file. Replaced the heredoc with `printf '%s\n' "$PROMPT" > test-prompt.txt`, which safely writes the PROMPT environment variable to the file using proper double-quoting, eliminating the risk of command injection from user-controlled workflow_dispatch input.

