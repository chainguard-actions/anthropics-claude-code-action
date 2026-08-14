<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.192

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.192** was hardened automatically. 17 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: blocks. In agent-approval-check/action.yml, `run: python "${{ github.action_path }}/agent_approval_check.py"` interpolates github.action_path directly into the shell command. In action.yml, the 'Revoke app token' step uses `${{ steps.run.outputs.github_token }}` directly inside a curl command. These allow YAML template substitution before the shell sees the value.

Locations:

- `agent-approval-check/action.yml:47`
- `action.yml:310`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: blocks in release.yml. Multiple steps interpolate step outputs directly into shell commands: 'Calculate next version' uses `${{ steps.get_latest_tag.outputs.latest_tag }}`, 'Display dry run info' uses `${{ steps.next_version.outputs.next_version }}` and `${{ github.sha }}`, 'Create and push tag' uses `${{ steps.next_version.outputs.next_version }}`, 'Create Release' uses `${{ steps.next_version.outputs.next_version }}`, and 'Update major version tag' uses `${{ needs.create-release.outputs.next_version }}`.

Locations:

- `.github/workflows/release.yml:42`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:74`
- `.github/workflows/release.yml:97`
- `.github/workflows/release.yml:113`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: blocks in sync-base-action.yml. The 'Setup SSH and clone target repository' step uses `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}"` directly in the shell script, interpolating the secret value via YAML template substitution before the shell processes it.

Locations:

- `.github/workflows/sync-base-action.yml:24`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: blocks in test-base-action.yml. 'Verify inline prompt output' uses `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`. 'Verify prompt file output' uses `OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.prompt-file-test.outputs.conclusion }}"`.

Locations:

- `.github/workflows/test-base-action.yml:37`
- `.github/workflows/test-base-action.yml:82`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: blocks in test-custom-executables.yml. The 'Verify custom executables worked' step uses `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` directly in the shell script.

Locations:

- `.github/workflows/test-custom-executables.yml:60`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: blocks in test-structured-output.yml. Multiple 'Verify outputs' steps use `OUTPUT='${{ steps.test.outputs.structured_output }}'` directly in shell scripts. The 'Generate Summary' step uses `${{ needs.test-basic-types.result == 'success' && '✅ PASS' || '❌ FAIL' }}` and similar expressions directly in echo commands.

Locations:

- `.github/workflows/test-structured-output.yml:47`
- `.github/workflows/test-structured-output.yml:108`
- `.github/workflows/test-structured-output.yml:168`
- `.github/workflows/test-structured-output.yml:228`
- `.github/workflows/test-structured-output.yml:290`

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: blocks in test-settings.yml. Multiple 'Verify' steps use `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"` directly in shell scripts.

Locations:

- `.github/workflows/test-settings.yml:36`
- `.github/workflows/test-settings.yml:80`
- `.github/workflows/test-settings.yml:120`
- `.github/workflows/test-settings.yml:165`

### github-env-injection (severity: high)

In action.yml, the 'Setup Custom Bun Path' step writes a value derived from `inputs.path_to_bun_executable` (an untrusted input) to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `action.yml:196`

### github-env-injection (severity: high)

In base-action/action.yml, two steps write values derived from untrusted inputs to $GITHUB_PATH without sanitization. (1) The 'Setup Custom Bun Path' step writes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` to $GITHUB_PATH, where PATH_TO_BUN_EXECUTABLE comes from `inputs.path_to_bun_executable`. (2) The 'Install Claude Code' step writes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` to $GITHUB_PATH, where PATH_TO_CLAUDE_CODE_EXECUTABLE comes from `inputs.path_to_claude_code_executable`. Neither write is preceded by the required `printf '%s' ... | tr -d '\n\r'` sanitization.

Locations:

- `base-action/action.yml:118`
- `base-action/action.yml:148`

### unpinned-uses (severity: high)

ci.yml uses multiple unpinned action references with mutable tags instead of full 40-character SHA digests: `actions/checkout@v6` (3 occurrences), `oven-sh/setup-bun@v2` (2 occurrences), `oven-sh/setup-bun@v1` (1 occurrence). These tags can be moved to point to different commits, enabling supply-chain attacks.

Locations:

- `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:26`
- `.github/workflows/ci.yml:36`
- `.github/workflows/ci.yml:38`

### unpinned-uses (severity: high)

claude-review.yml uses unpinned action references: `actions/checkout@v6` and `anthropics/claude-code-action@v1`. These mutable tags can be redirected to malicious commits.

