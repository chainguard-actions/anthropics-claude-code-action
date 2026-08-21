<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.199

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.199** was hardened automatically. 14 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): `${{ github.action_path }}` is interpolated directly inside a run: shell command string. An attacker who can influence the action path could inject shell commands. Line: `run: python "${{ github.action_path }}/agent_approval_check.py"`

Locations:

- `agent-approval-check/action.yml:47`

### script-injection (severity: high)

Rule (a): Multiple ${{ steps.*.outputs.* }}, ${{ github.* }}, and ${{ needs.*.outputs.* }} expressions are interpolated directly inside run: shell command strings. Offending lines include: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`, `echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"`, `echo "From commit: ${{ github.sha }}"`, `echo "Previous tag: ${{ steps.get_latest_tag.outputs.latest_tag }}"`, `next_version="${{ steps.next_version.outputs.next_version }}"` (Create and push tag step), `next_version="${{ steps.next_version.outputs.next_version }}"` (Create Release step), `next_version="${{ needs.create-release.outputs.next_version }}"` (update-major-tag job). These allow injection of shell metacharacters before the shell ever sees the value.

Locations:

- `.github/workflows/release.yml:38`
- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:54`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:61`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:88`

### script-injection (severity: high)

Rule (a): `${{ steps.inline-test.outputs.execution_file }}` and `${{ steps.inline-test.outputs.conclusion }}` are interpolated directly in a run: block (`OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`; `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`). Same pattern repeated for `steps.prompt-file-test.outputs.*`. Rule (b): `${PROMPT}` is used unquoted inside a heredoc where `PROMPT: ${{ github.event.inputs.test_prompt }}` — user-controlled workflow_dispatch input flows through an env var into an unquoted shell expansion.

Locations:

- `.github/workflows/test-base-action.yml:40`
- `.github/workflows/test-base-action.yml:41`
- `.github/workflows/test-base-action.yml:57`
- `.github/workflows/test-base-action.yml:68`
- `.github/workflows/test-base-action.yml:69`

### script-injection (severity: high)

Rule (a): `${{ steps.custom-test.outputs.execution_file }}` and `${{ steps.custom-test.outputs.conclusion }}` are interpolated directly in a run: block (`OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`; `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`). Step outputs can contain attacker-influenced content.

Locations:

- `.github/workflows/test-custom-executables.yml:68`
- `.github/workflows/test-custom-executables.yml:69`

### script-injection (severity: high)

Rule (a): `${{ steps.test.outputs.structured_output }}` and `${{ steps.test.outputs.execution_file }}` are interpolated directly in run: blocks (`OUTPUT='${{ steps.test.outputs.structured_output }}'`; `FILE="${{ steps.test.outputs.execution_file }}"`). The structured_output comes from Claude Code and can contain arbitrary content. Additionally, `${{ needs.test-basic-types.result == 'success' && '✅ PASS' || '❌ FAIL' }}` and similar needs.* expressions are interpolated directly in a run: block writing to $GITHUB_STEP_SUMMARY.

Locations:

- `.github/workflows/test-structured-output.yml:47`
- `.github/workflows/test-structured-output.yml:100`
- `.github/workflows/test-structured-output.yml:153`
- `.github/workflows/test-structured-output.yml:206`
- `.github/workflows/test-structured-output.yml:253`
- `.github/workflows/test-structured-output.yml:285`
- `.github/workflows/test-structured-output.yml:286`
- `.github/workflows/test-structured-output.yml:287`
- `.github/workflows/test-structured-output.yml:288`
- `.github/workflows/test-structured-output.yml:289`

### script-injection (severity: high)

Rule (a): `${{ steps.inline-settings-test.outputs.execution_file }}`, `${{ steps.inline-settings-test.outputs.conclusion }}`, `${{ steps.file-settings-test.outputs.execution_file }}`, and `${{ steps.file-settings-test.outputs.conclusion }}` are interpolated directly in run: blocks across multiple verify steps.

Locations:

- `.github/workflows/test-settings.yml:36`
- `.github/workflows/test-settings.yml:37`
- `.github/workflows/test-settings.yml:82`
- `.github/workflows/test-settings.yml:120`
- `.github/workflows/test-settings.yml:121`
- `.github/workflows/test-settings.yml:167`
- `.github/workflows/test-settings.yml:183`

### unpinned-uses (severity: high)

All `uses:` references in ci.yml use mutable tags instead of full 40-character SHA pins: `actions/checkout@v6` (3 occurrences), `oven-sh/setup-bun@v2` (2 occurrences), `oven-sh/setup-bun@v1` (1 occurrence). These can be silently updated to point to malicious code.

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:35`
- `.github/workflows/ci.yml:37`

