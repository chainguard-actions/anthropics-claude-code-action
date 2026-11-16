<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.277

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.277** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violated: a GitHub Actions expression is placed directly inside a run: script in a composite step. Offending line: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The expression is substituted into the script text before the shell runs it. Pass it through an env var instead (e.g. env ACTION_PATH: ${{ github.action_path }}, then run python "$ACTION_PATH/agent_approval_check.py"), or use the runner-provided "$GITHUB_ACTION_PATH".

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, the run step no longer puts the expression ${{ github.action_path }} straight into the script. It now uses the variable the runner already provides: python "$GITHUB_ACTION_PATH/agent_approval_check.py". The step runs under bash, so this is the right syntax and the path stays quoted. Nothing else changed and nothing has been run to test it.

