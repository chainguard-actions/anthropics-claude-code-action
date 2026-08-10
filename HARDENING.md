<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.181

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.181** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks.

Failing references:
- ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (×3)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:26`
- `.github/workflows/ci.yml:38`
- `.github/workflows/ci.yml:40`
- `.github/workflows/claude-review.yml:15`
- `.github/workflows/claude-review.yml:21`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:23`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:89`
- `.github/workflows/release.yml:113`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its jobs (test, prettier, typecheck) define job-level `permissions:` blocks. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple workflow run: blocks interpolate ${{ ... }} expressions directly into shell command strings (sub-rule a), allowing shell metacharacters in the expanded value to alter command execution. Additionally, one step uses an unquoted heredoc expansion of a workflow-dispatch input (sub-rule b).

**release.yml** — `Calculate next version` step: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`; `Display dry run info` step: `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, `${{ steps.get_latest_tag.outputs.latest_tag }}`; `Create and push tag` step: `next_version="${{ steps.next_version.outputs.next_version }}"`; `Create Release` step: `next_version="${{ steps.next_version.outputs.next_version }}"`; `Update major version tag` step: `next_version="${{ needs.create-release.outputs.next_version }}"`.

**sync-base-action.yml** — `Setup SSH and clone target repository` step: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` — secrets interpolated directly into shell.

**test-base-action.yml** — `Verify inline prompt output` step: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`; `Verify prompt file output` step: `OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"`; `Create test prompt file` step (sub-rule b): unquoted heredoc `${PROMPT}` where PROMPT=${{ github.event.inputs.test_prompt }}.

**test-custom-executables.yml** — `Verify custom executables worked` step: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`.

**test-settings.yml** — multiple Verify steps: `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `OUTPUT_FILE="${{ steps.file-settings-test.outputs.execution_file }}"`.

**test-structured-output.yml** — multiple Verify steps: `OUTPUT='${{ steps.test.outputs.structured_output }}'`; `FILE="${{ steps.test.outputs.execution_file }}"`; `Generate Summary` step: `${{ needs.test-basic-types.result == 'success' && '✅ PASS' || '❌ FAIL' }}` and `ALL_PASSED=${{ needs.*.result == 'success' && ... }}`.

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:78`
- `.github/workflows/release.yml:100`
- `.github/workflows/sync-base-action.yml:27`
- `.github/workflows/test-base-action.yml:35`
- `.github/workflows/test-base-action.yml:60`
- `.github/workflows/test-base-action.yml:75`
- `.github/workflows/test-custom-executables.yml:66`
- `.github/workflows/test-settings.yml:36`
- `.github/workflows/test-settings.yml:79`
- `.github/workflows/test-settings.yml:120`
- `.github/workflows/test-settings.yml:163`
- `.github/workflows/test-structured-output.yml:47`
- `.github/workflows/test-structured-output.yml:115`
- `.github/workflows/test-structured-output.yml:172`
- `.github/workflows/test-structured-output.yml:229`
- `.github/workflows/test-structured-output.yml:271`
- `.github/workflows/test-structured-output.yml:296`

### unsafe-shell (severity: high)

Remote install scripts are fetched and piped directly to bash without first downloading and verifying them. This allows a compromised or MITM'd remote server to execute arbitrary code on the runner.

- `.github/workflows/test-custom-executables.yml` — `curl -fsSL https://bun.sh/install | bash` and `curl -fsSL https://claude.ai/install.sh | bash -s latest`
- `base-action/action.yml` — `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (two occurrences in retry loop)

Locations:

- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:30`
- `base-action/action.yml:145`
- `base-action/action.yml:147`

### github-env-injection (severity: high)

Values derived from action inputs are written to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`), allowing newline injection that could add attacker-controlled entries to PATH or inject additional environment variable assignments.

- **action.yml** — `Setup Custom Bun Path` step: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`.
- **base-action/action.yml** — `Setup Custom Bun Path` step: same pattern — `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`.
- **base-action/action.yml** — `Install Claude Code` step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`.

Locations:

- `action.yml:228`
- `base-action/action.yml:120`
- `base-action/action.yml:152`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all mutable action references to full SHA digests in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. SHAs: actions/checkout@v6→d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2→0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1→f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1+main→6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975.

2. missing-permissions: Added top-level `permissions: contents: read` to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: shell strings into step env: blocks in release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml. The unquoted heredoc in test-base-action.yml was replaced with `printf '%s\n' "$PROMPT"`. The Generate Summary step in test-structured-output.yml was rewritten using shell conditionals instead of ${{ }} ternary expressions.

4. unsafe-shell: Replaced `curl | bash` and `curl | bash -s latest` patterns with download-to-tempfile-then-execute in test-custom-executables.yml and base-action/action.yml. Dropped the '--' separator from the claude.ai installer invocation as required (it was the shell's option terminator, not the script's).

5. github-env-injection: Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR to GITHUB_PATH in action.yml and base-action/action.yml, and before writing CLAUDE_DIR to GITHUB_PATH in base-action/action.yml.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings: (1) In action.yml 'Revoke app token' step, moved `${{ steps.run.outputs.github_token }}` out of the curl command into an `env:` block as `APP_TOKEN`, then referenced it as `$APP_TOKEN` in the shell. (2) In agent-approval-check/action.yml, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` using the automatically-set environment variable instead of a template expression.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Calculate next version' step in .github/workflows/release.yml (line 67). Added sanitization of the `next_version` value before writing to $GITHUB_OUTPUT: `safe=$(printf '%s' "$next_version" | tr -d '\n\r')` followed by `echo "next_version=$safe" >> $GITHUB_OUTPUT`. This strips any embedded newlines or carriage returns from the value derived from the untrusted LATEST_TAG steps output, preventing newline injection into $GITHUB_OUTPUT.

