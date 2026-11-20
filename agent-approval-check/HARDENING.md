<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.284

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.284** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): a GitHub Actions expression is placed directly inside a run: script in a composite step: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The value is substituted into the script before the shell parses it. Fix: use the runner-provided env var instead, e.g. `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:58`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, the run step had the `${{ github.action_path }}` expression written straight into the shell script. I replaced it with the runner-provided `$GITHUB_ACTION_PATH` variable, kept inside double quotes. The step uses `shell: bash`, so this form works there. Nothing else in the file was changed, and I didn't run the action to test it.

