<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.204

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.204** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks:
- ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (×3)

Locations:

- `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:23`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:36`
- `.github/workflows/ci.yml:38`
- `.github/workflows/claude-review.yml:18`
- `.github/workflows/claude-review.yml:22`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:22`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:88`
- `.github/workflows/release.yml:105`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level permissions. This means the workflow runs with the default token permissions, which may be broader than necessary.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple workflow run: blocks directly interpolate ${{ }} expressions into shell commands, violating rule (a). This allows expression values to be interpreted as shell code before quoting can protect them.

**release.yml** — `steps.*.outputs.*` and `github.*` values interpolated directly:
- `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`
- `next_version="${{ steps.next_version.outputs.next_version }}"`  (appears in three separate run blocks)
- `echo "From commit: ${{ github.sha }}"`
- `next_version="${{ needs.create-release.outputs.next_version }}"`

**sync-base-action.yml** — secret interpolated directly in a run block:
- `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base`

**test-base-action.yml** — `steps.*.outputs.*` values interpolated directly:
- `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"`
- `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"`
- `OUTPUT_FILE="${{ steps.prompt-file-test.outputs.execution_file }}"`
- `CONCLUSION="${{ steps.prompt-file-test.outputs.conclusion }}"`

**test-custom-executables.yml** — `steps.*.outputs.*` values interpolated directly:
- `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`
- `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"`

**test-settings.yml** — `steps.*.outputs.*` values interpolated directly:
- `OUTPUT_FILE="${{ steps.inline-settings-test.outputs.execution_file }}"`
- `CONCLUSION="${{ steps.inline-settings-test.outputs.conclusion }}"`
- `OUTPUT_FILE="${{ steps.file-settings-test.outputs.execution_file }}"`
- `CONCLUSION="${{ steps.file-settings-test.outputs.conclusion }}"`

**test-structured-output.yml** — `steps.*.outputs.*` and `needs.*.result` values interpolated directly:
- `OUTPUT='${{ steps.test.outputs.structured_output }}'`  (×4 jobs)
- `FILE="${{ steps.test.outputs.execution_file }}"`
- `echo "| Basic Types | ${{ needs.test-basic-types.result == 'success' && '✅ PASS' || '❌ FAIL' }} |"`  (and similar for other needs)

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:71`
- `.github/workflows/release.yml:80`
- `.github/workflows/release.yml:100`
- `.github/workflows/sync-base-action.yml:23`
- `.github/workflows/test-base-action.yml:37`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:72`
- `.github/workflows/test-base-action.yml:73`
- `.github/workflows/test-custom-executables.yml:56`
- `.github/workflows/test-custom-executables.yml:57`
- `.github/workflows/test-settings.yml:35`
- `.github/workflows/test-settings.yml:36`
- `.github/workflows/test-settings.yml:82`
- `.github/workflows/test-settings.yml:110`
- `.github/workflows/test-settings.yml:111`
- `.github/workflows/test-settings.yml:143`
- `.github/workflows/test-structured-output.yml:44`
- `.github/workflows/test-structured-output.yml:100`
- `.github/workflows/test-structured-output.yml:156`
- `.github/workflows/test-structured-output.yml:210`
- `.github/workflows/test-structured-output.yml:252`
- `.github/workflows/test-structured-output.yml:280`

### unsafe-shell (severity: high)

Remote install scripts are fetched and piped directly to bash without first downloading and verifying them:
- base-action/action.yml: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (inside a timeout wrapper and also directly)
- .github/workflows/test-custom-executables.yml: `curl -fsSL https://bun.sh/install | bash` and `curl -fsSL https://claude.ai/install.sh | bash -s latest`
If the remote server is compromised or the URL is hijacked, arbitrary code executes on the runner.

Locations:

- `base-action/action.yml:107`
- `base-action/action.yml:109`
- `.github/workflows/test-custom-executables.yml:18`
- `.github/workflows/test-custom-executables.yml:27`

### github-env-injection (severity: high)

In both action.yml and base-action/action.yml, the 'Setup Custom Bun Path' step writes a value derived from the caller-controlled input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization:
```
env:
  PATH_TO_BUN_EXECUTABLE: ${{ inputs.path_to_bun_executable }}
run: |
  BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")
  echo "$BUN_DIR" >> "$GITHUB_PATH"   # FAIL: no tr -d newlines
```
Similarly, base-action/action.yml writes `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` (from `inputs.path_to_claude_code_executable`) to $GITHUB_PATH without sanitization. A calling workflow can supply a value containing newlines to inject arbitrary entries into PATH.

Locations:

- `action.yml:224`
- `base-action/action.yml:96`
- `base-action/action.yml:122`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned actions/checkout@v6 → SHA d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → SHA 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → SHA f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 → SHA 6bcfb8263aca9b0eab0aba20d96dddd74de2875f, anthropics/claude-code-action@main → SHA 16b3b310c3d7b5279df73130324d5205aeea8eac across ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

2. missing-permissions: Added top-level 'permissions: contents: read' to ci.yml.

3. script-injection: Moved all ${{ steps.*.outputs.* }}, ${{ github.sha }}, ${{ needs.*.result }}, and ${{ secrets.* }} expressions from run: shell blocks into env: blocks across release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml. Replaced inline ${{ needs.*.result == 'success' && '✅ PASS' || '❌ FAIL' }} ternary expressions with shell if/else logic.

4. unsafe-shell: Fixed curl|bash piping in base-action/action.yml (both the timeout-wrapped and direct forms) and test-custom-executables.yml by downloading scripts to temp files (mktemp) first, then executing them separately. Correctly dropped the '--' separator that was the shell's option terminator.

5. github-env-injection: Added 'safe_bun_dir=$(printf \'%s\' "$BUN_DIR" | tr -d \'\n\r\')' sanitization before writing to $GITHUB_PATH in action.yml (Setup Custom Bun Path step) and base-action/action.yml (both Setup Custom Bun Path and Install Claude Code steps for the custom executable path).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script injection findings:
1. hardened/action/action.yml (line 537): Moved `${{ steps.run.outputs.github_token }}` from the curl command in the 'Revoke app token' step into an `env:` block as `APP_TOKEN`, and updated the shell command to reference `$APP_TOKEN` instead.
2. hardened/action/agent-approval-check/action.yml (line 57): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`, using the built-in environment variable that GitHub Actions sets automatically, avoiding YAML template substitution before shell processing.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

Fixed the github-env-injection finding in the `Calculate next version` step of `.github/workflows/release.yml`. The `next_version` value (derived from `LATEST_TAG`, which comes from git tag names) is now sanitized with `printf '%s' "$next_version" | tr -d '\n\r'` before being written to `$GITHUB_OUTPUT`. This prevents newline injection attacks where an attacker controlling git tag names could inject additional key=value pairs into the GitHub Actions output.

