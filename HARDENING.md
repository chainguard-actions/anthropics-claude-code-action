<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.195

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.195** was hardened automatically. 17 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): ${{ steps.run.outputs.github_token }} is interpolated directly inside a run: shell command string in the 'Revoke app token' step. A step output is a workflow-controllable context and must not be interpolated directly into shell commands.

Locations:

- `action.yml:399`

### script-injection (severity: high)

Rule (a): Multiple ${{ steps.*.outputs.* }} and ${{ needs.*.outputs.* }} expressions are interpolated directly inside run: shell command strings in release.yml. Specifically: 'Calculate next version' uses ${{ steps.get_latest_tag.outputs.latest_tag }}, 'Display dry run info' uses ${{ steps.next_version.outputs.next_version }} and ${{ steps.get_latest_tag.outputs.latest_tag }}, 'Create and push tag' uses ${{ steps.next_version.outputs.next_version }}, 'Create Release' uses ${{ steps.next_version.outputs.next_version }}, and 'Update major version tag' uses ${{ needs.create-release.outputs.next_version }}. These are workflow-controllable contexts that must not be interpolated directly into shell commands.

Locations:

- `.github/workflows/release.yml:42`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:80`
- `.github/workflows/release.yml:100`

### script-injection (severity: high)

Rule (a): ${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }} is interpolated directly inside a run: shell command string in the 'Setup SSH and clone target repository' step of sync-base-action.yml. Any ${{ }} expression in a run: block is a script-injection risk.

Locations:

- `.github/workflows/sync-base-action.yml:22`

### script-injection (severity: high)

Rule (a): ${{ steps.*.outputs.execution_file }} and ${{ steps.*.outputs.conclusion }} are interpolated directly inside run: shell command strings in test-base-action.yml ('Verify inline prompt output' and 'Verify prompt file output' steps). Step outputs are workflow-controllable contexts.

Locations:

- `.github/workflows/test-base-action.yml:44`
- `.github/workflows/test-base-action.yml:45`
- `.github/workflows/test-base-action.yml:88`
- `.github/workflows/test-base-action.yml:89`

### script-injection (severity: high)

Rule (a): ${{ steps.custom-test.outputs.execution_file }} and ${{ steps.custom-test.outputs.conclusion }} are interpolated directly inside a run: shell command string in the 'Verify custom executables worked' step of test-custom-executables.yml.

Locations:

- `.github/workflows/test-custom-executables.yml:62`
- `.github/workflows/test-custom-executables.yml:63`

### script-injection (severity: high)

Rule (a): ${{ steps.*.outputs.execution_file }}, ${{ steps.*.outputs.conclusion }}, and ${{ steps.*.outputs.execution_file }} are interpolated directly inside run: shell command strings in multiple 'Verify' steps of test-settings.yml.

Locations:

- `.github/workflows/test-settings.yml:44`
- `.github/workflows/test-settings.yml:45`
- `.github/workflows/test-settings.yml:88`
- `.github/workflows/test-settings.yml:130`
- `.github/workflows/test-settings.yml:131`
- `.github/workflows/test-settings.yml:175`

### script-injection (severity: high)

Rule (a): ${{ steps.test.outputs.structured_output }} is interpolated directly inside run: shell command strings in multiple 'Verify' steps of test-structured-output.yml (e.g. OUTPUT='${{ steps.test.outputs.structured_output }}'). Additionally, ${{ needs.*.result }} expressions are interpolated directly in the 'Generate Summary' run: block.

Locations:

- `.github/workflows/test-structured-output.yml:56`
- `.github/workflows/test-structured-output.yml:113`
- `.github/workflows/test-structured-output.yml:170`
- `.github/workflows/test-structured-output.yml:227`
- `.github/workflows/test-structured-output.yml:316`
- `.github/workflows/test-structured-output.yml:323`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step derives BUN_DIR from $PATH_TO_BUN_EXECUTABLE (which is set from inputs.path_to_bun_executable) and writes it to $GITHUB_PATH without sanitization (no printf '%s' ... | tr -d '\n\r' step). An attacker-controlled input containing newlines could inject arbitrary entries into PATH.

Locations:

- `action.yml:258`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml derives BUN_DIR from $PATH_TO_BUN_EXECUTABLE (inputs.path_to_bun_executable) and writes it to $GITHUB_PATH without sanitization. Additionally, the 'Install Claude Code' step derives CLAUDE_DIR from $PATH_TO_CLAUDE_CODE_EXECUTABLE (inputs.path_to_claude_code_executable) and writes it to $GITHUB_PATH without sanitization.

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:155`

