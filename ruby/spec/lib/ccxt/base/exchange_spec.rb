require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  describe 'tests from test.js' do
    let(:exchange_config) { { apiKey: ENV['KRAKEN_API_KEY'], secret: ENV['KRAKEN_API_SECRET'] } }
    let(:test_private) { exchange_config[:apiKey] && exchange_config[:secret] }
    let(:exchange) { Ccxt::Kraken.new exchange_config }
    let(:symbol) { 'BTC/EUR' }

    it 'testSymbol' do
      exchange.fetch_markets
      exchange.fetch_currencies
      exchange.fetch_ticker symbol
      exchange.fetch_tickers
      exchange.fetch_ohlcv symbol
      exchange.fetch_trades symbol
      exchange.fetch_order_book symbol
      exchange.fetch_l2_order_book symbol
    end

    it 'loadExchange' do
      exchange.load_markets
      expect(exchange.markets).to be_a Hash
      expect(exchange.symbols).to be_a Array
      expect(exchange.symbols.length).to be > 1
      expect(exchange.symbols.length).to eq exchange.markets.length
    end

    it 'testExchange' do
      next unless test_private

      exchange.fetch_balance
      expect { exchange.fetch_funding_fees }.to raise_error Ccxt::NotSupported
      exchange.fetch_trading_fees
      # exchange.fetch_orders
      exchange.fetch_open_orders
      exchange.fetch_closed_orders
      exchange.fetch_my_trades
      exchange.fetch_ledger
    end
  end
end
