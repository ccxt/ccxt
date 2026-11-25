// Shared table machinery for the ccxt-mcp price board (tickers.html): a sortable list of
// rows. Inlined after bridge.js by the same include mechanism (ts/ui.ts); it needs
// window.ccxtApp and nothing else.
//
// window.ccxtTable — three pieces:
//
//   labelled (parent, label, value[, tag])
//                 appends "label <b>value</b>" (a readout or stats entry) and returns it
//
//   loader (options) -> { data, args, busy, setStatus, accept, reload, start }
//                 the life of a view around its data: the payload gate, the status line, the
//                 Refresh button (same arguments as the original call, board dimmed and the
//                 button disabled meanwhile) and the connection to the host.
//       options   name       view name, as in payload.view ('tickers')
//                 tool       the tool Refresh calls again ('show_tickers')
//                 noun       what a reload that returns none is missing ('prices')
//                 nodes      { status, board, refresh }
//                 usable     function (payload) -> boolean
//                 apply      function (payload): take the payload over (rows, status line)
//                 render     function (): draw what apply () took over
//                 fallbackArgs  function () -> arguments for a reload when the host never
//                               sent the original ones
//                 defer      function (retry) -> true when the reload must wait (a live
//                            poll is in flight) and retry () will be called, optional
//                 connected  function (): the host handshake is done, optional
//
//   grid (options) -> { build, update, clear, built, place, restore, setActive, active, sort }
//                 the table itself: column headers that sort (a row without the value always
//                 last; third press restores the original order), one tab stop with arrow /
//                 Home / End movement between rows, the active (pointed at or focused) row,
//                 and keeping focus, active row and scroll position across a rebuild.
//                 update () refills the rows in place (same keys: false otherwise, and the
//                 caller rebuilds), re-sorting them only when the order changed.
//       options   board      the element the table is built into
//                 columns    [ { key, label, hint, fill (cell, row) [, short, unit (),
//                            className, text, left, header ] } ] — `text` sorts A→Z first and
//                            left-aligns, `left` only left-aligns, `header` makes the cell
//                            the row header, `short` is the label when there is no room
//                 rows       function () -> the normalized rows; each has a numeric `index`
//                            (its position in the payload) and a string `key`
//                 caption    function () -> the sentence that opens the table's caption
//                 beforeRows function (rows), optional: called before the rows are filled
//                 onActive   function (index, row), optional: the active row changed
//                            (index -1 and no row: none is active)
(function () {
    'use strict';
    var app = window.ccxtApp;

    // "label <b>value</b>" — textContent only, so a payload value can never become markup
    function labelled (parent, label, value, tag) {
        var item = app.element (tag || 'span', '', label + ' ');
        item.appendChild (app.element ('b', '', value));
        parent.appendChild (item);
        return item;
    }

    // ---- loader ---------------------------------------------------------------------

    function loader (options) {
        var nodes = options.nodes;
        var self = { data: null, args: null, busy: false };

        self.setStatus = function (message, isError) {
            nodes.status.textContent = message || '';
            nodes.status.className = 'status' + (isError ? ' error' : '');
        };

        self.accept = function (payload) {
            if (!options.usable (payload)) {
                if (!self.data) {
                    // nothing on screen yet: say so instead of waiting forever
                    self.setStatus ('Could not load: the host sent data this view cannot display.', true);
                }
                return;
            }
            self.data = payload;
            options.apply (payload);
            options.render ();
        };

        self.reload = function () {
            if (self.busy || !self.data || (options.defer && options.defer (self.reload))) {
                return;
            }
            var request = {};
            var base = self.args || options.fallbackArgs ();
            Object.keys (base).forEach (function (key) {
                if (base[key] !== undefined) {
                    request[key] = base[key];
                }
            });
            var finish = function () {
                self.busy = false;
                nodes.board.classList.remove ('busy');
                nodes.refresh.disabled = false;
            };
            self.busy = true;
            nodes.board.classList.add ('busy');
            nodes.refresh.disabled = true;
            self.setStatus ('Loading…');
            app.callTool (options.tool, request).then (function (payload) {
                finish ();
                if (!options.usable (payload)) {
                    self.setStatus ('Could not load: the host returned no ' + options.noun + '.', true);
                    return;
                }
                self.accept (payload);
            }, function (error) {
                finish ();
                self.setStatus ('Could not load: ' + ((error && error.message) || 'unknown error'), true);
            });
        };

        self.start = function () {
            nodes.refresh.addEventListener ('click', self.reload);
            app.connect ({
                name: 'ccxt-' + options.name,
                onInput: function (input) { self.args = input; },
                onResult: self.accept,
                onError: function (message) { self.setStatus ('Could not load: ' + message, true); },
                onContext: function () { options.render (); }
            }).then (function () {
                nodes.refresh.hidden = !self.data || !app.canCallTools ();
                if (options.connected) {
                    options.connected ();
                }
            }, function () {
                self.setStatus ('Could not connect to the host.', true);
            });
            // development hook: open the file directly and call window.ccxtView.accept (payload)
            window.ccxtView = { accept: self.accept };
        };

        return self;
    }

    // ---- grid -----------------------------------------------------------------------

    function grid (options) {
        var board = options.board;
        var columns = options.columns;
        var sort = { key: null, direction: 1 };
        var active = -1;
        var activeKey = null;
        var parts = null;

        function leftAligned (column) {
            return column.text || column.left;
        }

        function cellClass (column) {
            return ((column.className || '') + (leftAligned (column) ? ' l' : '')).trim ();
        }

        function setActive (index) {
            var rows = options.rows ();
            active = index;
            activeKey = rows[index] ? rows[index].key : null;
            if (!parts) {
                return;
            }
            Array.prototype.forEach.call (parts.body.rows, function (line) {
                line.classList.toggle ('active', Number (line.getAttribute ('data-index')) === index);
            });
            if (options.onActive) {
                options.onActive (index, (index >= 0) ? rows[index] : undefined);
            }
        }

        function compare (a, b) {
            var left = a[sort.key];
            var right = b[sort.key];
            // a row without the value goes last whichever way the column is sorted
            if (left === undefined || right === undefined) {
                return (left === right) ? (a.index - b.index) : ((left === undefined) ? 1 : -1);
            }
            var order = (typeof left === 'string') ? left.localeCompare (right) : (left - right);
            return (order * sort.direction) || (a.index - b.index);
        }

        function fillLine (line, row) {
            line.textContent = '';
            columns.forEach (function (column) {
                var cell = app.element (column.header ? 'th' : 'td', cellClass (column));
                if (column.header) {
                    cell.scope = 'row';
                }
                column.fill (cell, row);
                line.appendChild (cell);
            });
        }

        // New values for the same rows: the <tr> elements stay (and with them focus, the
        // active row and the tab stop), only their cells are rebuilt
        function update () {
            if (!parts) {
                return false;
            }
            var rows = options.rows ();
            var lines = {};
            var count = 0;
            Array.prototype.forEach.call (parts.body.rows, function (line) {
                lines['$' + line.getAttribute ('data-key')] = line;
                count++;
            });
            var same = count === rows.length && Object.keys (lines).length === count && rows.every (function (row) {
                return lines['$' + row.key] && Number (lines['$' + row.key].getAttribute ('data-index')) === row.index;
            });
            if (!same) {
                return false;
            }
            var ordered = rows.slice ();
            if (sort.key) {
                ordered.sort (compare);
            }
            if (options.beforeRows) {
                options.beforeRows (rows);
            }
            ordered.forEach (function (row) { fillLine (lines['$' + row.key], row); });
            var moved = ordered.some (function (row, position) { return parts.body.rows[position] !== lines['$' + row.key]; });
            if (moved) {
                var kept = place ();
                ordered.forEach (function (row) { parts.body.appendChild (lines['$' + row.key]); });
                restore (kept);
            }
            if (active >= 0 && options.onActive) {
                options.onActive (active, rows[active]);
            }
            return true;
        }

        function fillBody () {
            var body = parts.body;
            var rows = options.rows ();
            var ordered = rows.slice ();
            if (sort.key) {
                ordered.sort (compare);
            }
            if (options.beforeRows) {
                options.beforeRows (rows);
            }
            body.textContent = '';
            ordered.forEach (function (row, position) {
                var line = document.createElement ('tr');
                line.setAttribute ('data-index', row.index);
                line.setAttribute ('data-key', row.key);
                line.tabIndex = (position === 0) ? 0 : -1;
                fillLine (line, row);
                body.appendChild (line);
            });
            parts.heads.forEach (function (entry) {
                var state = (sort.key === entry.column.key) ? ((sort.direction > 0) ? 'ascending' : 'descending') : 'none';
                entry.cell.setAttribute ('aria-sort', state);
                entry.glyph.textContent = (state === 'ascending') ? '↑' : ((state === 'descending') ? '↓' : '');
            });
            setActive (-1);
        }

        function sortBy (column) {
            var natural = column.text ? 1 : -1;
            if (sort.key !== column.key) {
                sort = { key: column.key, direction: natural };
            } else if (sort.direction === natural) {
                sort = { key: column.key, direction: -natural };
            } else {
                // third press: back to the order the server sent
                sort = { key: null, direction: 1 };
            }
            fillBody ();
        }

        function moveFocus (event) {
            var line = event.target;
            var all = parts.body.rows;
            var current = Array.prototype.indexOf.call (all, line);
            var next = { ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: all.length - 1 }[event.key];
            if (current < 0 || next === undefined) {
                return;
            }
            event.preventDefault ();
            next = Math.max (0, Math.min (all.length - 1, next));
            line.tabIndex = -1;
            all[next].tabIndex = 0;
            all[next].focus ();
        }

        function build () {
            var table = document.createElement ('table');
            var caption = app.element ('caption', '', options.caption () + ' Column headers sort the table; arrow keys move between rows.');
            caption.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;';
            table.appendChild (caption);
            var thead = document.createElement ('thead');
            var headRow = document.createElement ('tr');
            var heads = columns.map (function (column) {
                var cell = app.element ('th', cellClass (column));
                cell.scope = 'col';
                var button = document.createElement ('button');
                button.type = 'button';
                button.title = column.hint;
                var glyph = app.element ('span', 'dir');
                glyph.setAttribute ('aria-hidden', 'true');
                var label = app.element ('span', '');
                // "In orders" when there is room, "Used" when there is not
                label.appendChild (app.element ('span', column.short ? 'long' : '', column.label));
                if (column.short) {
                    label.appendChild (app.element ('span', 'short', column.short));
                }
                var unit = column.unit ? column.unit () : '';
                if (unit) {
                    label.appendChild (document.createTextNode (' '));
                    label.appendChild (app.element ('span', 'unit', unit));
                }
                // the arrow sits on the side the column is aligned away from, so labels stay put
                button.appendChild (leftAligned (column) ? label : glyph);
                button.appendChild (leftAligned (column) ? glyph : label);
                button.addEventListener ('click', function () { sortBy (column); });
                cell.appendChild (button);
                headRow.appendChild (cell);
                return { column: column, cell: cell, glyph: glyph };
            });
            thead.appendChild (headRow);
            table.appendChild (thead);
            var body = document.createElement ('tbody');
            var rowOf = function (event) {
                var line = (event.target && event.target.closest) ? event.target.closest ('tr') : null;
                return line ? Number (line.getAttribute ('data-index')) : -1;
            };
            body.addEventListener ('pointerover', function (event) { setActive (rowOf (event)); });
            body.addEventListener ('pointerdown', function (event) { setActive (rowOf (event)); });
            body.addEventListener ('pointerleave', function () { setActive (rowOf ({ target: document.activeElement })); });
            body.addEventListener ('focusin', function (event) { setActive (rowOf (event)); });
            body.addEventListener ('focusout', function () { setActive (-1); });
            body.addEventListener ('keydown', moveFocus);
            table.appendChild (body);
            parts = { body: body, heads: heads };
            board.className = 'board scroll';
            board.appendChild (table);
            fillBody ();
        }

        // Rebuilding the board replaces the focused row or sort button. Remember where the user
        // was (by row key: the rows themselves may be newer ones) so a refresh or a host context
        // update does not throw a keyboard user back to the top of the document.
        function place () {
            var focus = document.activeElement;
            var line = (parts && focus && focus.closest && parts.body.contains (focus)) ? focus.closest ('tr') : null;
            var column = -1;
            (parts ? parts.heads : []).forEach (function (entry, position) {
                if (focus && entry.cell.contains (focus)) {
                    column = position;
                }
            });
            return { focused: line ? line.getAttribute ('data-key') : null, column: column, active: activeKey, scroll: board.scrollTop };
        }

        function restore (kept) {
            if (!parts) {
                return;
            }
            var lineOf = function (key) {
                var found = null;
                Array.prototype.forEach.call (parts.body.rows, function (line) {
                    if (key !== null && !found && line.getAttribute ('data-key') === key) {
                        found = line;
                    }
                });
                return found;
            };
            board.scrollTop = kept.scroll;
            var focused = lineOf (kept.focused);
            var hovered = lineOf (kept.active);
            if (focused) {
                Array.prototype.forEach.call (parts.body.rows, function (line) { line.tabIndex = (line === focused) ? 0 : -1; });
                // focusin makes it the inspected row again
                focused.focus ({ preventScroll: true });
            } else if (kept.column >= 0 && parts.heads[kept.column]) {
                parts.heads[kept.column].cell.querySelector ('button').focus ({ preventScroll: true });
            }
            if (hovered && !focused) {
                setActive (Number (hovered.getAttribute ('data-index')));
            }
        }

        return {
            build: build,
            update: update,
            // the board was emptied: the next build () starts a new table (the sort order stays)
            clear: function () { parts = null; },
            built: function () { return !!parts; },
            place: place,
            restore: restore,
            setActive: setActive,
            active: function () { return active; },
            sort: function () { return { key: sort.key, direction: sort.direction }; }
        };
    }

    window.ccxtTable = {
        labelled: labelled,
        loader: loader,
        grid: grid
    };
}) ();
