import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DOM_SKIP, firstColumn, headerButton, openView, plain, press, rowsOf } from '../helpers/dom.js';
import type { Host } from '../helpers/dom.js';

// ts/ui/table.js on its own: a bare page with the two shared includes and none of the views,
// driven through window.ccxtTable the way a view drives it.
const uiDir = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', '..', 'ts', 'ui');
const include = (file: string) => fs.readFileSync (path.join (uiDir, file), 'utf8');
const PAGE = '<!doctype html><html><head><title>table</title></head><body>'
    + '<button type="button" id="refresh" hidden>Refresh</button><div class="board" id="board"></div><div id="readout"></div><div class="status" id="status">Waiting for data…</div>'
    + '<script>' + include ('bridge.js') + '\n' + include ('table.js') + '</script></body></html>';

// name: text column; size, price: numeric, with rows that lack the value
const ROWS = [
    { 'name': 'delta', 'size': 3, 'price': 10 },
    { 'name': 'alpha', 'size': undefined, 'price': 10 },
    { 'name': 'charlie', 'size': 20, 'price': undefined },
    { 'name': 'bravo', 'size': 1, 'price': 5 },
    { 'name': 'echo', 'size': undefined, 'price': 5 },
];

interface Grid {
    host: Host;
    grid: any;
    active: (number | string)[];
    setRows: (rows: Record<string, any>[]) => void;
}

async function openGrid (rows: Record<string, any>[] = ROWS): Promise<Grid> {
    const host = await openView (PAGE, { 'embedded': false });
    const window = host.window;
    const document = host.document;
    const active: (number | string)[] = [];
    let current: Record<string, any>[] = [];
    const setRows = (next: Record<string, any>[]) => {
        current = next.map ((row, index) => ({ ...row, index, 'key': row['name'] }));
    };
    setRows (rows);
    const cell = (key: string) => (node: any, row: any) => {
        node.textContent = (row[key] === undefined) ? '–' : String (row[key]);
    };
    const grid = window.ccxtTable.grid ({
        'board': document.getElementById ('board'),
        'columns': [
            { 'key': 'name', 'label': 'Name', 'hint': 'Sort by name', 'text': true, 'header': true, 'fill': cell ('name') },
            { 'key': 'size', 'label': 'Size', 'short': 'Sz', 'hint': 'Sort by size', 'className': 'c-size', 'unit': () => 'lots', 'fill': cell ('size') },
            { 'key': 'price', 'label': 'Price', 'hint': 'Sort by price', 'left': true, 'fill': cell ('price') },
        ],
        'rows': () => current,
        'caption': () => 'Test rows.',
        'onActive': (index: number, row: any) => { active.push ((row === undefined) ? index : row.name); },
    });
    grid.build ();
    return { host, grid, active, setRows };
}

const sortState = (document: any) => Array.from (document.querySelectorAll ('thead th')).map ((cell: any) => cell.getAttribute ('aria-sort') + cell.querySelector ('.dir').textContent);
const tabStops = (document: any) => rowsOf (document).map ((row: any) => row.tabIndex);

