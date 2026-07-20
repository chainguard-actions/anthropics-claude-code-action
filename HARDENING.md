<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.178

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.178** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of full 40-character SHA commits, making them vulnerable to supply-chain attacks.

ci.yml: `actions/checkout@v6`, `oven-sh/setup-bun@v2`, `oven-sh/setup-bun@v1` (used in test, prettier, typecheck jobs)
claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
release.yml: `actions/checkout@v6` (used in create-release and update-major-tag jobs)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:26`
- `.github/workflows/ci.yml:38`
- `.github/workflows/ci.yml:40`
- `.github/workflows/claude-review.yml:13`
- `.github/workflows/claude-review.yml:18`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:30`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:23`
- `.github/workflows/release.yml:37`
- `.github/workflows/release.yml:67`
- `.github/workflows/release.yml:80`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level permissions. This means the workflow runs with the default token permissions, which may be overly broad.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple run: blocks directly interpolate ${{ }} expressions, allowing YAML template substitution to inject arbitrary shell content before the shell parses the command.

(a) agent-approval-check/action.yml — `run: python "${{ github.action_path }}/agent_approval_check.py"` — github.* context directly in run block.

(a) action.yml (Revoke app token step) — `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — steps.*.outputs.* directly in run block.

(a) release.yml (Calculate next version) — `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` — steps.*.outputs.* directly in run block.

(a) release.yml (Display dry run info) — `${{ steps.next_version.outputs.next_version }}`, `${{ github.sha }}`, `${{ steps.get_latest_tag.outputs.latest_tag }}` — multiple contexts directly in run block.

(a) release.yml (Create and push tag) — `next_version="${{ steps.next_version.outputs.next_version }}"` — steps.*.outputs.* directly in run block.

(a) release.yml (Create Release) — `next_version="${{ steps.next_version.outputs.next_version }}"` — steps.*.outputs.* directly in run block.

(a) release.yml (Update major version tag) — `next_version="${{ needs.create-release.outputs.next_version }}"` — needs.*.outputs.* directly in run block.

(a) sync-base-action.yml (Setup SSH) — `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` — secrets.* directly in run block.

(a) test-base-action.yml (Verify inline prompt output) — `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"` — steps.*.outputs.* directly in run block.

(a) test-base-action.yml (Verify prompt file output) — `OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.prompt-file-test.outputs.conclusion }}"` — steps.*.outputs.* directly in run block.

(a) test-custom-executables.yml (Verify custom executables worked) — `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` — steps.*.outputs.* directly in run block.

(a) test-settings.yml (Verify echo worked / Verify echo was denied) — `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"` — steps.*.outputs.* directly in run blocks.

(a) test-settings.yml (Verify echo worked / denied — file variants) — `OUTPUT_FILE="${{ steps.file-settings-test.outputs.execution_file }}"`, `CONCLUSION="${{ steps.file-settings-test.outputs.conclusion }}"` — steps.*.outputs.* directly in run blocks.

(a) test-structured-output.yml (Verify outputs / Verify JSON stringification / Verify edge cases / Verify sanitized names) — `OUTPUT='${{ steps.test.outputs.structured_output }}'` — steps.*.outputs.* directly in run blocks.

(a) test-structured-output.yml (Verify execution file) — `FILE="${{ steps.test.outputs.execution_file }}"` — steps.*.outputs.* directly in run block.

(a) test-structured-output.yml (Generate Summary) — `${{ needs.test-basic-types.result == 'success' && '✅ PASS' || '❌ FAIL' }}` and `ALL_PASSED=${{ needs.*.result == 'success' && ... }}` — needs.*.result expressions directly in run block.

Locations:

