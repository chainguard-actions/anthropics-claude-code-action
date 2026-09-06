<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.217

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.217** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: A ${{ }} expression is interpolated directly inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. Even though `github.action_path` is GitHub-controlled, any `${{ ... }}` expression inside a `run:` block flows through YAML template substitution before the shell processes it, making it a script-injection risk. The fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:52`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` in hardened/action/action.yml line 52. The GitHub Actions runner pre-sets $GITHUB_ACTION_PATH as an environment variable, so using it directly in the shell avoids the YAML template substitution that makes ${{ }} expressions a script-injection risk.

