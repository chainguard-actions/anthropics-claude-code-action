<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.181

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.181** was hardened automatically. 11 finding(s) were identified and resolved across 5 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): `${{ steps.run.outputs.github_token }}` is interpolated directly inside a `run:` shell command in the 'Revoke app token' step. The expression is embedded in a curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` command. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `action.yml:370`

### script-injection (severity: high)

Rule (a): Multiple `${{ ... }}` expressions are interpolated directly inside `run:` shell commands in release.yml. Affected steps: 'Calculate next version' uses `${{ steps.get_latest_tag.outputs.latest_tag }}`; 'Display dry run info' uses `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, and `${{ steps.get_latest_tag.outputs.latest_tag }}`; 'Create and push tag' uses `${{ steps.next_version.outputs.next_version }}`; 'Create Release' uses `${{ steps.next_version.outputs.next_version }}`; 'Update major version tag' uses `${{ needs.create-release.outputs.next_version }}`. All of these are `steps.*.outputs.*`, `needs.*.outputs.*`, and `github.*` context values interpolated directly into shell commands.

Locations:

- `.github/workflows/release.yml:42`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:65`
- `.github/workflows/release.yml:73`
- `.github/workflows/release.yml:82`
- `.github/workflows/release.yml:107`

### script-injection (severity: high)

Rule (a): `${{ steps.inline-test.outputs.execution_file }}` and `${{ steps.inline-test.outputs.conclusion }}` are interpolated directly inside a `run:` shell command in the 'Verify inline prompt output' step. Similarly, `${{ steps.prompt-file-test.outputs.execution_file }}` and `${{ steps.prompt-file-test.outputs.conclusion }}` are used directly in the 'Verify prompt file output' step. These `steps.*.outputs.*` values are substituted by the YAML template engine before the shell executes.

Locations:

- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:75`

### script-injection (severity: high)

Rule (a): `${{ steps.custom-test.outputs.execution_file }}` and `${{ steps.custom-test.outputs.conclusion }}` are interpolated directly inside a `run:` shell command in the 'Verify custom executables worked' step. These `steps.*.outputs.*` values are substituted by the YAML template engine before the shell executes.

Locations:

- `.github/workflows/test-custom-executables.yml:60`

### script-injection (severity: high)

Rule (a): Multiple `${{ ... }}` expressions are interpolated directly inside `run:` shell commands in test-structured-output.yml. The 'Verify outputs' step uses `${{ steps.test.outputs.structured_output }}` directly in `OUTPUT='${{ steps.test.outputs.structured_output }}'`. The 'Generate Summary' step uses `${{ needs.test-basic-types.result == 'success' && '✅ PASS' || '❌ FAIL' }}` and similar `needs.*.result` expressions directly in echo commands, and `${{ needs.*.result }}` in an `ALL_PASSED=${{ ... }}` assignment. All are `steps.*.outputs.*` and `needs.*.result` values substituted before the shell executes.

Locations:

- `.github/workflows/test-structured-output.yml:56`
- `.github/workflows/test-structured-output.yml:155`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets `PATH_TO_BUN_EXECUTABLE: ${{ inputs.path_to_bun_executable }}` in its `env:` block, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). An attacker-controlled `path_to_bun_executable` input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:175`
- `base-action/action.yml:118`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml sets `PATH_TO_CLAUDE_CODE_EXECUTABLE: ${{ inputs.path_to_claude_code_executable }}` in its `env:` block, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization. An attacker-controlled `path_to_claude_code_executable` input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:148`

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character commit SHAs. Unpinned references: ci.yml uses `actions/checkout@v6`, `oven-sh/setup-bun@v2`, `oven-sh/setup-bun@v1`; claude-review.yml uses `actions/checkout@v6`, `anthropics/claude-code-action@v1`; claude.yml uses `actions/checkout@v6`, `anthropics/claude-code-action@main`; issue-triage.yml uses `actions/checkout@v6`, `anthropics/claude-code-action@main`; release.yml uses `actions/checkout@v6` (in two jobs). These mutable refs can be silently updated to point to malicious code.

Locations:

- `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:34`
- `.github/workflows/ci.yml:36`
- `.github/workflows/claude-review.yml:16`
- `.github/workflows/claude-review.yml:20`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:26`
- `.github/workflows/issue-triage.yml:21`
- `.github/workflows/issue-triage.yml:25`
- `.github/workflows/release.yml:30`
- `.github/workflows/release.yml:96`

### missing-permissions (severity: medium)

The workflow file ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) have job-level `permissions:` keys. Without explicit permissions, the workflow inherits the repository's default token permissions, which may be overly broad (e.g., `write` on contents by default for some repository configurations).

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes remotely-fetched code without first verifying its integrity (e.g., via checksum). A compromised or MitM'd response would execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:155`

### unsafe-shell (severity: high)

