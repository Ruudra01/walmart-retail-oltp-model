# 3. Accept transaction_line.store_id as a denormalization

Date: 2026-09-03

## Status

Accepted

## Context

Invariant I3 in `docs/conceptual.md` requires that a transaction_line's
assortment belongs to the same store as its transaction: a basket rung at one
store cannot contain another store's assortment, at another store's price.
`conceptual.md` states this should be enforced "declaratively, and phase 2
should shape the keys so that it is" — i.e. by a constraint the database
checks, not by application code trusting itself.

A transaction_line already carries `sale_transaction_id` (which determines its
store, via `sale_transaction.store_id`) and `product_id`. Postgres foreign keys
can only reference a column set that is unique on the target table, and a
single-column FK cannot express "these two columns, taken together, must both
point at the same store." Enforcing I3 declaratively therefore requires
`store_id` to be physically present on `transaction_line`, even though it is
fully determined by `sale_transaction_id → sale_transaction.store_id` — a value
already reachable through an existing foreign key, and therefore redundant by
the strict definition of third normal form.

## Decision

We will store `store_id` directly on `transaction_line`, in addition to
`sale_transaction_id`, and enforce agreement between the two with two composite
foreign keys rather than one plain one:

```
transaction_line.(sale_transaction_id, store_id) > sale_transaction.(id, store_id)
transaction_line.(store_id, product_id)          > store_assortment.(store_id, product_id)
```

The first requires a supporting unique constraint on
`sale_transaction (id, store_id)` — trivially satisfiable since `id` alone is
already unique, but Postgres needs it declared for the composite FK to be valid
SQL. This is a physical-phase detail; it is noted here so migration V1 does not
"discover" it as a surprise.

## Consequences

**The redundancy.** `transaction_line.store_id` duplicates
`sale_transaction.store_id` for every line. It replaces a fully-derivable value
that pure 3NF would omit.

**What keeps the copies consistent.** Not a trigger, not application code — the
composite foreign key itself. A row cannot be inserted unless its
`(sale_transaction_id, store_id)` pair already exists as a row of
`sale_transaction`, which means the line's `store_id` is, by construction,
exactly the referenced transaction's `store_id`. This holds permanently, not
just at insert time, because `sale_transaction` rows are never updated after
creation — completed checkouts are immutable financial records, so there is no
"the transaction's store changed after the fact" case for the copies to drift
apart under. Divergence would require either bypassing the foreign key (not
possible through normal DML) or mutating a settled `sale_transaction` row
directly (already forbidden — migrations are the only sanctioned schema
change, and this is a data rule, but the same "never patch by hand" discipline
applies to hand-editing settled financial rows).

**How divergence would be detected anyway.** Constraints are enforced going
forward; they say nothing about data loaded by another route (a bulk import, a
future migration correcting old rows) that could in principle bypass them.
`tests/data_quality/` will carry a test asserting, over loaded data, that every
`transaction_line.store_id` equals its `sale_transaction.store_id` — a
belt-and-suspenders check that should never fail while the constraint holds,
and whose only job is to catch the day it doesn't. See
`docs/physical-design.md` for where this is tracked.

**What becomes easier.** I3 is enforced by the database and cannot be violated
by an application bug, a bad migration, or a manual `INSERT`. Query planning
against `transaction_line` also gets a `store_id` column directly, without a
join to `sale_transaction`, for any query that filters by store.

**What we rejected.** Enforcing I3 with a trigger instead — checking, on
insert, that the line's transaction and the line's assortment agree on store —
was the non-denormalizing alternative. Rejected because a trigger is
enforcement logic that has to be gotten right and kept in sync with the schema
by hand, where a foreign key is enforcement the database already knows how to
check, and because `conceptual.md` specifically suggested shaping the keys to
make this declarative. A trigger remains the honest fallback if a future
invariant needs a check no foreign key can express — see I2 in
`docs/conceptual.md`, which is exactly that case and is deliberately left to a
future ADR.

**Signed off by:** Gopi Eerla, 2026-09-03.
