<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.177

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.177** was hardened automatically. 14 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell commands. In the Revoke app token step, steps.run.outputs.github_token is interpolated directly into a curl command header. The steps.*.outputs.* context flows through YAML template substitution before the shell sees it, enabling script injection.

Locations:

- `action.yml:22785`

### script-injection (severity: high)

Sub-rule (a): Multiple direct ${{ }} expression interpolations inside run: shell commands in release.yml. Steps affected: Calculate next version uses steps.get_latest_tag.outputs.latest_tag directly; Display dry run info uses steps.next_version.outputs.next_version, github.sha, and steps.get_latest_tag.outputs.latest_tag; Create and push tag uses steps.next_version.outputs.next_version; Create Release uses steps.next_version.outputs.next_version; Update major version tag uses needs.create-release.outputs.next_version. All of steps.*.outputs.*, needs.*.outputs.*, and github.* are untrusted-input sources.

Locations:

- `.github/workflows/release.yml:37`
- `.github/workflows/release.yml:52`
- `.github/workflows/release.yml:58`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:68`
- `.github/workflows/release.yml:79`
- `.github/workflows/release.yml:96`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside a run: shell command in sync-base-action.yml. The Setup SSH and clone target repository step writes secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY directly into a shell heredoc via echo. Any ${{ }} expression in a run: block is a script-injection finding.

Locations:

- `.github/workflows/sync-base-action.yml:26`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell commands in test-base-action.yml. The Verify inline prompt output step uses steps.inline-test.outputs.execution_file and steps.inline-test.outputs.conclusion directly in shell variable assignments. The Verify prompt file output step uses steps.prompt-file-test.outputs.execution_file and steps.prompt-file-test.outputs.conclusion directly. steps.*.outputs.* is an untrusted-input source.

Locations:

- `.github/workflows/test-base-action.yml:35`
- `.github/workflows/test-base-action.yml:36`
- `.github/workflows/test-base-action.yml:79`
- `.github/workflows/test-base-action.yml:80`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell commands in test-custom-executables.yml. The Verify custom executables worked step uses steps.custom-test.outputs.execution_file and steps.custom-test.outputs.conclusion directly in shell variable assignments. steps.*.outputs.* is an untrusted-input source.

Locations:

- `.github/workflows/test-custom-executables.yml:68`
- `.github/workflows/test-custom-executables.yml:69`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell commands in test-structured-output.yml. Multiple Verify steps use steps.test.outputs.structured_output and steps.test.outputs.execution_file directly in shell variable assignments (e.g., OUTPUT='${{ steps.test.outputs.structured_output }}'). The Generate Summary step uses needs.test-basic-types.result and similar needs.*.result expressions directly in echo commands. steps.*.outputs.* and needs.*.outputs.* are untrusted-input sources.

Locations:

- `.github/workflows/test-structured-output.yml:47`
- `.github/workflows/test-structured-output.yml:116`
- `.github/workflows/test-structured-output.yml:175`
- `.github/workflows/test-structured-output.yml:234`
- `.github/workflows/test-structured-output.yml:265`
- `.github/workflows/test-structured-output.yml:289`

### unpinned-uses (severity: high)

Multiple unpinned uses: references using mutable tags instead of full 40-character SHA digests. Failing references: actions/checkout@v6 (all three jobs), oven-sh/setup-bun@v2 (test and typecheck jobs), oven-sh/setup-bun@v1 (prettier job).

Locations:

- `.github/workflows/ci.yml:8`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:36`
- `.github/workflows/ci.yml:39`

### unpinned-uses (severity: high)

Multiple unpinned uses: references using mutable tags. Failing references: actions/checkout@v6 and anthropics/claude-code-action@v1 (a mutable version tag, not a SHA).

Locations:

- `.github/workflows/claude-review.yml:12`
- `.github/workflows/claude-review.yml:16`

### unpinned-uses (severity: high)

Multiple unpinned uses: references using mutable tags/branches. Failing references: actions/checkout@v6 and anthropics/claude-code-action@main (a mutable branch name).

Locations:

- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`

### unpinned-uses (severity: high)

Multiple unpinned uses: references using mutable tags/branches. Failing references: actions/checkout@v6 and anthropics/claude-code-action@main (a mutable branch name).

Locations:

- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:22`

