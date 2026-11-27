const MarketDisplay = (() => {
  const number = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 10 });
  const price = new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const rate = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 6, signDisplay: 'exceptZero' });
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' });
  const tableTime = new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const tradeTime = new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, hourCycle: 'h23',
  });
  const decimalRateKeys = new Set(['fundingRate', 'nextFundingRate', 'maker', 'taker']);
  const dateKeys = new Set(['datetime', 'fundingDatetime', 'nextFundingDatetime', 'expiry']);

  function valueText(value) {
    return typeof value === 'number' ? number.format(value) : String(value ?? '—');
  }

  function booleanText(value, key) {
    if (key === 'active') return value ? 'Active' : 'Inactive';
    return value ? 'Yes' : 'No';
  }

  function tableValue(value, key, tool) {
    if (value == null) return '—';
    if (typeof value === 'number' && key === 'percentage') return rate.format(value / 100);
    if (typeof value === 'number' && decimalRateKeys.has(key)) return rate.format(value);
    if (dateKeys.has(key)) {
      const timestamp = typeof value === 'number' ? value : Date.parse(value);
      if (Number.isFinite(timestamp)) return (tool === 'get_trades' ? tradeTime : tableTime).format(timestamp);
    }
    if (typeof value === 'boolean') return booleanText(value, key);
    if (key === 'side') return String(value).replace(/^./, (letter) => letter.toUpperCase());
    return valueText(value);
  }

  function watermark() {
    return document.querySelector('#ccxt-watermark').content.cloneNode(true);
  }

  return { number, price, rate, date, tableTime, dateKeys, valueText, tableValue, watermark };
})();
