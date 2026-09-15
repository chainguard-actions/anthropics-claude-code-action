<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.224

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.224** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ github.action_path }}` is interpolated directly inside a `run:` shell command string. Although `github.action_path` is not attacker-controlled in the same way as `github.head_ref`, any `${{ ... }}` expression inside a `run:` block is a script-injection finding per the check rules — the value flows through YAML template substitution before the shell ever sees it. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` shell command on line 57 of action.yml with the pre-set environment variable `$GITHUB_ACTION_PATH`. This avoids YAML template substitution inside the shell command string, eliminating the script-injection finding. The `$GITHUB_ACTION_PATH` environment variable is automatically provided by the GitHub Actions runner and is functionally equivalent.

