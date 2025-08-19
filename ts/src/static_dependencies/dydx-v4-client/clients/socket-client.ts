import { HttpsProxyAgent } from 'https-proxy-agent';
import WebSocket, { ErrorEvent, MessageEvent } from 'ws';

import { getProxyAgent } from '../lib/utils';
import { IndexerConfig } from './constants';

enum OutgoingMessageTypes {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}

enum SocketChannels {
  SUBACCOUNTS = 'v4_subaccounts',
  ORDERBOOK = 'v4_orderbook',
  TRADES = 'v4_trades',
  MARKETS = 'v4_markets',
  CANDLES = 'v4_candles',
}

export enum IncomingMessageTypes {
  CONNECTED = 'connected',
  SUBSCRIBED = 'subscribed',
  ERROR = 'error',
  CHANNEL_DATA = 'channel_data',
  CHANNEL_BATCH_DATA = 'channel_batch_data',
  PONG = 'pong',
}

export enum CandlesResolution {
  ONE_MINUTE = '1MIN',
  FIVE_MINUTES = '5MINS',
  FIFTEEN_MINUTES = '15MINS',
  THIRTY_MINUTES = '30MINS',
  ONE_HOUR = '1HOUR',
  FOUR_HOURS = '4HOURS',
  ONE_DAY = '1DAY',
}

export class SocketClient {
  private url: string;
  private ws?: WebSocket;
  private proxyAgent?: HttpsProxyAgent<string>;
  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onMessageCallback?: (event: MessageEvent) => void;
  private onErrorCallback?: (event: ErrorEvent) => void;
  private lastMessageTime: number = Date.now();

  constructor(
    config: IndexerConfig,
    onOpenCallback: () => void,
    onCloseCallback: () => void,
    onMessageCallback: (event: MessageEvent) => void,
    onErrorCallback: (event: ErrorEvent) => void,
  ) {
    this.url = config.websocketEndpoint;
    this.proxyAgent = config.proxy ? getProxyAgent(config.proxy) : undefined;
    this.onOpenCallback = onOpenCallback;
    this.onCloseCallback = onCloseCallback;
    this.onMessageCallback = onMessageCallback;
    this.onErrorCallback = onErrorCallback;
  }

  connect(): void {
    this.ws = new WebSocket(this.url, {
      agent: this.proxyAgent,
    });
    this.ws.addEventListener('open', this.handleOpen.bind(this));
    this.ws.addEventListener('close', this.handleClose.bind(this));
    this.ws.addEventListener('message', this.handleMessage.bind(this));
    this.ws.addEventListener('error', this.handleError.bind(this));
  }

  /**
   * @description Close the websocket connection.
   *
   */
  close(): void {
    this.ws?.close();
    this.ws = undefined;
  }

  /**
   * @description Check is the websocket connection connecting
   */
  isConnecting(): boolean {
    return this.ws?.readyState === WebSocket.CONNECTING;
  }

  /**
   * @description Check is the websocket connection open
   */
  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * @description Check is the websocket connection closing
   */
  isClosing(): boolean {
    return this.ws?.readyState === WebSocket.CLOSING;
  }

  /**
   * @description Check is the websocket connection closed
   */
  isClosed(): boolean {
    return this.ws?.readyState === WebSocket.CLOSED;
  }

  /**
   * @description Send data to the websocket connection.
   *
   */
  send(data: string): void {
    this.ws?.send(data);
  }

  private handleOpen(): void {
    if (this.onOpenCallback) {
      this.onOpenCallback();
    }
  }

