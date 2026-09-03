#!/usr/bin/env node
// Renders model/schema.dbml to docs/erd/erd.png.
//
// Why this exists instead of a standard DBML-to-image tool: this repo wants a
// specific visual language - rounded cards, a dark header, a PK/FK badge
// column, no data-type clutter, crow's-foot connectors anchored to the exact
// row a relationship touches - that no off-the-shelf renderer (dbdiagram.io's
// export, dbml-renderer + Graphviz) produces. This script reads the same
// parsed model dbml-renderer would and draws it directly as SVG, then
// rasterizes with sharp.
//
// Run from anywhere: `node docs/erd/generate.js`. Needs @dbml/core and sharp -
// `npm install` in this directory first (see package.json here).
//
// Regenerate whenever model/schema.dbml changes, in the same PR - see
// docs/erd/README.md. Never hand-edit erd.png or erd.svg; fix the DBML, or
// this script, and re-run.

const { Parser } = require('@dbml/core');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'model', 'schema.dbml');
const OUT_SVG = path.join(__dirname, 'erd.svg');
const OUT_PNG = path.join(__dirname, 'erd.png');

const src = fs.readFileSync(SCHEMA_PATH, 'utf8');
const db = new Parser().parse(src, 'dbmlv2');
const schema = db.schemas[0];

// ---------- style ----------
const HEADER_H = 34;
const ROW_H = 25;
const PAD_X = 12;
const CARD_RADIUS = 9;
const GUTTER_X = 90;
const GUTTER_Y = 70;
const FONT = 'Helvetica, Arial, sans-serif';
const COL = {
  bg: '#f3f4f6',
  header: '#232e42',
  headerText: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: '#d3d7dd',
  divider: '#e1e4e9',
  badgeText: '#111827',
  colText: '#374151',
  edge: '#3a4150',
  outerBorder: '#e2e5ea',
};

function charWidth(bold) { return bold ? 7.3 : 6.6; }
function textWidth(str, bold) { return str.length * charWidth(bold); }
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------- build table models from the parsed schema ----------
const tables = {};
for (const t of schema.tables) {
  const pkCols = new Set();
  for (const f of t.fields) if (f.pk) pkCols.add(f.name);
  for (const idx of t.indexes) if (idx.pk) for (const c of idx.columns) pkCols.add(c.value || c);

  tables[t.name] = {
    name: t.name,
    fields: t.fields.map(f => ({ name: f.name, pk: pkCols.has(f.name), fkLabels: [] })),
  };
}

// endpoint.relation === '*' is the many/FK-holding side; '1' is the referenced side.
const refsForDraw = [];
const fkCounterPerTable = {};
for (const r of schema.refs) {
  const many = r.endpoints.find(e => e.relation === '*');
  const one = r.endpoints.find(e => e.relation === '1');
  if (!many || !one) continue;
  const holder = tables[many.tableName];
  if (!holder) continue;
  fkCounterPerTable[many.tableName] = (fkCounterPerTable[many.tableName] || 0) + 1;
  const label = 'FK' + fkCounterPerTable[many.tableName];
  for (const fname of many.fieldNames) {
    const f = holder.fields.find(x => x.name === fname);
    if (f) f.fkLabels.push(label);
  }
  refsForDraw.push({
    fromTable: many.tableName, fromCols: many.fieldNames,
    toTable: one.tableName, toCols: one.fieldNames,
  });
}

// PK columns grouped first (original relative order), a divider, then the rest.
for (const t of Object.values(tables)) {
  const pkRows = t.fields.filter(f => f.pk);
  const restRows = t.fields.filter(f => !f.pk);
  t.rows = [];
  for (const f of pkRows) t.rows.push({ field: f });
  if (pkRows.length && restRows.length) t.rows.push({ divider: true });
  for (const f of restRows) t.rows.push({ field: f });
}

