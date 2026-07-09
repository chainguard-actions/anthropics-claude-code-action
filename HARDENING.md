<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.169

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **anthropics--claude-code-action/v1.0.169** was hardened automatically. 19 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ github.action_path }} is interpolated directly inside a run: shell command string. The expression `run: python "${{ github.action_path }}/agent_approval_check.py"` passes the action_path context through YAML template substitution before the shell sees it.

Locations:

- `agent-approval-check/action.yml:47`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.run.outputs.github_token }} is interpolated directly inside a run: shell command string in the 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`.

Locations:

- `action.yml:310`

### script-injection (severity: high)

Sub-rule (a): Multiple ${{ }} expressions are interpolated directly inside run: shell command strings in release.yml. Offending lines include: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`, `echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"`, `echo "From commit: ${{ github.sha }}"`, `next_version="${{ steps.next_version.outputs.next_version }}"`, and `next_version="${{ needs.create-release.outputs.next_version }}"`.

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:56`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:98`

### script-injection (severity: high)

Sub-rule (a): ${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }} is interpolated directly inside a run: shell command string: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base`.

Locations:

- `.github/workflows/sync-base-action.yml:22`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.*.outputs.* }} expressions are interpolated directly inside run: shell command strings in test-base-action.yml. Offending lines include: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`.

Locations:

- `.github/workflows/test-base-action.yml:36`
- `.github/workflows/test-base-action.yml:37`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.*.outputs.* }} expressions are interpolated directly inside run: shell command strings in test-custom-executables.yml. Offending lines include: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`.

Locations:

- `.github/workflows/test-custom-executables.yml:60`
- `.github/workflows/test-custom-executables.yml:61`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.*.outputs.* }} expressions are interpolated directly inside run: shell command strings in test-settings.yml. Offending lines include: `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"`.

Locations:

- `.github/workflows/test-settings.yml:35`
- `.github/workflows/test-settings.yml:36`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.test.outputs.structured_output }} is interpolated directly inside run: shell command strings in test-structured-output.yml. Offending line: `OUTPUT='${{ steps.test.outputs.structured_output }}'`.

Locations:

- `.github/workflows/test-structured-output.yml:47`

### unpinned-uses (severity: high)

Multiple uses: references are pinned to mutable tags/branches rather than full 40-character commit SHAs. Failing references: `actions/checkout@v6`, `oven-sh/setup-bun@v2`, `oven-sh/setup-bun@v1`.

Locations:

- `.github/workflows/ci.yml:10`

### unpinned-uses (severity: high)

Multiple uses: references are pinned to mutable tags rather than full 40-character commit SHAs. Failing references: `actions/checkout@v6`, `anthropics/claude-code-action@v1`.

Locations:

- `.github/workflows/claude-review.yml:14`

### unpinned-uses (severity: high)

Multiple uses: references are pinned to mutable tags/branches rather than full 40-character commit SHAs. Failing references: `actions/checkout@v6`, `anthropics/claude-code-action@main`.

Locations:

- `.github/workflows/claude.yml:21`

### unpinned-uses (severity: high)

Multiple uses: references are pinned to mutable tags/branches rather than full 40-character commit SHAs. Failing references: `actions/checkout@v6`, `anthropics/claude-code-action@main`.

Locations:

- `.github/workflows/issue-triage.yml:18`

### unpinned-uses (severity: high)

uses: references are pinned to a mutable tag rather than a full 40-character commit SHA. Failing references: `actions/checkout@v6` (used in multiple jobs).

Locations:

- `.github/workflows/release.yml:36`

### permissions (severity: medium)

missing-permissions: The workflow file has no top-level permissions: key and none of its jobs (test, prettier, typecheck) have a job-level permissions: key.

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote content is piped directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` in the 'Install Claude Code' step.

Locations:

- `base-action/action.yml:121`

### unsafe-shell (severity: high)

Remote content is piped directly to bash without first downloading to a file: `curl -fsSL https://bun.sh/install | bash` and `curl -fsSL https://claude.ai/install.sh | bash -s latest`.

Locations:

- `.github/workflows/test-custom-executables.yml:18`
- `.github/workflows/test-custom-executables.yml:30`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is written via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without applying `printf '%s' ... | tr -d '\n\r'`.

Locations:

- `action.yml:186`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is written via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without applying `printf '%s' ... | tr -d '\n\r'`.

Locations:

- `base-action/action.yml:96`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization. PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }}, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is written via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without applying `printf '%s' ... | tr -d '\n\r'`.

Locations:

- `base-action/action.yml:130`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, permissions, unsafe-shell, github-env-injection

**Notes:**

Fixed all findings across multiple files: (1) script-injection in agent-approval-check/action.yml - moved github.action_path to env block; (2) script-injection in action.yml Revoke app token step - moved github_token to env block; (3) script-injection in release.yml - moved all ${{ steps.*.outputs.* }}, ${{ github.sha }}, and ${{ needs.*.outputs.* }} expressions to env blocks; (4) script-injection in sync-base-action.yml - moved secret to env block; (5) script-injection in test-base-action.yml, test-custom-executables.yml, test-settings.yml, test-structured-output.yml - moved all step output expressions to env blocks; (6) unpinned-uses in ci.yml - pinned actions/checkout@v6 to SHA df4cb1c069e1874edd31b4311f1884172cec0e10, oven-sh/setup-bun@v2 to SHA 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 to SHA f4d14e03ff726c06358e5557344e1da148b56cf7; (7) unpinned-uses in claude-review.yml - pinned actions/checkout@v6 and anthropics/claude-code-action@v1 to full SHAs; (8) unpinned-uses in claude.yml and issue-triage.yml - pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs; (9) unpinned-uses in release.yml - pinned actions/checkout@v6 to full SHA in both jobs; (10) missing-permissions in ci.yml - added top-level permissions: {}; (11) unsafe-shell in base-action/action.yml - download claude install script to /tmp file before executing; (12) unsafe-shell in test-custom-executables.yml - download bun and claude install scripts to /tmp files before executing; (13) github-env-injection in action.yml Setup Custom Bun Path - sanitize BUN_DIR with printf/tr before writing to GITHUB_PATH; (14) github-env-injection in base-action/action.yml Setup Custom Bun Path and Install Claude Code - sanitize BUN_DIR and CLAUDE_DIR with printf/tr before writing to GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Generate Summary' step in .github/workflows/test-structured-output.yml. All five ${{ needs.*.result }} expressions (and the multi-line ALL_PASSED expression) were moved out of the run: block into an env: block as RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, and RESULT_EXECUTION_FILE. The shell script was updated to use these env vars directly, computing pass/fail labels and the all-passed check using pure shell conditionals instead of GitHub Actions template expressions.

