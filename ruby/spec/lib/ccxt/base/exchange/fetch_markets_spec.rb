require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  exchanges.each do |exchange|
    context '#fetch_markets', :vcr do
      subject { exchange.fetch_markets }

      it 'fetches markets from exchange' do
        expect(subject).to be_an Array

        subject.each do |market|
          expect(market).to be_a Hash

          %w[info limits precision].each do |attribute|
            expect(market[attribute]).to be_a Hash
          end

          %w[amount cost price].each do |attribute|
            expect(market['limits'][attribute]).to be_a Hash
            expect(market['limits'][attribute].keys).to eq %w[min max]
          end

          %w[active darkpool].each do |attribute|
            expect(market[attribute]).to be(true).or be(false)
          end

          %w[altname base baseId id quote quoteId symbol].each do |attribute|
            expect(market[attribute]).to be_a String
          end

          %w[maker taker].each do |attribute|
            case exchange.id
            when 'kraken'
              unless market['darkpool']
                expect(market[attribute]).to be_a Numeric
              end
            end
          end
        end
      end
    end
  end
end
