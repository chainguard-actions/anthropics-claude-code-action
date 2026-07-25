<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.182

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.182** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ }} expressions are interpolated directly inside run: shell command strings.

1. agent-approval-check/action.yml: `run: python "${{ github.action_path }}/agent_approval_check.py"` — github.action_path flows through YAML template substitution before the shell sees it.

2. action.yml (Revoke app token step): `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — steps.*.outputs.* interpolated directly into a curl -H argument.

3. release.yml (Calculate next version step): `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`

4. release.yml (Display dry run info step): `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, `${{ steps.get_latest_tag.outputs.latest_tag }}`

5. release.yml (Create and push tag step): `next_version="${{ steps.next_version.outputs.next_version }}"`

6. release.yml (Create Release step): `next_version="${{ steps.next_version.outputs.next_version }}"`

7. release.yml (Update major version tag step): `next_version="${{ needs.create-release.outputs.next_version }}"`

8. sync-base-action.yml (Setup SSH step): `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}"` — secret value interpolated directly into shell.

9. test-base-action.yml (Verify inline prompt output step): `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`

10. test-base-action.yml (Verify prompt file output step): same pattern with steps.prompt-file-test.outputs.*

11. test-custom-executables.yml (Verify custom executables worked step): `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`

12. test-settings.yml (Verify echo worked / Verify echo was denied steps): `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"`

13. test-structured-output.yml (Verify outputs steps): `OUTPUT='${{ steps.test.outputs.structured_output }}'`

Locations:

- `agent-approval-check/action.yml:57`
- `action.yml:370`
- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:64`
- `.github/workflows/release.yml:73`
- `.github/workflows/release.yml:100`
- `.github/workflows/sync-base-action.yml:22`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:90`
- `.github/workflows/test-custom-executables.yml:62`
- `.github/workflows/test-settings.yml:34`
- `.github/workflows/test-settings.yml:80`
- `.github/workflows/test-structured-output.yml:44`

### github-env-injection (severity: high)

Inputs-derived values are written to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r').

1. action.yml (Setup Custom Bun Path step): PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable; BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is then written to $GITHUB_PATH with no newline sanitization. An attacker-controlled input containing newlines could inject arbitrary entries into PATH.

2. base-action/action.yml (Setup Custom Bun Path step): identical pattern — BUN_DIR derived from inputs.path_to_bun_executable written to $GITHUB_PATH unsanitized.

3. base-action/action.yml (Install Claude Code step): CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") derived from inputs.path_to_claude_code_executable written to $GITHUB_PATH unsanitized.

Locations:

- `action.yml:162`
- `base-action/action.yml:100`
- `base-action/action.yml:128`

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tag or branch instead of a full 40-character commit SHA, making them vulnerable to supply-chain attacks.

ci.yml: actions/checkout@v6 (×3), oven-sh/setup-bun@v2 (×2), oven-sh/setup-bun@v1 (×1)
claude-review.yml: actions/checkout@v6, anthropics/claude-code-action@v1
claude.yml: actions/checkout@v6, anthropics/claude-code-action@main
issue-triage.yml: actions/checkout@v6, anthropics/claude-code-action@main
release.yml: actions/checkout@v6 (×3)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:23`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:35`
- `.github/workflows/ci.yml:37`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:18`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:22`
- `.github/workflows/release.yml:30`
- `.github/workflows/release.yml:88`
- `.github/workflows/release.yml:107`

### unsafe-shell (severity: high)

Remote content is fetched and piped directly to a shell interpreter without first saving to a file for inspection.

1. base-action/action.yml (Install Claude Code step): `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (two occurrences: one inside a timeout wrapper, one in the else branch). If the remote URL is compromised or redirected, arbitrary code executes on the runner.

2. .github/workflows/test-custom-executables.yml (Install Bun manually step): `curl -fsSL https://bun.sh/install | bash`

3. .github/workflows/test-custom-executables.yml (Install Claude Code manually step): `curl -fsSL https://claude.ai/install.sh | bash -s latest`

Locations:

- `base-action/action.yml:116`
- `base-action/action.yml:118`
- `.github/workflows/test-custom-executables.yml:18`
- `.github/workflows/test-custom-executables.yml:27`

### permissions (severity: medium)

missing-permissions: .github/workflows/ci.yml has no top-level permissions: key and none of its three jobs (test, prettier, typecheck) define a job-level permissions: block. Without explicit permissions, the workflow inherits the repository default, which may be overly broad (e.g., write access to contents).

Locations:

- `.github/workflows/ci.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unpinned-uses, unsafe-shell, permissions

**Notes:**

Fixed all 5 security findings across 10 files:

1. script-injection: Moved all ${{ }} expressions from run: shell strings into env: blocks across agent-approval-check/action.yml, action.yml, release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml.

2. github-env-injection: Added printf '%s' ... | tr -d '\n\r' sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in action.yml and base-action/action.yml.

3. unpinned-uses: Pinned all mutable tag/branch references to full 40-char commit SHAs in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. SHAs: actions/checkout@v6=d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2=0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1=f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1/main=be7b93b1907a4abad570368f3c74b6fe3807510b.

4. unsafe-shell: Replaced curl|bash patterns with download-to-tempfile-then-execute in base-action/action.yml (Install Claude Code step) and test-custom-executables.yml (Install Bun manually and Install Claude Code manually steps).

5. permissions: Added top-level `permissions: contents: read` to ci.yml which had no permissions block.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed all three findings:

1. script-injection (examples/test-failure-analysis.yml lines 60, 79, 97): Moved ${{ steps.detect.outputs.structured_output }} to STRUCTURED_OUTPUT env var in all three affected steps ('Retry flaky tests', 'Low confidence detection', 'Comment on PR'). Also moved ${{ github.event.workflow_run.html_url }} to WORKFLOW_RUN_URL env var. run: blocks now use plain shell variable references.

2. script-injection (.github/workflows/test-structured-output.yml line 196): Moved all five ${{ needs.*.result }} expressions to env: variables (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE). Replaced the inline ${{ ... }} ALL_PASSED assignment with pure shell conditionals.

3. unpinned-uses: Pinned all mutable action references to full 40-character SHA commits across 12 files: actions/checkout@v4→11d5960a, actions/checkout@v6→d23441a4, actions/github-script@v7→f28e40c7, anthropics/claude-code-action@v1/main→be7b93b1, anthropics/claude-code-action/agent-approval-check@main→be7b93b1, anthropics/claude-code-base-action@beta→e8132bc5. All SHAs were resolved using lookup_action_sha and preserved with inline tag comments.

