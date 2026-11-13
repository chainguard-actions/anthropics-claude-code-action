<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.274

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.274** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): a GitHub Actions expression is placed directly in a run: shell command. Offending line: `- run: python "${{ github.action_path }}/agent_approval_check.py"`. The expression is filled in by template substitution before the shell parses the line. Fix: use the env var the runner already sets, `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`, or pass the value through env: and quote it.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, I changed the run step from `python "${{ github.action_path }}/agent_approval_check.py"` to `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The runner already sets `GITHUB_ACTION_PATH` for bash steps, and the step runs under bash, so the quoted form works. I didn't run the action or test it.

