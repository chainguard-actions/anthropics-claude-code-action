<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.219

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.219** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. Although `github.action_path` is GitHub-controlled rather than attacker-controlled, any `${{ ... }}` expression interpolated directly into a `run:` block is a script-injection risk — the value flows through YAML template substitution before the shell ever sees it, bypassing shell quoting. The fix is to route it through an `env:` variable and reference that variable in the script: set `ACTION_PATH: ${{ github.action_path }}` in the `env:` block and use `python "$ACTION_PATH/agent_approval_check.py"` in the `run:` block.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/action.yml line 57: moved `${{ github.action_path }}` from the `run:` shell command string into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`, and updated the run command to use `python "$ACTION_PATH/agent_approval_check.py"` instead.

