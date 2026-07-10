<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.168

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **anthropics--claude-code-action/v1.0.168** was hardened automatically. 5 finding(s) were identified and resolved across 5 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The `run:` block in the 'agent-approval-check/action.yml' step directly interpolates `${{ github.action_path }}` inside the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:59`

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in `action.yml` directly interpolates `${{ steps.run.outputs.github_token }}` inside the `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The `steps.*.outputs.*` context is interpolated by the template engine before the shell executes, making this a script-injection risk.

Locations:

- `action.yml:392`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via env var `PATH_TO_BUN_EXECUTABLE`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A caller-controlled newline in the input value could inject arbitrary entries into GITHUB_PATH. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` (untrusted input).

Locations:

- `action.yml:230`
- `base-action/action.yml:139`

### github-env-injection (severity: high)

The 'Install Claude Code' step in `base-action/action.yml` writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable` via env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A caller-controlled newline in the input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in `base-action/action.yml` pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and also inside a `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). The script is fetched from a remote URL and executed without first downloading and verifying it.

Locations:

- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. script-injection (agent-approval-check/action.yml line 59): Moved `${{ github.action_path }}` out of the `run:` shell string into the step's `env:` block as `ACTION_PATH`, then referenced it as `$ACTION_PATH` in the shell command. Also merged the env blocks to avoid duplication.

2. script-injection (action.yml line 392 - 'Revoke app token'): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` shell string into the step's `env:` block as `APP_GITHUB_TOKEN`, then referenced it as `$APP_GITHUB_TOKEN` in the curl Authorization header.

3. github-env-injection (action.yml line 230 - 'Setup Custom Bun Path'): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. github-env-injection (base-action/action.yml line 139 - 'Setup Custom Bun Path'): Same fix as above - added sanitization before writing BUN_DIR to `$GITHUB_PATH`.

5. github-env-injection (base-action/action.yml line 175 - 'Install Claude Code'): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

6. unsafe-shell (base-action/action.yml line 163 - 'Install Claude Code'): Replaced `curl ... | bash` pattern with download-then-execute: script is downloaded to a temp file via `curl -fsSL ... -o "$INSTALL_SCRIPT"` and then executed separately as `bash "$INSTALL_SCRIPT"`. The temp file is cleaned up after use. Both the timeout and non-timeout code paths were fixed.

### Iteration 2

**Fixes applied:** unpinned-uses, script-injection, missing-permissions, unsafe-shell

**Notes:**

Fixed all four findings across multiple workflow files:

1. unpinned-uses: Pinned all tag-based action references to full commit SHAs:
   - actions/checkout@v6 → @df4cb1c069e1874edd31b4311f1884172cec0e10 # v6
   - oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6 # v2
   - oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7 # v1
   - anthropics/claude-code-action@v1 → @536f2c32a39763739000b0e1ac69ca2647d97ce9 # v1
   - anthropics/claude-code-action@main → @536f2c32a39763739000b0e1ac69ca2647d97ce9 # main
   Applied to: ci.yml, claude-review.yml, claude.yml, issue-triage.yml, release.yml

2. missing-permissions: Added 'permissions: contents: read' top-level block to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: blocks into env: blocks:
   - release.yml: Fixed 'Calculate next version', 'Display dry run info', 'Create and push tag', 'Create Release', 'Update major version tag' steps
   - sync-base-action.yml: Fixed 'Setup SSH' step (deploy key secret)
   - test-base-action.yml: Fixed 'Verify inline prompt output' and 'Verify prompt file output' steps
   - test-custom-executables.yml: Fixed 'Verify custom executables worked' step
   - test-structured-output.yml: Fixed 'Verify outputs' (4 jobs) and 'Verify execution file' steps

4. unsafe-shell: Fixed test-custom-executables.yml by downloading install scripts to temp files before executing:
   - curl ... https://bun.sh/install -o /tmp/bun-install.sh && bash /tmp/bun-install.sh
   - curl ... https://claude.ai/install.sh -o /tmp/claude-install.sh && bash /tmp/claude-install.sh latest

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all 6 script injection locations in .github/workflows/test-settings.yml across 4 run: blocks. Moved ${{ steps.inline-settings-test.outputs.execution_file }}, ${{ steps.inline-settings-test.outputs.conclusion }}, ${{ steps.file-settings-test.outputs.execution_file }}, and ${{ steps.file-settings-test.outputs.conclusion }} expressions from inline shell string interpolation into env: blocks on their respective steps. The shell scripts now reference these values as plain environment variables ($OUTPUT_FILE and $CONCLUSION), preventing script injection via shell metacharacters in step outputs.

### Iteration 4

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in the 'Generate Summary' step of the test-summary job in .github/workflows/test-structured-output.yml. Moved all ${{ needs.*.result }} expressions from the run: shell script into an env: block (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE). Replaced inline ${{ }} ternary expressions for pass/fail display with a shell helper function pass_or_fail() that reads the env vars. Replaced the multi-line ${{ }} ALL_PASSED assignment with a proper shell if/elif chain comparing the env vars directly.

### Iteration 5

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in '.github/workflows/test-base-action.yml' at the 'Create test prompt file' step. Replaced the unquoted heredoc (`cat > test-prompt.txt << EOF` / `${PROMPT}` / `EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc delimiter caused shell variable and command substitution on `${PROMPT}`, allowing an attacker to inject commands via the `test_prompt` workflow_dispatch input. The printf approach safely writes the env var value without any heredoc expansion.