Locations:

- `.github/workflows/claude-review.yml:13`
- `.github/workflows/claude-review.yml:18`

### unpinned-uses (severity: high)

claude.yml uses unpinned action references: `actions/checkout@v6` and `anthropics/claude-code-action@main`. Using `@main` is especially dangerous as it tracks the default branch and will automatically pick up any new commits pushed there.

Locations:

- `.github/workflows/claude.yml:19`
- `.github/workflows/claude.yml:24`

### unpinned-uses (severity: high)

issue-triage.yml uses unpinned action references: `actions/checkout@v6` and `anthropics/claude-code-action@main`. Using `@main` tracks the default branch and will automatically pick up any new commits.

Locations:

- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:23`

### unpinned-uses (severity: high)

release.yml uses unpinned action references: `actions/checkout@v6` appears in three separate jobs (create-release, update-major-tag, and the commented-out release-base-action job). These mutable tags can be redirected to malicious commits.

Locations:

- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:93`
- `.github/workflows/release.yml:116`

### permissions (severity: medium)

missing-permissions: ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level permissions. Without explicit permissions, the workflow inherits the default repository permissions, which may be overly broad (e.g., write access to contents on some repository configurations).

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

base-action/action.yml 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside a timeout wrapper). The script is fetched and executed in a single pipeline without first downloading and verifying it, allowing a compromised or MITM'd install.sh to execute arbitrary code.

Locations:

- `base-action/action.yml:133`
- `base-action/action.yml:136`

### unsafe-shell (severity: high)

test-custom-executables.yml pipes remote content directly to bash in two steps: (1) 'Install Bun manually' uses `curl -fsSL https://bun.sh/install | bash`, and (2) 'Install Claude Code manually' uses `curl -fsSL https://claude.ai/install.sh | bash -s latest`. Both fetch and execute remote scripts in a single pipeline without prior download or integrity verification.

Locations:

- `.github/workflows/test-custom-executables.yml:20`
- `.github/workflows/test-custom-executables.yml:29`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unpinned-uses, unsafe-shell, permissions

**Notes:**

Fixed all 18 security findings across 11 files:

1. script-injection (agent-approval-check/action.yml): Moved github.action_path to env block (ACTION_PATH)
2. script-injection (action.yml line 310): Moved steps.run.outputs.github_token to env block (APP_TOKEN) in Revoke app token step
3. script-injection (release.yml): Moved all step output expressions to env blocks for Calculate next version, Display dry run info, Create and push tag, Create Release, and Update major version tag steps
4. script-injection (sync-base-action.yml): Moved CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY secret to env block (DEPLOY_KEY)
5. script-injection (test-base-action.yml): Moved execution_file and conclusion outputs to env blocks for both verify steps
6. script-injection (test-custom-executables.yml): Moved execution_file and conclusion outputs to env block
7. script-injection (test-structured-output.yml): Moved structured_output to env blocks; rewrote Generate Summary step to use shell conditionals instead of inline ${{ }} expressions
8. script-injection (test-settings.yml): Moved execution_file and conclusion outputs to env blocks for all 4 verify steps
9. github-env-injection (action.yml): Added printf/tr sanitization before writing BUN_DIR to GITHUB_PATH
10. github-env-injection (base-action/action.yml): Added printf/tr sanitization before writing BUN_DIR and CLAUDE_DIR to GITHUB_PATH
11. unpinned-uses (ci.yml): Pinned actions/checkout@v6→d23441a..., oven-sh/setup-bun@v2→0c5077e..., oven-sh/setup-bun@v1→f4d14e0...
12. unpinned-uses (claude-review.yml): Pinned actions/checkout@v6→d23441a..., anthropics/claude-code-action@v1→e63208c...
13. unpinned-uses (claude.yml): Pinned actions/checkout@v6→d23441a..., anthropics/claude-code-action@main→e63208c...
14. unpinned-uses (issue-triage.yml): Pinned actions/checkout@v6→d23441a..., anthropics/claude-code-action@main→e63208c...
15. unpinned-uses (release.yml): Pinned all actions/checkout@v6→d23441a... references
16. unsafe-shell (base-action/action.yml): Replaced curl|bash with download-to-tempfile then execute pattern; dropped the '--' separator per instructions
17. unsafe-shell (test-custom-executables.yml): Replaced curl|bash for both Bun and Claude Code installations with download-to-tempfile then execute
18. missing-permissions (ci.yml): Added top-level permissions: contents: read

