import { Secp256k1Pubkey, StdFee, encodeSecp256k1Pubkey } from '@cosmjs/amino';
import {
  AccountData,
  DirectSecp256k1HdWallet,
  DirectSecp256k1Wallet,
  EncodeObject,
  OfflineSigner,
} from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import Long from 'long';
import protobuf from 'protobufjs';

import { generateRegistry } from '../lib/registry';
import { TransactionOptions } from '../types';
import { TransactionSigner } from './signer';

// Required for encoding and decoding queries that are of type Long.
protobuf.util.Long = Long;
protobuf.configure();

export default class LocalWallet {
  accounts?: AccountData[];
  address?: string;
  pubKey?: Secp256k1Pubkey;
  signer?: TransactionSigner;
  offlineSigner?: OfflineSigner;

  static async fromOfflineSigner(signer: OfflineSigner): Promise<LocalWallet> {
    const wallet = new LocalWallet();
    await wallet.setSigner(signer);
    return wallet;
  }

  // extend fromPrivateKey in ccxt
  static async fromPrivateKey (privateKey: Uint8Array, prefix: string): Promise<LocalWallet> {
    const wallet = new LocalWallet();
    await wallet.setPrivateKey(privateKey, prefix);
    return wallet;
  }

  async setPrivateKey(privateKey: Uint8Array, prefix: string): Promise<void> {
    const signer = await DirectSecp256k1Wallet.fromKey(privateKey, prefix);
    return this.setSigner(signer);
  }

  static async fromMnemonic(mnemonic: string, prefix?: string): Promise<LocalWallet> {
    const wallet = new LocalWallet();
    await wallet.setMnemonic(mnemonic, prefix);
    return wallet;
  }

  async setSigner(signer: OfflineSigner): Promise<void> {
    this.offlineSigner = signer;
    const stargateClient = await SigningStargateClient.offline(signer, {
      registry: generateRegistry(),
    });
    const accountData = await signer.getAccounts();
    const firstAccount = accountData[0]!;
    this.accounts = [...accountData];
    this.address = firstAccount.address;
    this.pubKey = encodeSecp256k1Pubkey(firstAccount.pubkey);
    this.signer = new TransactionSigner(this.address, stargateClient, signer);
  }

  async setMnemonic(mnemonic: string, prefix?: string): Promise<void> {
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
    return this.setSigner(signer);
  }

  public async signTransaction(
    messages: EncodeObject[],
    transactionOptions: TransactionOptions,
    fee?: StdFee,
    memo: string = '',
  ): Promise<Uint8Array> {
    return this.signer!.signTransaction(messages, transactionOptions, fee, memo, this.pubKey);
  }
}
