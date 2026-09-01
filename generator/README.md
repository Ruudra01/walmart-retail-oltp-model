# Synthetic data generator

**What belongs here:** the code that produces synthetic retail POS data for the
schema in `migrations/`. Deterministic given a seed, configurable in volume,
writing to `data/` — which is gitignored.

**Done when:** it loads into a freshly migrated database with every constraint
enabled, `make test-data` passes on its output, and two runs with the same seed
produce the same data.

**Must NOT go here:** any generated output — `data/` is ignored, keep it that
way. No `ALTER TABLE ... DISABLE TRIGGER`, no dropped constraints, no
`ON CONFLICT DO NOTHING` to paper over a violation. If the generator cannot
satisfy a constraint, the generator is wrong, or the constraint is — find out
which, do not route around it.

## Written against the DDL, never before it

The generator is phase four. It is written against the physical schema that
already exists in `migrations/` and has already been applied.

This is not a sequencing preference. A generator written first quietly becomes
the specification: the schema ends up shaped by what was easy to fake rather
than by what the business does, and constraints get softened to let the
generator through. Write the model, ship the DDL, then generate data for it.

If generating realistic data reveals a genuine modeling problem, that is a real
finding — take it back to `model/schema.dbml` and fix it with a new migration.
Do not fix it in the generator.

## Expected shape

- one seed controls all randomness; same seed, same output
- volumes configurable (stores, days, transactions per store-day) — nothing
  hardcoded
- respects business rules from `docs/events.md`: voids and returns occur,
  baskets vary, store hours hold
- writes to `data/`, loaded by `make load`
- realistic enough to be worth testing against, not so realistic it is
  mistaken for production data

## Realism budget

Skewed distributions where they matter (basket size, item popularity, time of
day). Uniform where they do not. Perfectly clean data hides bugs that only
appear on messy data — generate the messiness the handoff contract already
admits to under Known quality issues, and nothing it does not.
