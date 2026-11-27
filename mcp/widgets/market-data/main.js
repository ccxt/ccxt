const TITLES = {
  get_ohlcv: 'Candlesticks',
  get_trades: 'Recent trades',
  get_tickers: 'Tickers',
  get_orderbook: 'Order book',
  get_funding_rates: 'Funding rates',
  search_markets: 'Markets',
  list_exchanges: 'Exchanges',
};
const DEFAULT_TITLE = 'CCXT market data';
const resultRoot = document.querySelector('#result');
let disposeChart = () => {};

function parseEnvelope(result) {
  if (result.structuredContent) return result.structuredContent;
  const text = result.content?.find((item) => item.type === 'text')?.text;
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { message: text } };
  }
}

function isOhlcv(meta) {
  return meta?.columns?.[0] === 'timestamp' && meta?.columns?.[5] === 'volume';
}

function isOrderBook(data) {
  return Array.isArray(data?.bids) && Array.isArray(data?.asks);
}

function toolOf(result, data, meta) {
  if (result._meta?.marketWidget) return result._meta.marketWidget;
  if (isOhlcv(meta)) return 'get_ohlcv';
  return isOrderBook(data) ? 'get_orderbook' : undefined;
}

function validCandles(data) {
  const isCandle = (row) => Array.isArray(row) && row.length >= 5 &&
    row.slice(0, 5).every(Number.isFinite) && Math.abs(row[0]) <= 8.64e15;
  return (Array.isArray(data) ? data : []).filter(isCandle).sort(([left], [right]) => left - right);
}

function scalarFields(record) {
  const isScalar = (value) => ['string', 'number', 'boolean'].includes(typeof value);
  return Object.fromEntries(Object.entries(record).filter(([, value]) => isScalar(value)));
}

function tableRows(data) {
  const isRecord = (row) => row && typeof row === 'object' && !Array.isArray(row);
  return data.filter(isRecord).map((row) => scalarFields({
    ...row,
    datetime: row.datetime ?? row.timestamp,
    fundingDatetime: row.fundingDatetime ?? row.fundingTimestamp,
    nextFundingDatetime: row.nextFundingDatetime ?? row.nextFundingTimestamp,
  }));
}

function showHeading(tool, data, meta) {
  const market = document.querySelector('#market');
  market.textContent = Format.joinPresent([meta?.exchange, meta?.symbol ?? data?.symbol, meta?.timeframe], ' · ');
  market.hidden = !market.textContent;
  document.querySelector('#title').textContent = Object.hasOwn(TITLES, tool) ? TITLES[tool] : DEFAULT_TITLE;
}

function showCount(count, unit) {
  document.querySelector('#count').textContent = count === undefined ? '' : MarketDisplay.number.format(count) + ' ' + unit;
}

function showNotice(text) {
  const notice = Dom.element('p', text);
  notice.className = 'status';
  resultRoot.append(notice);
}

function render(result) {
  disposeChart();
  disposeChart = () => {};
  resultRoot.replaceChildren();
  const { ok, data, meta, error } = parseEnvelope(result);
  const tool = toolOf(result, data, meta);
  showHeading(tool, data, meta);
  showCount();
  if (result.isError || ok !== true) {
    resultRoot.append(Dom.element('p', error?.message || 'No market data was returned.'));
    return;
  }
  if (tool === 'get_ohlcv') {
    const candles = validCandles(data);
    showCount(candles.length, 'candles');
    if (candles.length) disposeChart = drawChart(resultRoot, candles);
  } else if (isOrderBook(data)) {
    showCount(drawOrderBook(resultRoot, data), 'levels');
  } else if (Array.isArray(data)) {
    const rows = tableRows(data);
    showCount(rows.length, 'records');
    if (rows.length) drawTable(resultRoot, rows, tool, meta?.symbol);
  } else if (!meta?.truncated && data != null) {
    resultRoot.append(Dom.element('pre', JSON.stringify(data, null, 2)));
  }
  if (!resultRoot.firstChild && !meta?.truncated) resultRoot.append(Dom.element('p', 'No records matched this request.'));
  if (meta?.notice && (tool !== 'get_ohlcv' || meta.truncated)) showNotice(meta.notice);
}

HostBridge.connect({
  appInfo: { name: DEFAULT_TITLE, version: '1.0.0' },
  onToolResult: render,
  onTeardown: () => disposeChart(),
});
