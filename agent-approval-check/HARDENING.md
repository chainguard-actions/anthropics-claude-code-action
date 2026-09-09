<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.219

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.219** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ ... }}` expression is directly interpolated inside a `run:` shell command string. The step at line 56 of action.yml contains: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Even though `github.action_path` is not attacker-controlled in the same way as `github.head_ref`, any `${{ ... }}` expression directly inside a `run:` block is a script-injection finding per the check rules — the value flows through YAML template substitution before the shell ever sees it. The safe alternative is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead of the expression form.

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed line 56 of action.yml: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions automatically sets the GITHUB_ACTION_PATH environment variable to the same value as `github.action_path`, so this is a safe, equivalent substitution that avoids YAML template interpolation inside the shell command string.

