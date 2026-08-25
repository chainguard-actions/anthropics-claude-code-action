<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.202

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.202** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character commit SHAs, making them vulnerable to supply-chain attacks.

- ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (×3, two in commented-out blocks)

Locations:

- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:13`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:27`
- `.github/workflows/ci.yml:39`
- `.github/workflows/ci.yml:41`
- `.github/workflows/claude-review.yml:16`
- `.github/workflows/claude-review.yml:20`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:28`
- `.github/workflows/issue-triage.yml:19`
- `.github/workflows/issue-triage.yml:23`
- `.github/workflows/release.yml:32`

### script-injection (severity: high)

Multiple workflow run: blocks interpolate ${{ ... }} expressions directly into shell commands (sub-rule a), allowing expression values to be interpreted as shell code before the shell ever sees them.

- release.yml: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` and `next_version="${{ steps.next_version.outputs.next_version }}"` used directly in run: blocks across several steps.
- sync-base-action.yml: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` — a secret interpolated directly into a run: block.
- test-base-action.yml: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"` in run: blocks.
- test-custom-executables.yml: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` in run: blocks.
- test-settings.yml: `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"` in run: blocks.
- test-structured-output.yml: `OUTPUT='${{ steps.test.outputs.structured_output }}'` and `FILE="${{ steps.test.outputs.execution_file }}"` in run: blocks.
- action.yml (Revoke app token step): `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly in a run: block.

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:60`
- `.github/workflows/release.yml:68`
- `.github/workflows/release.yml:79`
- `.github/workflows/release.yml:93`
- `.github/workflows/sync-base-action.yml:24`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:39`
- `.github/workflows/test-base-action.yml:89`
- `.github/workflows/test-base-action.yml:90`
- `.github/workflows/test-custom-executables.yml:63`
- `.github/workflows/test-custom-executables.yml:64`
- `.github/workflows/test-settings.yml:38`
- `.github/workflows/test-settings.yml:39`
- `.github/workflows/test-settings.yml:91`
- `.github/workflows/test-settings.yml:130`
- `.github/workflows/test-structured-output.yml:47`
- `.github/workflows/test-structured-output.yml:116`
- `.github/workflows/test-structured-output.yml:175`
- `.github/workflows/test-structured-output.yml:233`
- `.github/workflows/test-structured-output.yml:278`
- `action.yml:310`

### unsafe-shell (severity: high)

Remote content is piped directly to a shell interpreter without first downloading and verifying the script.

- base-action/action.yml (Install Claude Code step): `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (two occurrences: one inside a `timeout` wrapper and one fallback).
- .github/workflows/test-custom-executables.yml (Install Bun manually step): `curl -fsSL https://bun.sh/install | bash`.
- .github/workflows/test-custom-executables.yml (Install Claude Code manually step): `curl -fsSL https://claude.ai/install.sh | bash -s latest`.

Locations:

- `base-action/action.yml:107`
- `base-action/action.yml:109`
- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:33`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define a job-level `permissions:` block. Without explicit permissions, the workflow inherits the default repository token permissions, which may be broader than necessary.

Locations:

- `.github/workflows/ci.yml:1`

### github-env-injection (severity: high)

Input values derived from `inputs.*` are written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`), allowing newline injection that could add arbitrary entries to PATH.

- action.yml (Setup Custom Bun Path step): `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"` — `PATH_TO_BUN_EXECUTABLE` comes from `inputs.path_to_bun_executable` with no sanitization.
- base-action/action.yml (Setup Custom Bun Path step): same pattern — `echo "$BUN_DIR" >> "$GITHUB_PATH"` from `inputs.path_to_bun_executable`.
- base-action/action.yml (Install Claude Code step): `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — `PATH_TO_CLAUDE_CODE_EXECUTABLE` comes from `inputs.path_to_claude_code_executable` with no sanitization.

Locations:

- `action.yml:196`
- `base-action/action.yml:96`
- `base-action/action.yml:119`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, unsafe-shell, missing-permissions, github-env-injection

**Notes:**

Fixed all 5 security findings across 10 files:

1. unpinned-uses: Pinned all mutable action references to full 40-char SHAs in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6, oven-sh/setup-bun@v1, oven-sh/setup-bun@v2, anthropics/claude-code-action@v1, and anthropics/claude-code-action@main.

2. script-injection: Moved all ${{ }} expressions from run: blocks to env: blocks across release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, test-structured-output.yml, and action.yml (Revoke app token step).

3. unsafe-shell: Fixed curl|bash pipe patterns in base-action/action.yml (both timeout and fallback paths) and test-custom-executables.yml by downloading scripts to temp files first then executing them. Dropped the '--' separator from the claude.ai/install.sh invocation as required (it was the shell's option terminator, not the script's).

4. missing-permissions: Added 'permissions: contents: read' top-level block to ci.yml.

5. github-env-injection: Replaced 'echo "$VAR" >> "$GITHUB_PATH"' with 'printf \'%s\' "$VAR" | tr -d \'\n\r\' >> "$GITHUB_PATH"' followed by 'echo >> "$GITHUB_PATH"' in action.yml (BUN_DIR) and base-action/action.yml (BUN_DIR, CLAUDE_DIR, and $HOME/.local/bin).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:

1. hardened/action/agent-approval-check/action.yml (line 57): Moved `${{ github.action_path }}` from the `run:` shell command into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now uses `python "$ACTION_PATH/agent_approval_check.py"` instead.

2. hardened/action/.github/workflows/test-structured-output.yml (line 340): Moved all five `${{ needs.*.result }}` expressions from the `run:` shell block into the step's `env:` block (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE). The shell script was rewritten to use a `pass_or_fail()` helper function and plain shell `[ "$VAR" = "success" ]` comparisons, eliminating all inline `${{ }}` template expressions from the run block.

