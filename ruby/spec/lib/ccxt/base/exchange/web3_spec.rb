require 'spec_helper'
require 'ccxt'

RSpec.describe Ccxt::Exchange do
  context 'Web3 support' do
    # The expectations are based on examples taken from the https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html
    # for the Web3 library.
    
    it 'has web3' do
      expect(Ccxt::Exchange.has_web3).to eq true
    end
    
    let(:exchange) { Ccxt::Exchange.new }
    let(:private_key) {'0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709'}
    let(:json_keystore) {'{"version":3,"id":"04e9bcbb-96fa-497b-94d1-14df4cd20af6","address":"2c7536e3605d9c16a7a3d7b1898e529396a65c23","crypto":{"ciphertext":"a1c25da3ecde4e6a24f3697251dd15d6208520efc84ad97397e906e6df24d251","cipherparams":{"iv":"2885df2b63f7ef247d753c82fa20038a"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10","n":262144,"r":8,"p":1},"mac":"b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6"}}'}
    let(:expected_address) {'0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'}
    let(:password) {'test!'}
    let(:expected_result) {'0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318'}

    it 'decrypts account from private key' do
      expect(exchange.decrypt_account_from_private_key(private_key)).to eq expected_address
    end
    
    it "decrypts account from JSON" do
      expect(exchange.decrypt_account(json_keystore, password)).to eq expected_result
    end
  end
end
