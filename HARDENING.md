<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.178

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.178** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Multiple workflow run: blocks directly interpolate ${{ ... }} expressions without routing through env: variables first.

• .github/workflows/release.yml — 'Calculate next version' step: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` directly in run:; 'Display dry run info' step: `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, `${{ steps.get_latest_tag.outputs.latest_tag }}` directly in run:; 'Create and push tag' step: `next_version="${{ steps.next_version.outputs.next_version }}"` directly in run:; 'Create Release' step: same; 'Update major version tag' step: `next_version="${{ needs.create-release.outputs.next_version }}"` directly in run:.

• .github/workflows/test-base-action.yml — 'Verify inline prompt output' step: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"` directly in run:; same pattern for 'Verify prompt file output' step with steps.prompt-file-test.outputs.*.

• .github/workflows/test-structured-output.yml — Multiple 'Verify outputs' steps: `OUTPUT='${{ steps.test.outputs.structured_output }}'` directly in run:; 'Verify execution file' step: `FILE="${{ steps.test.outputs.execution_file }}"` directly in run:; 'Generate Summary' step: `${{ needs.test-basic-types.result == 'success' && ... }}` and `ALL_PASSED=${{ needs.*.result ... }}` directly in run:.

• .github/workflows/test-custom-executables.yml — 'Verify custom executables worked' step: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` directly in run:.

• .github/workflows/test-settings.yml — Multiple verify steps: `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"`, `OUTPUT_FILE="${{ steps.file-settings-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.file-settings-test.outputs.conclusion }}"` directly in run: blocks.

• action.yml — 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly in run:.

• agent-approval-check/action.yml — `run: python "${{ github.action_path }}/agent_approval_check.py"` directly in run:.

Locations:

- `.github/workflows/release.yml:46`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:64`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:95`
- `.github/workflows/test-base-action.yml:37`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:84`
- `.github/workflows/test-base-action.yml:85`
- `.github/workflows/test-structured-output.yml:48`
- `.github/workflows/test-structured-output.yml:262`
- `.github/workflows/test-custom-executables.yml:62`
- `.github/workflows/test-custom-executables.yml:63`
- `.github/workflows/test-settings.yml:34`
- `.github/workflows/test-settings.yml:35`
- `action.yml:395`
- `agent-approval-check/action.yml:48`

### github-env-injection (severity: high)

Multiple composite action steps write values derived from untrusted inputs to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r').

• action.yml 'Setup Custom Bun Path' step: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable.

• base-action/action.yml 'Setup Custom Bun Path' step: same pattern — `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable.

• base-action/action.yml 'Install Claude Code' step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. PATH_TO_CLAUDE_CODE_EXECUTABLE is set from inputs.path_to_claude_code_executable.

An attacker controlling these inputs can inject newlines to write arbitrary entries to GITHUB_PATH, hijacking PATH resolution for subsequent steps.

Locations:

- `action.yml:228`
- `base-action/action.yml:131`
- `base-action/action.yml:163`

### unsafe-shell (severity: high)

Remote content is piped directly to a shell interpreter without first downloading to a file for inspection.

• .github/workflows/test-custom-executables.yml 'Install Bun manually' step: `curl -fsSL https://bun.sh/install | bash`
• .github/workflows/test-custom-executables.yml 'Install Claude Code manually' step: `curl -fsSL https://claude.ai/install.sh | bash -s latest`
• base-action/action.yml 'Install Claude Code' step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (also inside a `timeout ... bash -c "curl ... | bash -s -- $CLAUDE_CODE_VERSION"`)

If the remote server is compromised or the URL is redirected, arbitrary code executes on the runner.

Locations:

- `.github/workflows/test-custom-executables.yml:20`
- `.github/workflows/test-custom-executables.yml:30`
- `base-action/action.yml:145`

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tag or branch names instead of full 40-character commit SHAs, making them vulnerable to supply-chain attacks if the tag is moved.

• .github/workflows/ci.yml: `actions/checkout@v6`, `oven-sh/setup-bun@v2`, `oven-sh/setup-bun@v1`
• .github/workflows/claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
• .github/workflows/claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
• .github/workflows/issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
• .github/workflows/release.yml: `actions/checkout@v6` (in both create-release and update-major-tag jobs)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:26`
- `.github/workflows/ci.yml:40`
- `.github/workflows/ci.yml:43`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:20`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:30`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:24`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:82`

### missing-permissions (severity: medium)

.github/workflows/ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define a job-level `permissions:` block. Without explicit permissions, the workflow inherits the default token permissions from the repository or organization settings, which may be overly broad (e.g., write access to contents and pull-requests).

Locations:

- `.github/workflows/ci.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell, unpinned-uses, missing-permissions

**Notes:**

Fixed all 5 security findings across 10 files:

1. script-injection: Moved all ${{ }} expressions from run: blocks to env: blocks in action.yml (Revoke app token), agent-approval-check/action.yml (github.action_path), release.yml (5 steps), test-base-action.yml (2 steps), test-custom-executables.yml (1 step), test-structured-output.yml (6 steps including Generate Summary which was rewritten using shell conditionals), and test-settings.yml (4 steps).

2. github-env-injection: Replaced bare `echo "$DIR" >> "$GITHUB_PATH"` with `printf '%s' "$DIR" | tr -d '\n\r' >> "$GITHUB_PATH"; echo >> "$GITHUB_PATH"` in action.yml (Setup Custom Bun Path), base-action/action.yml (Setup Custom Bun Path and Install Claude Code).

3. unsafe-shell: Replaced all curl|bash patterns with download-to-tempfile-then-execute in base-action/action.yml (Install Claude Code, both timeout and non-timeout paths) and test-custom-executables.yml (Install Bun manually, Install Claude Code manually). Dropped '--' from the converted commands as required.

4. unpinned-uses: Pinned all 13 mutable action references across ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml to full 40-character commit SHAs.

5. missing-permissions: Added `permissions: contents: read` top-level block to ci.yml.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

1. sync-base-action.yml (line 30): Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` out of the inline `run:` shell string into an `env:` block as `DEPLOY_KEY`, then referenced it as `"$DEPLOY_KEY"` in the shell script to prevent shell metacharacter injection. 2. release.yml (line 59): Added newline sanitization before writing `next_version` to `$GITHUB_OUTPUT`. The value is now sanitized with `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` before the `echo "next_version=$safe_next_version" >> "$GITHUB_OUTPUT"` write, preventing newline injection via malicious git tag names.

