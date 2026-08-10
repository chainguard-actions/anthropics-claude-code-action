<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): ${{ }} expressions are interpolated directly inside run: shell command strings.

• action.yml — 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` is directly in the run block.

• .github/workflows/release.yml — 'Calculate next version' step: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` in run block; 'Display dry run info' step: `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, `${{ steps.get_latest_tag.outputs.latest_tag }}`; 'Create and push tag' step: `next_version="${{ steps.next_version.outputs.next_version }}"`; 'Create Release' step: `next_version="${{ steps.next_version.outputs.next_version }}"`; 'Update major version tag' step: `next_version="${{ needs.create-release.outputs.next_version }}"`.

• .github/workflows/test-base-action.yml — 'Verify inline prompt output' step: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`; 'Verify prompt file output' step: same pattern.

• .github/workflows/test-settings.yml — 'Verify settings' steps: `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"`.

• .github/workflows/test-structured-output.yml — Multiple 'Verify' steps: `OUTPUT='${{ steps.test.outputs.structured_output }}'` and `FILE="${{ steps.test.outputs.execution_file }}"`.

• .github/workflows/test-custom-executables.yml — 'Verify custom executables worked' step: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`.

Locations:

- `action.yml`
- `.github/workflows/release.yml`
- `.github/workflows/test-base-action.yml`
- `.github/workflows/test-settings.yml`
- `.github/workflows/test-structured-output.yml`
- `.github/workflows/test-custom-executables.yml`

### github-env-injection (severity: high)

Untrusted input values are written to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r').

• action.yml — 'Setup Custom Bun Path' step: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable (caller-controlled).

• base-action/action.yml — 'Setup Custom Bun Path' step: same pattern with PATH_TO_BUN_EXECUTABLE → $GITHUB_PATH without sanitization.

• base-action/action.yml — 'Install Claude Code' step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. PATH_TO_CLAUDE_CODE_EXECUTABLE is set from inputs.path_to_claude_code_executable (caller-controlled).

Locations:

- `action.yml`
- `base-action/action.yml`

### unpinned-uses (severity: high)

The following workflow files contain uses: references pinned to mutable tags or branch names instead of full 40-character commit SHAs:

• .github/workflows/ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1) — all unpinned version tags.

• .github/workflows/claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1` — unpinned version tags.

• .github/workflows/claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main` — unpinned (tag and branch).

• .github/workflows/issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main` — unpinned (tag and branch).

• .github/workflows/release.yml: `actions/checkout@v6` (×3) — unpinned version tag.

Locations:

- `.github/workflows/ci.yml`
- `.github/workflows/claude-review.yml`
- `.github/workflows/claude.yml`
- `.github/workflows/issue-triage.yml`
- `.github/workflows/release.yml`

### missing-permissions (severity: medium)

.github/workflows/ci.yml has no top-level permissions: key and none of its three jobs (test, prettier, typecheck) define a job-level permissions: block. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions.

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote content is piped directly to a shell interpreter without first downloading to a file for inspection.

• base-action/action.yml — 'Install Claude Code' step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears twice: once inside a timeout wrapper and once in the else branch).

• .github/workflows/test-custom-executables.yml — 'Install Bun manually' step: `curl -fsSL https://bun.sh/install | bash`; 'Install Claude Code manually' step: `curl -fsSL https://claude.ai/install.sh | bash -s latest`.

Locations:

- `base-action/action.yml`
- `.github/workflows/test-custom-executables.yml`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all 5 findings:

1. script-injection: Moved all ${{ }} expressions from run: blocks to env: blocks across action.yml (Revoke app token), release.yml (5 steps), test-base-action.yml (2 steps), test-settings.yml (4 steps), test-structured-output.yml (5 steps), and test-custom-executables.yml (1 step).

2. github-env-injection: Fixed GITHUB_PATH writes in action.yml and base-action/action.yml to use `printf '%s' "$VAR" | tr -d '\n\r' >> "$GITHUB_PATH"` pattern.

3. unpinned-uses: Pinned all mutable references - actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → 6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975.

4. missing-permissions: Added top-level and job-level permissions: contents: read to ci.yml.

5. unsafe-shell: Replaced all curl-pipe-bash patterns with download-then-execute pattern using mktemp. Dropped the '--' from claude.ai/install.sh invocations (it was the shell's option terminator, not the script's argument separator).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all three script-injection findings:
1. hardened/action/.github/workflows/sync-base-action.yml: Moved secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY from inline ${{ }} interpolation to env: block as DEPLOY_KEY.
2. hardened/action/.github/workflows/test-structured-output.yml: Moved all needs.*.result expressions to env: block (BASIC_RESULT, COMPLEX_RESULT, EDGE_RESULT, SANITIZATION_RESULT, EXECUTION_RESULT) and replaced inline ternary expressions and multi-line ALL_PASSED assignment with pure shell conditionals.
3. hardened/action/agent-approval-check/action.yml: Moved github.action_path from inline ${{ }} interpolation to env: block as ACTION_PATH, referenced as $ACTION_PATH in the python run command.

