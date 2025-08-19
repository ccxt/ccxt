import { Secp256k1Pubkey } from '@cosmjs/amino';
import { fromBase64 } from '@cosmjs/encoding';
import { Int53 } from '@cosmjs/math';
import {
  EncodeObject,
  encodePubkey,
  isOfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignDoc,
  OfflineSigner,
} from '@cosmjs/proto-signing';
import { SigningStargateClient, StdFee } from '@cosmjs/stargate';
import { TxExtension } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/accountplus/tx';
import { TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Any } from 'cosmjs-types/google/protobuf/any';
import Long from 'long';
import protobuf from 'protobufjs';

import { generateRegistry } from '../lib/registry';
import { TransactionOptions } from '../types';

// Required for encoding and decoding queries that are of type Long.
// Must be done once but since the individal modules should be usable
// - must be set in each module that encounters encoding/decoding Longs.
// Reference: https://github.com/protobufjs/protobuf.js/issues/921
protobuf.util.Long = Long;
protobuf.configure();

export class TransactionSigner {
  readonly address: string;
  readonly stargateSigningClient: SigningStargateClient;
  readonly offlineSigner: OfflineSigner;

  constructor(
    address: string,
    stargateSigningClient: SigningStargateClient,
    offlineSigner: OfflineSigner,
  ) {
    this.address = address;
    this.stargateSigningClient = stargateSigningClient;
    this.offlineSigner = offlineSigner;
  }

  /**
   * @description Get the encoded signed transaction or the promise is rejected if
   * no fee can be set for the transaction.
   *
   * @throws UserError if the fee is undefined.
   * @returns The signed and encoded transaction.
   */
  async signTransaction(
    messages: EncodeObject[],
    transactionOptions: TransactionOptions,
    fee?: StdFee,
    memo: string = '',
    publicKey?: Secp256k1Pubkey,
  ): Promise<Uint8Array> {
    if (!fee) {
      throw new Error('Fee cannot be undefined');
    }

    const registry = generateRegistry();

    // Encode the messages
    const encodedMessages = messages.map((msg) => registry.encodeAsAny(msg));

    // Encode the TxExtension message
    const txExtension = TxExtension.encode({
      selectedAuthenticators: transactionOptions.authenticators ?? [],
    }).finish();

    // Create the non-critical extension message
    const nonCriticalExtensionOptions: Any[] = [
      Any.fromPartial({
        typeUrl: '/dydxprotocol.accountplus.TxExtension',
        value: txExtension,
      }),
    ];

    // Construct the TxBody
    const txBody: TxBody = TxBody.fromPartial({
      messages: encodedMessages,
      memo,
      extensionOptions: [],
      nonCriticalExtensionOptions,
    });

    // Encode the TxBody
    const txBodyBytes = TxBody.encode(txBody).finish();

    if (!publicKey) {
      throw new Error('Public key cannot be undefined');
    }
    const pubkey = encodePubkey(publicKey); // Use the public key of the signer

    const gasLimit = Int53.fromString(String(fee.gas)).toNumber();
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: transactionOptions.sequence }],
      fee.amount,
      gasLimit,
      undefined,
      undefined,
    );

    // Create the SignDoc
    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      transactionOptions.chainId,
      transactionOptions.accountNumber,
    );

    // Use OfflineSigner to sign the transaction
    const signerAddress = this.address;
    if (isOfflineDirectSigner(this.offlineSigner)) {
      const { signed, signature } = await this.offlineSigner.signDirect(signerAddress, signDoc);

      const txRaw = TxRaw.fromPartial({
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [fromBase64(signature.signature)],
      });
      return Uint8Array.from(TxRaw.encode(txRaw).finish());
    } else {
      const rawTx: TxRaw = await this.stargateSigningClient.sign(
        this.address,
        messages,
        fee,
        memo,
        {
          accountNumber: transactionOptions.accountNumber,
          sequence: transactionOptions.sequence,
          chainId: transactionOptions.chainId,
        },
      );
      return Uint8Array.from(TxRaw.encode(rawTx).finish());
    }
  }
}
