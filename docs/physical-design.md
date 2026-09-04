# Physical design

**What belongs here:** the reasoning behind physical choices that the DDL shows
but does not explain — index strategy, partitioning scheme, and every accepted
denormalization. The migration records *what*; this records *why*, and what we
rejected.

**Done when:** every index in `migrations/` is accounted for by an access path
in `docs/query-patterns.md`, the partitioning scheme names its key and its
retention behavior, and every denormalization has a written justification
signed by a named person.

**Must NOT go here:** logical modeling — entities, attributes, and keys belong
in `model/schema.dbml`. No warehouse design: this is the physical layout of a
source system, not a query-performance layer for analytics. And no index
"because it might help" — if no query in `query-patterns.md` uses it, delete it.

## Index strategy

Every index costs write throughput on a system whose whole job is writes. List
each one with the access path it serves, from `docs/query-patterns.md`.

| Index | Table | Columns | Access path it serves | Why not covered by an existing index |
|-------|-------|---------|-----------------------|--------------------------------------|
| | | | | |

Unique constraints that exist for correctness are not listed here — they are in
the migration and tested in `tests/constraints/`.

## Partitioning

State the key, the interval, how partitions are created ahead of time, and what
happens to old ones. If we are not partitioning, say so and say at what volume
we would revisit — an unstated threshold is not a decision.

## Accepted denormalization

Default is none. This model is 3NF and stays 3NF, except for the one exception
below.

Each exception needs its own subsection with: the redundancy introduced, the
3NF form it replaced, what keeps the copies consistent (a constraint, a
trigger, application code — name it), how a divergence would be detected, and
who accepted the risk. "It was faster" is not a justification without a
measurement. Anything accepted here also needs an ADR in `docs/decisions/` and
a data quality test proving the copies agree.

### transaction_line.store_id

**Redundancy introduced.** `transaction_line.store_id` duplicates
`sale_transaction.store_id`, reachable through the line's existing
`sale_transaction_id` foreign key. In strict 3NF this column would not exist —
it is a non-key attribute whose value is fully determined by another
non-primary-key column reachable via a different table, which is exactly what
3NF forbids.

**Why:** invariant I3 (`docs/conceptual.md`) requires that a line's assortment
belong to the same store as its transaction. A Postgres foreign key can only
reference a unique column set on the target table, so enforcing "these two
columns agree" declaratively needs `store_id` physically present on the line —
see ADR 0003 for the full reasoning and the rejected trigger-based
alternative.

**What keeps the copies consistent.** A composite foreign key, not a trigger
and not application code:

```
transaction_line.(sale_transaction_id, store_id) > sale_transaction.(id, store_id)
```

This makes it impossible to insert a line whose `store_id` disagrees with the
`store_id` of the transaction it references. It stays consistent permanently,
not just at insert, because `sale_transaction` rows are immutable once written
— there is no update path that could move a transaction to a different store
after its lines exist. The supporting requirement is a unique constraint on
`sale_transaction (id, store_id)`, which the migration that creates
`sale_transaction` must include.

**How a divergence would be detected.** The constraint prevents divergence
through normal inserts; it says nothing about a row loaded by another route
(a bulk import, a hand-correction to old data — which is already against
`migrations/README.md`'s "never patch a database by hand" rule, but the point
of a data quality test is to catch the day someone does it anyway). A
`tests/data_quality/` test asserts, over loaded data, that every
`transaction_line.store_id` equals the `store_id` of its
`sale_transaction_id`. Written when phase 4 lands, per this repo's phase
order — it is listed here now so the requirement isn't lost between phases.

**Who accepted the risk.** Gopi Eerla, 2026-09-03 (ADR 0003).
