<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.200

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.200** was hardened automatically. 13 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): `${{ steps.run.outputs.github_token }}` is interpolated directly inside a `run:` shell command string in the 'Revoke app token' step. The expression is embedded in a curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` header, meaning the value is substituted by the Actions runner before the shell ever sees it, allowing newlines or shell metacharacters in the token value to break out of the quoted string.

Locations:

- `action.yml:330`

### script-injection (severity: high)

Rule (a): `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` is interpolated directly inside a `run:` shell command string in the 'Setup SSH and clone target repository' step of sync-base-action.yml. The secret value is passed via `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base`, which substitutes the secret before the shell processes it. A secret containing shell metacharacters or newlines could cause unexpected behavior.

Locations:

- `.github/workflows/sync-base-action.yml:22`

### script-injection (severity: high)

Rule (a): Multiple `${{ steps.*.outputs.* }}` and `${{ needs.*.outputs.* }}` expressions are interpolated directly inside `run:` shell command strings in release.yml. Affected steps include: 'Calculate next version' (`${{ steps.get_latest_tag.outputs.latest_tag }}`), 'Display dry run info' (`${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, `${{ steps.get_latest_tag.outputs.latest_tag }}`), 'Create and push tag' (`${{ steps.next_version.outputs.next_version }}`), 'Create Release' (`${{ steps.next_version.outputs.next_version }}`), and 'Update major version tag' (`${{ needs.create-release.outputs.next_version }}`). These are substituted before the shell processes the script.

Locations:

- `.github/workflows/release.yml:48`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:65`
- `.github/workflows/release.yml:75`
- `.github/workflows/release.yml:97`

### script-injection (severity: high)

Rule (a): `${{ steps.inline-test.outputs.execution_file }}`, `${{ steps.inline-test.outputs.conclusion }}`, `${{ steps.prompt-file-test.outputs.execution_file }}`, and `${{ steps.prompt-file-test.outputs.conclusion }}` are interpolated directly inside `run:` shell command strings in test-base-action.yml. These step output values are substituted before the shell processes the script.

Locations:

- `.github/workflows/test-base-action.yml:44`
- `.github/workflows/test-base-action.yml:45`
- `.github/workflows/test-base-action.yml:95`
- `.github/workflows/test-base-action.yml:96`

### script-injection (severity: high)

Rule (a): `${{ steps.custom-test.outputs.execution_file }}` and `${{ steps.custom-test.outputs.conclusion }}` are interpolated directly inside `run:` shell command strings in test-custom-executables.yml. These step output values are substituted before the shell processes the script.

Locations:

- `.github/workflows/test-custom-executables.yml:64`
- `.github/workflows/test-custom-executables.yml:65`

### script-injection (severity: high)

Rule (a): Multiple `${{ steps.*.outputs.* }}` expressions are interpolated directly inside `run:` shell command strings in test-settings.yml. Affected steps include 'Verify echo worked' and 'Verify echo was denied' steps that use `${{ steps.inline-settings-test.outputs.execution_file }}`, `${{ steps.inline-settings-test.outputs.conclusion }}`, `${{ steps.file-settings-test.outputs.execution_file }}`, and `${{ steps.file-settings-test.outputs.conclusion }}`.

Locations:

- `.github/workflows/test-settings.yml:44`
- `.github/workflows/test-settings.yml:45`
- `.github/workflows/test-settings.yml:96`
- `.github/workflows/test-settings.yml:143`

### script-injection (severity: high)

Rule (a): Multiple `${{ steps.test.outputs.structured_output }}` and `${{ steps.test.outputs.execution_file }}` expressions are interpolated directly inside `run:` shell command strings in test-structured-output.yml. The structured_output value comes from Claude's AI-generated output and is assigned to a shell variable via `OUTPUT='${{ steps.test.outputs.structured_output }}'` without any quoting protection at the substitution point.

Locations:

- `.github/workflows/test-structured-output.yml:52`
- `.github/workflows/test-structured-output.yml:113`
- `.github/workflows/test-structured-output.yml:174`
- `.github/workflows/test-structured-output.yml:235`
- `.github/workflows/test-structured-output.yml:296`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via the `PATH_TO_BUN_EXECUTABLE` env var) to `$GITHUB_PATH` without sanitization. An attacker-controlled input containing newlines could inject arbitrary entries into `$GITHUB_PATH`. The pattern `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"); echo "$BUN_DIR" >> "$GITHUB_PATH"` lacks the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `action.yml:165`
- `base-action/action.yml:120`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable` via the `PATH_TO_CLAUDE_CODE_EXECUTABLE` env var) to `$GITHUB_PATH` without sanitization. An attacker-controlled input containing newlines could inject arbitrary entries into `$GITHUB_PATH`. The pattern `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"); echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` lacks the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:152`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first verifying the content. If the remote URL is compromised or the request is intercepted, arbitrary code executes on the runner. The script should be downloaded to a file, verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:138`
- `base-action/action.yml:140`

