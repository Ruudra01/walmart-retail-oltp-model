# Conceptual Data Model - Retail OLTP

**Phase 1 scope:** in-store checkout, staffed lanes and self-checkout. Selling,
returning, tendering and the stock consequences of both.

**Deferred, not excluded:** online, pickup, curbside and delivery. `README.md`
states the scope of the eventual system; this document states what phase 1
agrees to model, and assumption A1 below is what stands between the two.

Source system only - not the warehouse.

**Eight entities, and eight logical tables.** No many-to-many survives at this
layer, so nothing here resolves into an associative entity later. What the
logical phase adds is attributes and keys, not structure.

---

## Rules for this layer

Entities and relationships only. **No attributes, no keys, no data types, no
indexes, no volumes.** Those belong to the logical and physical layers.

Every relationship on the diagram carries a stated business reason. At eight
entities that standard is affordable, so it is enforced: a relationship nobody
can justify in a sentence comes off the diagram.

Four entities that a fuller model would carry - a cart, a reservation, a
register, a promotion - are absent by **assumption**, not by oversight. Each
assumption below states the condition that invalidates it. When one is
invalidated, phase 1 reopens and the entity returns; that is a normal event,
not a failure. `CONTRIBUTING.md` says going back is expected.

This document is not done when it looks complete to us. It is done when a store
manager reads it and either agrees or corrects us.

---

## Diagram

```mermaid
erDiagram
    STORE            ||--o{ STORE_ASSORTMENT   : offers
    PRODUCT          ||--o{ STORE_ASSORTMENT   : offered-as
    STORE            ||--o{ SALE_TRANSACTION   : hosts
    CUSTOMER         |o--o{ SALE_TRANSACTION   : identified-on

    SALE_TRANSACTION ||--|{ TRANSACTION_LINE   : contains
    SALE_TRANSACTION ||--o{ TENDER             : settled-by

    STORE_ASSORTMENT ||--o{ TRANSACTION_LINE   : sold-as
    STORE_ASSORTMENT ||--o{ INVENTORY_MOVEMENT : stock-changed-by

    TRANSACTION_LINE |o--o{ TRANSACTION_LINE   : reverses
    TRANSACTION_LINE |o--o{ INVENTORY_MOVEMENT : triggers
```

---

## Entities

| Entity | Business meaning |
|---|---|
| STORE | A location where stock is held and a sale is processed |
| PRODUCT | An item the retailer sells, defined once for the whole chain |
| STORE_ASSORTMENT | A product as offered at one store - carried here, at this price. *Associative, and the business's own noun for it* |
| CUSTOMER | A person identified on a purchase. Optional throughout - most in-store baskets are anonymous |
| SALE_TRANSACTION | A completed checkout: a sale or a return. The transaction itself, and the only financial header in the model |
| TRANSACTION_LINE | One item within a transaction. **The atom of the business.** A returned line may reference the original line it reverses |
| TENDER | One means of settlement applied to a transaction. Negative on a refund |
| INVENTORY_MOVEMENT | A single stock change at one store: sale, return, receipt, transfer, shrink, adjustment, salvage. Only some movements originate from a sale |

**On the naming.** `ORDER` and `ORDER_ITEM` are gone for two reasons. `ORDER` is
reserved in ANSI SQL, and `model/schema.dbml` already forbids reserved words as
identifiers, "not even quoted" - the old name survived only by pluralising the
table to `orders`, which is a workaround, not a name. It is also the wrong noun:
an order is *placed* and later fulfilled, whereas a checkout *completes* on
tender. Keeping `ORDER` free means it stays available if online ordering enters
scope under A1, where it will be the correct word for a genuinely different
thing.

---

## Relationships