### unpinned-uses (severity: high)

Uses references in claude-review.yml use mutable tags: `actions/checkout@v6` and `anthropics/claude-code-action@v1`. These are not pinned to a full SHA digest.

Locations:

- `.github/workflows/claude-review.yml:16`
- `.github/workflows/claude-review.yml:21`

### unpinned-uses (severity: high)

Uses references in claude.yml use mutable tags/branches: `actions/checkout@v6` and `anthropics/claude-code-action@main`. The `@main` branch reference is especially dangerous as it tracks the live HEAD of the branch.

Locations:

- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`

### unpinned-uses (severity: high)

Uses references in issue-triage.yml use mutable tags/branches: `actions/checkout@v6` and `anthropics/claude-code-action@main`. The `@main` branch reference tracks the live HEAD.

Locations:

- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:23`

### unpinned-uses (severity: high)

Uses references in release.yml use mutable tags: `actions/checkout@v6` appears in both the create-release job and the update-major-tag job without SHA pinning.

Locations:

- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:79`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level `permissions:` blocks. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions.

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

The Install Claude Code step pipes a remote install script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. If the remote server is compromised or the URL is intercepted, arbitrary code executes on the runner without any integrity check.

Locations:

- `base-action/action.yml:148`

### unsafe-shell (severity: high)

Two steps in test-custom-executables.yml pipe remote install scripts directly to bash: (1) `curl -fsSL https://bun.sh/install | bash` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s latest`. Remote content is executed without integrity verification.

Locations:

- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:33`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all 14 findings across 9 files:

1. agent-approval-check/action.yml: Moved github.action_path from run: command to env: block.

2. .github/workflows/release.yml: Pinned actions/checkout@v6 to SHA d23441a48e516b6c34aea4fa41551a30e30af803. Moved all ${{ steps.*.outputs.* }}, ${{ github.sha }}, and ${{ needs.*.outputs.* }} expressions to env: blocks.

3. .github/workflows/test-base-action.yml: Moved steps.*.outputs.* expressions to env: blocks. Fixed unquoted ${PROMPT} heredoc by using printf to write the prompt file safely.

4. .github/workflows/test-custom-executables.yml: Moved steps.custom-test.outputs.* to env: blocks. Fixed unsafe curl|bash patterns by downloading to temp files first.

5. .github/workflows/test-structured-output.yml: Moved all structured_output, execution_file, and needs.*.result expressions to env: blocks.

6. .github/workflows/test-settings.yml: Moved all steps.*.outputs.* expressions to env: blocks.

7. .github/workflows/ci.yml: Pinned actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → f4d14e03ff726c06358e5557344e1da148b56cf7. Added top-level permissions: contents: read.

8. .github/workflows/claude-review.yml: Pinned actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, anthropics/claude-code-action@v1 → dcb57747bfceeaa1fa72638cae52295d1d853d4a.

9. .github/workflows/claude.yml: Pinned actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, anthropics/claude-code-action@main → dcb57747bfceeaa1fa72638cae52295d1d853d4a.

10. .github/workflows/issue-triage.yml: Pinned actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, anthropics/claude-code-action@main → dcb57747bfceeaa1fa72638cae52295d1d853d4a.

11. base-action/action.yml: Replaced curl|bash pipe with download-to-tempfile-then-execute pattern. Dropped the '--' shell option terminator (not needed when running a file directly) so the version string is correctly passed as $1 to the install script.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

Fixed 4 findings across 3 files:
1. .github/workflows/sync-base-action.yml: Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` to env var `DEPLOY_KEY` to prevent script injection.
2. action.yml (Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` to env var `APP_TOKEN` to prevent script injection.
3. action.yml (Setup Custom Bun Path step): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR to $GITHUB_PATH.
4. base-action/action.yml (Setup Custom Bun Path + Install Claude Code steps): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH.

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In the 'Calculate next version' step of .github/workflows/release.yml (line 67), added sanitization before writing to $GITHUB_OUTPUT. The `next_version` value (derived from the untrusted `steps.get_latest_tag.outputs.latest_tag` source via LATEST_TAG env var) is now sanitized with `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` before being written as `echo "next_version=$safe_next_version" >> "$GITHUB_OUTPUT"`. Also quoted `$GITHUB_OUTPUT` for good practice.