### unpinned-uses (severity: high)

Unpinned uses: references using mutable version tags. Failing references: actions/checkout@v6 appears in both the create-release and update-major-tag jobs.

Locations:

- `.github/workflows/release.yml:35`
- `.github/workflows/release.yml:89`

### permissions (severity: medium)

missing-permissions: The workflow file has no top-level permissions: key and none of its three jobs (test, prettier, typecheck) have a job-level permissions: block. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions.

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote content is piped directly to a shell interpreter without first downloading to a file. Two occurrences: (1) curl -fsSL https://bun.sh/install | bash installs Bun by piping the install script directly to bash; (2) curl -fsSL https://claude.ai/install.sh | bash -s latest installs Claude Code by piping the install script directly to bash. If the remote server is compromised or the URL is intercepted, arbitrary code executes on the runner.

Locations:

- `.github/workflows/test-custom-executables.yml:18`
- `.github/workflows/test-custom-executables.yml:27`

### unsafe-shell (severity: high)

Remote content is piped directly to a shell interpreter without first downloading to a file. The Install Claude Code step uses curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION (and a variant inside a bash -c subshell with timeout). If the remote server is compromised or the URL is intercepted, arbitrary code executes on the runner.

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:134`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, permissions, unsafe-shell

**Notes:**

Fixed all 14 findings across 9 files:

1. action.yml: Moved steps.run.outputs.github_token to env block in Revoke app token step.

2. .github/workflows/release.yml: Pinned actions/checkout@v6 to SHA d23441a48e516b6c34aea4fa41551a30e30af803 in both jobs. Moved all ${{ steps.*.outputs.* }}, ${{ needs.*.outputs.* }}, and ${{ github.sha }} expressions to env: blocks in Calculate next version, Display dry run info, Create and push tag, Create Release, and Update major version tag steps.

3. .github/workflows/sync-base-action.yml: Moved ${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }} to env: block as DEPLOY_KEY.

4. .github/workflows/test-base-action.yml: Moved steps.inline-test.outputs.* and steps.prompt-file-test.outputs.* to env: blocks in both Verify steps.

5. .github/workflows/test-custom-executables.yml: Moved steps.custom-test.outputs.* to env: block. Fixed two curl|bash patterns by downloading scripts to temp files first.

6. .github/workflows/test-structured-output.yml: Moved steps.test.outputs.structured_output to env: blocks in 4 Verify steps; moved steps.test.outputs.execution_file to env: block; moved all needs.*.result expressions to env: block in Generate Summary step and rewrote shell logic to use env vars.

7. .github/workflows/ci.yml: Pinned actions/checkout@v6 to SHA d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 to SHA 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 to SHA f4d14e03ff726c06358e5557344e1da148b56cf7. Added permissions: contents: read at top level.

8. .github/workflows/claude-review.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@v1 to full SHAs.

9. .github/workflows/claude.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

10. .github/workflows/issue-triage.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

11. base-action/action.yml: Fixed two curl|bash patterns (timeout variant and fallback) by downloading install script to /tmp/claude-install.sh first, then executing separately.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

Fixed 3 findings across 3 files:
1. agent-approval-check/action.yml: Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` to eliminate script-injection risk from template interpolation in run: blocks.
2. action.yml (Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and used `$safe_bun_dir` when writing to $GITHUB_PATH to prevent newline injection.
3. base-action/action.yml (Setup Custom Bun Path step, line 136): Same BUN_DIR sanitization fix. (Install Claude Code step, line 163): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and used `$safe_claude_dir` when writing to $GITHUB_PATH.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all 6 script injection locations in .github/workflows/test-settings.yml. In all four affected steps ('Verify echo worked' in test-settings-inline-allow, 'Verify echo was denied' in test-settings-inline-deny, 'Verify echo worked' in test-settings-file-allow, and 'Verify echo was denied' in test-settings-file-deny), the ${{ steps.*.outputs.execution_file }} and ${{ steps.*.outputs.conclusion }} expressions were moved from inline shell variable assignments in the run: block to the step's env: block. The shell scripts now reference these values as plain environment variables ($OUTPUT_FILE, $CONCLUSION) instead of directly interpolating workflow expressions.

