const OPERATIONS = {
  browser_create_order: { title: 'Review order', submit: 'Sign & submit', activity: 'place this order' },
  browser_cancel_order: { title: 'Review cancellation', submit: 'Sign & cancel order', activity: 'cancel this order' },
  browser_fetch_balance: { title: 'Review balance request', submit: 'Sign & fetch balances', activity: 'read your balances' },
  browser_fetch_positions: { title: 'Review positions request', submit: 'Sign & fetch positions', activity: 'read your positions' },
};
const INVALID_LINK = 'Open a valid approval link from the CCXT plugin in a secure browser tab.';
const vault = CredentialVault.open({ database: 'ccxt-signing', keyName: 'credentials' });
const networkSwitches = [Dom.byId('review-testnet'), Dom.byId('credentials-testnet')];

let request;
let storageKey;
let savedEntry;
let busy = false;
let readOnly = false;
let finished = false;

function showNotice(message) {
  Dom.byId('status').textContent = message;
}

function setDisabled(ids, disabled) {
  for (const id of ids) Dom.byId(id).disabled = disabled;
}

function setNetworkSwitches(change) {
  for (const toggle of networkSwitches) change(toggle);
}

function clearCredentialInputs() {
  Dom.byId('api-key').value = Dom.byId('secret').value = '';
}

function showCredentials() {
  Dom.byId('saved').hidden = !savedEntry;
  Dom.byId('add').hidden = Boolean(savedEntry);
  Dom.byId('submit').disabled = !savedEntry || busy;
  setNetworkSwitches((toggle) => { toggle.disabled = busy || finished; });
  Dom.byId('saved-label').textContent = savedEntry ? 'API key · ' + savedEntry.prefix + '••••' : '';
}

function openCredentialsDialog() {
  Dom.byId('credential-status').textContent = '';
  Dom.byId('credentials-dialog').showModal();
}

function selectNetwork(network) {
  const key = 'ccxt.exchange-' + network + '.v2.' + request.exchange + '.' + request.market;
  const entry = vault.readEntry(key);
  const savedForOtherNetwork = entry?.network && entry.network !== network;
  request.network = network;
  storageKey = key;
  savedEntry = savedForOtherNetwork ? null : entry;
  setNetworkSwitches((toggle) => { toggle.checked = network === 'testnet'; });
  const environment = Dom.byId('environment');
  environment.textContent = SigningRequest.networkLabel(request);
  environment.dataset.network = network;
}

function onNetworkSwitch(toggle) {
  if (busy || finished) return;
  try {
    selectNetwork(toggle.checked ? 'testnet' : 'mainnet');
  } catch {
    setNetworkSwitches((control) => { control.checked = request.network === 'testnet'; });
    showNotice('Could not load credentials for the selected network.');
    return;
  }
  clearCredentialInputs();
  Dom.byId('credential-status').textContent = '';
  showNotice('');
  showCredentials();
  const dialog = Dom.byId('credentials-dialog');
  if (savedEntry && dialog.open) dialog.close();
  else if (!savedEntry && !dialog.open) openCredentialsDialog();
}

async function saveTypedCredentials() {
  const credentials = { apiKey: Dom.byId('api-key').value.trim(), secret: Dom.byId('secret').value.trim() };
  if (!credentials.apiKey || !credentials.secret) throw new Error('Enter the API key and API secret.');
  const prefix = credentials.apiKey.length > 4 ? credentials.apiKey.slice(0, 4) : '';
  const entry = { network: request.network, prefix, ...await vault.encrypt(storageKey, credentials) };
  vault.writeEntry(storageKey, entry);
  savedEntry = entry;
}

function removeSavedCredentials() {
  if (!confirm('Remove these saved credentials from this browser?')) return;
  vault.removeEntry(storageKey);
  savedEntry = null;
  showCredentials();
  openCredentialsDialog();
}

function showRequestError({ title, code, message, uncertain = false }) {
  Dom.byId('request-error-title').textContent = title;
  Dom.byId('request-error-code').textContent = code ?? '';
  Dom.byId('request-error-code').hidden = !code;
  Dom.byId('request-error-detail').textContent = message;
  Dom.byId('request-error-next').hidden = !uncertain;
  showNotice(title);
  Dom.byId('request-error').showModal();
}

function showResult(result) {
  const list = Dom.byId('result-rows');
  const addRow = (label, value) => Dom.definitionRow(list, label, String(value ?? '—'));
  if (request.action === 'browser_fetch_balance') {
    for (const [asset, total] of Object.entries(result.total ?? {})) if (total) addRow(asset, total);
    if (!list.childElementCount) addRow('Balances', 'No nonzero balances');
  } else if (request.action === 'browser_fetch_positions') {
    for (const position of result) addRow(position.symbol, [position.side, position.contracts].filter((value) => value != null).join(' · '));
    if (!list.childElementCount) addRow('Positions', 'No positions returned');
  } else {
    addRow('Exchange order ID', result.id);
    addRow('Status', result.status ?? 'Acknowledged');
  }
  Dom.byId('receipt').hidden = false;
  Dom.byId('result-title').focus();
}

