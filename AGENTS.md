# Molaris OPS - Code Review Rules

## General Principles
- **KISS**: Keep It Simple, Stupid.
- **SOLID**: Follow SOLID principles in every abstraction.
- **Clean Architecture**: Maintain a clear separation between UI, logic, and data.

## React & Frontend
- Use **Functional Components** with hooks.
- Prefer **Named Exports** for better searchability.
- **Atomic Design**: Structure components following atomic principles (atoms, molecules, organisms).
- **Tailwind CSS**: Use utility classes. Avoid inline styles unless strictly necessary for dynamic values.
- **Framer Motion**: Use for transitions to maintain the "Alive" feel of the UI.

## TypeScript / JavaScript
- Use `const` and `let`, never `var`.
- Aim for **Strong Typing**. Avoid `any` at all costs.
- Use **Descriptive Naming** for variables and functions (e.g., `handlePatientCreation` instead of `doSave`).

## Supabase & Backend
- **Edge Functions**: Logic should be centralized in Edge Functions to keep the client thin.
- **RLS**: Every table MUST have Row Level Security enabled.
- **Normalización**: Prefer normalized tables with Foreign Keys over flat text fields.

## Internationalization (i18n)
- Never hardcode strings in the UI. Always use the `t()` function from `react-i18next`.
- Keep translation keys consistent with the database schema.