| Relationship | Cardinality | Why the business needs it |
|---|---|---|
| STORE offers STORE_ASSORTMENT | one to many | A store carries some of the chain's products, not all of them |
| PRODUCT offered-as STORE_ASSORTMENT | one to many | The same product is carried at many stores, at prices that differ by store and by state |
| STORE hosts SALE_TRANSACTION | one to many | Every checkout happens somewhere, and store is the unit of attribution under A2 |
| CUSTOMER identified-on SALE_TRANSACTION | zero-or-one to many | Anonymous baskets are the norm in store, so the transaction cannot require a customer |
| SALE_TRANSACTION contains TRANSACTION_LINE | one to one-or-many | A transaction with no lines is not a transaction |
| SALE_TRANSACTION settled-by TENDER | one to zero-or-many | Split tender is routine - gift card plus debit. Zero is possible while a transaction is suspended, and for a basket fully covered by a non-tender adjustment |
| STORE_ASSORTMENT sold-as TRANSACTION_LINE | one to many | A line sells what that store carries, at that store's price - not an abstract chain product |
| STORE_ASSORTMENT stock-changed-by INVENTORY_MOVEMENT | one to many | Stock is held per store and per product, which is the assortment grain |
| TRANSACTION_LINE reverses TRANSACTION_LINE | zero-or-one to many | A returned line optionally references the original it reverses. Optional because no-receipt returns exist; many because one original is returned against repeatedly. See ADR 0002 |
| TRANSACTION_LINE triggers INVENTORY_MOVEMENT | zero-or-one to many | A sale moves stock, but most movements have no line behind them - and one returned line can produce several movements, or none |

---

## Assumptions

Each one narrows the model. Each states what invalidates it. An assumption
without an invalidation condition is an omission pretending to be a decision.

**A1. Checkout is atomic. There is no state before tender and no handover
after it.** So no cart, no cart line, no reservation, no fulfilment. In store
the basket exists on a lane and in the shopper's hands, and a physical trolley
holds no server-side state.

*Invalidated when* the model must record a basket that exists before settlement
- an online cart, a suspended transaction that resumes on another lane, a
Scan & Go basket built on a phone - or a handover separated in time or place
from settlement, which is pickup, curbside and delivery. Any one of those
returns CART and FULFILLMENT, and stock held for an unsettled basket returns
RESERVATION with them.

**A2. Attribution is store-level.** So no register and no employee. A
transaction records where it happened, not which lane rang it or who served it.

*Invalidated when* an event has to name a lane or a person. Three such events
are already listed in `docs/events.md` - *register opened*, *register closed*,
*store day closed* - along with *price overridden*, and that document states
that a model unable to record a listed event is incomplete. **This assumption
therefore contradicts `docs/events.md` as it stands, and one of the two must
change in this PR: either those rows are marked out of phase 1, or A2 fails.**
Till reconciliation and override auditing are the business processes at stake.

**A3. Goods sell at their assortment price.** So no promotion, no category, no
loyalty accrual. The price on the line is the price the store carries.

*Invalidated when* a line settles at anything other than the assortment price:
a markdown, a manufacturer coupon, a basket-level offer, an employee discount.
The first of those returns PROMOTION, and with it the requirement to allocate
basket-level offers down to individual lines at the time of sale - without which
a partial return cannot be refunded correctly. That allocation will need its own
ADR when it arrives. Loyalty returns as soon as points accrue on a purchase, and
CATEGORY returns as soon as anything - an age restriction, a department
reporting line, a taxability rule - keys off a nesting of products rather than
off the product itself.

**A4. On-hand is a query over INVENTORY_MOVEMENT, not a stored position.**
Movement is an immutable event; a correction is another movement, never an edit
to the one it corrects. The position is the signed sum.

*Invalidated when* a read path needs the position faster than a ledger scan can
answer. That is not a reason to add an entity here: it is an accepted
denormalisation, and `docs/physical-design.md` governs it - the redundancy
named, what keeps the copies consistent, how divergence is detected, a signer,
an ADR, and a data quality test proving the copies agree.

**A5. Tax is a single amount per line.** So no taxing authority and no per-line,
per-authority tax grain.

