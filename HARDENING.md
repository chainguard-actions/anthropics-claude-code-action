<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.167

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.167** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks if the referenced tag or branch is moved.

Failing references:
- ci.yml: `actions/checkout@v6`, `oven-sh/setup-bun@v2`, `oven-sh/setup-bun@v1`
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (used in both jobs)

Locations:

- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:13`
- `.github/workflows/ci.yml:26`
- `.github/workflows/ci.yml:28`
- `.github/workflows/ci.yml:41`
- `.github/workflows/ci.yml:43`
- `.github/workflows/claude-review.yml:10`
- `.github/workflows/claude-review.yml:15`
- `.github/workflows/claude.yml:29`
- `.github/workflows/claude.yml:34`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:23`
- `.github/workflows/release.yml:36`
- `.github/workflows/release.yml:100`
- `.github/workflows/release.yml:115`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level `permissions:` blocks. Without explicit permissions, the workflow inherits the repository's default token permissions, which may be overly broad (write access to contents, pull-requests, etc.).

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple workflow `run:` blocks interpolate `${{ ... }}` expressions directly into shell command strings (rule a). This allows the values — which flow through YAML template substitution before the shell sees them — to inject arbitrary shell metacharacters.

Specific violations:

**release.yml** — `${{ steps.get_latest_tag.outputs.latest_tag }}` and `${{ steps.next_version.outputs.next_version }}` are interpolated directly into shell variable assignments and git commands in the 'Calculate next version', 'Display dry run info', 'Create and push tag', and 'Create Release' steps. `${{ needs.create-release.outputs.next_version }}` is similarly used in the 'Update major version tag' step.

**sync-base-action.yml** — `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` is interpolated directly into an `echo` command that writes the key to disk: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base`.

**test-base-action.yml** — `${{ steps.inline-test.outputs.execution_file }}` and `${{ steps.inline-test.outputs.conclusion }}` are interpolated directly into shell variable assignments in the 'Verify inline prompt output' and 'Verify prompt file output' steps.

**test-custom-executables.yml** — `${{ steps.custom-test.outputs.execution_file }}` and `${{ steps.custom-test.outputs.conclusion }}` are interpolated directly into shell variable assignments in the 'Verify custom executables worked' step.

**test-settings.yml** — `${{ steps.inline-settings-test.outputs.execution_file }}` and `${{ steps.inline-settings-test.outputs.conclusion }}` are interpolated directly into shell variable assignments in multiple 'Verify' steps.

**test-structured-output.yml** — `${{ steps.test.outputs.structured_output }}` is interpolated directly into a shell variable assignment (`OUTPUT='${{ steps.test.outputs.structured_output }}'`) in multiple 'Verify' steps.

Locations:

- `.github/workflows/release.yml:49`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:71`
- `.github/workflows/release.yml:79`
- `.github/workflows/release.yml:103`
- `.github/workflows/sync-base-action.yml:22`
- `.github/workflows/test-base-action.yml:40`
- `.github/workflows/test-base-action.yml:41`
- `.github/workflows/test-base-action.yml:88`
- `.github/workflows/test-base-action.yml:89`
- `.github/workflows/test-custom-executables.yml:60`
- `.github/workflows/test-custom-executables.yml:61`
- `.github/workflows/test-settings.yml:37`
- `.github/workflows/test-settings.yml:38`
- `.github/workflows/test-structured-output.yml:50`

### unsafe-shell (severity: high)

Remote install scripts are fetched with `curl` and piped directly to `bash` without first downloading and verifying the script. This pattern allows a compromised or man-in-the-middle server to execute arbitrary code on the runner.

- `base-action/action.yml` ('Install Claude Code' step): `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside a `timeout` wrapper)
- `.github/workflows/test-custom-executables.yml` ('Install Bun manually' step): `curl -fsSL https://bun.sh/install | bash`
- `.github/workflows/test-custom-executables.yml` ('Install Claude Code manually' step): `curl -fsSL https://claude.ai/install.sh | bash -s latest`

Locations:

- `base-action/action.yml:119`
- `base-action/action.yml:121`
- `.github/workflows/test-custom-executables.yml:20`
- `.github/workflows/test-custom-executables.yml:33`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' steps of both `action.yml` and `base-action/action.yml`, the value written to `$GITHUB_PATH` is derived from `inputs.path_to_bun_executable` (and `inputs.path_to_claude_code_executable` in base-action) via `dirname`. Although `dirname` is applied, the resulting path is written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow could supply a path containing embedded newlines, allowing injection of additional entries into `$GITHUB_PATH`.

- `action.yml`: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"` — `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`.
- `base-action/action.yml`: Same pattern for `$BUN_DIR` and also `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`.

Locations:

- `action.yml:218`
- `base-action/action.yml:107`
- `base-action/action.yml:138`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all action references to full SHA digests - actions/checkout@v6 → @df4cb1c069e1874edd31b4311f1884172cec0e10, oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → @af0559ee4f514d1ef21826982bed13f7edc3c35e across ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

2. missing-permissions: Added top-level `permissions: contents: read` to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: shell strings to step env: blocks in release.yml (steps.get_latest_tag.outputs.latest_tag, steps.next_version.outputs.next_version, github.sha, needs.create-release.outputs.next_version), sync-base-action.yml (secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY), test-base-action.yml (steps.inline-test.outputs.*, steps.prompt-file-test.outputs.*), test-custom-executables.yml (steps.custom-test.outputs.*), test-settings.yml (steps.inline-settings-test.outputs.*, steps.file-settings-test.outputs.*), and test-structured-output.yml (steps.test.outputs.structured_output, steps.test.outputs.execution_file).

4. unsafe-shell: Changed curl | bash patterns to download-then-execute in base-action/action.yml (both timeout and non-timeout variants) and test-custom-executables.yml (bun and claude installs).

5. github-env-injection: Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing dirname-derived paths to $GITHUB_PATH in action.yml (BUN_DIR) and base-action/action.yml (BUN_DIR and CLAUDE_DIR).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all three script-injection findings:
1. agent-approval-check/action.yml line 55: Moved `${{ github.action_path }}` into an `env:` variable `ACTION_PATH` and referenced it as `"$ACTION_PATH"` in the run: shell command.
2. .github/workflows/test-structured-output.yml line 313: Moved all `${{ needs.*.result }}` expressions into `env:` variables and replaced inline template expressions with shell conditionals and a helper function.
3. .github/workflows/test-base-action.yml line 75: Replaced the unquoted heredoc (vulnerable to EOF delimiter injection) with `printf '%s\n' "$PROMPT" > test-prompt.txt` for safe file writing.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in the 'Revoke app token' step of hardened/action/action.yml (line 480). Moved `${{ steps.run.outputs.github_token }}` from the `run:` shell command into an `env:` block as `APP_TOKEN`, and updated the curl command to reference `$APP_TOKEN` instead of the direct expression interpolation.