// badge column width: driven by the longest "PK, FKn, ..." string anywhere
let BADGE_W = 40;
for (const t of Object.values(tables)) {
  for (const r of t.rows) {
    if (r.divider) continue;
    const badge = [r.field.pk ? 'PK' : null, ...r.field.fkLabels].filter(Boolean).join(', ');
    BADGE_W = Math.max(BADGE_W, textWidth(badge, true) + 16);
  }
}

// per-table pixel size
for (const t of Object.values(tables)) {
  let maxNameW = textWidth(t.name.toUpperCase(), true) + 20;
  for (const r of t.rows) {
    if (r.divider) continue;
    const w = BADGE_W + 10 + textWidth(r.field.name, false) + PAD_X * 2;
    if (w > maxNameW) maxNameW = w;
  }
  t.width = Math.ceil(maxNameW / 2) * 2;
  let h = HEADER_H;
  for (const r of t.rows) h += r.divider ? 8 : ROW_H;
  t.height = h;
}

// ---------- manual grid placement ----------
// Hand-arranged to keep related tables close and minimize crossings. A table
// added to schema.dbml without an entry here is auto-placed in a new row at
// the end (with a warning) rather than crashing - update this grid instead.
const grid = {
  tender_type: [0, 0], tender: [1, 0], sale_transaction: [2, 0], customer: [3, 0],
  condition_code: [0, 1], transaction_line: [1, 1], store_assortment: [2, 1], product: [3, 1], unit_of_measure: [4, 1],
  movement_reason: [0, 2], inventory_movement: [1, 2], store: [2, 2], state: [3, 2],
};

let nextFallbackRow = Math.max(...Object.values(grid).map(([, r]) => r)) + 1;
let fallbackCol = 0;
for (const name of Object.keys(tables)) {
  if (!(name in grid)) {
    console.warn(`docs/erd/generate.js: "${name}" has no grid position - add one for a better layout. Auto-placed for now.`);
    grid[name] = [fallbackCol++, nextFallbackRow];
  }
}

const colOf = {}, rowOf = {};
for (const [name, [c, r]] of Object.entries(grid)) { colOf[name] = c; rowOf[name] = r; }
const maxCol = Math.max(...Object.values(colOf));
const maxRow = Math.max(...Object.values(rowOf));

const colWidth = Array(maxCol + 1).fill(0);
const rowHeight = Array(maxRow + 1).fill(0);
for (const t of Object.values(tables)) {
  colWidth[colOf[t.name]] = Math.max(colWidth[colOf[t.name]], t.width);
  rowHeight[rowOf[t.name]] = Math.max(rowHeight[rowOf[t.name]], t.height);
}
const colX = [40];
for (let i = 0; i <= maxCol; i++) colX.push(colX[i] + colWidth[i] + GUTTER_X);
const rowY = [40];
for (let i = 0; i <= maxRow; i++) rowY.push(rowY[i] + rowHeight[i] + GUTTER_Y);

for (const t of Object.values(tables)) {
  t.x = colX[colOf[t.name]];
  t.y = rowY[rowOf[t.name]];
}

function rowCenterY(tableName, fieldName) {
  const t = tables[tableName];
  let y = t.y + HEADER_H;
  for (const r of t.rows) {
    const h = r.divider ? 8 : ROW_H;
    if (!r.divider && r.field.name === fieldName) return y + h / 2;
    y += h;
  }
  return t.y + HEADER_H / 2;
}
function anchorY(tableName, fieldNames) {
  const ys = fieldNames.map(f => rowCenterY(tableName, f));
  return ys.reduce((a, b) => a + b, 0) / ys.length;
}

// ---------- SVG assembly ----------
const canvasW = colX[maxCol + 1] + 40;
const canvasH = rowY[maxRow + 1] + 40;

const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" font-family="${FONT}">`);
svg.push(`<rect x="0" y="0" width="${canvasW}" height="${canvasH}" fill="${COL.bg}"/>`);
svg.push(`<rect x="10" y="10" width="${canvasW - 20}" height="${canvasH - 20}" rx="20" fill="none" stroke="${COL.outerBorder}" stroke-width="2"/>`);