test ('table: the header — labels, short labels, units, hints, alignment and the caption', { 'skip': DOM_SKIP }, async () => {
    const { host } = await openGrid ();
    try {
        const document = host.document;
        assert.equal (document.getElementById ('board').className, 'board scroll');
        assert.equal (document.querySelector ('caption').textContent, 'Test rows. Column headers sort the table; arrow keys move between rows.');
        const heads: any[] = Array.from (document.querySelectorAll ('thead th'));
        assert.deepEqual (heads.map ((cell) => cell.scope), [ 'col', 'col', 'col' ]);
        assert.deepEqual (heads.map ((cell) => cell.className), [ 'l', 'c-size', 'l' ], 'text and left columns are left-aligned');
        assert.deepEqual (heads.map ((cell) => cell.querySelector ('button').title), [ 'Sort by name', 'Sort by size', 'Sort by price' ]);
        assert.equal (heads[1].querySelector ('.long').textContent, 'Size');
        assert.equal (heads[1].querySelector ('.short').textContent, 'Sz');
        assert.equal (heads[1].querySelector ('.unit').textContent, 'lots');
        assert.ok (heads[0].querySelector ('.short') === null);
        // the arrow sits on the side the column is aligned away from
        assert.equal (heads[0].querySelector ('button').lastChild.className, 'dir');
        assert.equal (heads[1].querySelector ('button').firstChild.className, 'dir');
        assert.deepEqual (sortState (document), [ 'none', 'none', 'none' ]);
        const first = rowsOf (document)[0];
        assert.equal (first.cells[0].tagName, 'TH', 'the header column is the row header');
        assert.equal (first.cells[0].scope, 'row');
        assert.equal (first.cells[1].className, 'c-size');
        assert.equal (first.getAttribute ('data-key'), 'delta');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('table: a numeric column sorts largest first, then smallest first, then back to the payload order', { 'skip': DOM_SKIP }, async () => {
    const { host } = await openGrid ();
    try {
        const document = host.document;
        const size = headerButton (document, 'Size');
        assert.deepEqual (firstColumn (document), [ 'delta', 'alpha', 'charlie', 'bravo', 'echo' ]);
        size.click ();
        assert.deepEqual (firstColumn (document), [ 'charlie', 'delta', 'bravo', 'alpha', 'echo' ]);
        assert.deepEqual (sortState (document), [ 'none', 'descending↓', 'none' ]);
        size.click ();
        assert.deepEqual (firstColumn (document), [ 'bravo', 'delta', 'charlie', 'alpha', 'echo' ]);
        assert.deepEqual (sortState (document), [ 'none', 'ascending↑', 'none' ]);
        size.click ();
        assert.deepEqual (firstColumn (document), [ 'delta', 'alpha', 'charlie', 'bravo', 'echo' ]);
        assert.deepEqual (sortState (document), [ 'none', 'none', 'none' ]);
    } finally {
        await host.close ();
    }
});

test ('table: rows without the value stay last in both directions, in payload order', { 'skip': DOM_SKIP }, async () => {
    const { host } = await openGrid ();
    try {
        const document = host.document;
        const size = headerButton (document, 'Size');
        size.click ();
        assert.deepEqual (firstColumn (document).slice (-2), [ 'alpha', 'echo' ]);
        size.click ();
        assert.deepEqual (firstColumn (document).slice (-2), [ 'alpha', 'echo' ], 'ascending does not bring the missing values to the top');
        // equal values keep the order the server sent
        const price = headerButton (document, 'Price');
        price.click ();
        assert.deepEqual (firstColumn (document), [ 'delta', 'alpha', 'bravo', 'echo', 'charlie' ]);
        price.click ();
        assert.deepEqual (firstColumn (document), [ 'bravo', 'echo', 'delta', 'alpha', 'charlie' ]);
    } finally {
        await host.close ();
    }
});

test ('table: a text column sorts A to Z first, and switching column starts that column\'s own order', { 'skip': DOM_SKIP }, async () => {
    const { host } = await openGrid ();
    try {
        const document = host.document;
        const name = headerButton (document, 'Name');
        name.click ();
        assert.deepEqual (firstColumn (document), [ 'alpha', 'bravo', 'charlie', 'delta', 'echo' ]);
        assert.deepEqual (sortState (document), [ 'ascending↑', 'none', 'none' ]);
        name.click ();
        assert.deepEqual (firstColumn (document), [ 'echo', 'delta', 'charlie', 'bravo', 'alpha' ]);
        headerButton (document, 'Size').click ();
        assert.deepEqual (sortState (document), [ 'none', 'descending↓', 'none' ]);
        assert.deepEqual (firstColumn (document)[0], 'charlie');
    } finally {
        await host.close ();
    }
});

test ('table: one tab stop; arrows, Home and End move the focus between rows and stop at the ends', { 'skip': DOM_SKIP }, async () => {
    const { host } = await openGrid ();
    try {
        const { document, window } = host;
        assert.deepEqual (tabStops (document), [ 0, -1, -1, -1, -1 ], 'the first row is the table\'s one tab stop');
        const rows = rowsOf (document);
        rows[0].focus ();
        const moved = (key: string) => {
            const event = press (window, document.activeElement, key);
            return [ rowsOf (document).indexOf (document.activeElement), event.defaultPrevented ];
        };
        assert.deepEqual (moved ('ArrowDown'), [ 1, true ]);
        assert.deepEqual (tabStops (document), [ -1, 0, -1, -1, -1 ], 'the tab stop follows the focus');
        assert.deepEqual (moved ('ArrowDown'), [ 2, true ]);
        assert.deepEqual (moved ('End'), [ 4, true ]);
        assert.deepEqual (moved ('ArrowDown'), [ 4, true ], 'no wrap-around at the bottom');
        assert.deepEqual (moved ('ArrowUp'), [ 3, true ]);
        assert.deepEqual (moved ('Home'), [ 0, true ]);
        assert.deepEqual (moved ('ArrowUp'), [ 0, true ], 'nor at the top');
        assert.deepEqual (tabStops (document), [ 0, -1, -1, -1, -1 ]);
        // a key the table has no use for is left to the browser
        assert.deepEqual (moved ('PageDown'), [ 0, false ]);
        assert.deepEqual (moved ('a'), [ 0, false ]);
    } finally {
        await host.close ();
    }
});

test ('table: the focused (or pointed-at) row is the active one, and losing focus clears it', { 'skip': DOM_SKIP }, async () => {
    const { host, grid, active } = await openGrid ();
    try {
        const { document, window } = host;
        const rows = rowsOf (document);
        const activeRows = () => rowsOf (document).filter ((row: any) => row.classList.contains ('active')).map ((row: any) => row.getAttribute ('data-key'));
        assert.deepEqual ([ ...active ], [ -1 ], 'a new table starts with no active row');
        rows[2].focus ();
        assert.deepEqual (activeRows (), [ 'charlie' ]);
        assert.equal (grid.active (), 2);
        press (window, rows[2], 'ArrowDown');
        assert.deepEqual (activeRows (), [ 'bravo' ]);
        rows[1].dispatchEvent (new window.Event ('pointerover', { 'bubbles': true }));
        assert.deepEqual (activeRows (), [ 'alpha' ], 'the pointer takes the active row');
        // when the pointer leaves, the row that has the keyboard focus is the active one again
        document.querySelector ('tbody').dispatchEvent (new window.Event ('pointerleave'));
        assert.deepEqual (activeRows (), [ 'bravo' ]);
        document.activeElement.blur ();
        assert.deepEqual (activeRows (), []);
        assert.equal (grid.active (), -1);
        assert.equal (active.at (-1), -1);
        assert.ok (active.includes ('charlie') && active.includes ('bravo') && active.includes ('alpha'));
    } finally {
        await host.close ();
    }
});

test ('table: a rebuild keeps the focus on the same row (by key), wherever that row now is', { 'skip': DOM_SKIP }, async () => {
    const { host, grid, setRows } = await openGrid ();
    try {
        const document = host.document;
        const board = document.getElementById ('board');
        headerButton (document, 'Size').click ();
        rowsOf (document)[1].focus ();
        assert.equal (document.activeElement.getAttribute ('data-key'), 'delta');
        // what a Refresh or a locale change does: remember, empty the board, build again
        const rebuild = (rows: Record<string, any>[]) => {
            const kept = grid.place ();
            setRows (rows);
            board.textContent = '';
            grid.clear ();
            assert.equal (grid.built (), false);
            grid.build ();
            grid.restore (kept);
        };
        const before = document.activeElement;
        // newer data: delta is now the largest, and a row was added in front
        rebuild ([ { 'name': 'zulu', 'size': 2 }, ...ROWS.map ((row) => ((row.name === 'delta') ? { ...row, 'size': 99 } : row)) ]);
        const focused = document.activeElement;
        assert.ok (focused !== before, 'the row is a new node');
        assert.equal (focused.getAttribute ('data-key'), 'delta');
        assert.deepEqual (firstColumn (document)[0], 'delta', 'the sort order survived the rebuild and delta moved to the top');
        assert.ok (focused.classList.contains ('active'), 'focus makes it the active row again');
        assert.deepEqual (tabStops (document), [ 0, -1, -1, -1, -1, -1 ], 'and the one tab stop is on it');
        assert.deepEqual (sortState (document), [ 'none', 'descending↓', 'none' ]);
        // the focused row is gone from the new data: focus is not handed to an unrelated row
        rebuild (ROWS.filter ((row) => row.name !== 'delta'));
        assert.equal (rowsOf (document).includes (document.activeElement), false);
        assert.deepEqual (tabStops (document), [ 0, -1, -1, -1 ]);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('table: a rebuild keeps the focus on a sort button and the pointed-at row active', { 'skip': DOM_SKIP }, async () => {
    const { host, grid } = await openGrid ();
    try {
        const { document, window } = host;
        const board = document.getElementById ('board');
        const rebuild = () => {
            const kept = grid.place ();
            board.textContent = '';
            grid.clear ();
            grid.build ();
            grid.restore (kept);
        };
        const price = headerButton (document, 'Price');
        price.focus ();
        rowsOf (document)[3].dispatchEvent (new window.Event ('pointerover', { 'bubbles': true }));
        rebuild ();
        assert.ok (document.activeElement !== price);
        assert.ok (document.activeElement === headerButton (document, 'Price'), 'the same column\'s new button has the focus');
        assert.deepEqual (rowsOf (document).filter ((row: any) => row.classList.contains ('active')).map ((row: any) => row.getAttribute ('data-key')), [ 'bravo' ]);
    } finally {
        await host.close ();
    }
});

test ('table: loader — the payload gate, Refresh with the original arguments, busy and error states', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (PAGE);
    try {
        const { document, window } = host;
        const nodes = { 'status': document.getElementById ('status'), 'board': document.getElementById ('board'), 'refresh': document.getElementById ('refresh') };
        const applied: any[] = [];
        let renders = 0;
        const source = window.ccxtTable.loader ({
            'name': 'things',
            'tool': 'show_things',
            'noun': 'things',
            nodes,
            'usable': (payload: any) => !!payload && payload.view === 'things' && Array.isArray (payload.things),
            'apply': (payload: any) => { applied.push (payload); source.setStatus (''); },
            'render': () => { renders++; },
            'fallbackArgs': () => ({ 'account': source.data.account, 'symbol': source.data.symbol }),
        });
        source.start ();
        assert.equal (host.requests ('ui/initialize')[0].params.appInfo.name, 'ccxt-things');
        await host.initialize ();
        assert.equal (nodes.refresh.hidden, true, 'no Refresh before there is data to refresh');
        // the handshake brought a locale: the view is asked to draw (it has nothing to draw yet)
        assert.equal (renders, 1);
        // not this view's payload, with nothing on screen: say so
        await host.notify ('ui/notifications/tool-result', { 'content': [], 'structuredContent': { 'view': 'other', 'things': [] } });
        assert.equal (nodes.status.textContent, 'Could not load: the host sent data this view cannot display.');
        assert.equal (nodes.status.className, 'status error');
        assert.equal (applied.length, 0);
        // no tool-input was sent: a reload falls back to what the payload says, minus what it lacks
        await host.notify ('ui/notifications/tool-result', { 'content': [], 'structuredContent': { 'view': 'things', 'things': [], 'account': 'main' } });
        assert.equal (applied.length, 1);
        assert.equal (renders, 2);
        assert.equal (nodes.status.textContent, '');
        source.reload ();
        await host.settle ();
        assert.deepEqual (host.requests ('tools/call')[0].params, { 'name': 'show_things', 'arguments': { 'account': 'main' } }, 'an undefined argument is left out');
        assert.equal (source.busy, true);
        assert.equal (nodes.refresh.disabled, true);
        assert.ok (nodes.board.classList.contains ('busy'));
        // an unusable payload while data IS on screen changes nothing (the reload reports it)
        await host.respond (host.requests ('tools/call')[0], { 'content': [], 'structuredContent': { 'view': 'things' } });
        assert.equal (nodes.status.textContent, 'Could not load: the host returned no things.');
        assert.equal (source.busy, false);
        assert.equal (applied.length, 1);
        // with the original arguments known, those are what a reload sends
        await host.notify ('ui/notifications/tool-input', { 'arguments': { 'account': 'other', 'limit': 5 } });
        nodes.refresh.click ();
        await host.settle ();
        assert.deepEqual (host.requests ('tools/call')[1].params.arguments, { 'account': 'other', 'limit': 5 });
        await host.respond (host.requests ('tools/call')[1], { 'content': [], 'structuredContent': { 'view': 'things', 'things': [ 1 ] } });
        assert.equal (applied.length, 2);
        assert.equal (renders, 3);
        assert.equal (nodes.refresh.disabled, false);
        // a new locale re-renders what is there, without asking for it again
        await host.notify ('ui/notifications/host-context-changed', { 'locale': 'fr-FR' });
        assert.equal (renders, 4);
        assert.equal (host.requests ('tools/call').length, 2);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge formatters never print a negative zero, and labelled () writes text only', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (PAGE, { 'embedded': false });
    try {
        // the bridge's own formatters, which every view calls
        const app = host.window.ccxtApp;
        for (const value of [ -0, -0.001, -1e-12 ]) {
            assert.equal (app.compact (-0), '0');
            assert.doesNotMatch (app.compact (value), /^[-−]0(\.0*)?$/, 'compact (' + value + ') printed ' + app.compact (value));
            assert.doesNotMatch (app.price (value, 2), /^[-−]0(\.0*)?$/, 'price (' + value + ', 2) printed ' + app.price (value, 2));
        }
        assert.equal (app.price (-0), '0');
        assert.equal (app.price (-0.004, 2), '0.00');
        assert.equal (app.price (-0.006, 2), '-0.01', 'a value that does not round to zero keeps its sign');
        assert.equal (app.compact (-1234), '-1.23K');
        for (const value of [ undefined, null, NaN, Infinity, -Infinity, '12', {}, true ]) {
            for (const name of [ 'compact', 'price', 'percent' ]) {
                const text = app[name] (value);
                assert.doesNotMatch (text, /NaN|undefined|Infinity|null/, name + ' (' + String (value) + ') printed ' + text);
            }
        }
        // labelled: the value is text, whatever it contains
        const parent = host.document.createElement ('div');
        const item = host.window.ccxtTable.labelled (parent, 'Fee', '<img src=x onerror=alert(1)>');
        assert.ok (parent.firstChild === item);
        assert.equal (item.textContent, 'Fee <img src=x onerror=alert(1)>');
        assert.ok (parent.querySelector ('img') === null);
        assert.equal (host.window.ccxtTable.labelled (parent, 'Bid', '1', 'dt').tagName, 'DT');
        // only what the price board uses is exported
        assert.deepEqual (Object.keys (host.window.ccxtTable).sort (), [ 'grid', 'labelled', 'loader' ]);
    } finally {
        await host.close ();
    }
});