The test-custom-executables.yml workflow pipes remote scripts directly to bash in two steps: 'Install Bun manually' uses `curl -fsSL https://bun.sh/install | bash`, and 'Install Claude Code manually' uses `curl -fsSL https://claude.ai/install.sh | bash -s latest`. Both execute remotely-fetched code without integrity verification.

Locations:

- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:33`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all security findings:

1. **script-injection**: Moved all ${{ ... }} expressions from run: blocks to env: blocks in action.yml (Revoke app token), release.yml (Calculate next version, Display dry run info, Create and push tag, Create Release, Update major version tag), test-base-action.yml (Verify inline prompt output, Verify prompt file output), test-custom-executables.yml (Verify custom executables worked), and test-structured-output.yml (all Verify steps and Generate Summary).

2. **github-env-injection**: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` in action.yml and base-action/action.yml Setup Custom Bun Path steps. Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` in base-action/action.yml Install Claude Code step.

3. **unpinned-uses**: Pinned all actions/checkout@v6 to SHA de0fac2e4500dabe0009e67214ff5f5447ce83dd (v6.0.2) in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Pinned oven-sh/setup-bun@v2 and @v1 to SHA 0c5077e51419868618aeaa5fe8019c62421857d6 (v2.2.0) in ci.yml. **NOTE: Could not pin anthropics/claude-code-action@v1 (claude-review.yml) and @main (claude.yml, issue-triage.yml) due to GitHub API rate limiting (HTTP 403).**

4. **missing-permissions**: Added `permissions: contents: read` to ci.yml.

5. **unsafe-shell**: Fixed base-action/action.yml Install Claude Code step to download script to temp file before executing. Fixed test-custom-executables.yml Install Bun manually and Install Claude Code manually steps to download scripts to temp files before executing.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all 3 script-injection findings:

1. agent-approval-check/action.yml (line 55): Moved `${{ github.action_path }}` out of the `run:` shell string into an `env:` variable `ACTION_PATH`, referenced as `"$ACTION_PATH"` in the script.

2. .github/workflows/sync-base-action.yml (line 27): Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` out of the `run:` shell string into an `env:` variable `DEPLOY_KEY`, referenced as `"$DEPLOY_KEY"` in the script.

3. .github/workflows/test-settings.yml (lines 47, 48, 100, 148, 149, 200): Moved all 6 `${{ steps.*.outputs.* }}` expressions (execution_file and conclusion outputs from inline-settings-test and file-settings-test steps) into `env:` blocks (`OUTPUT_FILE` and `CONCLUSION`), referenced as `"$OUTPUT_FILE"` and `"$CONCLUSION"` in the scripts.

Could NOT fix unpinned-uses finding: The GitHub API returned HTTP 403 (rate limit) on every attempt to resolve the commit SHA for `anthropics/claude-code-action` at refs `main`, `v1`, and `v1.0.181`. Per instructions, SHAs must never be invented or guessed, so these three workflow files (.github/workflows/claude.yml, .github/workflows/claude-review.yml, .github/workflows/issue-triage.yml) remain with mutable tag references.

### Iteration 3

**Fixes applied:** unpinned-uses

**Notes:**

Pinned all three unpinned anthropics/claude-code-action references to full commit SHA 44423bdec74b97d67543eb16c110546762c110b2:
- .github/workflows/claude.yml line 34: @main → @44423bdec74b97d67543eb16c110546762c110b2 # main
- .github/workflows/claude-review.yml line 21: @v1 → @44423bdec74b97d67543eb16c110546762c110b2 # v1
- .github/workflows/issue-triage.yml line 25: @main → @44423bdec74b97d67543eb16c110546762c110b2 # main
Both @main and @v1 resolved to the same SHA at the time of pinning.

### Iteration 4

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all 12 unpinned-uses findings across 12 files by pinning action references to full 40-character commit SHAs with tag comments. Fixed 4 script-injection findings: (1) base-action/examples/issue-triage.yml - moved ${{ github.event.issue.number }} to ISSUE_NUMBER env var, changed heredoc from 'EOF' to EOF so shell vars expand, removed duplicate env block; (2) examples/test-failure-analysis.yml - moved ${{ steps.detect.outputs.structured_output }} to STRUCTURED_OUTPUT env var in all three affected run: blocks ('Retry flaky tests', 'Low confidence detection', 'Comment on PR'), and moved ${{ github.event.workflow_run.html_url }} to WORKFLOW_RUN_URL env var in the 'Comment on PR' block. All ${{ }} expressions are now only in env: or with: blocks, never directly in run: shell scripts.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in '.github/workflows/test-base-action.yml' at the 'Create test prompt file' step. Replaced the unquoted heredoc (`cat > test-prompt.txt << EOF` / `${PROMPT}` / `EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc allowed bash to perform command substitution on the heredoc body, so a PROMPT value like `$(malicious_command)` would be executed. The printf approach with a double-quoted variable is safe and writes the content literally without any shell interpretation.