// dir: 'l'/'r' = horizontal exit, crow's-foot fans out vertically.
//      't'/'b' = vertical exit, crow's-foot fans out horizontally.
function crowFoot(x, y, dir) {
  const s = 9;
  if (dir === 'l' || dir === 'r') {
    const sign = dir === 'l' ? -1 : 1;
    return `<path d="M ${x} ${y} L ${x + sign * s} ${y - 6} M ${x} ${y} L ${x + sign * s} ${y} M ${x} ${y} L ${x + sign * s} ${y + 6}" stroke="${COL.edge}" stroke-width="1.4" fill="none"/>`;
  }
  const sign = dir === 't' ? -1 : 1;
  return `<path d="M ${x} ${y} L ${x - 6} ${y + sign * s} M ${x} ${y} L ${x} ${y + sign * s} M ${x} ${y} L ${x + 6} ${y + sign * s}" stroke="${COL.edge}" stroke-width="1.4" fill="none"/>`;
}
function oneTick(x, y, dir) {
  if (dir === 'l' || dir === 'r') {
    const sign = dir === 'l' ? -1 : 1;
    return `<line x1="${x + sign * 7}" y1="${y - 6}" x2="${x + sign * 7}" y2="${y + 6}" stroke="${COL.edge}" stroke-width="1.4"/>`;
  }
  const sign = dir === 't' ? -1 : 1;
  return `<line x1="${x - 6}" y1="${y + sign * 7}" x2="${x + 6}" y2="${y + sign * 7}" stroke="${COL.edge}" stroke-width="1.4"/>`;
}

const edgeSvg = [];
for (const ref of refsForDraw) {
  const from = tables[ref.fromTable], to = tables[ref.toTable];
  if (!from || !to) continue;

  if (ref.fromTable === ref.toTable) {
    // Self-reference: loop out the right side (left is reserved for
    // lookup-table edges, so the two kinds of line stay visually apart).
    const fy = anchorY(ref.fromTable, ref.fromCols);
    const ty = anchorY(ref.toTable, ref.toCols);
    const x = from.x + from.width;
    const bulge = 64;
    edgeSvg.push(`<path d="M ${x} ${fy} C ${x + bulge} ${fy}, ${x + bulge} ${ty}, ${x} ${ty}" stroke="${COL.edge}" stroke-width="1.4" fill="none"/>`);
    edgeSvg.push(crowFoot(x, fy, 'r'));
    edgeSvg.push(oneTick(x, ty, 'r'));
    continue;
  }

  const fcx = from.x + from.width / 2, fcy = from.y + from.height / 2;
  const tcx = to.x + to.width / 2, tcy = to.y + to.height / 2;
  const ddx = tcx - fcx, ddy = tcy - fcy;

  let fx, fy, fdir, tx, ty, tdir;
  if (Math.abs(ddx) > Math.abs(ddy) * 1.15) {
    fy = anchorY(ref.fromTable, ref.fromCols);
    ty = anchorY(ref.toTable, ref.toCols);
    if (ddx > 0) { fx = from.x + from.width; fdir = 'r'; tx = to.x; tdir = 'l'; }
    else { fx = from.x; fdir = 'l'; tx = to.x + to.width; tdir = 'r'; }
    const dx = Math.max(50, Math.abs(tx - fx) * 0.4);
    const c1x = fdir === 'r' ? fx + dx : fx - dx;
    const c2x = tdir === 'r' ? tx + dx : tx - dx;
    edgeSvg.push(`<path d="M ${fx} ${fy} C ${c1x} ${fy}, ${c2x} ${ty}, ${tx} ${ty}" stroke="${COL.edge}" stroke-width="1.4" fill="none"/>`);
  } else {
    fx = from.x + from.width / 2;
    tx = to.x + to.width / 2;
    if (ddy > 0) { fy = from.y + from.height; fdir = 'b'; ty = to.y; tdir = 't'; }
    else { fy = from.y; fdir = 't'; ty = to.y + to.height; tdir = 'b'; }
    const dy = Math.max(40, Math.abs(ty - fy) * 0.4);
    const c1y = fdir === 'b' ? fy + dy : fy - dy;
    const c2y = tdir === 'b' ? ty + dy : ty - dy;
    edgeSvg.push(`<path d="M ${fx} ${fy} C ${fx} ${c1y}, ${tx} ${c2y}, ${tx} ${ty}" stroke="${COL.edge}" stroke-width="1.4" fill="none"/>`);
  }
  edgeSvg.push(crowFoot(fx, fy, fdir));
  edgeSvg.push(oneTick(tx, ty, tdir));
}
svg.push(...edgeSvg);

