# RLS policy source

The executable, forward-only policy definitions live in
`../migrations/20260814182049_initial_data_layer.sql` alongside the tables and
security-definer predicate functions they depend on. Keeping them in one
migration guarantees a fresh database cannot receive the content tables before
their RLS policies.

Policy matrix:

| Role | Access |
|---|---|
| `anon` | Published principles and issues; content only when the parent principle is published and the related rendering has a non-null `approved_by`. No aggregate table access. |
| `rawi` | Can insert an essay with their own `submitted_by` id and read only their own essays. |
| `editor` | Full read; can insert/update essays, renderings, and soul tags. Cannot change a principle's publication status. |
| `owner` | Full access. |

`private.is_public_essay` and `private.is_public_rendering` are narrowly scoped
security-definer predicates. They live in a non-exposed schema and are used only
to evaluate RLS conditions; they do not expose content through an RPC.
