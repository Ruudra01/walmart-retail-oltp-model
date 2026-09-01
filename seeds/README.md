# Seeds

**What belongs here:** reference and lookup data that is **part of the model** —
tender types, reason codes, the department hierarchy, tax classes, the store
list. This data does not vary by environment and is not invented by the
generator; it is what the business is. It is committed.

**Done when:** every lookup table a migration creates has a matching CSV here,
the full set loads into a freshly migrated database without a constraint
violation, and the values match `docs/glossary.md`.

**Must NOT go here:** transactions, transaction lines, tenders, customers, or
anything else the generator produces — that is synthetic data, it goes to
`data/`, and it stays gitignored. If a row would differ between two runs of the
generator, it is not a seed.

## Why these are committed and synthetic data is not

Seeds are *input to the model*: change a reason code and the meaning of the
schema changes, so it belongs in review and in history. Synthetic transactions
are *output*: regenerable from a seed value, large, and meaningless in a diff.

The test: could you delete it and get the same thing back by running
`make generate`? Yes — it is data, ignore it. No — it is a seed, commit it.

## Layout

One CSV per table, named for the table, header row matching column names
exactly:

```
seeds/
  tender_type.csv
  reason_code.csv
  department.csv
  tax_class.csv
  store.csv
```

Loaded in dependency order by `make seed`, after `make migrate`. A seed file
whose table does not exist yet means the migration has not landed — that is the
phase order working, not a bug.

## Rules

- UTF-8, LF endings, header row, no BOM
- natural business keys only — never a surrogate id the database generates
- one row per line, sorted stably, so a diff shows what actually changed
- loading is idempotent: `make seed` twice must not double the rows
- a change to a seed is a reviewed change to the model, same as a migration
