import ccxt, { Exchange, Ticker } from 'ccxt'
import { useEffect, useState } from 'react';

const exchangeIds = ['binance', 'bitget', 'bybit', 'cryptocom']

export default function Home() {
  const [exchanges, setExchanges] = useState<Record<string, Exchange>>({});
  const [tickers, setTickers] = useState<Record<string, Ticker>>({});
  const [error, setError] = useState<string>();

  useEffect(() => {
    console.log('starting exchanges...');
    const newExchanges: Record<string, Exchange> = exchangeIds.reduce((acc: any, exchangeId) => {
      acc[exchangeId] = new (ccxt.pro as any)[exchangeId];
      return acc;
    }, {});
    setExchanges(newExchanges);
  }, []);

  useEffect(() => {
    const fetchTickers = async () => {
      for (const exchangeId in exchanges) {
        try {
          const newTicker = await exchanges[exchangeId].watchTicker('BTC/USDT');
          setTickers(tickers => ({ ...tickers, [exchangeId]: newTicker }));
        } catch (e) {
          setError(exchangeId + ': ' + JSON.stringify(e) + '\n')
        }
      };
    };
    fetchTickers();
  }, [tickers, exchanges, error]);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <div className="z-10 max-w-5xl w-full font-mono text-sm lg:flex justify-between">
        {exchangeIds.map((exchangeId) => (
          <div key={exchangeId} className="flex-1">
            <h3>{exchangeId}</h3>
            <ul>
              <li>{`last: ${tickers[exchangeId]?.last}`}</li>
              <li>{`high: ${tickers[exchangeId]?.high}`}</li>
              <li>{`low: ${tickers[exchangeId]?.low}`}</li>
              <li>{`bid: ${tickers[exchangeId]?.bid}`}</li>
              <li>{`ask: ${tickers[exchangeId]?.ask}`}</li>
              <li>{`ask volume: ${tickers[exchangeId]?.askVolume}`}</li>
              <li>{`bid volume: ${tickers[exchangeId]?.bidVolume}`}</li>
              <li>{`close: ${tickers[exchangeId]?.close}`}</li>
            </ul>
          </div>
        ))}
      </div>
      <div>
        <h3>Last error:</h3>
        <p>{error ? error : "None"}</p>
      </div>
    </main>
  )
}