function readRequestFromLink() {
  const linked = JSON.parse(decodeURIComponent(location.hash.slice(1)));
  if (!SigningRequest.isComplete(linked) || !window.isSecureContext) throw new Error(INVALID_LINK);
  return linked;
}

function showSummary() {
  const list = Dom.byId('intent');
  for (const { field, label, value, text } of SigningRequest.summary(request)) {
    const detail = Dom.definitionRow(list, label, text);
    if (field === 'side') detail.className = value;
  }
}

function showRequest() {
  const { title, submit, activity } = OPERATIONS[request.action];
  const exchangeName = Format.capitalize(request.exchange);
  const keyKind = readOnly ? 'read-only' : 'trading-enabled';
  Dom.byId('dialog-title-text').textContent = exchangeName + ' API keys needed';
  Dom.byId('credential-intro').textContent = 'Add ' + keyKind + ' API credentials to ' + activity + ' on ' + exchangeName + '.';
  Dom.byId('continue').textContent = readOnly ? 'Save & run' : 'Save & continue';
  Dom.byId('title').textContent = title;
  Dom.byId('submit').textContent = submit;
  Dom.byId('slippage-warning').hidden = !(SigningRequest.isOrder(request) && request.type === 'market');
  Dom.byId('market').textContent = SigningRequest.marketLine(request);
  showSummary();
}

function start() {
  try {
    request = readRequestFromLink();
    selectNetwork(request.network);
    readOnly = !SigningRequest.isWrite(request);
    showRequest();
    showCredentials();
    Dom.byId('form').hidden = false;
    if (!savedEntry) openCredentialsDialog();
    if (window.parent !== window) window.parent.postMessage({ type: 'ccxt/signing-ready' }, '*');
  } catch {
    showNotice(INVALID_LINK);
  }
}

async function onCredentialsSubmit(event) {
  event.preventDefault();
  if (busy) return;
  busy = true;
  setDisabled(['continue', 'dismiss'], true);
  setNetworkSwitches((toggle) => { toggle.disabled = true; });
  try {
    await saveTypedCredentials();
    Dom.byId('credentials-dialog').close();
    showNotice('Credentials saved on this browser.');
  } catch (error) {
    Dom.byId('credential-status').textContent = error.message;
  } finally {
    busy = false;
    setDisabled(['continue', 'dismiss'], false);
    showCredentials();
    if (savedEntry && !Dom.byId('credentials-dialog').open) {
      if (readOnly) Dom.byId('form').requestSubmit();
      else Dom.byId('submit').focus();
    }
  }
}

function cancelRequest() {
  finished = true;
  Dom.byId('form').hidden = true;
  showCredentials();
  showNotice('Request canceled.');
}

function failureDetail(error, sentToRelay) {
  if (error.requestDetail) return error.requestDetail;
  if (sentToRelay) return { title: 'Request failed', message: String(error.message ?? 'No error details were returned.') };
  return { title: 'Could not read saved credentials', message: 'Remove the saved credentials and add them again.' };
}

async function onRequestSubmit(event) {
  event.preventDefault();
  if (busy || !savedEntry) return;
  busy = true;
  setDisabled(['submit', 'cancel', 'remove'], true);
  setNetworkSwitches((toggle) => { toggle.disabled = true; });
  let sentToRelay = false;
  try {
    const credentials = await vault.decrypt(storageKey, savedEntry);
    showNotice('Sending signed request…');
    sentToRelay = true;
    showResult(await RelayExchange.run(request, credentials));
    Dom.byId('form').hidden = true;
    showNotice('Exchange response received.');
  } catch (error) {
    const detail = failureDetail(error, sentToRelay);
    if (detail.uncertain) Dom.byId('form').hidden = true;
    showRequestError(detail);
  } finally {
    busy = false;
    setDisabled(['cancel', 'remove'], false);
    finished = Dom.byId('form').hidden;
    showCredentials();
  }
}

for (const toggle of networkSwitches) toggle.onchange = () => onNetworkSwitch(toggle);
Dom.byId('add').onclick = openCredentialsDialog;
Dom.byId('dismiss').onclick = () => Dom.byId('credentials-dialog').close();
Dom.byId('credentials-dialog').onclose = clearCredentialInputs;
Dom.byId('credentials-dialog').oncancel = (event) => { if (busy) event.preventDefault(); };
Dom.byId('credentials-form').onsubmit = onCredentialsSubmit;
Dom.byId('remove').onclick = removeSavedCredentials;
Dom.byId('cancel').onclick = cancelRequest;
Dom.byId('form').onsubmit = onRequestSubmit;
start();
