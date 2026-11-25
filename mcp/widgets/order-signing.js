const $ = (id) => document.getElementById(id);
const encoder = new TextEncoder();
const encode = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const decode = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
const operations = {
  browser_create_order: ['Review order', 'Sign & submit'],
  browser_cancel_order: ['Review cancellation', 'Sign & cancel order'],
  browser_fetch_balance: ['Review balance request', 'Sign & fetch balances'],
  browser_fetch_positions: ['Review positions request', 'Sign & fetch positions'],
};
let intent;
let storageKey;
let saved;
let busy = false;
let readOnly = false;
let finished = false;
const networkSwitches = [$('review-testnet'), $('credentials-testnet')];

function notice(message) {
  $('status').textContent = message;
}

function showCredentials() {
  $('saved').hidden = !saved;
  $('add').hidden = Boolean(saved);
  $('submit').disabled = !saved || busy;
  for (const toggle of networkSwitches) toggle.disabled = busy || finished;
  $('saved-label').textContent = saved ? 'API key · ' + saved.prefix + '••••' : '';
}

function selectNetwork(network) {
  const key = 'ccxt.exchange-' + network + '.v2.' + intent.exchange + '.' + intent.market;
  const entry = JSON.parse(localStorage.getItem(key) || 'null');
  intent.network = network;
  storageKey = key;
  saved = entry?.network && entry.network !== network ? null : entry;
  for (const toggle of networkSwitches) toggle.checked = network === 'testnet';
  const environment = $('environment');
  environment.textContent = intent.network === 'mainnet' ? 'Mainnet · real funds'
    : intent.exchange === 'binance' && intent.market === 'swap' ? 'Demo trading' : 'Testnet';
  environment.dataset.network = intent.network;
}

for (const toggle of networkSwitches) {
  toggle.onchange = () => {
    if (busy || finished) return;
    try {
      selectNetwork(toggle.checked ? 'testnet' : 'mainnet');
    } catch {
      for (const control of networkSwitches) control.checked = intent.network === 'testnet';
      notice('Could not load credentials for the selected network.');
      return;
    }
    $('api-key').value = $('secret').value = '';
    $('credential-status').textContent = '';
    notice('');
    showCredentials();
    const dialog = $('credentials-dialog');
    if (saved && dialog.open) dialog.close();
    else if (!saved && !dialog.open) openCredentials();
  };
}

function openCredentials() {
  $('credential-status').textContent = '';
  $('credentials-dialog').showModal();
}

async function browserKey(create) {
  const generated = create && await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('ccxt-signing', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('keys');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('keys', create ? 'readwrite' : 'readonly');
      const keys = transaction.objectStore('keys');
      const request = keys.get('credentials');
      let key;
      request.onsuccess = () => {
        key = request.result || generated;
        if (!request.result && generated) keys.put(generated, 'credentials');
      };
      transaction.oncomplete = () => key ? resolve(key) : reject(new Error('Browser encryption key unavailable.'));
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function loadCredentials() {
  const key = await browserKey(false);
  const data = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decode(saved.iv), additionalData: encoder.encode(storageKey) }, key, decode(saved.data),
  );
  return JSON.parse(new TextDecoder().decode(data));
}

async function saveCredentials() {
  const credentials = { apiKey: $('api-key').value.trim(), secret: $('secret').value.trim() };
  if (!credentials.apiKey || !credentials.secret) throw new Error('Enter the API key and API secret.');
  const key = await browserKey(true);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(storageKey) }, key, encoder.encode(JSON.stringify(credentials)),
  );
  const entry = { network: intent.network, prefix: credentials.apiKey.length > 4 ? credentials.apiKey.slice(0, 4) : '',
    iv: encode(iv), data: encode(data) };
  localStorage.setItem(storageKey, JSON.stringify(entry));
  saved = entry;
}

function showRequestError({ title, code, message, uncertain = false }) {
  $('request-error-title').textContent = title;
  $('request-error-code').textContent = code ?? '';
  $('request-error-code').hidden = !code;
  $('request-error-detail').textContent = message;
  $('request-error-next').hidden = !uncertain;
  notice(title);
  $('request-error').showModal();
}

