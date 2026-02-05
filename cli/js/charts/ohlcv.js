import ololog from 'ololog';
import open from 'open';
import ansi from 'ansicolor';
import ora from 'ora';
import { saveChart } from '../cache.js';
import { loadSettingsAndCreateExchange, parseMethodArgs } from '../helpers.js';
const log = ololog.configure({ 'locate': false }).unlimited;
ansi.nice;
async function plotOHLCVChart(exchangeId, symbol, timeframe, args) {
    const spinner = ora('Fetching OHLCV data...').start();
    const exchange = await loadSettingsAndCreateExchange(exchangeId, {}); // pass cli options
    args = parseMethodArgs(exchange, args, 'fetchOHLCV', {}, false);
    const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, ...args);
    const candles = ohlcv.map(([time, open, high, low, close, volume]) => ({
        'time': Math.floor(time / 1000),
        open,
        high,
        low,
        close,
        volume,
    }));
    const html = generateHTML(candles, symbol, timeframe, exchange.id);
    spinner.succeed('Data loaded!');
    const safeSymbol = symbol.replace('/', '');
    const name = `${exchangeId}-${safeSymbol}-${timeframe}.html`;
    const filePath = saveChart(name, html);
    log.green('Chart created successfully, will be opened automatically in the browser');
    log.green(filePath);
    await open(filePath);
}
function generateHTML(data, symbol, timeframe, exchangeId = 'exchange') {
    const candleData = data.map((d) => ({
        'time': d.time,
        'open': d.open,
        'high': d.high,
        'low': d.low,
        'close': d.close,
    }));
    const volumeData = data.map((d) => ({
        'time': d.time,
        'value': d.volume,
        'color': 'rgba(128, 128, 128, 0.4)', // uniform transparent gray
    }));
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${symbol} OHLCV (${timeframe})</title>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #131722; font-family: sans-serif; }
    #container { position: relative; height: 100%; width: 100%; }
    #chart { position: absolute; top: 20px; bottom: 0; left: 0; right: 0; }
    #label {
      position: absolute;
      top: 0;
      left: 10px;
      padding: 2px 8px;
      background: #262b40;
      color: #fff;
      font-size: 13px;
      border-bottom-right-radius: 6px;
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="label">${exchangeId.toUpperCase()} – ${symbol} (${timeframe})</div>
    <div id="chart"></div>
  </div>
  <script src="https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js"></script>
  <script>
    const chart = LightweightCharts.createChart(document.getElementById('chart'), {
      layout: {
        background: { color: '#131722' },
        textColor: '#D1D4DC',
      },
      leftPriceScale: { visible: true, borderColor: '#485c7b' },
      rightPriceScale: { visible: false },
      grid: {
        vertLines: { color: '#363C4E' },
        horzLines: { color: '#363C4E' },
      },
      crosshair: { mode: 0 },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: false
      }
    });

    const candleSeries = chart.addCandlestickSeries({
      priceScaleId: 'left',
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    });

    candleSeries.setData(${JSON.stringify(candleData)});

    const volumeSeries = chart.addHistogramSeries({
      priceScaleId: '',  // use default independent scale
      priceFormat: { type: 'volume' }
    });

    volumeSeries.setData(${JSON.stringify(volumeData)});
  </script>
</body>
</html>`;
}
export { plotOHLCVChart, };
//# sourceMappingURL=ohlcv.js.map