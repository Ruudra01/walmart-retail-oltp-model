# Query patterns

**What belongs here:** how the application actually reads and writes each
table — the real access paths, with their predicates, frequency, and latency
expectation. This document is what justifies every index in
`docs/physical-design.md`, and it tells the OLAP team where the volume and the
churn are before they build on us.

**Done when:** every table has at least one documented read path and one write
path, every index in the physical design traces back to a row here, and no row
here describes a query nobody runs.

**Must NOT go here:** analytical queries. Reporting, aggregation, and anything
the warehouse runs are not our access paths — if the answer to "who runs this?"
is "the OLAP team", it does not belong in this file. No SQL tuning notes and no
`EXPLAIN` output either; keep those in the PR that changed the index.

## Write paths

The transaction lifecycle is the hot path. Say what is inserted, in what order,
inside which transaction boundary, and how often.

| Path | Tables written | Trigger | Rate | Transaction boundary |
|------|----------------|---------|------|----------------------|
| | | | | |

## Read paths

| Path | Tables read | Predicate | Frequency | Latency expectation |
|------|-------------|-----------|-----------|---------------------|
| | | | | |

## Extract paths

How data leaves for the OLAP team. Must agree with the CDC mechanism in
`docs/handoff-contract.md` — if the extract needs an index, it is an index like
any other and belongs in the physical design with this as its justification.

| Path | Tables | Predicate | Frequency |
|------|--------|-----------|-----------|
| | | | |

## Prompts

Register ringing a sale; suspending and resuming a transaction; voiding a line
mid-basket; looking up an original sale to process a return; end-of-day close
per store; price lookup by item; incremental extract since last watermark.
