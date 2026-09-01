# Conceptual model

**What belongs here:** the entities the retail business actually has, and the
relationships between them. Each entity gets a one-line definition below the
diagram saying what one instance of it *is* in the real world. Each
relationship gets a cardinality and a business reason.

**Done when:** every entity a POS transaction touches appears exactly once, no
two entities are the same thing under different names, every relationship's
cardinality survived an argument with someone who works in a store, and every
contested term is in `glossary.md` with an owner.

**Must NOT go here:** attributes. Keys. Data types. Nullability. Junction
tables invented to resolve many-to-many — state the many-to-many and resolve it
in the logical phase. Anything named `fact_` or `dim_`.

If you are reaching for a column, you are in the wrong phase. Go to
`model/schema.dbml` — after this document is agreed.

## Diagram

Entities and relationships only. Mermaid attribute blocks stay empty.

```mermaid
erDiagram
```

## Entities

One line each: what a single instance is.

## Relationships

One line each: cardinality, and why the business works that way.
