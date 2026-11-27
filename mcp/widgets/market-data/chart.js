function drawChart(container, candles) {
  const frame = Dom.element('div');
  frame.className = 'chart-frame';
  const viewport = Dom.element('div');
  viewport.className = 'chart-scroll';
  const track = Dom.element('div');
  track.className = 'chart-track';
  const plot = Dom.element('canvas');
  plot.tabIndex = 0;
  plot.setAttribute('aria-label', 'Candlestick price and volume chart. Scroll horizontally for older candles, or use the left and right arrow keys to inspect candles.');
  const axis = Dom.element('canvas');
  axis.className = 'chart-axis';
  axis.setAttribute('aria-hidden', 'true');
  const details = Dom.element('output');
  details.setAttribute('aria-live', 'polite');
  track.append(plot);
  viewport.append(track);
  frame.append(MarketDisplay.watermark(), viewport, axis);
  container.append(frame, details);

  const height = 410;
  const priceTop = 24;
  const priceBottom = 301;
  const volumeTop = 330;
  const volumeBottom = 381;
  const scale = window.devicePixelRatio || 1;
  const interval = (candles.at(-1)[0] - candles[0][0]) / Math.max(1, candles.length - 1);
  const tickFormat = interval >= 86400000
    ? { month: 'short', day: 'numeric' }
    : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  const time = new Intl.DateTimeFormat(undefined, { ...tickFormat, timeZone: 'UTC' });
  const colors = {};
  let selected = -1;
  let offset = 0;
  let spacing = 0;
  let width = 0;
  let frameId = 0;
  let mounted = false;

  function themeColors() {
    const probe = Dom.element('span');
    probe.hidden = true;
    frame.append(probe);
    for (const name of ['up', 'down', 'muted', 'grid', 'volume']) {
      probe.style.color = 'var(--' + name + ')';
      colors[name] = getComputedStyle(probe).color;
    }
    probe.remove();
  }

  function context(canvas, cssWidth) {
    const pixelWidth = Math.round(cssWidth * scale);
    const pixelHeight = Math.round(height * scale);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, cssWidth, height);
    ctx.font = '12px ' + getComputedStyle(frame).fontFamily;
    ctx.fillStyle = colors.muted;
    return ctx;
  }

  function gridLine(ctx, x1, y1, x2, y2, color = colors.grid) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function draw() {
    frameId = 0;
    if (!width || !spacing) return;
    offset = viewport.scrollLeft;
    const start = Math.floor(offset / spacing);
    const end = Math.min(candles.length, Math.ceil((offset + width) / spacing));
    const visible = candles.slice(start, end);
    const high = Math.max(...visible.map(([, open, peak, , close]) => Math.max(open, peak, close)));
    const low = Math.min(...visible.map(([, open, , trough, close]) => Math.min(open, trough, close)));
    const topVolume = Math.max(0, ...visible.map((row) => row[5] ?? 0));
    const padding = (high - low || Math.abs(high) || 1) * .035;
    const priceY = (price) => priceTop + (high + padding - price) / (high - low + 2 * padding) * (priceBottom - priceTop);
    const plotX = (index) => (index + .5) * spacing - offset;
    const ctx = context(plot, width);
    const labels = context(axis, axis.clientWidth);
    const labelWidth = axis.clientWidth - 10;

    labels.fillText('Price', 5, 15);
    labels.fillText('Volume', 5, volumeTop - 8);
    labels.fillText('UTC', 5, height - 8);
    for (let step = 0; step <= 4; step++) {
      const price = low - padding + (high - low + 2 * padding) * step / 4;
      const y = priceY(price);
      gridLine(ctx, 0, y, width, y);
      labels.fillText(MarketDisplay.price.format(price), 5, y + 4, labelWidth);
    }
    gridLine(ctx, 0, volumeBottom, width, volumeBottom);
    labels.fillText(MarketDisplay.valueText(topVolume), 5, volumeTop + 5, labelWidth);
    if (topVolume > 0) labels.fillText('0', 5, volumeBottom + 4);
    const bodyWidth = Math.min(14, spacing * .65);
    visible.forEach(([, open, high, low, close, volume], position) => {
      const x = plotX(start + position);
      const up = close >= open;
      const color = up ? colors.up : colors.down;
      gridLine(ctx, x, priceY(high), x, priceY(low), color);
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, Math.min(priceY(open), priceY(close)), bodyWidth, Math.max(2, Math.abs(priceY(open) - priceY(close))));
      if (topVolume > 0 && volume > 0) {
        const bar = volume / topVolume * (volumeBottom - volumeTop);
        ctx.fillStyle = colors.volume;
        ctx.fillRect(x - bodyWidth / 2, volumeBottom - bar, bodyWidth, bar);
      }
    });

    ctx.fillStyle = colors.muted;
    ctx.textAlign = 'center';
    const tickEvery = Math.max(1, Math.ceil(62 / spacing));
    for (let index = Math.ceil(start / tickEvery) * tickEvery; index < end; index += tickEvery) {
      const x = plotX(index);
      if (x >= 27 && x <= width - 27) ctx.fillText(time.format(candles[index][0]), x, height - 8);
    }
    const inspected = selected >= start && selected < end;
    if (inspected) {
      const x = plotX(selected);
      gridLine(ctx, x, priceTop, x, volumeBottom, colors.muted);
    }
    const [timestamp, open, highPrice, lowPrice, close, volume] = candles[inspected ? selected : end - 1];
    details.textContent = [
      MarketDisplay.date.format(timestamp) + ' UTC', 'Open ' + MarketDisplay.price.format(open), 'High ' + MarketDisplay.price.format(highPrice),
      'Low ' + MarketDisplay.price.format(lowPrice), 'Close ' + MarketDisplay.price.format(close), 'Volume ' + MarketDisplay.valueText(volume),
    ].join(' · ');
  }

  function scheduleDraw() {
    if (!frameId) frameId = requestAnimationFrame(draw);
  }

  function resize() {
    const atLatest = !mounted || offset + width >= spacing * candles.length - 2;
    width = viewport.clientWidth;
    if (!width) return;
    const candlesPerView = Math.max(50, Math.floor(width / 10));
    track.style.minWidth = Math.ceil(width * candles.length / candlesPerView) + 'px';
    plot.style.width = width + 'px';
    spacing = track.clientWidth / candles.length;
    if (atLatest) viewport.scrollLeft = viewport.scrollWidth;
    mounted = true;
    scheduleDraw();
  }

  viewport.addEventListener('scroll', scheduleDraw, { passive: true });
  plot.onpointermove = (event) => {
    selected = Math.min(candles.length - 1, Math.max(0, Math.floor((viewport.scrollLeft + event.offsetX) / spacing)));
    scheduleDraw();
  };
  plot.onpointerleave = () => { selected = -1; scheduleDraw(); };
  plot.onkeydown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !spacing) return;
    event.preventDefault();
    const lastVisible = Math.min(candles.length - 1, Math.ceil((viewport.scrollLeft + width) / spacing) - 1);
    const from = selected >= 0 ? selected : lastVisible;
    if (event.key === 'Home') selected = 0;
    else if (event.key === 'End') selected = candles.length - 1;
    else selected = Math.max(0, Math.min(candles.length - 1, from + (event.key === 'ArrowLeft' ? -1 : 1)));
    const left = selected * spacing;
    const right = left + spacing;
    if (left < viewport.scrollLeft) viewport.scrollLeft = left;
    if (right > viewport.scrollLeft + width) viewport.scrollLeft = right - width;
    scheduleDraw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  themeColors();
  resize();
  document.fonts.ready.then(() => {
    if (frame.isConnected) scheduleDraw();
  });
  return function dispose() {
    observer.disconnect();
    cancelAnimationFrame(frameId);
  };
}
