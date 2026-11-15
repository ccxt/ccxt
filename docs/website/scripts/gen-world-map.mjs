// One-off generator: fetch Natural Earth 110m country outlines (public domain, via the
// world-atlas topojson distribution) and decode them into a single equirectangular SVG
// path string. Committed output (src/data/world-map.json) is tiny and rendered inline by
// the LatencyMap component, so nothing is fetched at page-render time.
//
// Projection is plain equirectangular (plate carree), so a lat/lon marker maps with:
//   x = (lon + 180) * (W / 360)
//   y = (90  - lat) * (H / 180)
// which is exactly how the outline below is projected -> markers line up with the coasts.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname (fileURLToPath (import.meta.url));
const OUT = join (__dirname, '..', 'src', 'data', 'world-map.json');
const SRC = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const W = 1000, H = 500;

const round = (n) => Math.round (n * 10) / 10;
const projX = (lon) => round ((lon + 180) * (W / 360));
const projY = (lat) => round ((90 - lat) * (H / 180));

function decodeArcs (topology) {
    const { scale: [sx, sy], translate: [tx, ty] } = topology.transform;
    return topology.arcs.map ((arc) => {
        let x = 0, y = 0;
        return arc.map (([dx, dy]) => {
            x += dx; y += dy;
            return [x * sx + tx, y * sy + ty]; // -> [lon, lat]
        });
    });
}

function arcPoints (arcs, index) {
    if (index >= 0) return arcs[index];
    return arcs[~index].slice ().reverse (); // negative = reversed arc
}

function ringToPath (arcs, ring) {
    let pts = [];
    for (const idx of ring) {
        const seg = arcPoints (arcs, idx);
        // topojson shares endpoints between arcs; drop the duplicated join point
        pts = pts.length ? pts.concat (seg.slice (1)) : seg.slice ();
    }
    let d = '';
    pts.forEach (([lon, lat], i) => { d += (i ? 'L' : 'M') + projX (lon) + ' ' + projY (lat); });
    return d + 'Z';
}

const res = await fetch (SRC);
const topo = await res.json ();
const arcs = decodeArcs (topo);
const geoms = topo.objects.countries.geometries;
let d = '';
for (const g of geoms) {
    const polys = (g.type === 'Polygon') ? [g.arcs] : g.arcs;
    for (const poly of polys) for (const ring of poly) d += ringToPath (arcs, ring);
}
writeFileSync (OUT, JSON.stringify ({ width: W, height: H, path: d }));
console.log (`Wrote ${OUT} (${(d.length / 1024).toFixed (1)} KB path, ${geoms.length} countries)`);