  private handleClose(): void {
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data === 'PING') {
      this.send('PONG');
    } else {
      this.lastMessageTime = Date.now();
      if (this.onMessageCallback) {
        this.onMessageCallback(event);
      }
    }
  }

  private handleError(event: ErrorEvent): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(event);
    }
  }

  /**
   * @description Set callback when the socket is opened.
   *
   */
  set onOpen(callback: () => void) {
    this.onOpenCallback = callback;
  }

  /**
   * @description Set callback when the socket is closed.
   *
   */
  set onClose(callback: () => void) {
    this.onCloseCallback = callback;
  }

  /**
   * @description Set callback when the socket receives a message.
   *
   */
  set onMessage(callback: (event: MessageEvent) => void) {
    this.onMessageCallback = callback;
  }

  /**
   * @description Set callback when the socket encounters an error.
   */
  set onError(callback: (event: ErrorEvent) => void) {
    this.onErrorCallback = callback;
  }

  /**
   * @description Send a subscribe message to the websocket connection.
   *
   */
  subscribe(channel: string, params?: object): void {
    const message = {
      type: OutgoingMessageTypes.SUBSCRIBE,
      channel,
      ...params,
    };
    this.send(JSON.stringify(message));
  }

  /**
   * @description Send an unsubscribe message to the websocket connection.
   *
   */
  unsubscribe(channel: string, params?: object): void {
    const message = {
      type: OutgoingMessageTypes.UNSUBSCRIBE,
      channel,
      ...params,
    };
    this.send(JSON.stringify(message));
  }

  /**
   * @description Subscribe to markets channel.
   *
   */
  subscribeToMarkets(): void {
    const channel = SocketChannels.MARKETS;
    const params = {
      batched: true,
    };
    this.subscribe(channel, params);
  }

  /**
   * @description Unsubscribe from markets channel
   *
   */
  unsubscribeFromMarkets(): void {
    const channel = SocketChannels.MARKETS;
    this.unsubscribe(channel);
  }

  /**
   * @description Subscribe to trade channel
   * for a specific market.
   *
   */
  subscribeToTrades(market: string): void {
    const channel = SocketChannels.TRADES;
    const params = {
      id: market,
      batched: true,
    };
    this.subscribe(channel, params);
  }

  /**
   * @description Unscribed from trade channel
   * for a specific market.
   *
   */
  unsubscribeFromTrades(market: string): void {
    const channel = SocketChannels.TRADES;
    const params = {
      id: market,
    };
    this.unsubscribe(channel, params);
  }

  /**
   * @description Subscribe to orderbook channel
   * for a specific market.
   *
   */
  subscribeToOrderbook(market: string): void {
    const channel = SocketChannels.ORDERBOOK;
    const params = {
      id: market,
      batched: true,
    };
    this.subscribe(channel, params);
  }

  /**
   * @description Unsubscribe from orderbook channel
   * for a specific market.
   */
  unsubscribeFromOrderbook(market: string): void {
    const channel = SocketChannels.ORDERBOOK;
    const params = {
      id: market,
    };
    this.unsubscribe(channel, params);
  }

  /**
   * @description Subscribe to candles channel
   * for a specific market and resolution.
   *
   */
  subscribeToCandles(market: string, resolution: CandlesResolution): void {
    const channel = SocketChannels.CANDLES;
    const params = {
      id: `${market}/${resolution}`,
      batched: true,
    };
    this.subscribe(channel, params);
  }

  /**
   * @description Unsubscribe from candles channel
   * for a specific market and resolution.
   */
  unsubscribeFromCandles(market: string, resolution: CandlesResolution): void {
    const channel = SocketChannels.CANDLES;
    const params = {
      id: `${market}/${resolution}`,
    };
    this.unsubscribe(channel, params);
  }

  /**
   * @description Subscribe to subaccount channel
   * for a specific address and subaccount number.
   */
  subscribeToSubaccount(address: string, subaccountNumber: number): void {
    const channel = SocketChannels.SUBACCOUNTS;
    const subaccountId = `${address}/${subaccountNumber}`;
    const params = {
      id: subaccountId,
    };
    this.subscribe(channel, params);
  }

  /**
   * @description Unsubscribe from subaccount channel
   * for a specific address and subaccount number.
   *
   */
  unsubscribeFromSubaccount(address: string, subaccountNumber: number): void {
    const channel = SocketChannels.SUBACCOUNTS;
    const subaccountId = `${address}/${subaccountNumber}`;
    const params = {
      id: subaccountId,
    };
    this.unsubscribe(channel, params);
  }
}
