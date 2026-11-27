const SigningRequest = {
  ACTIONS: ['browser_create_order', 'browser_cancel_order', 'browser_fetch_balance', 'browser_fetch_positions'],
  EXCHANGES: ['binance', 'bybit'],
  NETWORKS: ['mainnet', 'testnet'],
  MARKETS: ['spot', 'swap'],
  SUMMARY_FIELDS: { side: 'Side', type: 'Order type', amount: 'Quantity', price: 'Limit price', orderId: 'Order ID' },

  isSupported(request) {
    return SigningRequest.ACTIONS.includes(request?.action) && SigningRequest.EXCHANGES.includes(request.exchange) &&
      SigningRequest.NETWORKS.includes(request.network) && SigningRequest.MARKETS.includes(request.market);
  },

  isComplete(request) {
    const positive = (value) => Number.isFinite(value) && value > 0;
    if (!SigningRequest.isSupported(request)) return false;
    if (request.action === 'browser_fetch_positions') return request.market === 'swap';
    if (request.action === 'browser_cancel_order') return Boolean(request.symbol) && Boolean(request.orderId);
    if (request.action !== 'browser_create_order') return true;
    if (!request.symbol || !['buy', 'sell'].includes(request.side) || !positive(request.amount)) return false;
    if (request.type === 'market') return request.price === undefined;
    return request.type === 'limit' && positive(request.price);
  },

  isOrder(request) {
    return request.action === 'browser_create_order';
  },

  isWrite(request) {
    return request.action === 'browser_create_order' || request.action === 'browser_cancel_order';
  },

  usesDemoTrading(request) {
    return request.exchange === 'binance' && request.market === 'swap';
  },

  networkLabel(request) {
    if (request.network === 'mainnet') return 'Mainnet · real funds';
    return SigningRequest.usesDemoTrading(request) ? 'Demo trading' : 'Testnet';
  },

  marketLine(request) {
    return Format.joinPresent([Format.capitalize(request.exchange), Format.capitalize(request.market), request.symbol], ' · ');
  },

  summary(request) {
    const [base, quote] = Format.splitSymbol(request.symbol);
    const display = (field, value) => {
      if (field === 'side' || field === 'type') return Format.capitalize(value);
      if (typeof value !== 'number') return value;
      const unit = field === 'price' ? quote : request.market === 'spot' ? base : '';
      return Format.joinPresent([Format.quantity.format(value), unit], ' ');
    };
    return Object.entries(SigningRequest.SUMMARY_FIELDS)
      .filter(([field]) => request[field] != null)
      .map(([field, label]) => ({ field, label, value: request[field], text: display(field, request[field]) }));
  },
};
