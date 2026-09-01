# Constraint tests

**What belongs here:** pgTAP tests that run against an **empty** schema and
prove the database rejects invalid data. Every constraint a migration adds gets
a test that tries to violate it and asserts the failure.

**Done when:** every table, column, key, foreign key, check constraint, unique
constraint and not-null in `migrations/` has a test asserting it exists *and* a
test proving it bites — an `INSERT` that should fail, failing.

**Must NOT go here:** anything that needs loaded data. No row counts, no
distributions, no "does the generator produce sensible baskets", no queries
over real volumes. Those are data quality tests.

## Shape

```sql
BEGIN;
SELECT plan(3);

SELECT has_table('store');
SELECT col_is_pk('store', 'id');

SELECT throws_ok(
    $$ INSERT INTO store (code) VALUES (NULL) $$,
    '23502',
    NULL,
    'store.code rejects NULL'
);

SELECT * FROM finish();
ROLLBACK;
```

Each test wraps in a transaction and rolls back. The schema stays empty. Order
does not matter and no test may depend on another.

Run: `make test-constraints`.

## Why this is separate from tests/data_quality

Different subject, different precondition, different failure meaning.

These test **the schema**. They need an empty database, run in milliseconds,
and run in CI on every PR that touches a migration. A failure here means the
DDL is wrong — the schema permits something the business forbids.

Data quality tests test **the data**. They need a loaded database, are slow,
and run after generation. A failure there means the generator is wrong, not the
schema.

Mixing them means the fast, always-run tests inherit the slow ones' setup, and
a schema bug and a generator bug produce the same red check. Keep them apart.
