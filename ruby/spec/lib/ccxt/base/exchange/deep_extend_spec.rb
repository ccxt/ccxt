require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  context '.deep_extend' do
    subject { Ccxt::Exchange.deep_extend hash1, hash2 }

    let(:hash1) do
      {
        'a' => 1,
        'b' => 2,
        'd' => {
            'a' => 1,
            'b' => [],
            'c' => {'test1' => 123, 'test2' => 321}},
        'f' => 5,
        'g' => 123,
        'i' => 321,
        'j' => [1, 2],
      }
    end

    let(:hash2) do
      {
        'b' => 3,
        'c' => 5,
        'd' => {
            'b' => {'first' => 'one', 'second' => 'two'},
            'c' => {'test2' => 222}},
        'e' => {'one' => 1, 'two' => 2},
        'f' => [{'foo' => 'bar'}],
        'g' => nil,
        'h' => /abc/,
        'i' => nil,
        'j' => [3, 4]
      }
    end

    let(:merged_hash) do
      {
        'a' => 1,
        'b' => 3,
        'd' => {
          'a' => 1,
          'b' => {'first' => 'one', 'second' => 'two'},
          'c' => {'test1' => 123, 'test2' => 222}
        },
        'f' => [{'foo' => 'bar'}],
        'g' => nil,
        'c' => 5,
        'e' => {'one' => 1, 'two' => 2},
        'h' => /abc/,
        'i' => nil,
        'j' => [3, 4]
      }
    end

    it 'merges a list of hashes deeply' do
      expect(subject).to eq merged_hash
    end
  end
end
