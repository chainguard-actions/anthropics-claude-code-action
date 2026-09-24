<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.220

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.220** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ ... }} expression is directly interpolated inside a run: shell command string. The run: block on line 59 of action.yml contains: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ }} expression embedded directly in a run: script is a script-injection risk because the value is substituted into the shell command string before the shell parses it. The safe alternative is to use the pre-set environment variable $GITHUB_ACTION_PATH (which GitHub Actions automatically populates) instead of the ${{ github.action_path }} expression, e.g.: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:59`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in action.yml line 59: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions automatically sets the $GITHUB_ACTION_PATH environment variable to the same value as `github.action_path`, so this is a safe, behavior-preserving substitution that eliminates the ${{ }} expression from the shell command string.

