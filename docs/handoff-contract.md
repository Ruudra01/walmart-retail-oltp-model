# Handoff contract

**What belongs here:** what the OLAP team can rely on. This is the promise we
make about the data we hand over — the one document they read before building
anything on top of us. Every heading below is a question they will otherwise
have to ask us, or guess at.

**Done when:** every section is filled in, every guarantee is one the physical
model actually enforces (a constraint, not an intention), and a warehouse
engineer who has never spoken to us can build against it without asking.

**Must NOT go here:** how they should model it. This says what our data means
and what holds true — not what dimensions to build from it. Also not a place
for anything we cannot enforce: if the model does not guarantee it, do not
promise it here, write it under Known quality issues instead.

## Grain per table

## Stable keys

## Immutability guarantees

## Business date vs system timestamp

## CDC mechanism

## Late-arriving data behavior

## Known quality issues
