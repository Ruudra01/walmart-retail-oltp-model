# 2. Link returns to originals at item level

Date: 2026-09-02

## Status

Proposed

## Context

A return reverses items that were sold earlier. The model has to record which
original sale a return relates to, and the retail cases are not simple:

- A customer returns items from two different receipts in a single trip.
- A single original order is returned against repeatedly, a few items at a
  time, over weeks.
- A customer returns an item with no receipt at all. This is common and is a
  significant fraud vector, so the model cannot treat the original as
  mandatory.
- Refunding an item that carried a basket-level promotion requires knowing
  what that item was actually sold for, not what its shelf price was.

We have already decided that a return is an ORDER carrying a type, not a
separate entity, because financial records are immutable and we never mutate
the original sale. What remains is where the link to the original lives:
on the order header, or on each returned item.

## Decision

We will carry the reference at item level. Each ORDER_ITEM on a return
optionally references the original ORDER_ITEM it reverses.

The relationship is optional on both sides, expressed in `conceptual.md` as
`ORDER_ITEM |o--o{ ORDER_ITEM : reversed-by`.

## Consequences

The many-to-many relationship between a return order and its original orders
emerges from the item links rather than needing to be modelled separately.
Partial returns and multi-receipt returns both fall out of the same structure
with no additional entity.

Because the reference is optional, a no-receipt return is representable
without inventing a placeholder original order.

Each returned item can be traced to the exact price it was originally sold at,
including its allocated share of any basket-level promotion. This is what makes
a correct refund computable.

What becomes harder: answering "which orders does this return reverse?" now
requires aggregating over the return's items rather than reading one column.
Whether to also store a header-level convenience reference for the common
single-receipt case is deliberately left open — it is open question 4 in
`conceptual.md`, and it is a duplication question, not a modelling one.

**We rejected a header-level link.** One reference on the return order cannot
express a return spanning two receipts, so it would have needed an associative
entity between return orders and original orders to survive the real case. That
entity would carry no information of its own, and it would still lose what
actually matters: which specific item was returned, in what condition, and at
what price it was originally sold. It is more structure for strictly less
information.

## Update, 2026-09-03

Review cut the conceptual model to eight entities and renamed two of them:
ORDER became SALE_TRANSACTION, and ORDER_ITEM became TRANSACTION_LINE. `ORDER`
is reserved in ANSI SQL, and an order is placed and later fulfilled whereas a
checkout completes on tender.

**This decision is unchanged.** Read ORDER as SALE_TRANSACTION and ORDER_ITEM as
TRANSACTION_LINE throughout the text above; the cardinality quoted from
`conceptual.md` is now `TRANSACTION_LINE |o--o{ TRANSACTION_LINE : reverses`.

The rename in fact strengthens it: the link is a self-reference inside one
entity, so item-level linkage costs no associative entity at all, and it
survives a model with no many-to-many anywhere in it.
