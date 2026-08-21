<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.198

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.198** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks.

- ci.yml: `uses: actions/checkout@v6`, `uses: oven-sh/setup-bun@v2`, `uses: oven-sh/setup-bun@v1` (with `bun-version: latest`)
- claude-review.yml: `uses: actions/checkout@v6`, `uses: anthropics/claude-code-action@v1`
- claude.yml: `uses: actions/checkout@v6`, `uses: anthropics/claude-code-action@main`
- issue-triage.yml: `uses: actions/checkout@v6`, `uses: anthropics/claude-code-action@main`
- release.yml: `uses: actions/checkout@v6` (two jobs)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:26`
- `.github/workflows/claude-review.yml:16`
- `.github/workflows/claude-review.yml:21`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:29`
- `.github/workflows/issue-triage.yml:19`
- `.github/workflows/issue-triage.yml:23`
- `.github/workflows/release.yml:38`
- `.github/workflows/release.yml:68`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level permissions. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple run: blocks directly interpolate ${{ ... }} expressions into shell commands (sub-rule a), allowing expression values to be parsed as shell syntax before quoting can protect them.

**sync-base-action.yml** (~line 27): `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` — secret value interpolated directly into shell.

**release.yml** (~lines 47, 57, 72, 76, 80, 100): `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`, `next_version="${{ steps.next_version.outputs.next_version }}"`, `echo "From commit: ${{ github.sha }}"`, `next_version="${{ needs.create-release.outputs.next_version }}"` — steps/needs/github context values interpolated directly into run blocks.

**action.yml** (~line 450): `curl ... -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — steps output interpolated directly into shell.

**test-base-action.yml** (~lines 43, 44, 95, 96): `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`, `OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.prompt-file-test.outputs.conclusion }}"`.

**test-custom-executables.yml** (~lines 68, 69): `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`.

**test-settings.yml** (~lines 37, 38, 73, 107, 108, 143): `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"`, `OUTPUT_FILE="${{ steps.file-settings-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.file-settings-test.outputs.conclusion }}"`.

**test-structured-output.yml** (~lines 51, 113, 175, 237, 285, 330–336): `OUTPUT='${{ steps.test.outputs.structured_output }}'`, `FILE="${{ steps.test.outputs.execution_file }}"`, `${{ needs.test-*.result == 'success' && '...' || '...' }}` written to GITHUB_STEP_SUMMARY, `ALL_PASSED=${{ needs.*.result == 'success' && ... }}`.

All of these are sub-rule (a) violations: any `${{ ... }}` directly inside a run: shell command string.

Locations:

- `.github/workflows/sync-base-action.yml:27`
- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:76`
- `.github/workflows/release.yml:80`
- `.github/workflows/release.yml:100`
- `action.yml:450`
- `.github/workflows/test-base-action.yml:43`
- `.github/workflows/test-base-action.yml:44`
- `.github/workflows/test-base-action.yml:95`
- `.github/workflows/test-base-action.yml:96`
- `.github/workflows/test-custom-executables.yml:68`
- `.github/workflows/test-custom-executables.yml:69`
- `.github/workflows/test-settings.yml:37`
- `.github/workflows/test-settings.yml:38`
- `.github/workflows/test-settings.yml:73`
- `.github/workflows/test-settings.yml:107`
- `.github/workflows/test-settings.yml:108`
- `.github/workflows/test-settings.yml:143`
- `.github/workflows/test-structured-output.yml:51`
- `.github/workflows/test-structured-output.yml:113`
- `.github/workflows/test-structured-output.yml:175`
- `.github/workflows/test-structured-output.yml:237`
- `.github/workflows/test-structured-output.yml:285`
- `.github/workflows/test-structured-output.yml:330`

### unsafe-shell (severity: high)

Remote content is piped directly to a shell interpreter without first downloading to a file for inspection.

**base-action/action.yml** (~line 155): `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` — the install script is fetched and executed in one pipeline. Also inside a `bash -c` wrapper: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

**test-custom-executables.yml** (~line 23): `curl -fsSL https://bun.sh/install | bash` — Bun installer piped directly to bash.

**test-custom-executables.yml** (~line 33): `curl -fsSL https://claude.ai/install.sh | bash -s latest` — Claude installer piped directly to bash.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:158`
- `.github/workflows/test-custom-executables.yml:23`
- `.github/workflows/test-custom-executables.yml:33`

### github-env-injection (severity: high)

Two composite action steps write values derived from `inputs.*` to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

**action.yml — "Setup Custom Bun Path" step** (~line 215): `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` in the env: block, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH`. No newline sanitization is applied before the write.

**base-action/action.yml — "Setup Custom Bun Path" step** (~line 130): Same pattern — `PATH_TO_BUN_EXECUTABLE: ${{ inputs.path_to_bun_executable }}` → `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` → `echo "$BUN_DIR" >> "$GITHUB_PATH"` without sanitization.

**base-action/action.yml — "Install Claude Code" step** (~line 155): `PATH_TO_CLAUDE_CODE_EXECUTABLE: ${{ inputs.path_to_claude_code_executable }}` → `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` → `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

A calling workflow can supply a newline-containing path to inject arbitrary environment variables or PATH entries.

Locations:

- `action.yml:215`
- `base-action/action.yml:130`
- `base-action/action.yml:165`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all action references to full SHAs in ci.yml (actions/checkout@v6→SHA, oven-sh/setup-bun@v2→SHA, oven-sh/setup-bun@v1→SHA), claude-review.yml (checkout@v6, anthropics/claude-code-action@v1), claude.yml (checkout@v6, claude-code-action@main), issue-triage.yml (checkout@v6, claude-code-action@main), and release.yml (two checkout@v6 references).

2. missing-permissions: Added `permissions: contents: read` top-level block to ci.yml.

3. script-injection: Moved all ${{ }} expressions out of run: shell strings into env: blocks in sync-base-action.yml (deploy key secret), release.yml (steps outputs, github.sha, needs outputs), action.yml (steps.run.outputs.github_token in Revoke app token step), test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml. The test-structured-output.yml summary step was rewritten to use pure shell conditionals instead of ${{ }} ternary expressions.

4. unsafe-shell: Fixed base-action/action.yml Install Claude Code step by downloading the install script to a temp file first, then executing it (removing the curl|bash pipe). Also fixed test-custom-executables.yml for both the Bun and Claude installers. Dropped the '--' separator from the Claude installer invocation as required (it was the shell's option terminator, not the script's).

5. github-env-injection: Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR to $GITHUB_PATH in action.yml and base-action/action.yml, and before writing CLAUDE_DIR to $GITHUB_PATH in base-action/action.yml.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml line 55: moved `${{ github.action_path }}` out of the `run:` shell command string and into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now references it as `"$ACTION_PATH/agent_approval_check.py"` instead of `"${{ github.action_path }}/agent_approval_check.py"`.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Create test prompt file' step in .github/workflows/test-base-action.yml. Replaced the unquoted heredoc (`<< EOF` with `${PROMPT}` inside) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The `printf '%s\n'` form treats its argument as a literal string, so any `$(...)` or backtick expressions inside the PROMPT value are never executed by the shell. The PROMPT env var (sourced from `github.event.inputs.test_prompt`) is still safely expanded as a shell variable, preserving the intended behavior.

