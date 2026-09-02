# Glossary

**What belongs here:** every business term the model uses, defined once, owned
by one named person. The pre-seeded rows are the terms that cause arguments on
every retail project. Fill them in before the conceptual model is agreed —
they are seeded blank on purpose, because the argument is the point.

**Done when:** no row has an empty Definition or Owner, every `Draft` has
become `Agreed`, and the model uses these words in exactly these senses.

**Must NOT go here:** table names, column names, warehouse vocabulary. This is
the business's language, not the schema's. If a term only makes sense to the
OLAP team, it is theirs to define.

**Owner** is a person, not a team. **Status** is `Draft`, `Agreed`, or
`Contested`. A `Contested` term blocks the phase that depends on it.

| Term | Definition | Owner | Status |
|------|------------|-------|--------|
| transaction | One ORDER instance — a single sale or a single return, from first item scanned to settlement. A failed payment attempt is not a transaction; it leaves no ORDER | Rushitha Chandaluri | Draft |
| sale | An ORDER whose type is sale: the whole basket, not one line of it. A single line is an ORDER_ITEM | Rushitha Chandaluri | Draft |
| void | Cancellation of a line or a whole basket *before* it becomes a financial record. Reversal *after* tender is a return, not a void — the two are different words for different acts. Whether a void leaves an ORDER behind is open question 2 in `conceptual.md` | Rushitha Chandaluri | Draft |
| return | An ORDER that reverses items previously sold. Each returned ORDER_ITEM *optionally* references the original item it reverses; no-receipt returns carry no reference at all | Rushitha Chandaluri | Draft |
| trip | One customer's single visit to one store. Not an entity in this model — a trip may produce more than one ORDER (paying twice is two transactions, one trip), and the model does not attempt to group them | Rushitha Chandaluri | Draft |
| customer | The identified party associated with a purchase, not merely the party standing at the register. Optional on every relationship: anonymous in-store baskets and guest checkouts have no CUSTOMER | Rushitha Chandaluri | Draft |
| business date | The trading day an ORDER is attributed to, in the store's own local timezone. Distinct from the system timestamp that records when the row was written; a late-night sale can belong to the prior business date. The end-of-day cutoff is not yet settled | Rushitha Chandaluri | Draft |
| store | A location that holds stock or processes a sale, physical or virtual. Not a legal entity and not a reporting rollup — both of those are the OLAP team's concern | Rushitha Chandaluri | Draft |

All eight rows are `Draft` and owned by the author pending review. Ownership
should be reassigned to whoever actually settles each argument — the point of
the Owner column is that a named person can adjudicate, and the author cannot
adjudicate against themselves.

Questions each seeded term has to survive:

- **transaction** — is a void a transaction? Is a return? Is a failed payment?
- **sale** — the whole basket, or one line of it?
- **void** — before tender, after tender, next day: same word?
- **return** — does it reference the original sale, or stand alone?
- **trip** — one customer, one visit, one basket? What if they pay twice?
- **customer** — an identified person, or the party at the register?
- **business date** — when does a store's day end, and in which timezone?
- **store** — a building, a legal entity, or a reporting unit?
