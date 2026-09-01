# Migrations

**What belongs here:** every change to the physical schema, as a numbered SQL
file. This directory is the only way the database changes.

**Done when:** the full set applies to an empty Postgres 16 from scratch, in
order, without error, and produces a schema where every table and column has a
comment.

**Must NOT go here:** data. No seed rows, no lookup values that are really
business data, no synthetic data — that is the generator's job. No `DROP`
of anything another migration created unless you are deliberately reversing it
in a new migration. No edits to a file that has been merged.

## Naming

```
V001__create_store.sql
V002__add_transaction_and_line.sql
```

`V` + three digits + double underscore + snake_case description + `.sql`.
Numbers are sequential with no gaps and are never reused. Two open PRs claiming
`V014` is a conflict — the second one to merge renumbers.

The description says what the migration does, not which ticket asked for it.

## Forward-only

Migrations are append-only. Once a migration is merged it is immutable, even if
it is wrong, even if nobody has run it yet in production, even if it is one
character.

Wrong migration? Write the next one. There are no down migrations; a rollback
is a new forward migration that undoes the change, reviewed like any other.

Never patch a database by hand. If the schema in an environment does not match
what the migrations produce, that environment is broken — fix it by rebuilding
from migrations, not by making the migrations match it.

## Comments are part of the DDL

Every table and every column gets a `COMMENT ON`, in the same migration, in the
same file, written at the same time as the DDL. Not a follow-up PR. Not "we'll
document it after".

```sql
CREATE TABLE store (
    id   integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code text    NOT NULL UNIQUE
);

COMMENT ON TABLE  store      IS 'A physical retail location that can ring transactions.';
COMMENT ON COLUMN store.id   IS 'Surrogate key. Never exposed to the business.';
COMMENT ON COLUMN store.code IS 'Operator-facing store number. Stable for the life of the store.';
```

The comment text comes from the Note on the same object in
`model/schema.dbml`. Write it once, carry it across.

A comment that restates the column name is not a comment. Say what one value
*means* to the business, and what it guarantees.

## Every migration includes

- the DDL
- `COMMENT ON` for each new table and column
- the constraints that make invalid states impossible — in the database, not
  assumed in application code
- corresponding tests in `tests/constraints/`
