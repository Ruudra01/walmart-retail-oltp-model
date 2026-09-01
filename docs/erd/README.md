# ERD exports

**What belongs here:** the rendered entity-relationship diagram exported from
`model/schema.dbml`, as PNG. Committed on purpose — most of the people who need
to read the model (analysts, the OLAP team, anyone in a review meeting) do not
have DBML tooling installed, and a diagram nobody can open documents nothing.

**Done when:** `erd.png` matches the current `model/schema.dbml`, is legible at
100%, and was regenerated in the same PR as the model change that altered it.

**Must NOT go here:** hand-drawn diagrams, screenshots of a whiteboard, or a
diagram edited directly. `model/schema.dbml` is the source; this directory is
build output that we happen to commit. Never fix the diagram — fix the DBML and
re-export. Also nothing warehouse-shaped: this is the OLTP model.

## Export

Render `model/schema.dbml` and save as `erd.png` here. Regenerate whenever the
logical model changes; a stale ERD is worse than none, because people trust it.

State the source commit in the PR description so a reader can tell what the
image was generated from.