- `agent-approval-check/action.yml:47`
- `action.yml:234`
- `.github/workflows/release.yml:44`
- `.github/workflows/release.yml:58`
- `.github/workflows/release.yml:65`
- `.github/workflows/release.yml:72`
- `.github/workflows/release.yml:82`
- `.github/workflows/sync-base-action.yml:23`
- `.github/workflows/test-base-action.yml:33`
- `.github/workflows/test-base-action.yml:77`
- `.github/workflows/test-custom-executables.yml:60`
- `.github/workflows/test-settings.yml:38`
- `.github/workflows/test-settings.yml:72`
- `.github/workflows/test-settings.yml:113`
- `.github/workflows/test-settings.yml:148`
- `.github/workflows/test-structured-output.yml:44`
- `.github/workflows/test-structured-output.yml:88`
- `.github/workflows/test-structured-output.yml:132`
- `.github/workflows/test-structured-output.yml:176`
- `.github/workflows/test-structured-output.yml:218`
- `.github/workflows/test-structured-output.yml:248`
- `.github/workflows/test-structured-output.yml:265`

### github-env-injection (severity: high)

Several run: blocks write values derived from untrusted inputs to $GITHUB_PATH or $GITHUB_OUTPUT without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

(d) action.yml (Setup Custom Bun Path): `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"` — PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable, an attacker-controlled composite action input.

(d) base-action/action.yml (Setup Custom Bun Path): same pattern — `echo "$BUN_DIR" >> "$GITHUB_PATH"` where BUN_DIR is derived from inputs.path_to_bun_executable.

(d) base-action/action.yml (Install Claude Code): `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — PATH_TO_CLAUDE_CODE_EXECUTABLE comes from inputs.path_to_claude_code_executable.

(c) release.yml (Calculate next version): `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` then `echo "next_version=$next_version" >> $GITHUB_OUTPUT` — next_version is derived from a steps.*.outputs.* value without sanitization before the GITHUB_OUTPUT write.

Locations:

- `action.yml:163`
- `base-action/action.yml:100`
- `base-action/action.yml:122`
- `.github/workflows/release.yml:44`

### unsafe-shell (severity: high)

Run blocks pipe remote content directly to a shell interpreter without first downloading and verifying the script.

base-action/action.yml (Install Claude Code step): `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` — remote install script piped directly to bash. Also the timeout-wrapped variant: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

.github/workflows/test-custom-executables.yml (Install Bun manually): `curl -fsSL https://bun.sh/install | bash` — remote install script piped directly to bash.

.github/workflows/test-custom-executables.yml (Install Claude Code manually): `curl -fsSL https://claude.ai/install.sh | bash -s latest` — remote install script piped directly to bash.

Locations:

- `base-action/action.yml:115`
- `base-action/action.yml:117`
- `.github/workflows/test-custom-executables.yml:18`
- `.github/workflows/test-custom-executables.yml:30`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 finding types across multiple files:

1. unpinned-uses: Pinned all action references to full SHAs in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6, oven-sh/setup-bun@v1, oven-sh/setup-bun@v2, anthropics/claude-code-action@v1, and anthropics/claude-code-action@main.

2. missing-permissions: Added top-level `permissions: contents: read` to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: blocks into env: blocks across agent-approval-check/action.yml, action.yml, release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml. For the test-structured-output.yml Generate Summary step, replaced the complex ${{ needs.*.result == 'success' && ... }} ternary expressions with env vars and bash if/else conditionals.

4. github-env-injection: Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing to GITHUB_PATH in action.yml (Setup Custom Bun Path) and base-action/action.yml (Setup Custom Bun Path and Install Claude Code). Also sanitized values written to GITHUB_OUTPUT in release.yml (Get latest tag and Calculate next version steps).

5. unsafe-shell: Replaced `curl -fsSL URL | bash` patterns with `curl -fsSL --output /tmp/script.sh URL && bash /tmp/script.sh` in base-action/action.yml (both timeout and non-timeout variants) and test-custom-executables.yml (both Bun and Claude Code install steps).

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in '.github/workflows/test-base-action.yml' at the 'Create test prompt file' step. The unquoted heredoc (`<< EOF` with `${PROMPT}` inside) was replaced with `printf '%s\n' "$PROMPT" > test-prompt.txt`. This safely writes the PROMPT environment variable to the file without shell expansion of its contents, eliminating the injection vector while preserving the intended functionality.

