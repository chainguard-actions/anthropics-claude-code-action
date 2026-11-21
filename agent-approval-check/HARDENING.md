<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.286

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.286** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): a GitHub Actions expression is placed directly inside a run: script in the composite step: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The expression is filled in by template substitution before the shell parses the line. Use the shell variable instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, the run: line used the template expression `${{ github.action_path }}`. I replaced it with the shell variable `$GITHUB_ACTION_PATH`, which the runner sets to the same directory. The step runs under bash, so the quoted path works the same as before. Nothing else in the file changed. I haven't run the action to test it.