let cardId = 0;
for (const t of Object.values(tables)) {
  cardId++;
  const clipId = `clip${cardId}`;
  svg.push(`<defs><clipPath id="${clipId}"><rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" rx="${CARD_RADIUS}"/></clipPath></defs>`);
  svg.push(`<g clip-path="url(#${clipId})">`);
  svg.push(`<rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" fill="${COL.cardBg}"/>`);
  svg.push(`<rect x="${t.x}" y="${t.y}" width="${t.width}" height="${HEADER_H}" fill="${COL.header}"/>`);
  svg.push(`</g>`);
  svg.push(`<rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" rx="${CARD_RADIUS}" fill="none" stroke="${COL.cardBorder}" stroke-width="1.3"/>`);
  svg.push(`<text x="${t.x + t.width / 2}" y="${t.y + HEADER_H / 2 + 5}" text-anchor="middle" fill="${COL.headerText}" font-size="13.5" font-weight="700">${escapeXml(t.name)}</text>`);
  svg.push(`<line x1="${t.x + BADGE_W}" y1="${t.y + HEADER_H}" x2="${t.x + BADGE_W}" y2="${t.y + t.height}" stroke="${COL.divider}" stroke-width="1"/>`);

  let y = t.y + HEADER_H;
  for (const r of t.rows) {
    if (r.divider) {
      const my = y + 4;
      svg.push(`<line x1="${t.x}" y1="${my}" x2="${t.x + t.width}" y2="${my}" stroke="${COL.divider}" stroke-width="1"/>`);
      y += 8;
      continue;
    }
    const rowMidY = y + ROW_H / 2 + 4;
    const badge = [r.field.pk ? 'PK' : null, ...r.field.fkLabels].filter(Boolean).join(', ');
    if (badge) svg.push(`<text x="${t.x + 8}" y="${rowMidY}" font-size="10.5" font-weight="700" fill="${COL.badgeText}">${badge}</text>`);
    svg.push(`<text x="${t.x + BADGE_W + 10}" y="${rowMidY}" font-size="12.5" fill="${COL.colText}" font-weight="${r.field.pk ? '700' : '400'}">${escapeXml(r.field.name)}</text>`);
    if (y + ROW_H < t.y + t.height) svg.push(`<line x1="${t.x}" y1="${y + ROW_H}" x2="${t.x + t.width}" y2="${y + ROW_H}" stroke="${COL.divider}" stroke-width="0.7"/>`);
    y += ROW_H;
  }
}
svg.push(`</svg>`);

fs.writeFileSync(OUT_SVG, svg.join('\n'));

sharp(OUT_SVG, { density: 220 })
  .flatten({ background: '#ffffff' })
  .png({ compressionLevel: 9 })
  .toFile(OUT_PNG)
  .then(info => {
    console.log(`Wrote ${path.relative(process.cwd(), OUT_PNG)} (${info.width}x${info.height}), ${Object.keys(tables).length} tables, ${refsForDraw.length} relationships.`);
  })
  .catch(e => { console.error(e); process.exit(1); });