function redactError(message, credentials) {
  let text = String(message ?? '');
  for (const value of [credentials.apiKey, credentials.secret].filter(Boolean)) {
    for (const form of new Set([value, encodeURIComponent(value), JSON.stringify(value).slice(1, -1)])) {
      text = text.replaceAll(form, '[redacted]');
    }
  }
  return text
    .replace(/https?:\/\/[^\s"'<>]+/gi, '[request URL]')
    .replace(/(["']?(?:signature|api[-_ ]?key|secret|x-bapi-sign|x-mbx-apikey|authorization)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&}]+)/gi, '$1[redacted]')
    .slice(0, 600);
}

async function execute(credentials) {
  const adapter = globalThis.ccxt?.[intent.exchange];
  if (!adapter) throw new Error('CCXT could not load for this exchange.');
  const market = intent.market;
  const exchange = new adapter({
    ...credentials, enableRateLimit: true, verbose: false,
    options: { defaultType: market === 'swap' && intent.exchange === 'binance' ? 'future' : market,
      // fetchMargins: binance otherwise loads margin pairs from sapi during loadMarkets — no testnet URL, and not relayed
      fetchCurrencies: false, fetchMargins: false, adjustForTimeDifference: false, maxRetriesOnFailure: 0,
      fetchMarkets: { types: [market === 'swap' ? 'linear' : market] } },
  });
  exchange.has.fetchCurrencies = false;
  // Select the CCXT URL map from the reviewed network. The transport relays the resulting URL.
  if (intent.network === 'testnet') {
    const useDemo = intent.exchange === 'binance' && market === 'swap';
    const endpoints = exchange.urls[useDemo ? 'demo' : 'test'];
    if (!endpoints) throw new Error('CCXT does not provide endpoints for the selected test network.');
    exchange.urls.api = endpoints;
    if (useDemo) exchange.options.enableDemoTrading = true;
  }
  exchange.fetchIsNative = true;
  exchange.fetchImplementationLoading = Promise.resolve();
  let failure;
  let writeAttempted = false;
  exchange.fetchImplementation = async (url, request) => {
    const write = request.method !== 'GET';
    writeAttempted ||= write;
    let response;
    let result;
    try {
      response = await fetch('/relay-order', {
        method: 'POST', credentials: 'same-origin', redirect: 'error', signal: request.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange: intent.exchange, signedPayload: {
          url, method: request.method, headers: Object.fromEntries(new Headers(request.headers)), body: request.body ?? null,
        } }),
      });
      result = await response.json();
    } catch (error) {
      failure = { title: 'Could not reach the relay', code: error.name,
        message: error.message, uncertain: writeAttempted };
      throw error;
    }
    if (!response.ok) {
      failure = { title: 'Relay error', code: 'HTTP ' + response.status,
        message: typeof result?.error === 'string' ? result.error : response.statusText,
        uncertain: write && (response.status === 409 || response.status >= 500) };
      throw new Error(failure.message);
    }
    let body;
    try { body = JSON.parse(result.body); } catch { /* CCXT handles non-JSON responses. */ }
    const exchangeCode = body?.retCode ?? body?.code;
    const exchangeMessage = body?.retMsg ?? body?.msg;
    if (result.status >= 400 || (exchangeCode != null && Number(exchangeCode) !== 0)) {
      const uncertain = write && (result.status >= 500 ||
        ['-1006', '-1007', '10000', '10016'].includes(String(exchangeCode)));
      failure = {
        title: uncertain ? 'Exchange outcome uncertain' : 'Exchange rejected the request',
        code: /^-?\d+$/.test(String(exchangeCode)) ? 'Exchange code ' + exchangeCode : 'HTTP ' + result.status,
        message: typeof exchangeMessage === 'string' ? exchangeMessage : 'The exchange returned HTTP ' + result.status + '.',
        uncertain,
      };
    }
    return new Response(result.body, { status: result.status, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    switch (intent.action) {
      case 'browser_create_order':
        if (market === 'spot' && intent.type === 'market' && intent.exchange === 'bybit' && intent.side === 'buy') {
          const [, unified] = await exchange.isUnifiedEnabled();
          if (!unified) throw new Error('Bybit base-quantity market buys require a Unified Trading Account.');
        }
        return await exchange.createOrder(intent.symbol, intent.type, intent.side, intent.amount,
          intent.type === 'limit' ? intent.price : undefined);
      case 'browser_cancel_order':
        return await exchange.cancelOrder(intent.orderId, intent.symbol);
      case 'browser_fetch_balance':
        return await exchange.fetchBalance();
      case 'browser_fetch_positions':
        return await exchange.fetchPositions(intent.symbol ? [intent.symbol] : undefined);
    }
  } catch (error) {
    const detail = failure ?? {
      title: writeAttempted ? 'Order outcome uncertain' : 'Request failed',
      code: error.name,
      message: writeAttempted ? 'CCXT could not confirm the result of the signed request.' : error.message,
      uncertain: writeAttempted,
    };
    throw Object.assign(new Error(redactError(detail.message, credentials) || 'No error details were returned.'), {
      requestDetail: {
        ...detail,
        code: detail.code ? redactError(detail.code, credentials) : undefined,
        message: redactError(detail.message, credentials) || 'No error details were returned.',
      },
    });
  }
}

function showResult(result) {
  const list = $('result-rows');
  const add = (label, value) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = String(value ?? '—');
    row.append(term, description);
    list.append(row);
  };
  if (intent.action === 'browser_fetch_balance') {
    for (const [asset, total] of Object.entries(result.total ?? {})) if (total) add(asset, total);
    if (!list.childElementCount) add('Balances', 'No nonzero balances');
  } else if (intent.action === 'browser_fetch_positions') {
    for (const position of result) add(position.symbol, [position.side, position.contracts].filter((value) => value != null).join(' · '));
    if (!list.childElementCount) add('Positions', 'No positions returned');
  } else {
    add('Exchange order ID', result.id);
    add('Status', result.status ?? 'Acknowledged');
  }
  $('receipt').hidden = false;
  $('result-title').focus();
}

try {
  intent = JSON.parse(decodeURIComponent(location.hash.slice(1)));
  if (!Object.hasOwn(operations, intent.action) || !['binance', 'bybit'].includes(intent.exchange) ||
      !['mainnet', 'testnet'].includes(intent.network) || !['spot', 'swap'].includes(intent.market) || !window.isSecureContext) throw new Error();
  if (intent.action === 'browser_fetch_positions' && intent.market !== 'swap') throw new Error();
  if (['browser_create_order', 'browser_cancel_order'].includes(intent.action) && !intent.symbol) throw new Error();
  if (intent.action === 'browser_create_order' &&
      (!['buy', 'sell'].includes(intent.side) || !['market', 'limit'].includes(intent.type) ||
       !Number.isFinite(intent.amount) || intent.amount <= 0 ||
       (intent.type === 'market' ? intent.price !== undefined : !Number.isFinite(intent.price) || intent.price <= 0))) throw new Error();
  if (intent.action === 'browser_cancel_order' && !intent.orderId) throw new Error();
  selectNetwork(intent.network);
  const [title, action] = operations[intent.action];
  const exchangeName = intent.exchange === 'binance' ? 'Binance' : 'Bybit';
  const activity = {
    browser_create_order: 'place this order',
    browser_cancel_order: 'cancel this order',
    browser_fetch_balance: 'read your balances',
    browser_fetch_positions: 'read your positions',
  }[intent.action];
  readOnly = intent.action === 'browser_fetch_balance' || intent.action === 'browser_fetch_positions';
  $('dialog-title-text').textContent = exchangeName + ' API keys needed';
  $('credential-intro').textContent = 'Add ' + (readOnly ? 'read-only' : 'trading-enabled') +
    ' API credentials to ' + activity + ' on ' + exchangeName + '.';
  $('continue').textContent = readOnly ? 'Save & run' : 'Save & continue';
  $('title').textContent = title;
  $('submit').textContent = action;
  $('slippage-warning').hidden = !(intent.action === 'browser_create_order' && intent.type === 'market');
  $('market').textContent = [exchangeName, intent.market === 'spot' ? 'Spot' : 'Swap', intent.symbol].filter(Boolean).join(' · ');
  const [base, quote] = (intent.symbol ?? '').split(':')[0].split('/');
  const number = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 21 });
  for (const [field, label] of Object.entries({ side: 'Side', type: 'Order type', amount: 'Quantity', price: 'Limit price', orderId: 'Order ID' })) {
    if (intent[field] == null) continue;
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const value = document.createElement('dd');
    term.textContent = label;
    const raw = intent[field];
    if (field === 'side' || field === 'type') {
      value.textContent = raw[0].toUpperCase() + raw.slice(1);
      if (field === 'side') value.className = raw;
    } else if (typeof raw === 'number') {
      const unit = field === 'price' ? quote : intent.market === 'spot' ? base : '';
      value.textContent = [number.format(raw), unit].filter(Boolean).join(' ');
    } else {
      value.textContent = raw;
    }
    row.append(term, value);
    $('intent').append(row);
  }
  showCredentials();
  $('form').hidden = false;
  if (!saved) openCredentials();
  if (window.parent !== window) window.parent.postMessage({ type: 'ccxt/signing-ready' }, '*');
} catch {
  notice('Open a valid approval link from the CCXT plugin in a secure browser tab.');
}

$('add').onclick = openCredentials;
$('dismiss').onclick = () => $('credentials-dialog').close();
$('credentials-dialog').onclose = () => {
  $('api-key').value = $('secret').value = '';
};
$('credentials-dialog').oncancel = (event) => { if (busy) event.preventDefault(); };
$('credentials-form').onsubmit = async (event) => {
  event.preventDefault();
  if (busy) return;
  busy = true;
  $('continue').disabled = $('dismiss').disabled = true;
  for (const toggle of networkSwitches) toggle.disabled = true;
  try {
    await saveCredentials();
    $('credentials-dialog').close();
    notice('Credentials saved on this browser.');
  } catch (error) {
    $('credential-status').textContent = error.message;
  } finally {
    busy = false;
    $('continue').disabled = $('dismiss').disabled = false;
    showCredentials();
    if (saved && !$('credentials-dialog').open) {
      if (readOnly) $('form').requestSubmit();
      else $('submit').focus();
    }
  }
};
$('remove').onclick = () => {
  if (!confirm('Remove these saved credentials from this browser?')) return;
  localStorage.removeItem(storageKey);
  saved = null;
  showCredentials();
  openCredentials();
};
$('cancel').onclick = () => {
  finished = true;
  $('form').hidden = true;
  showCredentials();
  notice('Request canceled.');
};
$('form').onsubmit = async (event) => {
  event.preventDefault();
  if (busy || !saved) return;
  busy = true;
  for (const id of ['submit', 'cancel', 'remove']) $(id).disabled = true;
  for (const toggle of networkSwitches) toggle.disabled = true;
  let submitted = false;
  try {
    const credentials = await loadCredentials();
    notice('Sending signed request…');
    submitted = true;
    const result = await execute(credentials);
    showResult(result);
    $('form').hidden = true;
    notice('Exchange response received.');
  } catch (error) {
    const detail = error.requestDetail ?? (submitted
      ? { title: 'Request failed', message: String(error.message ?? 'No error details were returned.') }
      : { title: 'Could not read saved credentials', message: 'Remove the saved credentials and add them again.' });
    if (detail.uncertain) $('form').hidden = true;
    showRequestError(detail);
  } finally {
    busy = false;
    for (const id of ['cancel', 'remove']) $(id).disabled = false;
    finished = $('form').hidden;
    showCredentials();
  }
};
