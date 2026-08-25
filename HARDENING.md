<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.205

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.205** was hardened automatically. 11 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks if the referenced tag is moved or the branch is updated.

Failing references:
- ci.yml: `actions/checkout@v6`, `oven-sh/setup-bun@v2`, `oven-sh/setup-bun@v1`
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (used in two jobs)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/claude-review.yml:16`
- `.github/workflows/claude.yml:22`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/release.yml:35`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level permissions. This means the workflow runs with the default (broad) token permissions.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

release.yml interpolates ${{ }} expressions directly inside run: shell commands (sub-rule a). This includes `${{ steps.get_latest_tag.outputs.latest_tag }}` (steps.*.outputs.*), `${{ steps.next_version.outputs.next_version }}` (steps.*.outputs.*), `${{ github.sha }}` (github.*), and `${{ needs.create-release.outputs.next_version }}` (needs.*.outputs.*) — all injected directly into shell strings before the shell ever sees them.

Offending lines include:
  latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"
  echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"
  echo "From commit: ${{ github.sha }}"
  next_version="${{ steps.next_version.outputs.next_version }}" (Create and push tag step)
  next_version="${{ steps.next_version.outputs.next_version }}" (Create Release step)
  next_version="${{ needs.create-release.outputs.next_version }}" (update-major-tag job)

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:56`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:96`

### script-injection (severity: high)

test-base-action.yml interpolates `${{ steps.inline-test.outputs.execution_file }}` and `${{ steps.inline-test.outputs.conclusion }}` (steps.*.outputs.* — sub-rule a) directly inside run: shell commands. These step outputs are set by the Claude Code action and flow through YAML template substitution before the shell sees them.

Offending lines:
  OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"
  CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"
  OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"
  CONCLUSION="${{ steps.prompt-file-test.outputs.conclusion }}"

Locations:

- `.github/workflows/test-base-action.yml:47`
- `.github/workflows/test-base-action.yml:48`
- `.github/workflows/test-base-action.yml:89`
- `.github/workflows/test-base-action.yml:90`

### script-injection (severity: high)

test-custom-executables.yml interpolates `${{ steps.custom-test.outputs.execution_file }}` and `${{ steps.custom-test.outputs.conclusion }}` (steps.*.outputs.* — sub-rule a) directly inside a run: shell command.

Offending lines:
  OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"
  CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"

Locations:

- `.github/workflows/test-custom-executables.yml:72`
- `.github/workflows/test-custom-executables.yml:73`

### script-injection (severity: high)

test-settings.yml interpolates `${{ steps.inline-settings-test.outputs.execution_file }}` and `${{ steps.inline-settings-test.outputs.conclusion }}` (steps.*.outputs.* — sub-rule a) directly inside run: shell commands across multiple verify steps.

Offending lines:
  OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"
  CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"
  OUTPUT_FILE="${{ steps.file-settings-test.outputs.execution_file }}"
  CONCLUSION="${{ steps.file-settings-test.outputs.conclusion }}"

Locations:

- `.github/workflows/test-settings.yml:42`
- `.github/workflows/test-settings.yml:43`
- `.github/workflows/test-settings.yml:97`
- `.github/workflows/test-settings.yml:131`

### script-injection (severity: high)

test-structured-output.yml interpolates `${{ steps.test.outputs.structured_output }}` and `${{ steps.test.outputs.execution_file }}` (steps.*.outputs.* — sub-rule a) directly inside run: shell commands. The structured_output value is Claude-generated content, making this particularly dangerous as it could contain shell metacharacters.

Offending lines:
  OUTPUT='${{ steps.test.outputs.structured_output }}'
  FILE="${{ steps.test.outputs.execution_file }}"

Locations:

- `.github/workflows/test-structured-output.yml:55`
- `.github/workflows/test-structured-output.yml:161`
- `.github/workflows/test-structured-output.yml:218`
- `.github/workflows/test-structured-output.yml:275`
- `.github/workflows/test-structured-output.yml:330`

### unsafe-shell (severity: high)

base-action/action.yml pipes remote content directly to bash in the 'Install Claude Code' step. The script is fetched from https://claude.ai/install.sh and executed immediately without first downloading and verifying it.

Offending patterns:
  timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"
  curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"

