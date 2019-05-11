module Ccxt
  class << self
    attr_accessor :exchanges
  end

  def self.[](key)
    if Ccxt.exchanges.include? key
      class_name = key.split('_').collect(&:capitalize).join
      return const_get class_name
    else
      return nil
    end
  end

  @exchanges = ['bitmex', 'kraken'].freeze
end

require 'ccxt/version'
require 'ccxt/base/exchange'
require 'ccxt/bitmex'
require 'ccxt/kraken'
