<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.196

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.196** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tag or branch instead of a full 40-character SHA commit hash, making them vulnerable to supply-chain attacks.

- .github/workflows/ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- .github/workflows/claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- .github/workflows/claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- .github/workflows/issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- .github/workflows/release.yml: `actions/checkout@v6` (×2 active jobs)

Locations:

- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:13`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:27`
- `.github/workflows/ci.yml:38`
- `.github/workflows/ci.yml:40`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:18`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:28`
- `.github/workflows/issue-triage.yml:17`
- `.github/workflows/issue-triage.yml:21`
- `.github/workflows/release.yml:34`
- `.github/workflows/release.yml:79`

### script-injection (severity: high)

Multiple workflow run: blocks directly interpolate ${{ ... }} expressions into shell commands (sub-rule a), allowing template substitution before the shell parses the string. This enables script injection if any of the referenced values contain shell metacharacters.

- release.yml 'Calculate next version' step: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`
- release.yml 'Display dry run info' step: `echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"`, `echo "From commit: ${{ github.sha }}"`, `echo "Previous tag: ${{ steps.get_latest_tag.outputs.latest_tag }}"`
- release.yml 'Create and push tag' step: `next_version="${{ steps.next_version.outputs.next_version }}"`
- release.yml 'Create Release' step: `next_version="${{ steps.next_version.outputs.next_version }}"`
- release.yml 'Update major version tag' step: `next_version="${{ needs.create-release.outputs.next_version }}"`
- test-base-action.yml 'Verify inline prompt output' step: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`
- test-base-action.yml 'Verify prompt file output' step: `OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.prompt-file-test.outputs.conclusion }}"`
- test-custom-executables.yml 'Verify custom executables worked' step: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`
- test-settings.yml 'Verify echo worked/denied' steps: `OUTPUT_FILE="${{ steps.*.outputs.execution_file }}"`, `CONCLUSION="${{ steps.*.outputs.conclusion }}"`
- test-structured-output.yml 'Verify outputs' steps: `OUTPUT='${{ steps.test.outputs.structured_output }}'` (particularly dangerous as structured_output may contain attacker-influenced Claude output), `FILE="${{ steps.test.outputs.execution_file }}"`
- test-structured-output.yml 'Generate Summary' step: `${{ needs.*.result == 'success' && '✅ PASS' || '❌ FAIL' }}` in echo commands

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:56`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:62`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:84`
- `.github/workflows/test-base-action.yml:40`
- `.github/workflows/test-base-action.yml:41`
- `.github/workflows/test-base-action.yml:83`
- `.github/workflows/test-base-action.yml:84`
- `.github/workflows/test-custom-executables.yml:60`
- `.github/workflows/test-custom-executables.yml:61`
- `.github/workflows/test-settings.yml:38`
- `.github/workflows/test-settings.yml:39`
- `.github/workflows/test-structured-output.yml:47`
- `.github/workflows/test-structured-output.yml:113`
- `.github/workflows/test-structured-output.yml:168`
- `.github/workflows/test-structured-output.yml:224`
- `.github/workflows/test-structured-output.yml:278`

### unsafe-shell (severity: high)

Remote scripts are fetched and piped directly to bash without first downloading and verifying them. This allows a compromised or malicious remote server to execute arbitrary code on the runner.

- base-action/action.yml 'Install Claude Code' step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (also inside `bash -c "curl ... | bash"`)
- .github/workflows/test-custom-executables.yml 'Install Bun manually' step: `curl -fsSL https://bun.sh/install | bash`
- .github/workflows/test-custom-executables.yml 'Install Claude Code manually' step: `curl -fsSL https://claude.ai/install.sh | bash -s latest`

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:133`
- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:32`

### missing-permissions (severity: medium)

The workflow file .github/workflows/ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define a job-level `permissions:` block. Without explicit permissions, the workflow inherits the repository's default token permissions, which may be broader than necessary.

Locations:

- `.github/workflows/ci.yml:1`

### github-env-injection (severity: high)

Several composite action steps write values derived from caller-supplied inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject additional entries into GITHUB_PATH.

- action.yml 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`; `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is then written to `$GITHUB_PATH` unsanitized.
- base-action/action.yml 'Setup Custom Bun Path' step: same pattern — `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` written to `$GITHUB_PATH` unsanitized.
- base-action/action.yml 'Install Claude Code' step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` written to `$GITHUB_PATH` unsanitized when a custom executable path is provided.

Locations:

- `action.yml:248`
- `base-action/action.yml:118`
- `base-action/action.yml:148`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, unsafe-shell, missing-permissions, github-env-injection

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all mutable action references to full SHAs in ci.yml (actions/checkout@v6→d23441a4, oven-sh/setup-bun@v2→0c5077e5, oven-sh/setup-bun@v1→f4d14e03), claude-review.yml (actions/checkout@v6→d23441a4, anthropics/claude-code-action@v1→e2a4b761), claude.yml (actions/checkout@v6→d23441a4, anthropics/claude-code-action@main→e2a4b761), issue-triage.yml (same), and release.yml (actions/checkout@v6→d23441a4 in both jobs).

2. script-injection: Moved all ${{ }} expressions from run: shell strings to env: blocks in release.yml (Calculate next version, Display dry run info, Create and push tag, Create Release, Update major version tag steps), test-base-action.yml (Verify inline prompt output, Verify prompt file output), test-custom-executables.yml (Verify custom executables worked), test-settings.yml (all 4 Verify steps), and test-structured-output.yml (all 5 Verify steps + Generate Summary).

3. unsafe-shell: Converted curl-pipe-bash patterns to download-then-execute in base-action/action.yml Install Claude Code step (both timeout and non-timeout paths) and in test-custom-executables.yml Install Bun manually and Install Claude Code manually steps. Dropped the '--' shell option terminator as required (was 'bash -s -- $VERSION', now 'bash script.sh $VERSION').

4. missing-permissions: Added top-level 'permissions: contents: read' to ci.yml.

5. github-env-injection: Added 'safe_dir=$(printf '%s' "$VAR" | tr -d '\n\r')' sanitization before writing BUN_DIR to $GITHUB_PATH in action.yml and base-action/action.yml, and before writing CLAUDE_DIR to $GITHUB_PATH in base-action/action.yml.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all three script-injection findings:
1. hardened/action/agent-approval-check/action.yml (line 52): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` — using the built-in env var instead of a template expression.
2. hardened/action/action.yml (line 497): Moved `${{ steps.run.outputs.github_token }}` from the curl `-H "Authorization: Bearer ..."` argument into an `env:` block as `APP_TOKEN`, then referenced it as `$APP_TOKEN` in the shell.
3. hardened/action/.github/workflows/sync-base-action.yml (line 22): Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` from the `echo` command into an `env:` block as `DEPLOY_KEY`, then referenced it as `$DEPLOY_KEY` in the shell.

