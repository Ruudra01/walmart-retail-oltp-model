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

```sh
cd docs/erd
npm install   # one-time; installs @dbml/core and sharp locally here
node generate.js
```

Regenerates `erd.png` from the current `model/schema.dbml`. Regenerate whenever
the logical model changes; a stale ERD is worse than none, because people trust
it.

`generate.js` is a small custom renderer, not a wrapper around a standard DBML
tool - it draws the specific look this repo settled on (rounded cards, a dark
header, a PK/FK badge column, no data-type clutter, crow's-foot connectors
anchored to the exact row a relationship touches), which no off-the-shelf
export produced. It reads `model/schema.dbml` the same way any DBML tool would
(via `@dbml/core`); nothing about the schema itself is special-cased.

If you add a table to `model/schema.dbml`, also add it to the `grid` layout
object near the top of `generate.js` - an unlisted table still renders (with a
console warning) but gets auto-placed rather than positioned sensibly next to
what it relates to.

Never hand-edit `erd.png`, and never hand-edit the `erd.svg` `generate.js`
writes on the way there (gitignored - it's a build byproduct, not the
diagram). Fix `model/schema.dbml`, or `generate.js` itself if the layout or
style needs to change, and re-run.

State the source commit in the PR description so a reader can tell what the
image was generated from.
