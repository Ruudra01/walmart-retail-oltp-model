# Data quality tests

**What belongs here:** checks that run against **loaded** data and assert the
invariants the schema cannot express. Referential integrity is the database's
job; "a transaction's lines sum to its total" and "no store rings sales before
it opened" are ours.

**Done when:** every guarantee promised in `docs/handoff-contract.md` has a
test proving it holds on generated data, and every known quality issue listed
there has a test that measures it rather than pretending it is absent.

**Must NOT go here:** tests that a constraint exists — that is
`tests/constraints/`. If an invariant *can* be a database constraint, make it
one and test it there; only what genuinely cannot be constrained belongs here.

## What to assert

- totals reconcile: line amounts sum to transaction totals, tenders sum to
  amount due
- lifecycle holds: no return without an original sale, no line on a voided
  transaction, no tender after close
- business dates behave: no transaction on a date the store was closed,
  business date and system timestamp agree within the store's timezone rules
- distributions are plausible: baskets are not all size one, returns are rare
  but present, no store has zero activity
- the handoff contract's grain claims are true: the column set claimed unique
  per table actually is

Failures here mean the **generator** is wrong, not the schema — unless the
assertion itself was a constraint we forgot to write, in which case move it.

Run: `make test-data`, after `make generate && make load`.

## Why this is separate from tests/constraints

`tests/constraints/` needs an empty database and proves the schema rejects bad
data. These need a loaded one and prove the data is sane. Different
precondition, different runtime, different meaning when red — a constraint
failure is a DDL bug, a quality failure is a generator bug. Keeping them apart
keeps the schema tests fast enough to run on every PR.
