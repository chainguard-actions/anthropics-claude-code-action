<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.182

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.182** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of pinned full-length SHA commits, making them vulnerable to supply-chain attacks.

ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1`
claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
release.yml: `actions/checkout@v6` (×3, including commented-out sections)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/claude-review.yml:13`
- `.github/workflows/claude.yml:25`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/release.yml:35`

### script-injection (severity: high)

Multiple workflow run: blocks interpolate ${{ }} expressions directly into shell commands (sub-rule a), allowing shell metacharacters to be injected.

(1) release.yml — `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` and `next_version="${{ steps.next_version.outputs.next_version }}"` and `echo "From commit: ${{ github.sha }}"` are all interpolated directly into run: scripts. A tag name containing shell metacharacters would be executed.

(2) sync-base-action.yml — `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` interpolates a secret directly into the shell command.

(3) action.yml (Revoke app token step) — `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` interpolates a step output directly into a curl command.

(4) test-base-action.yml — `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"` interpolated directly in run: blocks.

(5) test-custom-executables.yml — `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` interpolated directly in run: blocks.

(6) test-settings.yml — `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"` interpolated directly in run: blocks.

(7) test-structured-output.yml — `OUTPUT='${{ steps.test.outputs.structured_output }}'` and `FILE="${{ steps.test.outputs.execution_file }}"` interpolated directly in run: blocks. The structured_output value comes from Claude and could contain shell metacharacters that break out of single quotes.

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:62`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:82`
- `.github/workflows/release.yml:95`
- `.github/workflows/sync-base-action.yml:27`
- `action.yml:349`
- `.github/workflows/test-base-action.yml:37`
- `.github/workflows/test-base-action.yml:82`
- `.github/workflows/test-custom-executables.yml:57`
- `.github/workflows/test-settings.yml:35`
- `.github/workflows/test-settings.yml:100`
- `.github/workflows/test-structured-output.yml:43`
- `.github/workflows/test-structured-output.yml:248`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level `permissions:` blocks. This means the workflow runs with the default token permissions, which may be broader than necessary (e.g., write access to contents and packages on some repository configurations).

Locations:

- `.github/workflows/ci.yml:1`

### github-env-injection (severity: high)

Input-derived values are written to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

(1) action.yml — 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}` and then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH`. A newline in the input could inject an arbitrary path entry.

(2) base-action/action.yml — 'Setup Custom Bun Path' step: same pattern as above with `inputs.path_to_bun_executable`.

(3) base-action/action.yml — 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}` and then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:175`
- `base-action/action.yml:110`
- `base-action/action.yml:138`

### unsafe-shell (severity: high)

Remote scripts are fetched and piped directly to bash without first downloading and verifying them, allowing a compromised CDN or MITM to execute arbitrary code.

(1) base-action/action.yml — 'Install Claude Code' step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant wrapped in `timeout ... bash -c "curl ... | bash ..."`).

(2) .github/workflows/test-custom-executables.yml — 'Install Bun manually' step: `curl -fsSL https://bun.sh/install | bash`; 'Install Claude Code manually' step: `curl -fsSL https://claude.ai/install.sh | bash -s latest`.

Locations:

- `base-action/action.yml:126`
- `base-action/action.yml:128`
- `.github/workflows/test-custom-executables.yml:21`
- `.github/workflows/test-custom-executables.yml:33`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all action references to full commit SHAs in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6, oven-sh/setup-bun@v1, oven-sh/setup-bun@v2, and anthropics/claude-code-action@v1/main.

2. script-injection: Moved all ${{ }} expressions from run: shell scripts to env: blocks in release.yml (LATEST_TAG, NEXT_VERSION, COMMIT_SHA), sync-base-action.yml (DEPLOY_KEY), action.yml (APP_TOKEN for Revoke app token step), test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml.

3. missing-permissions: Added top-level `permissions: contents: read` block to ci.yml.

4. github-env-injection: Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing to GITHUB_PATH in action.yml (Setup Custom Bun Path) and base-action/action.yml (Setup Custom Bun Path and Install Claude Code steps).

5. unsafe-shell: Fixed curl-pipe-to-bash patterns in base-action/action.yml (Install Claude Code step) and test-custom-executables.yml (Install Bun manually and Install Claude Code manually steps) by downloading scripts to mktemp files first, then executing them separately. Dropped the '--' separator from the claude.ai install.sh invocation as required (it was the shell's option terminator, not the script's).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/agent-approval-check/action.yml line 53: moved `${{ github.action_path }}` out of the `run:` shell command string and into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now uses `python "$ACTION_PATH/agent_approval_check.py"` instead of the direct template expression.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:

1. hardened/action/.github/workflows/test-base-action.yml (line 67): Replaced the unquoted heredoc (`<< EOF` with `${PROMPT}` expansion) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The PROMPT env var is now properly double-quoted, preventing shell expansion of user-controlled input.

2. hardened/action/.github/workflows/test-structured-output.yml (line 276): Moved all five `${{ needs.*.result }}` expressions from inline `run:` shell strings into the step's `env:` block (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE). Rewrote the conditional logic using a pure shell `pass_fail` function and a `for` loop over the env vars, eliminating all `${{ }}` template interpolation from the shell script body.

