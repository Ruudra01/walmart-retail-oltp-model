# 4. Put transaction type on the line, not the header

Date: 2026-09-03

## Status

Accepted

## Context

`docs/conceptual.md`, under Modelling decisions, states: "A return is a
SALE_TRANSACTION, not a separate entity. It carries a transaction type." Read
plainly, that puts a single sale-or-return type on the transaction header.

The same document separately flags an edge case it declined to resolve, under
invariant I4: "an even exchange, where a returned line and a sold line offset
exactly. Real registers still record a tender for it, often two that net to
zero... If the business says otherwise, I4 is the invariant that bends" — and
names this explicitly as something "for phase 2 to confirm rather than
assume."

A header-level type cannot represent that case. If `sale_transaction` has one
`transaction_type`, an exchange is either forced into being two transactions
(a return, then an unrelated-looking sale) or forced into a type value that is
true of neither line. Splitting it into two transactions also sits uneasily
against assumption A1 — checkout is atomic, with no handover separated from
settlement — since a real exchange is one register event, not two.

Meanwhile invariant I1 ("every *sale line* moves stock") and invariant I2 ("a
*return line* cannot exceed what was sold") are already written in terms of
lines, not transactions. The header-level type in the Modelling decisions
prose and the line-level reasoning in the invariants were already pulling in
different directions before this ADR.

## Decision

We will put the type on `transaction_line` (`line_type: sale | return`), not
on `sale_transaction`. `sale_transaction` carries no type of its own; whether a
transaction is a pure sale, a pure return, or an exchange is a property of the
set of lines it contains, not a stored fact.

## Consequences

**The exchange edge case is resolved, not deferred.** One `sale_transaction`
can hold both a `return`-typed line and a `sale`-typed line, settled by one set
of tenders, exactly matching how a register handles it in one event. This
satisfies A1 rather than straining against it.

**I1, I2 read more naturally.** Both were already phrased per-line; they now
match the schema they describe instead of describing a finer grain than the
header actually carries.

**A modelling decision in `docs/conceptual.md` is superseded.** The sentence
"It carries a transaction type" no longer describes the schema. `conceptual.md`
is updated in place to say the type lives on the line, with a pointer to this
ADR — consistent with how ADR 0002 already carries an in-place update rather
than leaving the source document to contradict a later decision silently.
Going back to revise phase 1 output is expected per `CONTRIBUTING.md`, not a
failure of phase 1.

**What becomes harder.** "Is this transaction a sale or a return?" is no
longer a single-column read — it requires looking at the transaction's lines
(pure sale, pure return, or exchange). Every place that used to filter
`sale_transaction.transaction_type` now filters or joins on
`transaction_line.line_type` instead. This is a real cost, paid once, for
correctly representing a case the header-level design could not.

**What we rejected.** Keeping the header-level type and representing an
exchange as two linked transactions. Rejected because it invents a linkage
between the two transactions that `docs/conceptual.md` explicitly rejected
elsewhere (SALE_TRANSACTION carries no header-level reference to another
transaction, for the same reason ADR 0002 gives: the reference is null or
arbitrary in exactly the case that matters), and because it misrepresents one
atomic register event as two.

**Signed off by:** Gopi Eerla, 2026-09-03.
