<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.252

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.252** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ }}` expression is directly interpolated inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. Per the script-injection check, ANY `${{ ... }}` expression directly inside a `run:` block is a finding — YAML template substitution occurs before the shell ever sees the string, meaning the value is not shell-quoted by GitHub Actions. The safe fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:58`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/action.yml line 58: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is pre-set by the GitHub Actions runner and is safe to use directly in shell commands, unlike the `${{ github.action_path }}` expression which is interpolated before the shell sees it.

