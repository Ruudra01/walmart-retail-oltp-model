# walmart-retail-oltp-model

A 3NF OLTP data model for retail point-of-sale transactions in Postgres,
populated with synthetic data, handed off to a separate OLAP team.

## Scope boundary: this is OLTP, not OLAP

We are the **source system**. We model the business as it operates — one row
per real-world thing that happened, normalized, constrained, written by
transactions.

**In scope:** normalized entities, foreign keys, check constraints, natural and
surrogate keys, referential integrity, the transaction lifecycle (sale, void,
return), a synthetic data generator, and a documented handoff contract.

**Out of scope, permanently:** facts, dimensions, star schemas, snowflakes,
slowly-changing dimensions, conformed dimensions, surrogate keys that exist
only for a warehouse, pre-aggregated rollups, denormalization "for query
performance". If a change makes sense only to a warehouse, it belongs in the
OLAP team's repo, not this one.

The line to hold: if you find yourself naming something `fact_` or `dim_`,
stop.

## Phases

Run in order. Never skip ahead.

| # | Phase | Artifact | Done when |
|---|-------|----------|-----------|
| 1 | Conceptual | `docs/conceptual.md`, `docs/glossary.md`, `docs/events.md` | Entities and relationships agreed; contested terms defined and owned |
| 2 | Logical | `model/schema.dbml` | Attributes, keys, cardinality, normalized to 3NF — no Postgres types yet |
| 3 | Physical | `migrations/` | DDL applied via numbered migrations, every object commented |
| 4 | Generator | `generator/` | Synthetic data written against the shipped DDL |

Tests follow the phase they verify: `tests/constraints/` after phase 3,
`tests/data_quality/` after phase 4.

## The four rules

1. Phases run conceptual → logical → physical → generator. Never skip ahead.
2. Data is never committed, only the code that generates it.
3. Schema changes only via forward-only numbered migrations, never by patching
   the database directly.
4. Every table and column gets a `COMMENT ON` inside its migration, written at
   the same time as the DDL.

See `CONTRIBUTING.md` for how these are enforced in review.

## Quickstart

```sh
cp .env.example .env     # fill in credentials
make db-up               # start Postgres 16
make migrate             # apply migrations
make test-constraints    # prove the empty schema rejects bad data
make generate            # produce synthetic data (gitignored)
make load                # load it
make test-data           # prove invariants hold on loaded data
```

`make` targets are stubs until the phase that owns them lands.

## Repo map

```
docs/               conceptual model, glossary, events, handoff contract, ADRs
model/schema.dbml   logical model
migrations/         forward-only numbered DDL
tests/constraints/  schema tests, empty database
tests/data_quality/ invariant tests, loaded database
generator/          synthetic data generation
docker/             local Postgres
```
