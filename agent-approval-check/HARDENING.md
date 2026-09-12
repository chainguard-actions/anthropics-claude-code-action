<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.222

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.222** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ ... }} expression is directly interpolated inside a run: shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"` — the `github.action_path` context value is substituted by the Actions runner into the shell command before the shell ever sees it. Any `${{ ... }}` expression directly inside a run: block is a script-injection risk. The fix is to use the pre-set `$GITHUB_ACTION_PATH` environment variable instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection vulnerability in action.yml at line 57. Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is pre-set by the GitHub Actions runner and is safe to use directly in shell scripts, unlike the `${{ github.action_path }}` expression which gets interpolated into the shell command string before the shell sees it.

