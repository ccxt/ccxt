const Timing = (() => {
  const LOG_PREFIX = '[ccxt-widget] ';
  const mountedAt = performance.now();
  let entries = [];

  function record(label, milliseconds, note = '') {
    const rounded = Math.round(milliseconds);
    entries.push({ label, milliseconds: rounded, note });
    console.info(LOG_PREFIX + label + ': ' + rounded + ' ms' + (note ? ' (' + note + ')' : ''));
  }

  function recordSince(label, startedAt, note) {
    record(label, performance.now() - startedAt, note);
  }

  function logSinceMount(label) {
    console.info(LOG_PREFIX + label + ' ' + Math.round(performance.now() - mountedAt) + ' ms after the widget loaded');
  }

  function reset() {
    entries = [];
  }

  function show(panel, list) {
    list.replaceChildren();
    for (const { label, milliseconds, note } of entries) {
      Dom.definitionRow(list, label, milliseconds + ' ms' + (note ? ' · ' + note : ''));
    }
    panel.hidden = entries.length === 0;
  }

  return { record, recordSince, logSinceMount, reset, show };
})();
