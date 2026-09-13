<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.223

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.223** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. While `github.action_path` is not typically attacker-controlled, any `${{ ... }}` expression interpolated directly into a `run:` block bypasses shell quoting and is a script-injection risk per the check rules. The value is substituted by the Actions template engine before the shell ever sees it, meaning special characters in the path could be interpreted by the shell. The fix is to use the `$GITHUB_ACTION_PATH` environment variable instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` in action.yml line 57. The $GITHUB_ACTION_PATH environment variable is set automatically by GitHub Actions and is safe to reference directly in shell scripts, avoiding the template-engine substitution that creates script-injection risk.

