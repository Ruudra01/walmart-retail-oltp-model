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
| transaction | One SALE_TRANSACTION instance — a single sale or a single return, from first item scanned to settlement. A failed payment attempt is not a transaction; it leaves no row | Rushitha Chandaluri | Draft |
| sale | A SALE_TRANSACTION whose type is sale: the whole basket, not one line of it. A single line is a TRANSACTION_LINE | Rushitha Chandaluri | Draft |
| void | Cancellation of a line or a whole basket *before* it becomes a financial record. Reversal *after* tender is a return, not a void — the two are different words for different acts. Whether a void leaves a SALE_TRANSACTION behind is open question 1 in `conceptual.md` | Rushitha Chandaluri | Draft |
| return | A SALE_TRANSACTION that reverses items previously sold. Each returned TRANSACTION_LINE *optionally* references the original line it reverses, as a self-reference; no-receipt returns carry no reference at all | Rushitha Chandaluri | Draft |
| trip | One customer's single visit to one store. Not an entity in this model — a trip may produce more than one SALE_TRANSACTION (paying twice is two transactions, one trip), and the model does not attempt to group them | Rushitha Chandaluri | Draft |
| customer | The identified party associated with a purchase, not merely the party standing at the register. Optional on every relationship: anonymous in-store baskets and guest checkouts have no CUSTOMER | Rushitha Chandaluri | Draft |
| business date | The trading day a SALE_TRANSACTION is attributed to, in the store's own local timezone. Distinct from the system timestamp that records when the row was written; a late-night sale can belong to the prior business date. The end-of-day cutoff is not yet settled — and under assumption A2 there is no store-day entity to hang it on, so the cutoff is a rule rather than a row | Rushitha Chandaluri | Draft |
| store | A location that holds stock or processes a sale, physical or virtual. Not a legal entity and not a reporting rollup — both of those are the OLAP team's concern | Rushitha Chandaluri | Draft |
| tender | One means of settlement applied to a transaction — cash, card, gift card, EBT, cheque. A basket settled by gift card and debit together is two tenders on one transaction, which is why TENDER is an entity and not an amount on the header. Negative on a refund | Rushitha Chandaluri | Draft |
| assortment | The set of products a given store carries, and the price it carries them at. STORE_ASSORTMENT is one product at one store; price lives here rather than on PRODUCT because prices vary by store and by state | Rushitha Chandaluri | Draft |
| inventory movement | One stock change at one store: sale, return, receipt, transfer, shrink, cycle-count adjustment, salvage. Immutable — a correction is another movement, never an edit to the one it corrects. On-hand is the signed sum of movements, not a stored number (assumption A4) | Rushitha Chandaluri | Draft |

All eleven rows are `Draft` and owned by the author pending review. The first
eight are the seeded terms; **tender**, **assortment** and **inventory
movement** were added when review cut the conceptual model to eight entities and
made those three words load-bearing. Ownership
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
- **tender** — is an unsuccessful authorisation a tender? Is a refund a
  negative tender or its own act?
- **assortment** — does a de-assorted product with stock still on the shelf
  remain in the assortment?
- **inventory movement** — is a movement that nets to zero worth recording?
