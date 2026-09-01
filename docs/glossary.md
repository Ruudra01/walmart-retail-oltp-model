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
| transaction | | | Draft |
| sale | | | Draft |
| void | | | Draft |
| return | | | Draft |
| trip | | | Draft |
| customer | | | Draft |
| business date | | | Draft |
| store | | | Draft |

Questions each seeded term has to survive:

- **transaction** — is a void a transaction? Is a return? Is a failed payment?
- **sale** — the whole basket, or one line of it?
- **void** — before tender, after tender, next day: same word?
- **return** — does it reference the original sale, or stand alone?
- **trip** — one customer, one visit, one basket? What if they pay twice?
- **customer** — an identified person, or the party at the register?
- **business date** — when does a store's day end, and in which timezone?
- **store** — a building, a legal entity, or a reporting unit?
