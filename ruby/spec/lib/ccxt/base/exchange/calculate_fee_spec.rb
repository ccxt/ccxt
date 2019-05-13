require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  context '#calculate_fee' do
    subject { exchange.calculate_fee symbol, order_type, side, amount, price, taker_or_maker, params }

    let(:exchange) { Ccxt::Exchange.new id: 'mock', markets: {symbol => market} }

    let(:symbol) { 'FOO/BAR' }
    let(:order_type) { 'limit' }
    let(:side) { 'sell' }
    let(:amount) { 10.00 }
    let(:price) { 100.00 }
    let(:params) { {} }

    let(:taker_fee) { 0.0025 }
    let(:maker_fee) { 0.0010 }
    let(:market) do
      {
        'id' => 'foobar',
        'symbol' => symbol,
        'base' => 'FOO',
        'quote' => 'BAR',
        'taker' => taker_fee,
        'maker' => maker_fee,
        'precision' => {
          'base' => 8,
          'price' => 1
        }
      }
    end

    context 'taker' do
      let(:taker_or_maker) { 'taker' }
      let(:calculated_fees) do
        {
          "cost" => 2.5,
          "currency" => "BAR",
          "rate" => 0.0025,
          "type" => "taker",
        }
      end

      it 'calculates fees' do
        expect(subject).to eq calculated_fees
      end
    end

    context 'taker' do
      let(:taker_or_maker) { 'maker' }
      let(:calculated_fees) do
        {
          "cost" => 1.0,
          "currency" => "BAR",
          "rate" => 0.0010,
          "type" => "maker",
        }
      end

      it 'calculates fees' do
        expect(subject).to eq calculated_fees
      end
    end
  end
end
