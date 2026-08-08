<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.189

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.189** was hardened automatically. 5 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tag or branch refs instead of immutable 40-character SHA digests, making them vulnerable to supply-chain attacks if the referenced tag is moved or the branch is updated.

Failing references:
- .github/workflows/ci.yml: `actions/checkout@v6`, `oven-sh/setup-bun@v2`, `oven-sh/setup-bun@v1`
- .github/workflows/claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- .github/workflows/claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- .github/workflows/issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- .github/workflows/release.yml: `actions/checkout@v6` (three occurrences)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/claude.yml:19`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude-review.yml:13`
- `.github/workflows/claude-review.yml:18`
- `.github/workflows/issue-triage.yml:20`
- `.github/workflows/issue-triage.yml:25`
- `.github/workflows/release.yml:30`

### missing-permissions (severity: medium)

The workflow file ci.yml has no top-level `permissions:` block and none of its three jobs (test, prettier, typecheck) define job-level permissions. This means the workflow runs with the default token permissions, which may be broader than necessary.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

release.yml interpolates GitHub Actions expressions directly inside `run:` shell command strings, violating rule (a). The values `steps.*.outputs.*` and `needs.*.outputs.*` are workflow-controllable and flow through YAML template substitution before the shell sees them, enabling command injection.

Failing lines:
- `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` — a git tag name read from the repo is interpolated directly into a shell assignment inside a run: block.
- `next_version="${{ steps.next_version.outputs.next_version }}"` — same pattern, used in multiple steps (Display dry run info, Create and push tag, Create Release).
- `next_version="${{ needs.create-release.outputs.next_version }}"` — job output interpolated directly in the update-major-tag job's run: block.

Locations:

- `.github/workflows/release.yml:46`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:62`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:82`
- `.github/workflows/release.yml:100`

### unsafe-shell (severity: high)

base-action/action.yml pipes the output of `curl` directly to `bash` in the 'Install Claude Code' step. If the remote URL (https://claude.ai/install.sh) is compromised or the connection is intercepted, arbitrary code will execute on the runner without any integrity check. The script should be downloaded to a file first, its checksum verified, and then executed separately.

Failing patterns:
- `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`
- `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`

Locations:

- `base-action/action.yml:108`
- `base-action/action.yml:111`

### github-env-injection (severity: high)

Both action.yml and base-action/action.yml write values derived from composite action inputs to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a newline-containing value for these inputs, injecting arbitrary additional entries into GITHUB_PATH.

(a) action.yml — 'Setup Custom Bun Path' step: `inputs.path_to_bun_executable` is placed into env var `PATH_TO_BUN_EXECUTABLE`, then `dirname "$PATH_TO_BUN_EXECUTABLE"` is written to `$GITHUB_PATH` without sanitization.

(b) base-action/action.yml — 'Setup Custom Bun Path' step: same pattern with `inputs.path_to_bun_executable`.

(c) base-action/action.yml — 'Install Claude Code' step: `inputs.path_to_claude_code_executable` is placed into env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` is written to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:196`
- `base-action/action.yml:96`
- `base-action/action.yml:117`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all five findings:

1. unpinned-uses: Pinned all action references to full SHA digests in ci.yml, claude.yml, claude-review.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6, oven-sh/setup-bun@v1, oven-sh/setup-bun@v2, anthropics/claude-code-action@main, and anthropics/claude-code-action@v1.

2. missing-permissions: Added top-level `permissions: {}` to ci.yml and job-level `permissions: contents: read` to all three jobs (test, prettier, typecheck).

3. script-injection: In release.yml, moved all ${{ steps.*.outputs.* }} and ${{ needs.*.outputs.* }} expressions from run: shell strings into env: blocks (LATEST_TAG, NEXT_VERSION), then referenced them as plain shell variables.

4. unsafe-shell: In base-action/action.yml, replaced both `curl ... | bash -s -- $VERSION` patterns with download-then-execute: `curl ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" $VERSION`. Dropped the `-s` and `--` as required (they were shell options for stdin reading, not script arguments).

5. github-env-injection: Fixed all three GITHUB_PATH writes by sanitizing the path with `printf '%s' "$VAR" | tr -d '\n\r' | xargs dirname` before writing to $GITHUB_PATH, in both action.yml and base-action/action.yml.

### Iteration 2

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

Fixed all 8 findings across 7 files:

1. agent-approval-check/action.yml: Moved github.action_path to env var ACTION_PATH.

2. .github/workflows/release.yml: Moved github.sha to env var GH_SHA in the 'Display dry run info' step.

3. .github/workflows/sync-base-action.yml: Moved secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY to env var DEPLOY_KEY and used printf to write it safely.

4. .github/workflows/test-base-action.yml: Moved steps.inline-test.outputs.execution_file, steps.inline-test.outputs.conclusion, steps.prompt-file-test.outputs.execution_file, and steps.prompt-file-test.outputs.conclusion to env: blocks.

5. .github/workflows/test-custom-executables.yml: (a) Fixed unsafe-shell: 'curl | bash' for bun.sh/install now downloads to mktemp file then executes; 'curl | bash -s latest' for claude.ai/install.sh now downloads to mktemp file then runs 'bash "$SCRIPT" latest' (dropped -s and -- per rules). (b) Fixed script-injection: moved steps.custom-test.outputs.execution_file and steps.custom-test.outputs.conclusion to env: block.

6. .github/workflows/test-settings.yml: Moved all step output expressions to env: blocks in all four verify steps (two 'Verify echo worked' and two 'Verify echo was denied' steps).

7. .github/workflows/test-structured-output.yml: Moved all steps.test.outputs.structured_output, steps.test.outputs.execution_file, and all needs.*.result expressions to env: blocks in all five verify steps and the Generate Summary step.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in the 'Revoke app token' step (action.yml line 544). Moved `${{ steps.run.outputs.github_token }}` from the `run:` shell string into an `env:` block as `APP_TOKEN`, and updated the curl command to reference `$APP_TOKEN` instead of the direct template expression.

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

Fixed two github-env-injection findings in .github/workflows/release.yml:
1. 'Get latest tag' step (line 44): Added `safe_latest_tag=$(printf '%s' "$latest_tag" | tr -d '\n\r')` and write `$safe_latest_tag` to GITHUB_OUTPUT instead of the raw value.
2. 'Calculate next version' step (line 62): Added `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` and write `$safe_next_version` to GITHUB_OUTPUT instead of the raw value.
Also quoted `"$GITHUB_OUTPUT"` in both echo statements for good practice.

