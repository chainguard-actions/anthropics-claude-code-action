<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.240

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.240** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ ... }} expression is directly interpolated inside a run: shell command string. In action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the github.action_path context value directly into the shell command before the shell ever sees it. Per the check rules, any ${{ ... }} directly inside a run: script is a script-injection finding regardless of which context it reads from. The safe pattern is to use the $GITHUB_ACTION_PATH environment variable instead (which GitHub Actions automatically sets), e.g.: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:58`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in action.yml line 58: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions automatically sets the GITHUB_ACTION_PATH environment variable to the same value as github.action_path, so this is a safe, equivalent substitution that avoids embedding a ${{ }} expression directly in the shell command string.

