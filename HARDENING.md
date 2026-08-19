<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.194

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.194** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of immutable 40-character SHA digests, making them vulnerable to supply-chain attacks.

- .github/workflows/ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- .github/workflows/claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- .github/workflows/claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- .github/workflows/issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- .github/workflows/release.yml: `actions/checkout@v6` (×2 active)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`
- `.github/workflows/claude-review.yml:15`
- `.github/workflows/claude-review.yml:20`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:22`
- `.github/workflows/release.yml:35`
- `.github/workflows/release.yml:80`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level `permissions:` blocks. Without explicit permissions, the workflow inherits the default token permissions, which may be overly broad (write access to contents and packages on some repository configurations).

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple run: blocks interpolate ${{ }} expressions directly into shell command strings (sub-rule a). This allows the expression value to be interpreted as shell syntax before the shell ever sees it, enabling command injection.

- release.yml 'Calculate next version': `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`
- release.yml 'Display dry run info': `echo "From commit: ${{ github.sha }}"`, `echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"`
- release.yml 'Create and push tag': `next_version="${{ steps.next_version.outputs.next_version }}"`
- release.yml 'Create Release': `next_version="${{ steps.next_version.outputs.next_version }}"`
- release.yml 'Update major version tag': `next_version="${{ needs.create-release.outputs.next_version }}"`
- sync-base-action.yml 'Setup SSH': `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base`
- test-base-action.yml 'Verify inline prompt output': `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`
- test-base-action.yml 'Verify prompt file output': `OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"`
- test-custom-executables.yml 'Verify custom executables worked': `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`
- test-settings.yml (×4 verify steps): `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"`
- test-structured-output.yml (×4 verify steps): `OUTPUT='${{ steps.test.outputs.structured_output }}'`

Locations:

- `.github/workflows/release.yml:46`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:62`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:78`
- `.github/workflows/release.yml:97`
- `.github/workflows/sync-base-action.yml:24`
- `.github/workflows/test-base-action.yml:37`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:87`
- `.github/workflows/test-base-action.yml:88`
- `.github/workflows/test-custom-executables.yml:66`
- `.github/workflows/test-custom-executables.yml:67`
- `.github/workflows/test-settings.yml:36`
- `.github/workflows/test-settings.yml:88`
- `.github/workflows/test-settings.yml:130`
- `.github/workflows/test-settings.yml:183`
- `.github/workflows/test-structured-output.yml:46`
- `.github/workflows/test-structured-output.yml:107`
- `.github/workflows/test-structured-output.yml:168`
- `.github/workflows/test-structured-output.yml:229`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml and base-action/action.yml writes a value derived from `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The value flows: `inputs.path_to_bun_executable` → env var `PATH_TO_BUN_EXECUTABLE` → `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` → `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline embedded in the input could inject arbitrary entries into PATH.

Similarly, the 'Install Claude Code' step in base-action/action.yml writes a value derived from `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` → `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

The required sanitization pattern `safe=$(printf '%s' "$VAR" | tr -d '\n\r')` is absent before each write.

Locations:

- `action.yml:233`
- `base-action/action.yml:131`
- `base-action/action.yml:163`

### unsafe-shell (severity: high)

Remote installation scripts are piped directly to bash without first downloading and verifying them. This pattern executes arbitrary remote code and is vulnerable to MITM attacks or compromised CDN content.

- base-action/action.yml 'Install Claude Code' step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears twice, once inside a timeout wrapper and once in the else branch)
- .github/workflows/test-custom-executables.yml 'Install Bun manually' step: `curl -fsSL https://bun.sh/install | bash`
- .github/workflows/test-custom-executables.yml 'Install Claude Code manually' step: `curl -fsSL https://claude.ai/install.sh | bash -s latest`

Locations:

- `base-action/action.yml:175`
- `base-action/action.yml:177`
- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:33`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all mutable action references to full SHA digests across ci.yml, claude.yml, claude-review.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs.

2. missing-permissions: Added top-level 'permissions: contents: read' to ci.yml which had no permissions block.

3. script-injection: Moved all ${{ }} expressions from run: shell strings into step env: blocks across release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml.

4. github-env-injection: Added sanitization (printf '%s' "$VAR" | tr -d '\n\r') before writing derived paths to $GITHUB_PATH in action.yml (Setup Custom Bun Path) and base-action/action.yml (Setup Custom Bun Path and Install Claude Code).

5. unsafe-shell: Replaced curl-pipe-to-bash patterns with download-to-tempfile-then-execute in base-action/action.yml (Install Claude Code, both timeout and non-timeout branches) and test-custom-executables.yml (Install Bun manually and Install Claude Code manually). Dropped '-s' and '--' from the shell invocation as required when switching from pipe to file execution.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:
1. hardened/action/action.yml (line 497, 'Revoke app token' step): Moved `${{ steps.run.outputs.github_token }}` to an `env:` variable `APP_TOKEN` and replaced the inline expression in the curl `-H "Authorization: Bearer $APP_TOKEN"` line.
2. hardened/action/agent-approval-check/action.yml (line 55): Moved `${{ github.action_path }}` to an `env:` variable `ACTION_PATH` and replaced the inline expression with `"$ACTION_PATH/agent_approval_check.py"` in the python run command.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in .github/workflows/test-structured-output.yml: moved all ${{ needs.*.result }} expressions from the 'Generate Summary' run: shell script into the step's env: block as RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, and RESULT_EXECUTION_FILE. The shell script now computes pass/fail labels and the all-passed check using plain environment variable references and shell conditionals, eliminating the YAML template injection risk.

