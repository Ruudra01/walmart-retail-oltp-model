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

Default is none. This model is 3NF and stays 3NF.

Each exception needs its own subsection with: the redundancy introduced, the
3NF form it replaced, what keeps the copies consistent (a constraint, a
trigger, application code — name it), how a divergence would be detected, and
who accepted the risk. "It was faster" is not a justification without a
measurement. Anything accepted here also needs an ADR in `docs/decisions/` and
a data quality test proving the copies agree.
