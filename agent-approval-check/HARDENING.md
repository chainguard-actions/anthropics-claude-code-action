<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): a GitHub Actions expression is placed directly inside a run: shell command in the composite action. Offending line: `- run: python "${{ github.action_path }}/agent_approval_check.py"`. The value is substituted into the script text before the shell runs. Fix: use the runner-provided $GITHUB_ACTION_PATH env var instead, double-quoted: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced ${{ github.action_path }} in the run: command with the double-quoted runner env var $GITHUB_ACTION_PATH (shell: bash). The other expressions are already in the env: block.

