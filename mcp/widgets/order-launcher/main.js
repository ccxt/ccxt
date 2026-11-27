const SUBMIT_LABELS = {
  browser_create_order: 'Sign & submit order',
  browser_cancel_order: 'Sign & cancel order',
  browser_fetch_balance: 'Sign & fetch balances',
  browser_fetch_positions: 'Sign & fetch positions',
};
const MAX_SIGNING_ROUNDS = 8;
const SIGNING_PAGE_PATH = '/order-signing';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];
const vault = CredentialVault.open({ database: 'ccxt-inline-signing', keyName: 'device' });

let request;
let storageKey;
let savedEntry;
let sessionCredentials;
let busy = false;
let finished = false;

function showStatus(text, kind = '') {
  Dom.byId('status').textContent = text;
  Dom.byId('status').dataset.kind = kind;
}

function displayValue(value) {
  if (value == null || value === '') return '—';
  return typeof value === 'number' ? Format.quantity.format(value) : String(value);
}

function addRow(list, label, value) {
  return Dom.definitionRow(list, label, displayValue(value));
}

function readSavedEntry() {
  try {
    return vault.readEntry(storageKey);
  } catch {
    return null;
  }
}

async function saveCredentials(credentials) {
  try {
    const entry = { prefix: credentials.apiKey.slice(0, 4), ...await vault.encrypt(storageKey, credentials) };
    vault.writeEntry(storageKey, entry);
    return entry;
  } catch {
    return null;
  }
}

async function loadSavedCredentials() {
  try {
    return await vault.decrypt(storageKey, savedEntry);
  } catch {
    throw new Error('The saved keys could not be read on this device. Choose "Use different keys" and enter them again.');
  }
}

function typedCredentials() {
  const typed = { apiKey: Dom.byId('api-key').value.trim(), secret: Dom.byId('secret').value.trim() };
  if (!typed.apiKey || !typed.secret) throw new Error('Enter the API key and the API secret.');
  return typed;
}

function currentCredentials() {
  if (sessionCredentials) return sessionCredentials;
  if (savedEntry) return loadSavedCredentials();
  return typedCredentials();
}

function credentialSource() {
  if (savedEntry) return 'decrypted from this device';
  return sessionCredentials ? 'from memory' : 'typed';
}

function removeSavedEntry() {
  try {
    vault.removeEntry(storageKey);
  } catch {
    return;
  }
}

function forgetCredentials() {
  if (busy) return;
  removeSavedEntry();
  savedEntry = null;
  sessionCredentials = undefined;
  showForm();
  Dom.byId('api-key').focus();
}

function showForm() {
  const hasKeys = Boolean(savedEntry) || Boolean(sessionCredentials);
  const showsSavedKeys = Boolean(savedEntry) && !sessionCredentials;
  Dom.byId('form').hidden = finished || !request;
  Dom.byId('saved').hidden = !showsSavedKeys;
  Dom.byId('new').hidden = hasKeys;
  Dom.byId('forget').hidden = !hasKeys;
  Dom.byId('saved-label').textContent = showsSavedKeys ? 'Saved keys: ' + savedEntry.prefix + '••••' : '';
  Dom.byId('submit').textContent = SUBMIT_LABELS[request?.action] ?? 'Sign & submit';
}

function setControlsDisabled(disabled) {
  Dom.byId('submit').disabled = Dom.byId('forget').disabled = disabled;
}

function showBalances(list, balances) {
  Dom.byId('outcome-title').textContent = 'Balances';
  for (const [asset, entry] of Object.entries(balances ?? {})) addRow(list, asset, entry.total);
  if (!list.childElementCount) addRow(list, 'Balances', 'No nonzero balances');
}

function positionLine(position) {
  const entry = position.entryPrice != null ? '@ ' + Format.quantity.format(position.entryPrice) : '';
  return Format.joinPresent([position.side, Format.quantity.format(position.contracts), entry], ' ');
}

function showPositions(list, positions) {
  Dom.byId('outcome-title').textContent = 'Positions';
  for (const position of positions ?? []) {
    if (position.contracts) addRow(list, position.symbol, positionLine(position));
  }
  if (!list.childElementCount) addRow(list, 'Positions', 'No open positions');
}

function showOrderOutcome(list, outcome) {
  Dom.byId('outcome-title').textContent = outcome.kind === 'cancel' ? 'Order canceled' : 'Order submitted';
  addRow(list, 'Exchange order ID', outcome.id);
  addRow(list, 'Status', outcome.status ?? 'Acknowledged');
  if (outcome.filled != null) addRow(list, 'Filled', outcome.filled);
  if (outcome.average != null) addRow(list, 'Average price', outcome.average);
}

function showOutcome(outcome) {
  const list = Dom.byId('outcome-rows');
  list.replaceChildren();
  if (outcome.kind === 'balance') showBalances(list, outcome.balances);
  else if (outcome.kind === 'positions') showPositions(list, outcome.positions);
  else showOrderOutcome(list, outcome);
  Dom.byId('outcome').hidden = false;
}

function showSummary(review) {
  const list = Dom.byId('order');
  list.replaceChildren();
  Dom.byId('title').textContent = review.title;
  Dom.byId('detail').textContent = SigningRequest.marketLine(review);
  for (const { field, label, value, text } of SigningRequest.summary(review)) {
    const detail = Dom.definitionRow(list, label, text);
    if (field === 'type' || field === 'side') detail.dataset.field = field;
    if (field === 'side') detail.dataset.side = value;
  }
}

