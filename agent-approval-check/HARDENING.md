<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.227

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.227** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. Although `github.action_path` is not attacker-controlled in the same way as `github.head_ref`, the check rules require that NO `${{ ... }}` expression appear anywhere inside a `run:` shell command string — YAML template substitution happens before the shell ever sees the value, bypassing shell quoting. The fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection finding in hardened/action/action.yml at line 57. Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is automatically set by GitHub Actions and is safe to use directly in shell scripts, avoiding the YAML template substitution that bypasses shell quoting.

