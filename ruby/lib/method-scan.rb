#!/usr/bin/env ruby

# utility script to scan the python files for use of WEB3 methods.

WEB3_METHODS = %w(
  requiresWeb3
  check_required_dependencies
  eth_decimals
  eth_unit
  fromWei
  toWei
  decryptAccountFromJSON
  decryptAccount
  decryptAccountFromPrivateKey
  soliditySha3
  soliditySha256
  solidityTypes
  solidityValues
  getZeroExOrderHash2
  getZeroExOrderHash
  remove_0x_prefix
  getZeroExOrderHashV2
  signZeroExOrder
  signZeroExOrderV2
  _convertECSignatureToSignatureHex
  hashMessage
  signHash
  signMessage
  oath
  totp
)

method_calls = {}
WEB3_METHODS.each do |method|
  method_calls[method] = []
end

Dir['../../python/ccxt/*.py'].each do |filename|
  exchange = File.basename(filename, '.py')
  next if exchange == '__init__'
  data = File.read(filename)
  WEB3_METHODS.each do |method|
    unless data.scan(method).empty?
      method_calls[method] << exchange
    end
  end
end

puts "| Method | Exchanges |"
puts "| ------ | --------- |"
WEB3_METHODS.each do |method|
  puts "|#{method}|#{method_calls[method].join(',')}|"
end