function showNetwork(review) {
  const badge = Dom.byId('network');
  badge.dataset.network = review.network;
  badge.textContent = SigningRequest.networkLabel(review);
  badge.hidden = false;
}

function showWarnings(review) {
  const onMainnet = review.network === 'mainnet';
  Dom.byId('slippage').hidden = !SigningRequest.isOrder(review) || review.type !== 'market';
  Dom.byId('real-funds').hidden = !onMainnet || !SigningRequest.isWrite(review);
}

function isSigningPageUrl(url) {
  const local = url.protocol === 'http:' && LOCAL_HOSTS.includes(url.hostname);
  return (local || url.protocol === 'https:') && url.pathname === SIGNING_PAGE_PATH;
}

function showSigningPageLink(review) {
  const link = Dom.byId('review');
  try {
    const url = new URL(review.url);
    link.hidden = !isSigningPageUrl(url);
    if (!link.hidden) link.href = url.href;
  } catch {
    link.hidden = true;
  }
}

function clearReview() {
  request = undefined;
  for (const id of ['form', 'network', 'review', 'slippage', 'real-funds']) Dom.byId(id).hidden = true;
  Dom.byId('order').replaceChildren();
  Dom.byId('detail').textContent = 'This request could not be displayed.';
}

function showReview(review) {
  showSummary(review);
  showNetwork(review);
  showWarnings(review);
  showSigningPageLink(review);
  request = review;
  Timing.logSinceMount('review received');
  Timing.reset();
  Timing.show(Dom.byId('timing'), Dom.byId('timing-rows'));
  finished = false;
  storageKey = 'ccxt.inline-signing.v1.' + review.exchange + '.' + review.network + '.' + review.market;
  savedEntry = readSavedEntry();
  Dom.byId('outcome').hidden = true;
  showStatus('');
  showForm();
}

function onToolResult(params) {
  const review = params?.structuredContent;
  if (SigningSteps.resultOf({ structuredContent: review })) return;
  if (!SigningRequest.isSupported(review)) return;
  try {
    showReview(review);
  } catch {
    clearReview();
  }
}

function stepError(failure) {
  return Object.assign(new Error(failure.message), { uncertain: failure.uncertain, title: failure.title });
}

async function signAndSend(credentials, progress) {
  showStatus('Preparing the request…');
  let step = await SigningSteps.prepare(request, credentials.apiKey);
  progress.reachedServer = true;
  for (let round = 1; step.status === 'sign'; round++) {
    if (round > MAX_SIGNING_ROUNDS) throw new Error('Too many signing rounds.');
    showStatus('Signing in this widget…');
    const startedAt = performance.now();
    const signatures = await SigningSteps.sign(credentials.secret, step.need);
    Timing.recordSince('sign in widget', startedAt, signatures.length + ' signature' + (signatures.length === 1 ? '' : 's'));
    step = await SigningSteps.submitSignatures(request, step.session, signatures);
  }
  if (step.status === 'error') throw stepError(step.error);
  return step.result;
}

async function rememberAcceptedCredentials(credentials) {
  sessionCredentials = credentials;
  let couldNotSave = false;
  if (!savedEntry && Dom.byId('remember').checked) {
    savedEntry = await saveCredentials(credentials);
    couldNotSave = !savedEntry;
  }
  Dom.byId('api-key').value = Dom.byId('secret').value = '';
  return couldNotSave;
}

function showFailure(error, progress) {
  const outcomeUnknown = SigningRequest.isWrite(request) && progress.reachedServer && error.uncertain !== false && !error.title;
  if (outcomeUnknown) {
    finished = true;
    showStatus('The outcome is unknown. Check the exchange before trying again.', 'error');
    return;
  }
  if (error.uncertain) finished = true;
  showStatus(Format.joinPresent([error.title, error.message], ': '), 'error');
}

async function onSubmit(event) {
  event.preventDefault();
  if (busy || finished || !request) return;
  busy = true;
  setControlsDisabled(true);
  Dom.byId('outcome').hidden = true;
  Timing.reset();
  SigningSteps.resetCallCount();
  const clickedAt = performance.now();
  const progress = { reachedServer: false };
  try {
    const credentials = await currentCredentials();
    Timing.recordSince('read keys', clickedAt, credentialSource());
    const outcome = await signAndSend(credentials, progress);
    const couldNotSave = await rememberAcceptedCredentials(credentials);
    showOutcome(outcome);
    showStatus(couldNotSave ? 'Done. The keys could not be saved in this host, so they will be asked for again next time.' : 'Done.', 'ok');
    finished = SigningRequest.isWrite(request);
  } catch (error) {
    showFailure(error, progress);
  } finally {
    Timing.recordSince('total from click', clickedAt);
    Timing.show(Dom.byId('timing'), Dom.byId('timing-rows'));
    busy = false;
    setControlsDisabled(false);
    showForm();
  }
}

Dom.byId('forget').onclick = forgetCredentials;
Dom.byId('form').onsubmit = onSubmit;
HostBridge.connect({
  appInfo: { name: 'CCXT Order Review', version: '2.0.0' },
  onToolResult,
  onTeardown: () => { sessionCredentials = undefined; },
});
