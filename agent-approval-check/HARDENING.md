<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.231

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.231** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ github.action_path }}` expression from the `github.*` context is interpolated directly inside a `run:` shell command string in action.yml. Even though `github.action_path` is not attacker-controlled in the same way as `github.head_ref`, any `${{ ... }}` expression directly inside a `run:` block flows through YAML template substitution before the shell sees it and constitutes a script-injection risk. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The fix is to use the `$GITHUB_ACTION_PATH` environment variable instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` in the `run:` step of action.yml (line 57). The GitHub Actions runner sets `GITHUB_ACTION_PATH` as an environment variable automatically, so using it directly in the shell script avoids YAML template substitution and eliminates the script-injection risk.

