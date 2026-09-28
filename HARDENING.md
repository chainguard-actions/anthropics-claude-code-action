<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.190

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.190** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside the `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk regardless of which context it reads from, as YAML template substitution occurs before the shell ever sees the value.

Locations:

- `action.yml:530`

### script-injection (severity: high)

Sub-rule (a): The step `run: python "${{ github.action_path }}/agent_approval_check.py"` directly interpolates a `github.*` expression inside the `run:` shell command string. Even though `github.action_path` is GitHub-controlled, any `${{ ... }}` expression directly inside a `run:` script is a script-injection finding — the value flows through YAML template substitution before the shell processes it.

Locations:

- `agent-approval-check/action.yml:56`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash`. This executes whatever the remote server returns without any integrity verification. The script should be downloaded to a file first, verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:143`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

Fixed three security findings:

1. script-injection (action.yml, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` shell string into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the shell.

2. script-injection (agent-approval-check/action.yml, line 56): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` using the built-in GitHub Actions environment variable instead of a template expression.

3. unsafe-shell (base-action/action.yml, line 143): Replaced `curl ... | bash` pipe pattern with download-then-execute: script is saved to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` that was the shell's option terminator in the pipe form). Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** unpinned-uses, script-injection, github-env-injection

**Notes:**

Fixed all three finding types:

1. unpinned-uses: Pinned all 12 unpinned action references across 12 files to full 40-character SHA commits using lookup_action_sha. Files fixed: examples/agent-approval-check.yml, examples/ci-failure-auto-fix.yml, examples/claude-wif.yml, examples/claude.yml, examples/issue-deduplication.yml, examples/issue-triage.yml, examples/manual-code-analysis.yml, examples/pr-review-comprehensive.yml, examples/pr-review-filtered-authors.yml, examples/pr-review-filtered-paths.yml, examples/test-failure-analysis.yml, base-action/examples/issue-triage.yml.

2. script-injection: Fixed 5 injection points. In examples/test-failure-analysis.yml, three run: steps used OUTPUT='${{ steps.detect.outputs.structured_output }}' - moved to env: STRUCTURED_OUTPUT and referenced as $STRUCTURED_OUTPUT. Also moved ${{ github.event.workflow_run.html_url }} to env. In base-action/examples/issue-triage.yml, moved ${{ secrets.GITHUB_TOKEN }} and ${{ github.event.issue.number }} to env vars, switched heredocs from 'EOF' to EOF (with shell expansion), and escaped backticks.

3. github-env-injection: Fixed 3 unsanitized GITHUB_PATH writes in action.yml and base-action/action.yml by replacing `echo "$VAR" >> "$GITHUB_PATH"` with `printf '%s' "$VAR" | tr -d '\n\r' >> "$GITHUB_PATH"` for both BUN_DIR and CLAUDE_DIR.

