const TABLE_COLUMNS = {
  get_trades: [['datetime', 'Time (UTC)'], ['price', 'Price'], ['amount', 'Size'], ['cost', 'Total']],
  get_tickers: [['symbol', 'Market'], ['last', 'Last'], ['percentage', 'Change (24h)'], ['bid', 'Bid'], ['ask', 'Ask'], ['high', 'High'], ['low', 'Low'], ['quoteVolume', 'Quote volume'], ['baseVolume', 'Base volume'], ['datetime', 'Time (UTC)']],
  get_funding_rates: [['symbol', 'Market'], ['fundingRate', 'Funding rate'], ['fundingDatetime', 'Funding time (UTC)'], ['nextFundingRate', 'Next rate'], ['nextFundingDatetime', 'Next funding (UTC)'], ['interval', 'Interval'], ['markPrice', 'Mark price'], ['indexPrice', 'Index price']],
  search_markets: [['symbol', 'Market'], ['type', 'Type'], ['active', 'Status'], ['base', 'Base'], ['quote', 'Quote'], ['settle', 'Settlement'], ['maker', 'Maker fee'], ['taker', 'Taker fee'], ['expiry', 'Expiry (UTC)'], ['strike', 'Strike'], ['optionType', 'Option type'], ['id', 'Exchange ID']],
  list_exchanges: [['id', 'Exchange ID'], ['name', 'Exchange'], ['certified', 'Certified'], ['ws', 'WebSocket'], ['prediction', 'Prediction']],
};
const TABLE_PAGE_SIZE = 25;

function drawTable(container, rows, tool, symbol) {
  const isTradeTape = tool === 'get_trades';
  const [base, quote] = Format.splitSymbol(symbol ?? rows[0].symbol);
  const units = { price: quote, amount: base, cost: quote };
  const keysPresent = [...new Set(rows.flatMap(Object.keys))];
  const columns = (TABLE_COLUMNS[tool] ?? keysPresent.map((key) => [key, key]))
    .filter(([key]) => keysPresent.includes(key))
    .map(([key, label]) => [key, isTradeTape && units[key] ? label + ' (' + units[key] + ')' : label]);
  const keys = columns.map(([key]) => key);
  const numeric = new Set(keys.filter((key) => !MarketDisplay.dateKeys.has(key) && rows.some((row) => typeof row[key] === 'number')));
  const search = Dom.element('input');
  search.type = 'search';
  search.placeholder = isTradeTape ? 'Search trades' : 'Search records';
  search.setAttribute('aria-label', search.placeholder);
  const scroller = Dom.element('div');
  scroller.className = 'scroller';
  const table = Dom.element('table');
  if (isTradeTape) {
    table.className = 'trade-tape';
    scroller.tabIndex = 0;
    scroller.setAttribute('role', 'region');
    scroller.setAttribute('aria-label', 'Recent trades');
  }
  const headings = table.createTHead().insertRow();
  const body = table.createTBody();
  const controls = Dom.element('div');
  controls.className = 'controls';
  const previous = Dom.element('button', 'Previous');
  const next = Dom.element('button', 'Next');
  const status = Dom.element('span');
  status.className = 'status';
  status.setAttribute('role', 'status');
  controls.append(previous, next, status);
  scroller.append(table);
  container.append(search);
  if (isTradeTape) {
    const frame = Dom.element('div');
    frame.className = 'trade-table-frame';
    frame.append(MarketDisplay.watermark(), scroller);
    container.append(frame);
  } else {
    container.append(scroller);
  }
  container.append(controls);
  let page = 0;
  let sortBy = tool === 'get_trades' && keys.includes('datetime') ? 'datetime' : undefined;
  let direction = sortBy ? -1 : 1;
  const headers = columns.map(([key, label]) => {
    const header = Dom.element('th');
    header.scope = 'col';
    if (numeric.has(key)) header.className = 'numeric';
    const button = Dom.element('button', label);
    button.onclick = () => {
      direction = sortBy === key ? -direction : 1;
      sortBy = key;
      page = 0;
      update();
    };
    header.append(button);
    headings.append(header);
    return header;
  });
  function update() {
    const query = search.value.trim().toLowerCase();
    const searchKeys = isTradeTape ? [...keys, 'side', 'id'] : keys;
    const filtered = rows.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(query) ||
      MarketDisplay.tableValue(row[key], key, tool).toLowerCase().includes(query)));
    if (sortBy) filtered.sort((left, right) => {
      let a = left[sortBy];
      let b = right[sortBy];
      if (MarketDisplay.dateKeys.has(sortBy)) {
        a = typeof a === 'number' ? a : (Date.parse(a) || null);
        b = typeof b === 'number' ? b : (Date.parse(b) || null);
      }
      if (a == null || b == null) return (a == null) - (b == null);
      return direction * (typeof a === 'number' && typeof b === 'number'
        ? a - b : String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true }));
    });
    headers.forEach((header, index) => {
      const active = keys[index] === sortBy;
      header.setAttribute('aria-sort', active ? (direction === 1 ? 'ascending' : 'descending') : 'none');
      header.firstChild.textContent = columns[index][1] + (active ? (direction === 1 ? ' ↑' : ' ↓') : '');
    });
    body.replaceChildren();
    scroller.scrollTop = 0;
    const offset = page * TABLE_PAGE_SIZE;
    for (const row of filtered.slice(offset, offset + TABLE_PAGE_SIZE)) {
      const tr = body.insertRow();
      for (const key of keys) {
        const cell = tr.insertCell();
        const value = row[key];
        cell.textContent = MarketDisplay.tableValue(value, key, tool);
        if (numeric.has(key)) cell.className = 'numeric';
        if (key === 'side') cell.dataset.side = value;
        if (isTradeTape && key === 'price' && ['buy', 'sell'].includes(row.side)) {
          cell.dataset.side = row.side;
          const side = Dom.element('span', row.side === 'buy' ? 'Buy ' : 'Sell ');
          side.className = 'visually-hidden';
          cell.prepend(side);
        }
        if (isTradeTape && key === 'datetime' && value != null) {
          cell.className = 'trade-time';
          const timestamp = typeof value === 'number' ? value : Date.parse(value);
          if (Number.isFinite(timestamp)) cell.title = MarketDisplay.tableTime.format(timestamp) + ' UTC';
        }
        if (key === 'percentage' || key === 'fundingRate' || key === 'nextFundingRate') {
          if (value > 0) cell.classList.add('positive');
          if (value < 0) cell.classList.add('negative');
        }
      }
    }
    previous.disabled = page === 0;
    next.disabled = offset + TABLE_PAGE_SIZE >= filtered.length;
    status.textContent = filtered.length
      ? (offset + 1) + '–' + Math.min(offset + TABLE_PAGE_SIZE, filtered.length) + ' of ' + filtered.length
      : 'No matching records';
  }
  search.oninput = () => { page = 0; update(); };
  previous.onclick = () => { page--; update(); };
  next.onclick = () => { page++; update(); };
  update();
}