Locations:

- `base-action/action.yml:116`

### unsafe-shell (severity: high)

test-custom-executables.yml pipes remote content directly to bash in two steps. Scripts are fetched from https://bun.sh/install and https://claude.ai/install.sh and executed immediately without downloading and verifying them first.

Offending patterns:
  curl -fsSL https://bun.sh/install | bash
  curl -fsSL https://claude.ai/install.sh | bash -s latest

Locations:

- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:33`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes $BUN_DIR (derived from the caller-controlled input `inputs.path_to_bun_executable` via `dirname`) to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline embedded in the input value could inject arbitrary entries into PATH.

Offending code:
  env:
    PATH_TO_BUN_EXECUTABLE: ${{ inputs.path_to_bun_executable }}
  run: |
    BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")
    echo "$BUN_DIR" >> "$GITHUB_PATH"   # FAIL: no tr -d newlines

Locations:

- `action.yml:196`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes $BUN_DIR (derived from the caller-controlled input `inputs.path_to_bun_executable` via `dirname`) to $GITHUB_PATH without the required sanitization step. Additionally, the 'Install Claude Code' step writes $CLAUDE_DIR (derived from `inputs.path_to_claude_code_executable` via `dirname`) to $GITHUB_PATH without sanitization.

Offending code:
  BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")
  echo "$BUN_DIR" >> "$GITHUB_PATH"   # FAIL: no tr -d newlines

  CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")
  echo "$CLAUDE_DIR" >> "$GITHUB_PATH"   # FAIL: no tr -d newlines

Locations:

- `base-action/action.yml:103`
- `base-action/action.yml:130`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 11 findings across 9 files:

1. **unpinned-uses**: Pinned all action references to full SHAs in ci.yml (actions/checkout@v6→SHA, oven-sh/setup-bun@v2→SHA, oven-sh/setup-bun@v1→SHA), claude-review.yml (actions/checkout@v6, anthropics/claude-code-action@v1), claude.yml (actions/checkout@v6, anthropics/claude-code-action@main), issue-triage.yml (actions/checkout@v6, anthropics/claude-code-action@main), release.yml (actions/checkout@v6 in two jobs).

2. **missing-permissions**: Added `permissions: contents: read` to ci.yml.

3. **script-injection (release.yml)**: Moved all ${{ steps.*.outputs.* }}, ${{ github.sha }}, and ${{ needs.*.outputs.* }} expressions to env: blocks in the Calculate next version, Display dry run info, Create and push tag, Create Release, and Update major version tag steps.

4. **script-injection (test-base-action.yml, test-custom-executables.yml, test-settings.yml, test-structured-output.yml)**: Moved all ${{ steps.*.outputs.* }} expressions from run: shell strings to env: blocks.

5. **unsafe-shell (base-action/action.yml)**: Replaced `curl ... | bash -s -- $VERSION` with download-to-tempfile then `bash script VERSION` (dropping the '--' shell option terminator as instructed).

6. **unsafe-shell (test-custom-executables.yml)**: Replaced both `curl ... | bash` patterns with download-to-tempfile then execute.

7. **github-env-injection (action.yml, base-action/action.yml)**: Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all three script-injection findings:
1. agent-approval-check/action.yml: Moved ${{ github.action_path }} into env: block as ACTION_PATH, referenced as $ACTION_PATH in run: shell.
2. .github/workflows/sync-base-action.yml: Moved ${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }} into env: block as DEPLOY_KEY, referenced as $DEPLOY_KEY in run: shell.
3. .github/workflows/test-structured-output.yml: Moved all five ${{ needs.*.result }} expressions into env: block as RESULT_* variables; replaced inline ${{ }} ternary expressions with a pass_or_fail() shell function and replaced the multi-line ALL_PASSED=${{ ... }} expression with a proper shell if-statement.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection vulnerability in the 'Revoke app token' step of action.yml (line 573). Moved `${{ steps.run.outputs.github_token }}` from the `run:` shell command string into an `env:` block as `APP_TOKEN`, and updated the Authorization header to reference `$APP_TOKEN` instead. This prevents the GitHub Actions template engine from expanding the expression directly in the shell, eliminating the risk of a malicious token value injecting arbitrary shell commands.

