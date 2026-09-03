# Business events

**What belongs here:** every event that changes state in the retail business,
what triggers it, which system records it, and what it causes elsewhere. This
is what the model has to be able to represent — an entity that cannot record
one of these events is incomplete.

**Done when:** the conceptual model can represent every row, every event names
a real capturing system (not "the database"), and downstream effects are
traced to another event or to a state change on an entity.

**Must NOT go here:** implementation. No triggers, no queues, no CDC mechanics
— those live in `handoff-contract.md`. No warehouse-side consumption; what the
OLAP team does with an event is not a downstream effect of it here.

| Event | Trigger | Capturing system | Downstream effects |
|-------|---------|------------------|--------------------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

Prompts, not a checklist — decide whether each is one event or several: item
scanned, price overridden, tender accepted, tender declined, transaction
suspended, transaction voided, item returned, register opened, register closed,
inventory adjusted.

**Deferred out of phase 1, with the assumption that defers each.** These are
real events and this list does not disown them; the conceptual model simply
does not claim to record them yet, and each one's return is governed by a
stated invalidation condition in `conceptual.md`:

| Event | Deferred by | Returns when |
|---|---|---|
| register opened, register closed, store day closed | A2, attribution is store-level | Till reconciliation enters scope, or any event must name a lane |
| price overridden | A2 and A3 | An override must name the associate who authorised it, or a line sells at other than assortment price |
| transaction suspended | A1, checkout is atomic | A basket must survive being moved between lanes |

Every other prompt above is recordable by the eight-entity model, and the rows
of the table should be filled in for those before this phase closes.
