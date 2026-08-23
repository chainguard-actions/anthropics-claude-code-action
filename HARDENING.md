<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.201

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.201** was hardened automatically. 4 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Multiple workflow files and action.yml directly interpolate ${{ ... }} expressions inside run: shell blocks (rule a), allowing expression values to be parsed as shell commands before the shell ever sees them.

• action.yml — 'Revoke app token' step: `curl ... -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — a steps.*.outputs.* value injected directly into a shell command.

• .github/workflows/release.yml — 'Calculate next version' step: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` and `next_version="${{ steps.next_version.outputs.next_version }}"` in run blocks; 'Display dry run info' step: `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, `${{ steps.get_latest_tag.outputs.latest_tag }}`; 'Create and push tag' and 'Create Release' steps also interpolate `${{ steps.next_version.outputs.next_version }}`; 'Update major version tag' step: `next_version="${{ needs.create-release.outputs.next_version }}"`.

• .github/workflows/sync-base-action.yml — 'Setup SSH and clone target repository' step: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` — a secrets.* expression directly in a run block.

• .github/workflows/test-base-action.yml — 'Verify inline prompt output' step: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`; 'Verify prompt file output' step: same pattern with steps.prompt-file-test.outputs.*.

• .github/workflows/test-custom-executables.yml — 'Verify custom executables worked' step: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`.

• .github/workflows/test-settings.yml — 'Verify echo worked' and 'Verify echo was denied' steps: `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"`.

• .github/workflows/test-structured-output.yml — 'Verify outputs' steps: `OUTPUT='${{ steps.test.outputs.structured_output }}'` in multiple jobs; 'Generate Summary' step: `${{ needs.test-basic-types.result == 'success' && '✅ PASS' || '❌ FAIL' }}` and similar needs.*.result expressions echoed into $GITHUB_STEP_SUMMARY.

Locations:

- `action.yml:348`
- `.github/workflows/release.yml:42`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:60`
- `.github/workflows/release.yml:68`
- `.github/workflows/release.yml:80`
- `.github/workflows/release.yml:100`
- `.github/workflows/sync-base-action.yml:25`
- `.github/workflows/test-base-action.yml:42`
- `.github/workflows/test-base-action.yml:43`
- `.github/workflows/test-base-action.yml:88`
- `.github/workflows/test-custom-executables.yml:65`
- `.github/workflows/test-settings.yml:38`
- `.github/workflows/test-structured-output.yml:48`
- `.github/workflows/test-structured-output.yml:155`

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tag or branch names instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks if the referenced tag or branch is moved.

• .github/workflows/ci.yml: `actions/checkout@v6` (3×), `oven-sh/setup-bun@v2` (2×), `oven-sh/setup-bun@v1` (1×).

• .github/workflows/claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`.

• .github/workflows/claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`.

• .github/workflows/issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`.

• .github/workflows/release.yml: `actions/checkout@v6` (3×, in create-release and update-major-tag jobs).

Locations:

- `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:34`
- `.github/workflows/ci.yml:36`
- `.github/workflows/claude-review.yml:17`
- `.github/workflows/claude-review.yml:22`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`
- `.github/workflows/issue-triage.yml:19`
- `.github/workflows/issue-triage.yml:24`
- `.github/workflows/release.yml:30`
- `.github/workflows/release.yml:90`
- `.github/workflows/release.yml:100`

### missing-permissions (severity: medium)

.github/workflows/ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define a job-level `permissions:` block. This means the workflow runs with the default (potentially broad) token permissions granted by the repository or organization settings.

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote installer scripts are fetched and piped directly to bash without first downloading and verifying them, allowing a compromised CDN or MITM to execute arbitrary code on the runner.

• .github/workflows/test-custom-executables.yml — 'Install Bun manually' step: `curl -fsSL https://bun.sh/install | bash`
• .github/workflows/test-custom-executables.yml — 'Install Claude Code manually' step: `curl -fsSL https://claude.ai/install.sh | bash -s latest`
• base-action/action.yml — 'Install Claude Code' step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (two occurrences: inside a timeout wrapper and in the else branch)

Locations:

- `.github/workflows/test-custom-executables.yml:24`
- `.github/workflows/test-custom-executables.yml:35`
- `base-action/action.yml:120`
- `base-action/action.yml:122`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all 4 finding types across 10 files:

1. script-injection: Moved all ${{ }} expressions from run: shell blocks to env: blocks in action.yml (Revoke app token), release.yml (5 steps), sync-base-action.yml (SSH key), test-base-action.yml (2 steps), test-custom-executables.yml (1 step), test-settings.yml (4 steps), and test-structured-output.yml (6 steps including Generate Summary rewrite).

2. unpinned-uses: Pinned actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → c81e3bc69d1b18badbb63ba39581218f02421678 in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

3. missing-permissions: Added 'permissions: contents: read' to ci.yml.

4. unsafe-shell: Replaced curl|bash patterns with download-to-tempfile-then-execute in test-custom-executables.yml (bun.sh/install and claude.ai/install.sh) and base-action/action.yml (claude.ai/install.sh in both timeout and non-timeout branches). Dropped the '--' argument terminator as instructed since it was the shell's option terminator, not the script's.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed all three github-env-injection findings by adding sanitization steps using `printf '%s' "$VAR" | tr -d '\n\r'` before writing values to $GITHUB_PATH and $GITHUB_OUTPUT:
1. hardened/action/action.yml: Sanitized BUN_DIR before writing to GITHUB_PATH in 'Setup Custom Bun Path' step.
2. hardened/action/base-action/action.yml: Sanitized BUN_DIR before writing to GITHUB_PATH in 'Setup Custom Bun Path' step.
3. hardened/action/base-action/action.yml: Sanitized CLAUDE_DIR before writing to GITHUB_PATH in 'Install Claude Code' step.
4. hardened/action/.github/workflows/release.yml: Sanitized next_version before writing to GITHUB_OUTPUT in 'Calculate next version' step, also fixed unquoted $GITHUB_OUTPUT reference.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml line 57, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The $GITHUB_ACTION_PATH environment variable is already set by the GitHub Actions runner and is equivalent to `github.action_path`, but using it as a shell variable avoids the script-injection risk of having a `${{ ... }}` template expression directly interpolated into the shell command string.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the heredoc-based script injection vulnerability in `.github/workflows/test-base-action.yml` at the 'Create test prompt file' step. The original code used `cat > test-prompt.txt << EOF` with `${PROMPT}` inside the unquoted heredoc body, which allowed command substitution if PROMPT contained `$(...)` or backtick expressions. Replaced the heredoc with `printf '%s\n' "$PROMPT" > test-prompt.txt`, which safely writes the variable value literally without any shell expansion risk.

