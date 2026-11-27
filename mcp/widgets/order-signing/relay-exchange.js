const RelayExchange = (() => {
  const RELAY_PATH = '/relay-order';
  const UNCERTAIN_EXCHANGE_CODES = ['-1006', '-1007', '10000', '10016'];
  const NO_DETAILS = 'No error details were returned.';
  const SECRET_FIELD = /(["']?(?:signature|api[-_ ]?key|secret|x-bapi-sign|x-mbx-apikey|authorization)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&}]+)/gi;
  const REQUEST_URL = /https?:\/\/[^\s"'<>]+/gi;
  const MAX_ERROR_LENGTH = 600;

  function redact(message, credentials) {
    let text = String(message ?? '');
    for (const value of [credentials.apiKey, credentials.secret].filter(Boolean)) {
      for (const form of new Set([value, encodeURIComponent(value), JSON.stringify(value).slice(1, -1)])) {
        text = text.replaceAll(form, '[redacted]');
      }
    }
    return text.replace(REQUEST_URL, '[request URL]').replace(SECRET_FIELD, '$1[redacted]').slice(0, MAX_ERROR_LENGTH);
  }

  function exchangeOptions(request) {
    const { exchange, market } = request;
    return {
      defaultType: market === 'swap' && exchange === 'binance' ? 'future' : market,
      fetchCurrencies: false,
      fetchMargins: false,
      adjustForTimeDifference: false,
      maxRetriesOnFailure: 0,
      fetchMarkets: { types: [market === 'swap' ? 'linear' : market] },
    };
  }

  function useTestEndpoints(exchange, request) {
    const useDemo = SigningRequest.usesDemoTrading(request);
    const endpoints = exchange.urls[useDemo ? 'demo' : 'test'];
    if (!endpoints) throw new Error('CCXT does not provide endpoints for the selected test network.');
    exchange.urls.api = endpoints;
    if (useDemo) exchange.options.enableDemoTrading = true;
  }

  function createExchange(request, credentials) {
    const adapter = globalThis.ccxt?.[request.exchange];
    if (!adapter) throw new Error('CCXT could not load for this exchange.');
    const exchange = new adapter({ ...credentials, enableRateLimit: true, verbose: false, options: exchangeOptions(request) });
    exchange.has.fetchCurrencies = false;
    if (request.network === 'testnet') useTestEndpoints(exchange, request);
    exchange.fetchIsNative = true;
    exchange.fetchImplementationLoading = Promise.resolve();
    return exchange;
  }

  function parseJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }

  function relayRefusal(response, relayed, isWrite) {
    return {
      title: 'Relay error',
      code: 'HTTP ' + response.status,
      message: typeof relayed?.error === 'string' ? relayed.error : response.statusText,
      uncertain: isWrite && (response.status === 409 || response.status >= 500),
    };
  }

  function exchangeRejection(relayed, isWrite) {
    const body = parseJson(relayed.body);
    const code = body?.retCode ?? body?.code;
    const message = body?.retMsg ?? body?.msg;
    const rejected = relayed.status >= 400 || (code != null && Number(code) !== 0);
    if (!rejected) return undefined;
    const uncertain = isWrite && (relayed.status >= 500 || UNCERTAIN_EXCHANGE_CODES.includes(String(code)));
    return {
      title: uncertain ? 'Exchange outcome uncertain' : 'Exchange rejected the request',
      code: /^-?\d+$/.test(String(code)) ? 'Exchange code ' + code : 'HTTP ' + relayed.status,
      message: typeof message === 'string' ? message : 'The exchange returned HTTP ' + relayed.status + '.',
      uncertain,
    };
  }

  function postToRelay(request, url, signed) {
    return fetch(RELAY_PATH, {
      method: 'POST', credentials: 'same-origin', redirect: 'error', signal: signed.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchange: request.exchange, signedPayload: {
        url, method: signed.method, headers: Object.fromEntries(new Headers(signed.headers)), body: signed.body ?? null,
      } }),
    });
  }

  function sendThroughRelay(exchange, request, attempt) {
    exchange.fetchImplementation = async (url, signed) => {
      const isWrite = signed.method !== 'GET';
      attempt.wroteToExchange ||= isWrite;
      let response;
      let relayed;
      try {
        response = await postToRelay(request, url, signed);
        relayed = await response.json();
      } catch (error) {
        attempt.failure = { title: 'Could not reach the relay', code: error.name, message: error.message, uncertain: attempt.wroteToExchange };
        throw error;
      }
      if (!response.ok) {
        attempt.failure = relayRefusal(response, relayed, isWrite);
        throw new Error(attempt.failure.message);
      }
      attempt.failure = exchangeRejection(relayed, isWrite) ?? attempt.failure;
      return new Response(relayed.body, { status: relayed.status, headers: { 'Content-Type': 'application/json' } });
    };
  }

  async function requireUnifiedAccount(exchange) {
    const [, unified] = await exchange.isUnifiedEnabled();
    if (!unified) throw new Error('Bybit base-quantity market buys require a Unified Trading Account.');
  }

  async function createOrder(exchange, request) {
    const { exchange: venue, market, symbol, type, side, amount, price } = request;
    const isBybitSpotMarketBuy = venue === 'bybit' && market === 'spot' && type === 'market' && side === 'buy';
    if (isBybitSpotMarketBuy) await requireUnifiedAccount(exchange);
    return exchange.createOrder(symbol, type, side, amount, type === 'limit' ? price : undefined);
  }

  function perform(exchange, request) {
    switch (request.action) {
      case 'browser_create_order': return createOrder(exchange, request);
      case 'browser_cancel_order': return exchange.cancelOrder(request.orderId, request.symbol);
      case 'browser_fetch_balance': return exchange.fetchBalance();
      case 'browser_fetch_positions': return exchange.fetchPositions(request.symbol ? [request.symbol] : undefined);
    }
  }

  function unconfirmedFailure(error, attempt) {
    return {
      title: attempt.wroteToExchange ? 'Order outcome uncertain' : 'Request failed',
      code: error.name,
      message: attempt.wroteToExchange ? 'CCXT could not confirm the result of the signed request.' : error.message,
      uncertain: attempt.wroteToExchange,
    };
  }

  function requestError(detail, credentials) {
    const message = redact(detail.message, credentials) || NO_DETAILS;
    const code = detail.code ? redact(detail.code, credentials) : undefined;
    return Object.assign(new Error(message), { requestDetail: { ...detail, code, message } });
  }

  async function run(request, credentials) {
    const exchange = createExchange(request, credentials);
    const attempt = { failure: undefined, wroteToExchange: false };
    sendThroughRelay(exchange, request, attempt);
    try {
      return await perform(exchange, request);
    } catch (error) {
      throw requestError(attempt.failure ?? unconfirmedFailure(error, attempt), credentials);
    }
  }

  return { run };
})();
