# Skill Registry - Molaris OPS

This file registers all specialized skills available for this project.

| Skill Name | Description | Path |
|------------|-------------|------|
| `molaris-ops-automation` | Automate Supabase Edge Function deployment and project builds. Trigger: edge functions, code changes. | [.gemini/skills/molaris-ops-automation/SKILL.md](.gemini/skills/molaris-ops-automation/SKILL.md) |
| `go-testing` | Go testing patterns for Gentleman.Dots. | (global) |
| `skill-creator` | Creates new AI agent skills. | (global) |
| `sdd-*` | Spec-Driven Development phases. | (global) |

## Compact Rules

### `molaris-ops-automation`
- **Edge Functions**: Deploy using `supabase functions deploy {name} --no-verify-jwt` after any change.
- **Build**: Run `npm run build` after every code modification.
