# Contributing

This repo holds the data model for a retail OLTP system. We are building the
**source system**, not the warehouse. Dimensional modelling belongs to the
OLAP team downstream and does not go in this repo.

Nothing here is precious. If you think something is wrong, open a pull request
and say so.

---

## The four rules

1. **Phases run conceptual → logical → physical → generator.** Never skip
   ahead. A migration that lands before the entity exists in `schema.dbml` is
   rejected, however obvious the table looks.
2. **Data is never committed, only the code that generates it.** No CSVs, no
   dumps, no parquet, no "small sample for testing".
3. **Schema changes only via forward-only numbered migrations.** Never patch a
   database by hand, never edit a merged migration. Wrong? Add `V00N+1`.
4. **Every table and column gets a `COMMENT ON` inside its migration**, written
   at the same time as the DDL — not in a follow-up PR, not "later".

Rule 1 forbids skipping *ahead*. Going back is expected — writing the
generator will expose gaps in the logical model, and revising it is the
process working, not failing.

One more, less a rule than a reflex: **never commit credentials.** Connection
strings and passwords live in `.env`, which is gitignored. `.env.example`
shows the shape with placeholder values.

---

## One-time setup

```bash
git clone https://github.com/Ruudra01/walmart-retail-oltp-model.git
cd walmart-retail-oltp-model
```

Set your commit identity for this repo. Use `--local`, not `--global` — this
repo commits under your work address, whatever your global config says:

```bash
git config --local user.name "Your Name"
git config --local user.email "you@datafactz.ai"
```

Create your `.env` and fill in every `CHANGEME`. It is gitignored and must stay
that way:

```bash
cp .env.example .env
```

Then bring up Postgres and apply the migrations:

```bash
make db-up
make migrate
```

`make help` lists the rest of the targets.

---

## Making a change

Never commit directly to `main`. Every change goes through a branch and a pull
request, including small ones.

```bash
# start from an up-to-date main
git checkout main
git pull

# branch
git checkout -b physical/add-transaction-line-table

# edit, then commit
git add migrations/V001__create_transaction_line.sql
git commit -m "physical: add transaction_line table with comments"

# push and open a PR
git push -u origin physical/add-transaction-line-table
```

GitHub prints a pull request link when you push. Open it, fill in the
template, and request a review.

After it's merged:

```bash
git checkout main
git pull
git branch -d physical/add-transaction-line-table
```

---

## Branch naming

```
<phase>/<short-description>
```

`conceptual/`, `logical/`, `physical/`, `generator/`, plus `docs/` and `fix/`.
Example: `physical/add-transaction-line-table`.

The phase prefix is a claim about which phase your change belongs to.
Reviewers check that claim first.

Commit messages take the same prefix and describe what the change *does*:
`logical: split TENDER out of PAYMENT`, not `updated file`.

---

## Pull requests

Fill in `.github/pull_request_template.md` honestly. A PR must:

- name its phase, and touch only files that phase owns
- update `docs/glossary.md` if it introduces or changes a business term
- add a migration rather than editing an existing one, if the schema changes
- include `COMMENT ON` for every new table and column, in the same migration
- add or update the tests for its phase
- carry no generated data

Small and single-purpose beats large and mixed. A PR that changes the model and
the generator at once is two PRs.

In the description, explain the reasoning rather than the diff. We can all read
the diff.

> Splitting TENDER out of PAYMENT because one transaction can be settled with
> a gift card and a debit card together. One payment per order can't express
> split tender, which is common in store.

---

## What reviewers check, by phase

**Conceptual** — Are these entities, or are they tables in disguise? Does every
relationship have a stated cardinality and a business reason? Is every
contested term in the glossary with an owner? No attributes, no keys.

**Logical** — Is it actually in 3NF, or is there a transitive dependency
someone is defending? Does each entity have a stable natural key identified,
even if a surrogate is used? Are optional relationships genuinely optional in
the business? No Postgres types, no indexes, no storage concerns.

**Physical** — Does every table and column have a comment? Are constraints in
the database rather than assumed in application code? Is the migration
forward-only and numbered without a gap? Does it run on an empty database from
scratch? Are there constraint tests proving the schema rejects the invalid
cases the DDL claims to prevent?

**Generator** — Is it written against the shipped DDL, not ahead of it? Does it
produce data that satisfies every constraint without disabling any? Is the
output gitignored? Are volumes and seeds configurable rather than hardcoded?

**Every phase** — no facts, no dimensions, no star schemas. We are the source
system.

---

## Editing the diagram

The conceptual model is a Mermaid diagram inside `docs/conceptual.md`. GitHub
renders it automatically, so you can check your work by viewing the file after
pushing. For a faster loop, paste the block into
[mermaid.live](https://mermaid.live).

Cardinality notation, which is easy to get backwards. Each pair is the same
cardinality written for the left entity and for the right:

- `||` and `||` — exactly one
- `|o` and `o|` — zero or one
- `}o` and `o{` — zero or many
- `}|` and `|{` — one or many

The marker sits on the side of the entity it describes, and says how many of
that entity there are for one of the other. So
`CUSTOMER |o--o{ ORDER : places` reads: an order has zero or one customer, and
a customer has zero or many orders. The `|o` on the left is what makes
anonymous transactions possible.

If you change a cardinality, check whether any prose elsewhere in the file now
contradicts it. The entity descriptions restate relationships in words, and
they drift out of sync easily.

---

## If you get stuck

Merge conflicts, a branch in a strange state, an accidental commit to `main` —
ask before trying to fix it with commands you found online. Most git problems
are two minutes to solve and twenty minutes to un-solve.
