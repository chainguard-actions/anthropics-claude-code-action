<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.226

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.226** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ }}` expression is interpolated directly inside a `run:` shell command string. The offending line is:

    run: python "${{ github.action_path }}/agent_approval_check.py"

Although `github.action_path` is not typically attacker-controlled, any `${{ ... }}` expression interpolated directly into a `run:` block is a script-injection risk because the value is substituted by the GitHub Actions template engine before the shell ever sees it — bypassing shell quoting. The safe fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead:

    run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` in hardened/action/action.yml line 57. The pre-set `$GITHUB_ACTION_PATH` environment variable is equivalent in value but avoids template-engine interpolation into the shell command string, eliminating the script-injection risk.

