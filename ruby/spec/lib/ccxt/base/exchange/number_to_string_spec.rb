require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  context '.number_to_string' do
    it 'Converts a number to string' do
      expect(Ccxt::Exchange.number_to_string(-7.8e-7)).to eq '-0.00000078'
      expect(Ccxt::Exchange.number_to_string(7.8e-7)).to eq '0.00000078'
      expect(Ccxt::Exchange.number_to_string(-17.805e-7)).to eq '-0.0000017805'
      expect(Ccxt::Exchange.number_to_string(17.805e-7)).to eq '0.0000017805'
      expect(Ccxt::Exchange.number_to_string(-7.0005e27)).to eq '-7000500000000000000000000000'
      expect(Ccxt::Exchange.number_to_string(7.0005e27)).to eq '7000500000000000000000000000'
      expect(Ccxt::Exchange.number_to_string(-7.9e27)).to eq '-7900000000000000000000000000'
      expect(Ccxt::Exchange.number_to_string(7.9e27)).to eq '7900000000000000000000000000'
      expect(Ccxt::Exchange.number_to_string(-12.345)).to eq '-12.345'
      expect(Ccxt::Exchange.number_to_string(12.345)).to eq '12.345'
      expect(Ccxt::Exchange.number_to_string(0)).to eq '0'
    end
  end
end