### unsafe-shell (severity: high)

The 'Install Bun manually' and 'Install Claude Code manually' steps in test-custom-executables.yml pipe remote content directly to bash: `curl -fsSL https://bun.sh/install | bash` and `curl -fsSL https://claude.ai/install.sh | bash -s latest`. This executes whatever the remote server returns without verification.

Locations:

- `.github/workflows/test-custom-executables.yml:23`
- `.github/workflows/test-custom-executables.yml:36`

### unpinned-uses (severity: high)

Multiple workflow files and action files use `uses:` references pinned to mutable tags or branch names instead of full 40-character commit SHAs. Mutable refs can be silently updated to point to malicious code. Affected references include: `actions/checkout@v6` (ci.yml, claude.yml, claude-review.yml, issue-triage.yml, release.yml×3), `oven-sh/setup-bun@v2` and `oven-sh/setup-bun@v1` (ci.yml), `anthropics/claude-code-action@main` (claude.yml, issue-triage.yml), `anthropics/claude-code-action@v1` (claude-review.yml).

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:13`
- `.github/workflows/ci.yml:27`
- `.github/workflows/ci.yml:31`
- `.github/workflows/ci.yml:45`
- `.github/workflows/ci.yml:49`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:28`
- `.github/workflows/claude-review.yml:17`
- `.github/workflows/claude-review.yml:23`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:24`
- `.github/workflows/release.yml:36`
- `.github/workflows/release.yml:88`
- `.github/workflows/release.yml:107`

### missing-permissions (severity: medium)

The workflow file ci.yml has no top-level `permissions:` key and no job-level `permissions:` key on any of its jobs (`test`, `prettier`, `typecheck`). Without explicit permissions, the workflow inherits the repository's default token permissions, which may be overly broad (e.g., `contents: write` by default on some repositories). Explicit minimal permissions should be declared.

Locations:

- `.github/workflows/ci.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell, unpinned-uses, missing-permissions

**Notes:**

Fixed all 13 findings across 9 files:

1. action.yml: Fixed script-injection in 'Revoke app token' (moved github_token to env block); fixed github-env-injection in 'Setup Custom Bun Path' (added tr -d '\n\r' sanitization).

2. base-action/action.yml: Fixed github-env-injection in 'Setup Custom Bun Path' (sanitized BUN_DIR); fixed unsafe-shell and github-env-injection in 'Install Claude Code' (download script to temp file before executing, sanitized CLAUDE_DIR).

3. sync-base-action.yml: Fixed script-injection in 'Setup SSH' (moved deploy key secret to env block, used printf to write it safely).

4. release.yml: Fixed script-injection in 5 steps (moved all step/needs outputs and github.sha to env blocks); pinned actions/checkout@v6 to full SHA in both jobs.

5. test-base-action.yml: Fixed script-injection in 2 verify steps (moved execution_file and conclusion outputs to env blocks).

6. test-custom-executables.yml: Fixed unsafe-shell in 2 install steps (download-then-execute pattern); fixed script-injection in verify step (moved outputs to env block).

7. test-settings.yml: Fixed script-injection in 4 verify steps (moved all step outputs to env blocks).

8. test-structured-output.yml: Fixed script-injection in 5 verify steps (moved structured_output and execution_file to env blocks).

9. ci.yml: Added top-level `permissions: contents: read`; pinned actions/checkout@v6, oven-sh/setup-bun@v2, and oven-sh/setup-bun@v1 to full commit SHAs.

10. claude.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

11. claude-review.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@v1 to full SHAs.

12. issue-triage.yml: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Generate Summary' step in the test-summary job of .github/workflows/test-structured-output.yml. All ${{ needs.*.result }} expressions were moved from the run: shell script block into an env: block (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE). The shell script now uses plain environment variable references and shell [ ] conditionals to compute pass/fail labels and the overall ALL_PASSED check, eliminating the script injection risk.

### Iteration 3

**Fixes applied:** script-injection, github-env-injection

**Notes:**

1. agent-approval-check/action.yml (line 56): Moved `${{ github.action_path }}` from the run: shell command into an env: variable `ACTION_PATH: ${{ github.action_path }}`, and updated the shell command to use `python "$ACTION_PATH/agent_approval_check.py"` instead. 2. .github/workflows/release.yml (line 67): Added newline sanitization before writing next_version to $GITHUB_OUTPUT: `safe=$(printf '%s' "$next_version" | tr -d '\n\r')` and then `echo "next_version=$safe" >> "$GITHUB_OUTPUT"` to prevent newline injection attacks.

