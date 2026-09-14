<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.222

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.222** was hardened automatically. 6 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates ${{ steps.run.outputs.github_token }} inside a run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any expression inside ${{ }} is expanded by the GitHub Actions template engine before the shell sees it, making this a script-injection risk.

Locations:

- `action.yml:399`

### script-injection (severity: high)

Sub-rule (a): Multiple run: blocks in examples/test-failure-analysis.yml directly interpolate ${{ }} expressions inside shell commands. The 'Retry flaky tests' step uses OUTPUT='${{ steps.detect.outputs.structured_output }}', the 'Low confidence detection' step uses the same pattern, and the 'Comment on PR' step uses both OUTPUT='${{ steps.detect.outputs.structured_output }}' and ${{ github.event.workflow_run.html_url }} inside a heredoc — all directly inside run: shell scripts.

Locations:

- `examples/test-failure-analysis.yml:57`
- `examples/test-failure-analysis.yml:79`
- `examples/test-failure-analysis.yml:96`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes the output of curl directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This executes remotely-fetched content without first downloading and verifying it, and is present in two code paths (with and without the timeout wrapper).

Locations:

- `base-action/action.yml:131`
- `base-action/action.yml:133`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes $BUN_DIR (derived from the input-controlled env var PATH_TO_BUN_EXECUTABLE, which holds inputs.path_to_bun_executable) to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:222`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes $BUN_DIR (derived from inputs.path_to_bun_executable via PATH_TO_BUN_EXECUTABLE) to $GITHUB_PATH without sanitization. Similarly, the 'Install Claude Code' step writes $CLAUDE_DIR (derived from inputs.path_to_claude_code_executable via PATH_TO_CLAUDE_CODE_EXECUTABLE) to $GITHUB_PATH without sanitization.

Locations:

- `base-action/action.yml:113`
- `base-action/action.yml:143`

### unpinned-uses (severity: high)

Multiple example workflow files reference GitHub Actions using mutable tags or branch names instead of pinned 40-character commit SHAs, making them vulnerable to supply-chain attacks if the referenced action is compromised or the tag is moved. Failing references include: actions/checkout@v6, actions/checkout@v4, anthropics/claude-code-action@v1, anthropics/claude-code-action@main, anthropics/claude-code-action/agent-approval-check@main, actions/github-script@v7, anthropics/claude-code-base-action@beta.

Locations:

- `examples/claude.yml:22`
- `examples/claude.yml:27`
- `examples/claude-wif.yml:32`
- `examples/claude-wif.yml:37`
- `examples/ci-failure-auto-fix.yml:33`
- `examples/ci-failure-auto-fix.yml:46`
- `examples/ci-failure-auto-fix.yml:68`
- `examples/issue-deduplication.yml:16`
- `examples/issue-deduplication.yml:21`
- `examples/issue-triage.yml:17`
- `examples/issue-triage.yml:22`
- `examples/manual-code-analysis.yml:22`
- `examples/manual-code-analysis.yml:27`
- `examples/pr-review-comprehensive.yml:18`
- `examples/pr-review-comprehensive.yml:23`
- `examples/pr-review-filtered-authors.yml:20`
- `examples/pr-review-filtered-authors.yml:25`
- `examples/pr-review-filtered-paths.yml:18`
- `examples/pr-review-filtered-paths.yml:23`
- `examples/test-failure-analysis.yml:22`
- `examples/test-failure-analysis.yml:27`
- `examples/agent-approval-check.yml:30`
- `base-action/examples/issue-triage.yml:55`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection, unpinned-uses

**Notes:**

Fixed all 5 finding types across multiple files:

1. script-injection (action.yml): Moved `${{ steps.run.outputs.github_token }}` to env var `APP_TOKEN` in the 'Revoke app token' step.

2. script-injection (examples/test-failure-analysis.yml): Moved `${{ steps.detect.outputs.structured_output }}` to `STRUCTURED_OUTPUT` env var in 3 steps, and `${{ github.event.workflow_run.html_url }}` to `WORKFLOW_RUN_URL` env var.

3. unsafe-shell (base-action/action.yml): Replaced `curl ... | bash -s -- $VERSION` with download-then-execute pattern: `curl ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropped the `--` as it was the shell's option terminator, not the script's). Applied to both timeout and non-timeout code paths.

4. github-env-injection (action.yml + base-action/action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH.

5. unpinned-uses: Pinned all 23 unpinned action references across examples/ and base-action/examples/ to full 40-character commit SHAs with tag comments for readability.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The $GITHUB_ACTION_PATH environment variable is automatically set by the GitHub Actions runner to the same value, so there is no functional change — only the script-injection risk is eliminated.

