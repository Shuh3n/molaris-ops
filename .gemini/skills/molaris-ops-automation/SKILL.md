---
name: molaris-ops-automation
description: >
  Automate Supabase Edge Function deployment and project builds.
  Trigger: When creating/modifying Edge Functions in supabase/functions or changing code in src/.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Use after creating or modifying any Supabase Edge Function.
- Use after making code changes in the frontend or backend logic to ensure build integrity.

## Critical Patterns

- **Edge Functions**: MUST deploy using `supabase functions deploy {name} --no-verify-jwt` immediately after creation or modification.
- **Build Integrity**: MUST run `npm run build` after any code modification to verify that the project remains buildable and free of compilation errors.
- **Sequential Execution**: Always run deployment first, then the build, to ensure the environment is updated before the local verification.

## Commands

```bash
# Deploy a specific function
supabase functions deploy manage-patients --no-verify-jwt

# Run project build
npm run build
```

## Resources

- **Supabase Docs**: [Functions Deployment](https://supabase.com/docs/guides/functions/deploy)
- **Vite Docs**: [Building for Production](https://vitejs.dev/guide/build.html)
