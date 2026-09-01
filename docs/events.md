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
store day closed, inventory adjusted.
