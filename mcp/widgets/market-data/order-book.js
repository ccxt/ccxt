function drawOrderBook(container, book) {
  const depthNumber = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 15 });
  const validLevels = (levels, direction) => levels
    .filter((level) => Array.isArray(level) && Number.isFinite(level[0]) && Number.isFinite(level[1]) && level[1] > 0)
    .sort(([a], [b]) => direction * (a - b));
  const asks = validLevels(book.asks, 1);
  const bids = validLevels(book.bids, -1);
  if (!asks.length && !bids.length) return 0;
  const [base, quote] = Format.splitSymbol(book.symbol);
  const sizeUnit = book.symbol?.includes(':') ? '' : base;
  const column = (label, unit) => unit ? label + ' (' + unit + ')' : label;
  const frame = Dom.element('div');
  frame.className = 'order-book-frame';
  const scroller = Dom.element('div');
  scroller.className = 'order-book-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Order book depth');
  const table = Dom.element('table');
  table.className = 'order-book';
  const caption = table.createCaption();
  caption.className = 'visually-hidden';
  caption.textContent = 'Order book depth. Asks above the spread, bids below.';
  const headings = table.createTHead().insertRow();
  for (const label of [column('Price', quote), column('Size', sizeUnit), column('Total', sizeUnit)]) {
    const heading = Dom.element('th', label);
    heading.scope = 'col';
    headings.append(heading);
  }
  const totalSize = (levels) => levels.reduce((total, [, size]) => total + size, 0);
  const maxDepth = Math.max(totalSize(asks), totalSize(bids));
  function appendSide(levels, side) {
    const body = table.createTBody();
    body.className = side;
    body.setAttribute('aria-label', side === 'asks' ? 'Asks' : 'Bids');
    let total = 0;
    const rows = levels.map(([price, size]) => {
      total += size;
      const row = Dom.element('tr');
      row.className = 'depth-level';
      row.style.setProperty('--depth', (100 * total / maxDepth) + '%');
      row.append(...[price, size, total].map((value) => Dom.element('td', depthNumber.format(value))));
      return row;
    });
    if (side === 'asks') rows.reverse();
    body.append(...rows);
  }
  appendSide(asks, 'asks');
  const spread = table.createTBody().insertRow();
  spread.className = 'book-spread';
  const label = Dom.element('th', 'Spread');
  label.scope = 'row';
  spread.append(label);
  const bestAsk = asks[0]?.[0];
  const bestBid = bids[0]?.[0];
  const gap = bestAsk != null && bestBid != null ? bestAsk - bestBid : null;
  const decimalPlaces = (value) => {
    const [coefficient, exponent = 0] = String(value).split('e');
    return Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent));
  };
  const gapText = gap == null ? '—' : new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.min(20, Math.max(decimalPlaces(bestAsk), decimalPlaces(bestBid))),
  }).format(gap);
  const percent = gap != null && bestAsk > 0 ? MarketDisplay.rate.format(gap / bestAsk).replace(/^\+/, '') : '—';
  spread.append(Dom.element('td', gapText), Dom.element('td', percent));
  appendSide(bids, 'bids');
  scroller.append(table);
  frame.append(MarketDisplay.watermark(), scroller);
  container.append(frame);
  scroller.scrollTop = spread.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    - (scroller.clientHeight - spread.offsetHeight) / 2;
  return asks.length + bids.length;
}
