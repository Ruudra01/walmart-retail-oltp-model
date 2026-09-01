# Contributing

## The four rules

1. **Phases run conceptual → logical → physical → generator.** Never skip
   ahead. A migration that lands before the entity exists in `schema.dbml` is
   rejected, however obvious the table looks.
2. **Data is never committed, only the code that generates it.** No CSVs, no
   dumps, no parquet, no "small sample for testing".
3. **Schema changes only via forward-only numbered migrations.** Never patch a
   database by hand, never edit a merged migration. Wrong? Add `V00N+1`.
4. **Every table and column gets a `COMMENT ON` inside its migration**, written
   at the same time as the DDL — not in a follow-up PR, not "later".

## Branch naming

```
<phase>/<short-description>
```

`conceptual/`, `logical/`, `physical/`, `generator/`, plus `docs/` and `fix/`.
Example: `physical/add-transaction-line-table`.

The phase prefix is a claim about which phase your change belongs to.
Reviewers check that claim first.

## Pull requests

Fill in `.github/pull_request_template.md` honestly. A PR must:

- name its phase, and touch only files that phase owns
- update `docs/glossary.md` if it introduces or changes a business term
- add a migration rather than editing an existing one, if the schema changes
- include `COMMENT ON` for every new table and column, in the same migration
- add or update the tests for its phase
- carry no generated data

Small and single-purpose beats large and mixed. A PR that changes the model and
the generator at once is two PRs.

## What reviewers check, by phase

**Conceptual** — Are these entities, or are they tables in disguise? Does every
relationship have a stated cardinality and a business reason? Is every
contested term in the glossary with an owner? No attributes, no keys.

**Logical** — Is it actually in 3NF, or is there a transitive dependency
someone is defending? Does each entity have a stable natural key identified,
even if a surrogate is used? Are optional relationships genuinely optional in
the business? No Postgres types, no indexes, no storage concerns.

**Physical** — Does every table and column have a comment? Are constraints in
the database rather than assumed in application code? Is the migration
forward-only and numbered without a gap? Does it run on an empty database from
scratch? Are there constraint tests proving the schema rejects the invalid
cases the DDL claims to prevent?

**Generator** — Is it written against the shipped DDL, not ahead of it? Does it
produce data that satisfies every constraint without disabling any? Is the
output gitignored? Are volumes and seeds configurable rather than hardcoded?

**Every phase** — no facts, no dimensions, no star schemas. We are the source
system.
