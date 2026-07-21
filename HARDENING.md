<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.179

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.179** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character commit SHAs, making them vulnerable to supply-chain attacks.

- ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (×2)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:23`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:35`
- `.github/workflows/ci.yml:37`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:18`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:29`
- `.github/workflows/issue-triage.yml:21`
- `.github/workflows/issue-triage.yml:26`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:89`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level permissions. Without explicit permissions, the workflow inherits the default token permissions, which may be broader than necessary.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple `run:` blocks interpolate `${{ ... }}` expressions directly into shell commands (rule a), allowing expression values to be interpreted as shell code before the shell ever sees them.

1. agent-approval-check/action.yml: `run: python "${{ github.action_path }}/agent_approval_check.py"` — `github.action_path` is a github.* context value interpolated directly in a run: block.

2. release.yml — several run: blocks interpolate steps/needs outputs and github.sha directly:
   - `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`
   - `echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"`
   - `echo "From commit: ${{ github.sha }}"`
   - `next_version="${{ steps.next_version.outputs.next_version }}"` (×2)
   - `next_version="${{ needs.create-release.outputs.next_version }}"`

3. sync-base-action.yml: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` — a ${{ }} expression directly in a run: block.

4. test-base-action.yml: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"` in run: blocks (×2 jobs).

5. test-custom-executables.yml: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` in run: block.

6. test-settings.yml: `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"` in run: blocks.

7. test-structured-output.yml: `OUTPUT='${{ steps.test.outputs.structured_output }}'` in run: blocks (×5 jobs), and `${{ needs.test-*.result }}` expressions in a run: block.

Locations:

- `agent-approval-check/action.yml:47`
- `.github/workflows/release.yml:44`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:91`
- `.github/workflows/sync-base-action.yml:24`
- `.github/workflows/test-base-action.yml:37`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:82`
- `.github/workflows/test-base-action.yml:83`
- `.github/workflows/test-custom-executables.yml:55`
- `.github/workflows/test-custom-executables.yml:56`
- `.github/workflows/test-settings.yml:36`
- `.github/workflows/test-settings.yml:37`
- `.github/workflows/test-structured-output.yml:48`
- `.github/workflows/test-structured-output.yml:107`
- `.github/workflows/test-structured-output.yml:166`
- `.github/workflows/test-structured-output.yml:225`
- `.github/workflows/test-structured-output.yml:284`

### github-env-injection (severity: high)

Three `run:` blocks write values derived from action inputs to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`), allowing newline injection that could add arbitrary entries to PATH or inject additional environment variable assignments.

1. action.yml — 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` and then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` without sanitization.

2. base-action/action.yml — 'Setup Custom Bun Path' step: identical pattern — `$BUN_DIR` (derived from `inputs.path_to_bun_executable`) written to `$GITHUB_PATH` without sanitization.

3. base-action/action.yml — 'Install Claude Code' step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` (derived from `inputs.path_to_claude_code_executable`) written to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:196`
- `base-action/action.yml:115`
- `base-action/action.yml:143`

### unsafe-shell (severity: high)

Remote installation scripts are fetched and piped directly to a shell interpreter without first downloading and verifying them. This pattern allows a compromised or man-in-the-middle server to execute arbitrary code on the runner.

1. base-action/action.yml — 'Install Claude Code' step:
   - `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (inside a `bash -c` wrapper)
   - `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (direct pipe)

2. .github/workflows/test-custom-executables.yml — 'Install Bun manually' step:
   - `curl -fsSL https://bun.sh/install | bash`

3. .github/workflows/test-custom-executables.yml — 'Install Claude Code manually' step:
   - `curl -fsSL https://claude.ai/install.sh | bash -s latest`

Locations:

- `base-action/action.yml:133`
- `base-action/action.yml:135`
- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:31`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all 14 unpinned action references to full SHAs: actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → b76a0776ae74036e77cd11018083743453d7ad35.

2. missing-permissions: Added `permissions: contents: read` to ci.yml.

3. script-injection: Moved all ${{ }} expressions out of run: blocks into env: blocks across 7 files (agent-approval-check/action.yml, release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, test-structured-output.yml). The test-structured-output.yml summary job was rewritten to use shell conditionals instead of inline ${{ needs.*.result }} expressions.

4. github-env-injection: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization in action.yml and base-action/action.yml before writing to $GITHUB_PATH, and `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` in base-action/action.yml.

5. unsafe-shell: Changed `curl -fsSL URL | bash` patterns to download-then-execute in base-action/action.yml (both timeout and non-timeout paths) and test-custom-executables.yml (both Bun and Claude Code installs).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection vulnerability in the 'Revoke app token' step of action.yml (line 437). Moved `${{ steps.run.outputs.github_token }}` from the `run:` shell command string into an `env:` block as `APP_TOKEN`, and updated the curl command to reference it as `$APP_TOKEN` instead of the direct template expression. This ensures the value is passed safely as an environment variable rather than being interpolated by the YAML template engine before the shell sees it.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Create test prompt file' step in .github/workflows/test-base-action.yml. Replaced the unquoted heredoc (`<< EOF` with `${PROMPT}` inside) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. This eliminates the command substitution/variable expansion risk from the user-controlled workflow_dispatch input while still correctly writing the prompt value to the file. The ${{ github.event.inputs.test_prompt }} expression remains safely in the env: block.

