## What and why

<!-- One paragraph. What changes, and what it lets us do. -->

## Phase

<!-- Exactly one. A PR spanning phases is two PRs. -->

- [ ] Conceptual — entities and relationships
- [ ] Logical — attributes, keys, 3NF
- [ ] Physical — migrations and DDL
- [ ] Generator — synthetic data
- [ ] Docs / tooling only

Prior phase is complete and merged for everything this PR touches: <!-- yes / n/a -->

## Checklist

- [ ] Glossary updated — new or changed business terms are in
      `docs/glossary.md` with a definition and a named owner
- [ ] Migration added, not edited — schema changes are a new numbered
      `V00N__*.sql`; no merged migration was modified
- [ ] Comments written — every new table and column has a `COMMENT ON` in the
      same migration as its DDL
- [ ] Tests added — constraint tests for new constraints, data quality tests
      for new invariants
- [ ] No data committed — no CSV, parquet, dump, or sample rows
- [ ] No warehouse modeling — no facts, no dimensions, no star schemas

## ADR

<!-- Link the ADR, or say why this decision does not need one. -->

## How this was verified

<!-- Commands run and what they printed. "Ran make migrate on an empty database"
     beats "tested locally". -->
