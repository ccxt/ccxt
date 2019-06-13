require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange, :vcr do
  exchanges.each do |exchange|
    context exchange.id do
      let(:test_private) { exchange.apiKey && exchange.secret }
      let(:symbol) { 'BTC/EUR' }

      it 'fetches public GET endpoints' do
        exchange.fetch_markets
        exchange.fetch_currencies
        exchange.fetch_ticker symbol
        exchange.fetch_tickers
        exchange.fetch_ohlcv symbol
        exchange.fetch_trades symbol
        exchange.fetch_order_book symbol
        exchange.fetch_l2_order_book symbol
      end

      context '#load_markets' do
        it 'loads market data into @markets and @symbols' do
          exchange.load_markets
          expect(exchange.markets).to be_a Hash
          expect(exchange.symbols).to be_a Array
          expect(exchange.symbols.length).to be > 1
          expect(exchange.symbols.length).to eq exchange.markets.length
        end
      end

      it 'fetches private GET endpoints' do
        next unless test_private

        exchange.fetch_balance
        expect { exchange.fetch_funding_fees }.to raise_error Ccxt::NotSupported
        exchange.fetch_trading_fees
        expect { exchange.fetch_orders }.to raise_error Ccxt::NotSupported
        exchange.fetch_open_orders
        exchange.fetch_closed_orders
        exchange.fetch_my_trades
        exchange.fetch_ledger
      end
    end
  end
end
