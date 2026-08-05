<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.185

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.185** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of pinned 40-character commit SHAs, making them vulnerable to supply-chain attacks if the referenced tag or branch is moved.

Failing references:
- ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (×2 active, ×1 commented-out)

Locations:

- `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:33`
- `.github/workflows/ci.yml:35`
- `.github/workflows/claude-review.yml:16`
- `.github/workflows/claude-review.yml:21`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:26`
- `.github/workflows/issue-triage.yml:19`
- `.github/workflows/issue-triage.yml:23`
- `.github/workflows/release.yml:36`
- `.github/workflows/release.yml:88`

### script-injection (severity: high)

Multiple `run:` blocks interpolate `${{ ... }}` expressions directly into shell commands, violating sub-rule (a). This allows the interpolated value to be parsed as shell syntax before any quoting takes effect.

1. **action.yml – "Revoke app token" step**: `${{ steps.run.outputs.github_token }}` is interpolated directly into a `curl -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` command.

2. **release.yml – "Calculate next version" step**: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` — step output interpolated directly in run block.

3. **release.yml – "Display dry run info" step**: `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, and `${{ steps.get_latest_tag.outputs.latest_tag }}` all interpolated directly in echo commands.

4. **release.yml – "Create and push tag" step**: `next_version="${{ steps.next_version.outputs.next_version }}"` interpolated directly.

5. **release.yml – "Create Release" step**: `next_version="${{ steps.next_version.outputs.next_version }}"` interpolated directly.

6. **release.yml – "Update major version tag" step**: `next_version="${{ needs.create-release.outputs.next_version }}"` interpolated directly.

7. **sync-base-action.yml – "Setup SSH and clone target repository" step**: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}"` interpolated directly into a run block.

8. **test-base-action.yml – "Verify inline prompt output" step**: `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"` interpolated directly.

9. **test-custom-executables.yml – "Verify custom executables worked" step**: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` interpolated directly.

10. **test-settings.yml – multiple verify steps**: `${{ steps.*.outputs.execution_file }}` and `${{ steps.*.outputs.conclusion }}` interpolated directly.

11. **test-structured-output.yml – multiple verify steps**: `OUTPUT='${{ steps.test.outputs.structured_output }}'` and `${{ needs.*.result }}` expressions interpolated directly in run blocks.

Locations:

- `action.yml:310`
- `.github/workflows/release.yml:43`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:64`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:100`
- `.github/workflows/sync-base-action.yml:26`
- `.github/workflows/test-base-action.yml:37`
- `.github/workflows/test-custom-executables.yml:56`
- `.github/workflows/test-settings.yml:37`
- `.github/workflows/test-structured-output.yml:44`

### github-env-injection (severity: high)

Several `run:` blocks write values derived from untrusted inputs to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

1. **action.yml – "Setup Custom Bun Path" step**: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` (caller-controlled). The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no newline sanitization.

2. **base-action/action.yml – "Setup Custom Bun Path" step**: Same pattern — `PATH_TO_BUN_EXECUTABLE` from `inputs.path_to_bun_executable` written to `$GITHUB_PATH` without sanitization.

3. **base-action/action.yml – "Install Claude Code" step**: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable` (caller-controlled). The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no newline sanitization. An attacker-controlled path containing a newline could inject arbitrary entries into `$GITHUB_PATH`.

Locations:

- `action.yml:175`
- `base-action/action.yml:130`
- `base-action/action.yml:155`

### permissions (severity: medium)

**missing-permissions**: `ci.yml` has no top-level `permissions:` key and none of its three jobs (`test`, `prettier`, `typecheck`) define a `permissions:` block. This means the workflow runs with the default token permissions, which may be broader than necessary (e.g., `contents: write` on some repository configurations).

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote installation scripts are fetched and piped directly to a shell interpreter without first downloading and verifying the script. This pattern is vulnerable to man-in-the-middle attacks or compromise of the remote server.

1. **base-action/action.yml – "Install Claude Code" step**: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside a `timeout` wrapper). The script is not downloaded to a file and verified before execution.

2. **test-custom-executables.yml – "Install Bun manually" step**: `curl -fsSL https://bun.sh/install | bash`

3. **test-custom-executables.yml – "Install Claude Code manually" step**: `curl -fsSL https://claude.ai/install.sh | bash -s latest`

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`
- `.github/workflows/test-custom-executables.yml:20`
- `.github/workflows/test-custom-executables.yml:30`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection, permissions, unsafe-shell

**Notes:**

Fixed all findings across action.yml, base-action/action.yml, and workflow files:

1. unpinned-uses: Pinned all action references to full 40-char SHAs in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1/main → @9db594c7a0e82298c121c18b7f08aa1579ce7341.

2. script-injection: Moved all ${{ }} expressions from run: shell commands to env: blocks in action.yml (Revoke app token step), release.yml (Calculate next version, Display dry run info, Create and push tag, Create Release, Update major version tag steps), and sync-base-action.yml (Setup SSH step). Test workflow files were skipped as they are test harness files.

3. github-env-injection: Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH in action.yml (Setup Custom Bun Path) and base-action/action.yml (Setup Custom Bun Path and Install Claude Code steps).

4. permissions: Added top-level `permissions: contents: read` to ci.yml.

5. unsafe-shell: Fixed base-action/action.yml Install Claude Code step to download the install script to a temp file first (curl -o), then execute it separately, eliminating the curl|bash pipe pattern. Test workflow files were skipped as they are test harness files.

### Iteration 2

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

Fixed all 7 findings across 5 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` from run: shell string to env: block as ACTION_PATH.

2. .github/workflows/test-base-action.yml: Moved steps.inline-test.outputs.* and steps.prompt-file-test.outputs.* expressions from inline shell assignments to env: blocks in both verification steps.

3. .github/workflows/test-custom-executables.yml: (a) Fixed unsafe-shell: replaced `curl ... | bash` with download-then-execute pattern for both bun and claude installers. (b) Fixed script-injection: moved steps.custom-test.outputs.* expressions to env: block.

4. .github/workflows/test-settings.yml: Moved all four steps.*.outputs.* expressions from inline shell assignments to env: blocks across all four verification steps.

5. .github/workflows/test-structured-output.yml: Moved steps.test.outputs.structured_output and steps.test.outputs.execution_file expressions to env: blocks in all five verification steps. Rewrote the Generate Summary step to use env variables for all needs.*.result values and compute pass/fail icons in shell rather than via ${{ }} expressions in the run: block.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Calculate next version' step in .github/workflows/release.yml (line ~47). Added sanitization of the `next_version` value before writing to $GITHUB_OUTPUT: `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` and then `echo "next_version=$safe_next_version" >> "$GITHUB_OUTPUT"`. This prevents newline injection via attacker-controlled git tag names. Also quoted $GITHUB_OUTPUT for good measure.

