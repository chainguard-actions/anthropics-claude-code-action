<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.278

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.278** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): a GitHub Actions expression is placed directly inside a run: script in the composite action: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The template is substituted into the script before the shell runs it. Pass the value through an env var instead, e.g. env: ACTION_PATH: ${{ github.action_path }}, then run: python "$ACTION_PATH/agent_approval_check.py". Using the runner-provided "$GITHUB_ACTION_PATH" also works.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the script-injection finding in action.yml. The `${{ github.action_path }}` expression is now passed in through a new `ACTION_PATH` env var on the step, and the run line uses the quoted variable `"$ACTION_PATH/agent_approval_check.py"` instead. The step's shell is bash, so the `$VAR` syntax is correct. No other changes were made, and I did not run the action to check the change.

