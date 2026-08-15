<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.193

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.193** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ }} expressions are interpolated directly inside run: shell command strings.

1. agent-approval-check/action.yml: `run: python "${{ github.action_path }}/agent_approval_check.py"` — github.action_path is injected directly into the shell command.

2. action.yml (Revoke app token step): `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — steps.*.outputs.* is injected directly into the curl command.

3. .github/workflows/release.yml (Calculate next version step): `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` — steps.*.outputs.* injected directly into run block. Also: `echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"`, `echo "From commit: ${{ github.sha }}"`, `next_version="${{ steps.next_version.outputs.next_version }}"` (multiple steps), and `next_version="${{ needs.create-release.outputs.next_version }}"` in update-major-tag job.

4. .github/workflows/test-base-action.yml (Verify inline/prompt-file output steps): `OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"` directly in run blocks.

5. .github/workflows/test-custom-executables.yml (Verify custom executables step): `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"` and `CONCLUSION="${{ steps.custom-test.outputs.conclusion }}"` directly in run blocks.

6. .github/workflows/test-settings.yml (multiple Verify steps): `OUTPUT_FILE="${{ steps.*.outputs.execution_file }}"` and `CONCLUSION="${{ steps.*.outputs.conclusion }}"` directly in run blocks.

7. .github/workflows/test-structured-output.yml (multiple Verify steps): `OUTPUT='${{ steps.test.outputs.structured_output }}'` directly in run blocks. Also echo lines writing ${{ needs.*.result }} expressions to $GITHUB_STEP_SUMMARY.

Locations:

- `agent-approval-check/action.yml:47`
- `action.yml:432`
- `.github/workflows/release.yml:38`
- `.github/workflows/release.yml:52`
- `.github/workflows/release.yml:60`
- `.github/workflows/release.yml:67`
- `.github/workflows/release.yml:80`
- `.github/workflows/release.yml:107`
- `.github/workflows/test-base-action.yml:36`
- `.github/workflows/test-base-action.yml:80`
- `.github/workflows/test-custom-executables.yml:55`
- `.github/workflows/test-settings.yml:44`
- `.github/workflows/test-settings.yml:80`
- `.github/workflows/test-settings.yml:120`
- `.github/workflows/test-settings.yml:160`
- `.github/workflows/test-structured-output.yml:44`
- `.github/workflows/test-structured-output.yml:90`
- `.github/workflows/test-structured-output.yml:140`

### github-env-injection (severity: high)

Untrusted input values are written to special GitHub environment files without sanitization (no `printf '%s' ... | tr -d '\n\r'` step).

1. action.yml (Setup Custom Bun Path step): `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`. The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without sanitization. An attacker-controlled path_to_bun_executable input containing newlines can inject arbitrary entries into PATH.

2. base-action/action.yml (Setup Custom Bun Path step): Same pattern — `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` written to `$GITHUB_PATH` without sanitization.

3. base-action/action.yml (Install Claude Code step): `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` written to `$GITHUB_PATH` without sanitization. `PATH_TO_CLAUDE_CODE_EXECUTABLE` comes from `${{ inputs.path_to_claude_code_executable }}`.

4. .github/workflows/release.yml (Calculate next version step): `next_version` is derived from `${{ steps.get_latest_tag.outputs.latest_tag }}` (a steps.*.outputs.* value) and written to `$GITHUB_OUTPUT` via `echo "next_version=$next_version" >> $GITHUB_OUTPUT` without sanitization.

Locations:

- `action.yml:212`
- `base-action/action.yml:120`
- `base-action/action.yml:155`
- `.github/workflows/release.yml:38`

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of full 40-character commit SHAs, making them vulnerable to supply-chain attacks.

.github/workflows/ci.yml:
  - actions/checkout@v6 (3 occurrences)
  - oven-sh/setup-bun@v2 (2 occurrences)
  - oven-sh/setup-bun@v1 (1 occurrence, with bun-version: latest)

.github/workflows/claude-review.yml:
  - actions/checkout@v6
  - anthropics/claude-code-action@v1

.github/workflows/claude.yml:
  - actions/checkout@v6
  - anthropics/claude-code-action@main

.github/workflows/issue-triage.yml:
  - actions/checkout@v6
  - anthropics/claude-code-action@main

.github/workflows/release.yml:
  - actions/checkout@v6 (3 occurrences across create-release and update-major-tag jobs)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:35`
- `.github/workflows/ci.yml:37`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:19`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:27`
- `.github/workflows/issue-triage.yml:14`
- `.github/workflows/issue-triage.yml:19`
- `.github/workflows/release.yml:26`
- `.github/workflows/release.yml:88`
- `.github/workflows/release.yml:112`

### missing-permissions (severity: medium)

.github/workflows/ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define a job-level `permissions:` block. This means the workflow runs with the default token permissions, which may be broader than necessary (e.g., write access to contents and packages on some repository configurations).

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote scripts are downloaded and piped directly to a shell interpreter without first saving to a file for inspection.

1. base-action/action.yml (Install Claude Code step): `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` — the install script is fetched and executed in a single pipeline. If the remote server is compromised or the URL is intercepted, arbitrary code runs on the runner. This pattern appears twice (inside a `bash -c` wrapper and as a direct pipe).

2. .github/workflows/test-custom-executables.yml (Install Bun manually step): `curl -fsSL https://bun.sh/install | bash` — same pattern.

3. .github/workflows/test-custom-executables.yml (Install Claude Code manually step): `curl -fsSL https://claude.ai/install.sh | bash -s latest` — same pattern.

Locations:

- `base-action/action.yml:140`
- `.github/workflows/test-custom-executables.yml:19`
- `.github/workflows/test-custom-executables.yml:31`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all 5 findings across multiple files:

1. script-injection: Moved all ${{ }} expressions from run: blocks into env: blocks in agent-approval-check/action.yml, action.yml (Revoke app token), release.yml (multiple steps), test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml.

2. github-env-injection: Added printf '%s' ... | tr -d '\n\r' sanitization before writing user-controlled paths to GITHUB_PATH in action.yml (Setup Custom Bun Path), base-action/action.yml (Setup Custom Bun Path and Install Claude Code). Also sanitized next_version before writing to GITHUB_OUTPUT in release.yml.

3. unpinned-uses: Pinned actions/checkout@v6 → SHA d23441a..., oven-sh/setup-bun@v2 → SHA 0c5077e..., oven-sh/setup-bun@v1 → SHA f4d14e0..., anthropics/claude-code-action@v1 → SHA 9d7150b..., anthropics/claude-code-action@main → SHA d721746... across ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

4. missing-permissions: Added 'permissions: contents: read' to ci.yml.

5. unsafe-shell: Replaced curl | bash patterns with download-then-execute pattern (curl -o tmpfile && bash tmpfile) in base-action/action.yml Install Claude Code step and test-custom-executables.yml Install Bun/Claude Code steps. Dropped the '--' separator from the install script invocation as required (the '--' was the shell's option terminator, not the script's argument).

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in `.github/workflows/sync-base-action.yml` line 30: moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` out of the `run:` block into an `env:` variable (`DEPLOY_KEY`) and updated the shell script to reference `$DEPLOY_KEY` instead of the direct expression interpolation.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection vulnerability in `.github/workflows/test-base-action.yml` at the 'Create test prompt file' step. Replaced the unquoted heredoc (`<< EOF` with `${PROMPT}` inside) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc allowed bash to perform command substitution on the user-controlled PROMPT value (sourced from `github.event.inputs.test_prompt`). The `printf` form safely writes the env var value to the file without any shell expansion risk.

