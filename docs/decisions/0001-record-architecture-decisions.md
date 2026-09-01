# 1. Record architecture decisions

Date: TBD

## Status

Accepted

## Context

Modeling decisions on this project are contested, and the reasoning behind them
is lost within weeks. Six months from now someone will look at a nullable
column or a missing constraint and either "fix" it, breaking something, or
leave it alone out of fear. Both are bad. The DDL records what we chose; it
cannot record what we rejected or why.

## Decision

Record every significant decision as a numbered ADR in this directory:
`NNNN-short-title.md`, numbered sequentially, never renumbered.

Copy the template below. Keep it to one page — an ADR nobody finishes reading
records nothing.

## Consequences

A PR that makes a significant decision without an ADR is incomplete. ADRs are
immutable once merged: to change a decision, write a new ADR and set the old
one's status to `Superseded by NNNN`.

---

## When to write one

Write an ADR when the decision is hard to reverse later, or when the next
person would reasonably do it differently:

- normalization you deliberately did not do, and why
- surrogate key vs natural key on a contested entity
- how the transaction lifecycle is represented (status column vs event rows)
- soft delete vs hard delete
- how money, timezones, and business dates are stored
- anything the OLAP team is going to depend on
- anything that took more than one meeting to settle

Do not write one for: naming conventions (they go in `model/schema.dbml`),
routine columns, or anything you could reverse in one migration without anyone
noticing.

## Template

```markdown
# NNNN. Short title in the imperative

Date: YYYY-MM-DD

## Status

Proposed | Accepted | Superseded by NNNN

## Context

The forces at play. What makes this decision necessary, what constrains it,
what we did not know. Neutral — no advocacy here.

## Decision

What we are doing, in the active voice. "We will ..."

## Consequences

What becomes easier, what becomes harder, what we now have to live with.
Include the option we rejected and why — that is the part future readers need.
```
