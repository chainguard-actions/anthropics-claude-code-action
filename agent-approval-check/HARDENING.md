<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.245

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.245** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string. Even though `github.action_path` is not directly attacker-controlled, any `${{ ... }}` expression inside a `run:` block undergoes YAML template substitution before the shell processes it, bypassing shell quoting. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The safe alternative is to use the `$GITHUB_ACTION_PATH` environment variable instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` in the run: block of action.yml (line 56). The $GITHUB_ACTION_PATH environment variable is set by GitHub Actions and is the safe alternative to the ${{ github.action_path }} expression, which undergoes YAML template substitution before shell processing and thus bypasses shell quoting.