*Invalidated when* tax must be remitted by jurisdiction, or when a return must
reverse the exact amounts each authority charged. A line is really taxed by
state, county, city and sometimes a transit district at once, at rates differing
by taxability - groceries exempt, prepared food not - so this assumption is the
most likely of the five to fail. It is stated rather than modelled because
remittance is not yet in phase 1 scope.

---

## Modelling decisions

**A return is a SALE_TRANSACTION, not a separate entity.** It carries a
transaction type. Financial records are immutable - we never mutate the original
sale.

**Return linkage is at line level, not header level, and the reference is
optional.** Each returned line optionally references the original line it
reverses, as a self-reference inside TRANSACTION_LINE. No associative entity is
needed. The many-to-many between a return and its original transactions emerges
from the line links: a customer returns items from two receipts in one trip, and
one original transaction is returned against repeatedly through partial returns.
No-receipt returns are common and are a significant fraud vector, so the
reference cannot be mandatory. See
`docs/decisions/0002-link-returns-at-item-level.md`.

**Not every stock movement comes from a sale.** Supplier receipts, inter-store
transfers, shrink, cycle-count adjustments and salvage all change stock with no
line behind them. The relationship is optional on both sides, which is why
INVENTORY_MOVEMENT is an entity in its own right rather than an artefact of
selling.

**A return does not always increase the stock it came from.** Condition decides
where the goods go: back to shelf, to salvage, to a claims hold, or nowhere when
the item is destroyed at the counter. One returned line therefore produces zero,
one or more movements, and not always positive ones.

**Prices are captured as sold, never recomputed.** A line holds what was
actually paid, so a refund reverses the real amount however far the shelf price
has moved since.

**Weighed items sell in fractional quantities.** Produce, meat and deli sell by
weight, so quantity is not always a whole number. The business fact belongs
here; precision, rounding and unit-of-measure handling are logical concerns.

**CUSTOMER is optional, and identity is not inferred.** Anonymous is the normal
case in store. Resolving identity downstream is the OLAP team's problem, not a
reason to require a customer here.

**Price belongs to STORE_ASSORTMENT, not PRODUCT.** Prices vary by store and by
state, for the same reason stock does.

---

## Open questions

**1. Are voided and suspended transactions SALE_TRANSACTION instances with a
status?** A void before tender leaves no financial record and, we think, no row
- nothing has happened yet. A reversal after tender is a return, not a void. But
a suspended basket that resumes on another lane is state that outlives the first
lane, and under A1 this model has nowhere to put it; recording it as an
unsettled transaction is the alternative to invalidating A1. This is the
question most likely to move the scope.

**2. Should SALE_TRANSACTION carry a header-level reference to the original
transaction?** Deriving it from the line links is the default. Storing it is
wrong in exactly the case that matters - a multi-receipt return has no single
original, so the column is null or arbitrary whenever the interesting thing
happens - and it would be a denormalisation needing an ADR.

**3. When does a store's day end?** `business date` is the trading day a
transaction is attributed to, in the store's local timezone, and the glossary
already flags the cutoff as unsettled. Under A2 there is no store-day entity to
hang it on, so it is an attribute of the transaction and the cutoff is a rule,
not a row.

---

## Deliberately excluded

Legitimate business processes that are **not in scope**:

Pharmacy, a separate HIPAA-walled system - supplier and purchase orders,
because procurement is a different process - auto care and vision work orders -
money centre and gift-card issuance - price change history - employee
scheduling - any store grouping above STORE, such as region, district or
banner, because those are reporting rollups and rollups are the OLAP team's.

Excluded as attributes or lookups rather than entities: transaction type, tender
type, condition code, movement reason, unit of measure. A closed list of codes
with a name and nothing else is a domain, not an entity. If one ever acquires
history of its own - a tender type whose fees change over time - it graduates,
and that is a change to this document, not a quiet one to the DDL.

Also excluded: `outbox_event`. Reliable event publication is an implementation
mechanism, not a business entity - a store manager has never heard of it. It is
a real table and a necessary one, and it belongs to the physical layer.
