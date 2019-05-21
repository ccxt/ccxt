require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  context '.shalow_extend' do
    subject { Ccxt::Exchange.shallow_extend hash1, hash2 }

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
            'b' => {'first' => 'one', 'second' => 'two'},
            'c' => {'test2' => 222},
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

    it 'merges a list of hashes shallowly' do
      expect(subject).to eq merged_hash
    end
    
    it 'does not mutate the arguments' do
      hash1_original = hash1.dup
      hash2_original = hash2.dup
      result = subject
      expect(hash1).to eq hash1_original
      expect(hash2).to eq hash2_original
    end
    
  end
end