### unpinned-uses (severity: high)

Multiple uses: references in ci.yml use mutable tag/version refs instead of full 40-character SHA commits: actions/checkout@v6 (3 times), oven-sh/setup-bun@v2 (2 times), oven-sh/setup-bun@v1 (1 time).

Locations:

- `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:13`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:34`
- `.github/workflows/ci.yml:37`

### unpinned-uses (severity: high)

claude-review.yml uses mutable tag/branch refs: actions/checkout@v6 and anthropics/claude-code-action@v1.

Locations:

- `.github/workflows/claude-review.yml:16`
- `.github/workflows/claude-review.yml:22`

### unpinned-uses (severity: high)

claude.yml uses mutable tag/branch refs: actions/checkout@v6 and anthropics/claude-code-action@main.

Locations:

- `.github/workflows/claude.yml:18`
- `.github/workflows/claude.yml:24`

### unpinned-uses (severity: high)

issue-triage.yml uses mutable tag/branch refs: actions/checkout@v6 and anthropics/claude-code-action@main.

Locations:

- `.github/workflows/issue-triage.yml:17`
- `.github/workflows/issue-triage.yml:23`

### unpinned-uses (severity: high)

release.yml uses mutable tag refs: actions/checkout@v6 appears multiple times (in create-release and update-major-tag jobs, and in commented-out code).

Locations:

- `.github/workflows/release.yml:35`
- `.github/workflows/release.yml:92`

### permissions (severity: medium)

ci.yml has no top-level permissions: key and none of its jobs (test, prettier, typecheck) define job-level permissions: blocks. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions.

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. The script is not downloaded and verified before execution.

Locations:

- `base-action/action.yml:143`
- `base-action/action.yml:145`

### unsafe-shell (severity: high)

test-custom-executables.yml pipes remote content directly to bash in two steps: 'Install Bun manually' uses `curl -fsSL https://bun.sh/install | bash` and 'Install Claude Code manually' uses `curl -fsSL https://claude.ai/install.sh | bash -s latest`.

Locations:

- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:30`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell, unpinned-uses, permissions

**Notes:**

Fixed all 17 findings across 9 files:

1. action.yml: Fixed script-injection in 'Revoke app token' (moved github_token to env block); fixed github-env-injection in 'Setup Custom Bun Path' (sanitized BUN_DIR with tr -d '\n\r').

2. base-action/action.yml: Fixed github-env-injection in 'Setup Custom Bun Path' (sanitized BUN_DIR); fixed unsafe-shell in 'Install Claude Code' (replaced curl|bash with download-then-execute using mktemp); fixed github-env-injection for CLAUDE_DIR (sanitized before writing to GITHUB_PATH).

3. .github/workflows/release.yml: Fixed script-injection in 5 steps by moving step/needs outputs to env: blocks; pinned actions/checkout@v6 to SHA d23441a48e516b6c34aea4fa41551a30e30af803 (including commented-out code).

4. .github/workflows/sync-base-action.yml: Fixed script-injection by moving deploy key secret to env: block.

5. .github/workflows/test-base-action.yml: Fixed script-injection in both verify steps by moving execution_file and conclusion outputs to env: blocks.

6. .github/workflows/test-custom-executables.yml: Fixed unsafe-shell for both curl|bash patterns (Bun and Claude installs) using mktemp; fixed script-injection in verify step.

7. .github/workflows/test-settings.yml: Fixed script-injection in all 4 verify steps by moving step outputs to env: blocks.

8. .github/workflows/test-structured-output.yml: Fixed script-injection in all 5 verify steps and Generate Summary step by moving expressions to env: blocks.

9. .github/workflows/ci.yml: Pinned actions/checkout@v6, oven-sh/setup-bun@v2, and oven-sh/setup-bun@v1 to full SHAs; added top-level permissions: contents: read.

10. .github/workflows/claude-review.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@v1 to full SHAs.

11. .github/workflows/claude.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

12. .github/workflows/issue-triage.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml line 57, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is automatically set by GitHub Actions to the same value as `github.action_path`, but using it avoids the YAML template engine interpolating the expression into the shell command string before the shell sees it, eliminating the script injection vector.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/.github/workflows/release.yml at line 73. Moved `${{ github.sha }}` from the run: shell command into the step's env: block as `COMMIT_SHA: ${{ github.sha }}`, and updated the echo command to reference `$COMMIT_SHA` instead of the direct template expression.

