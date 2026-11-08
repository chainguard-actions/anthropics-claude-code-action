<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.269

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.269** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): a GitHub Actions expression is placed directly in a run: script: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Pass it through env instead (e.g. env: ACTION_PATH: ${{ github.action_path }}, then run: python "$ACTION_PATH/agent_approval_check.py"), or use the runner-provided "$GITHUB_ACTION_PATH".

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, replaced the inline ${{ github.action_path }} in the bash run: step with the runner-provided "$GITHUB_ACTION_PATH", double-quoted. No other changes.

