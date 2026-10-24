<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.262

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.262** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) is violated: a GitHub Actions expression is put directly into a run: shell command. The offending line is `run: python "${{ github.action_path }}/agent_approval_check.py"`. To fix it, use the runner-provided env var instead, e.g. `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:10`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

action.yml: replaced inline ${{ github.action_path }} with "$GITHUB_ACTION_PATH" in the bash run step that runs agent_approval_check.py.

