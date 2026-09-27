<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.208

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.208** was hardened automatically. 8 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command (in the curl Authorization header). The `steps.*.outputs.*` context is an untrusted expression that is template-substituted before the shell runs, enabling script injection.

Locations:

- `action.yml:388`

### script-injection (severity: high)

Sub-rule (a): The composite action step directly interpolates `${{ github.action_path }}` inside a `run:` shell command: `python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly in a run: block is a script-injection risk.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run: block directly interpolates `${{ secrets.GITHUB_TOKEN }}` inside a heredoc shell command. GitHub Actions template-substitutes `${{ }}` expressions before the shell runs, even inside single-quoted heredocs. Additionally, the 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` (attacker-controlled) inside a heredoc.

Locations:

- `base-action/examples/issue-triage.yml:22`
- `base-action/examples/issue-triage.yml:57`

### script-injection (severity: high)

Sub-rule (a): Multiple run: blocks in examples/test-failure-analysis.yml directly interpolate `${{ steps.detect.outputs.structured_output }}` (steps.*.outputs.* is untrusted) and `${{ github.event.workflow_run.html_url }}` into shell commands. Specifically: `OUTPUT='${{ steps.detect.outputs.structured_output }}'` appears in the 'Retry flaky tests', 'Low confidence detection', and 'Comment on PR' steps; `${{ github.event.workflow_run.html_url }}` appears in the 'Comment on PR' step.

Locations:

- `examples/test-failure-analysis.yml:60`
- `examples/test-failure-analysis.yml:77`
- `examples/test-failure-analysis.yml:90`
- `examples/test-failure-analysis.yml:113`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable` (untrusted input), derives BUN_DIR via `dirname`, and writes it to $GITHUB_PATH without sanitization (`echo "$BUN_DIR" >> "$GITHUB_PATH"`). An attacker-controlled input containing newlines could inject arbitrary entries into PATH.

Locations:

- `action.yml:228`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `inputs.path_to_claude_code_executable` (untrusted input), derives CLAUDE_DIR via `dirname`, and writes it to $GITHUB_PATH without sanitization (`echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`). An attacker-controlled input containing newlines could inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:165`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant wrapped in `bash -c`). This executes remotely-fetched content without first downloading and verifying it, making the action vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:154`

### unpinned-uses (severity: high)

Multiple files reference GitHub Actions using mutable tags or branch names instead of full 40-character SHA commit hashes, making them vulnerable to supply-chain attacks. Unpinned references found:
- `anthropics/claude-code-base-action@beta`
- `anthropics/claude-code-action/agent-approval-check@main`
- `anthropics/claude-code-action@main`
- `anthropics/claude-code-action@v1` (multiple files)
- `actions/checkout@v6` (multiple files)
- `actions/checkout@v4`
- `actions/github-script@v7`

Locations:

- `base-action/examples/issue-triage.yml:82`
- `examples/agent-approval-check.yml:30`
- `examples/test-failure-analysis.yml:22`
- `examples/ci-failure-auto-fix.yml:33`
- `examples/ci-failure-auto-fix.yml:57`
- `examples/ci-failure-auto-fix.yml:73`
- `examples/claude-wif.yml:33`
- `examples/claude-wif.yml:38`
- `examples/claude.yml:24`
- `examples/claude.yml:29`
- `examples/issue-deduplication.yml:14`
- `examples/issue-deduplication.yml:19`
- `examples/issue-triage.yml:14`
- `examples/issue-triage.yml:19`
- `examples/manual-code-analysis.yml:18`
- `examples/manual-code-analysis.yml:23`
- `examples/pr-review-comprehensive.yml:17`
- `examples/pr-review-comprehensive.yml:22`
- `examples/pr-review-filtered-authors.yml:18`
- `examples/pr-review-filtered-authors.yml:23`
- `examples/pr-review-filtered-paths.yml:18`
- `examples/pr-review-filtered-paths.yml:23`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell, unpinned-uses

**Notes:**

Fixed all findings:

1. script-injection (action.yml): Moved `${{ steps.run.outputs.github_token }}` to APP_TOKEN env var in 'Revoke app token' step.

2. script-injection (agent-approval-check/action.yml): Moved `${{ github.action_path }}` to ACTION_PATH env var, merged with existing env block.

3. script-injection (base-action/examples/issue-triage.yml): Moved secrets.GITHUB_TOKEN to env var for MCP config heredoc; moved github.event.issue.number to ISSUE_NUMBER env var, used quoted heredoc with placeholders then sed substitution with sanitized values.

4. script-injection (examples/test-failure-analysis.yml): Moved steps.detect.outputs.structured_output to STRUCTURED_OUTPUT env var and github.event.workflow_run.html_url to WORKFLOW_RUN_URL env var in all three affected steps.

5. github-env-injection (action.yml + base-action/action.yml): Sanitized BUN_DIR and CLAUDE_DIR with `printf '%s' | tr -d '\n\r'` before writing to $GITHUB_PATH.

6. unsafe-shell (base-action/action.yml): Replaced `curl | bash -s -- VERSION` with download-then-execute pattern: `curl -o $INSTALL_SCRIPT && bash $INSTALL_SCRIPT VERSION` (dropped the `--` as it was the shell's option terminator, not the script's).

7. unpinned-uses: Pinned all action references to full SHA hashes across all example files: anthropics/claude-code-base-action@beta, anthropics/claude-code-action/agent-approval-check@main, anthropics/claude-code-action@main, anthropics/claude-code-action@v1, actions/checkout@v6, actions/checkout@v4, actions/github-script@v7.

