/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'circle.cctp.v1';

/**
 * Copyright (c) 2023, © Circle Internet Financial, LTD.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** TODO add comments */
export interface MsgUpdateOwner {
  from: string;
  newOwner: string;
}

export interface MsgUpdateOwnerResponse {}

export interface MsgUpdateAttesterManager {
  from: string;
  newAttesterManager: string;
}

export interface MsgUpdateAttesterManagerResponse {}

export interface MsgUpdateTokenController {
  from: string;
  newTokenController: string;
}

export interface MsgUpdateTokenControllerResponse {}

export interface MsgUpdatePauser {
  from: string;
  newPauser: string;
}

export interface MsgUpdatePauserResponse {}

export interface MsgAcceptOwner {
  from: string;
}

export interface MsgAcceptOwnerResponse {}

export interface MsgEnableAttester {
  from: string;
  attester: string;
}

export interface MsgEnableAttesterResponse {}

export interface MsgDisableAttester {
  from: string;
  attester: string;
}

export interface MsgDisableAttesterResponse {}

export interface MsgPauseBurningAndMinting {
  from: string;
}

export interface MsgPauseBurningAndMintingResponse {}

export interface MsgUnpauseBurningAndMinting {
  from: string;
}

export interface MsgUnpauseBurningAndMintingResponse {}

export interface MsgPauseSendingAndReceivingMessages {
  from: string;
}

export interface MsgPauseSendingAndReceivingMessagesResponse {}

export interface MsgUnpauseSendingAndReceivingMessages {
  from: string;
}

export interface MsgUnpauseSendingAndReceivingMessagesResponse {}

export interface MsgUpdateMaxMessageBodySize {
  from: string;
  messageSize: Long;
}

export interface MsgUpdateMaxMessageBodySizeResponse {}

export interface MsgSetMaxBurnAmountPerMessage {
  from: string;
  localToken: string;
  amount: string;
}

export interface MsgSetMaxBurnAmountPerMessageResponse {}

export interface MsgDepositForBurn {
  from: string;
  amount: string;
  destinationDomain: number;
  mintRecipient: Uint8Array;
  burnToken: string;
}

export interface MsgDepositForBurnResponse {
  nonce: Long;
}

export interface MsgDepositForBurnWithCaller {
  from: string;
  amount: string;
  destinationDomain: number;
  mintRecipient: Uint8Array;
  burnToken: string;
  destinationCaller: Uint8Array;
}

export interface MsgDepositForBurnWithCallerResponse {
  nonce: Long;
}

export interface MsgReplaceDepositForBurn {
  from: string;
  originalMessage: Uint8Array;
  originalAttestation: Uint8Array;
  newDestinationCaller: Uint8Array;
  newMintRecipient: Uint8Array;
}

export interface MsgReplaceDepositForBurnResponse {}

export interface MsgReceiveMessage {
  from: string;
  message: Uint8Array;
  attestation: Uint8Array;
}

export interface MsgReceiveMessageResponse {
  success: boolean;
}

export interface MsgSendMessage {
  from: string;
  destinationDomain: number;
  recipient: Uint8Array;
  messageBody: Uint8Array;
}

export interface MsgSendMessageResponse {
  nonce: Long;
}

export interface MsgSendMessageWithCaller {
  from: string;
  destinationDomain: number;
  recipient: Uint8Array;
  messageBody: Uint8Array;
  destinationCaller: Uint8Array;
}

export interface MsgSendMessageWithCallerResponse {
  nonce: Long;
}

export interface MsgReplaceMessage {
  from: string;
  originalMessage: Uint8Array;
  originalAttestation: Uint8Array;
  newMessageBody: Uint8Array;
  newDestinationCaller: Uint8Array;
}

export interface MsgReplaceMessageResponse {}

export interface MsgUpdateSignatureThreshold {
  from: string;
  amount: number;
}

export interface MsgUpdateSignatureThresholdResponse {}

export interface MsgLinkTokenPair {
  from: string;
  remoteDomain: number;
  remoteToken: Uint8Array;
  localToken: string;
}

export interface MsgLinkTokenPairResponse {}

export interface MsgUnlinkTokenPair {
  from: string;
  remoteDomain: number;
  remoteToken: Uint8Array;
  localToken: string;
}

export interface MsgUnlinkTokenPairResponse {}

export interface MsgAddRemoteTokenMessenger {
  from: string;
  domainId: number;
  address: Uint8Array;
}

export interface MsgAddRemoteTokenMessengerResponse {}

export interface MsgRemoveRemoteTokenMessenger {
  from: string;
  domainId: number;
}

export interface MsgRemoveRemoteTokenMessengerResponse {}

function createBaseMsgUpdateOwner(): MsgUpdateOwner {
  return { from: '', newOwner: '' };
}

export const MsgUpdateOwner = {
  encode(message: MsgUpdateOwner, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.newOwner !== '') {
      writer.uint32(18).string(message.newOwner);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateOwner {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateOwner();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.newOwner = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateOwner {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      newOwner: isSet(object.newOwner) ? gt.String(object.newOwner) : '',
    };
  },

  toJSON(message: MsgUpdateOwner): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.newOwner !== '') {
      obj.newOwner = message.newOwner;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateOwner>, I>>(base?: I): MsgUpdateOwner {
    return MsgUpdateOwner.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateOwner>, I>>(object: I): MsgUpdateOwner {
    const message = createBaseMsgUpdateOwner();
    message.from = object.from ?? '';
    message.newOwner = object.newOwner ?? '';
    return message;
  },
};

function createBaseMsgUpdateOwnerResponse(): MsgUpdateOwnerResponse {
  return {};
}

export const MsgUpdateOwnerResponse = {
  encode(_: MsgUpdateOwnerResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateOwnerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateOwnerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUpdateOwnerResponse {
    return {};
  },

  toJSON(_: MsgUpdateOwnerResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateOwnerResponse>, I>>(
    base?: I,
  ): MsgUpdateOwnerResponse {
    return MsgUpdateOwnerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateOwnerResponse>, I>>(
    _: I,
  ): MsgUpdateOwnerResponse {
    const message = createBaseMsgUpdateOwnerResponse();
    return message;
  },
};

function createBaseMsgUpdateAttesterManager(): MsgUpdateAttesterManager {
  return { from: '', newAttesterManager: '' };
}

export const MsgUpdateAttesterManager = {
  encode(message: MsgUpdateAttesterManager, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.newAttesterManager !== '') {
      writer.uint32(18).string(message.newAttesterManager);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateAttesterManager {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateAttesterManager();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.newAttesterManager = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateAttesterManager {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      newAttesterManager: isSet(object.newAttesterManager)
        ? gt.String(object.newAttesterManager)
        : '',
    };
  },

  toJSON(message: MsgUpdateAttesterManager): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.newAttesterManager !== '') {
      obj.newAttesterManager = message.newAttesterManager;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateAttesterManager>, I>>(
    base?: I,
  ): MsgUpdateAttesterManager {
    return MsgUpdateAttesterManager.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateAttesterManager>, I>>(
    object: I,
  ): MsgUpdateAttesterManager {
    const message = createBaseMsgUpdateAttesterManager();
    message.from = object.from ?? '';
    message.newAttesterManager = object.newAttesterManager ?? '';
    return message;
  },
};

function createBaseMsgUpdateAttesterManagerResponse(): MsgUpdateAttesterManagerResponse {
  return {};
}

export const MsgUpdateAttesterManagerResponse = {
  encode(
    _: MsgUpdateAttesterManagerResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateAttesterManagerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateAttesterManagerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUpdateAttesterManagerResponse {
    return {};
  },

  toJSON(_: MsgUpdateAttesterManagerResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateAttesterManagerResponse>, I>>(
    base?: I,
  ): MsgUpdateAttesterManagerResponse {
    return MsgUpdateAttesterManagerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateAttesterManagerResponse>, I>>(
    _: I,
  ): MsgUpdateAttesterManagerResponse {
    const message = createBaseMsgUpdateAttesterManagerResponse();
    return message;
  },
};

function createBaseMsgUpdateTokenController(): MsgUpdateTokenController {
  return { from: '', newTokenController: '' };
}

export const MsgUpdateTokenController = {
  encode(message: MsgUpdateTokenController, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.newTokenController !== '') {
      writer.uint32(18).string(message.newTokenController);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateTokenController {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateTokenController();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.newTokenController = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateTokenController {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      newTokenController: isSet(object.newTokenController)
        ? gt.String(object.newTokenController)
        : '',
    };
  },

  toJSON(message: MsgUpdateTokenController): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.newTokenController !== '') {
      obj.newTokenController = message.newTokenController;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateTokenController>, I>>(
    base?: I,
  ): MsgUpdateTokenController {
    return MsgUpdateTokenController.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateTokenController>, I>>(
    object: I,
  ): MsgUpdateTokenController {
    const message = createBaseMsgUpdateTokenController();
    message.from = object.from ?? '';
    message.newTokenController = object.newTokenController ?? '';
    return message;
  },
};

function createBaseMsgUpdateTokenControllerResponse(): MsgUpdateTokenControllerResponse {
  return {};
}

export const MsgUpdateTokenControllerResponse = {
  encode(
    _: MsgUpdateTokenControllerResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateTokenControllerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateTokenControllerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUpdateTokenControllerResponse {
    return {};
  },

  toJSON(_: MsgUpdateTokenControllerResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateTokenControllerResponse>, I>>(
    base?: I,
  ): MsgUpdateTokenControllerResponse {
    return MsgUpdateTokenControllerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateTokenControllerResponse>, I>>(
    _: I,
  ): MsgUpdateTokenControllerResponse {
    const message = createBaseMsgUpdateTokenControllerResponse();
    return message;
  },
};

function createBaseMsgUpdatePauser(): MsgUpdatePauser {
  return { from: '', newPauser: '' };
}

export const MsgUpdatePauser = {
  encode(message: MsgUpdatePauser, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.newPauser !== '') {
      writer.uint32(18).string(message.newPauser);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdatePauser {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdatePauser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.newPauser = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUpdatePauser {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      newPauser: isSet(object.newPauser) ? gt.String(object.newPauser) : '',
    };
  },

  toJSON(message: MsgUpdatePauser): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.newPauser !== '') {
      obj.newPauser = message.newPauser;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdatePauser>, I>>(base?: I): MsgUpdatePauser {
    return MsgUpdatePauser.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdatePauser>, I>>(object: I): MsgUpdatePauser {
    const message = createBaseMsgUpdatePauser();
    message.from = object.from ?? '';
    message.newPauser = object.newPauser ?? '';
    return message;
  },
};

function createBaseMsgUpdatePauserResponse(): MsgUpdatePauserResponse {
  return {};
}

export const MsgUpdatePauserResponse = {
  encode(_: MsgUpdatePauserResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdatePauserResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdatePauserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUpdatePauserResponse {
    return {};
  },

  toJSON(_: MsgUpdatePauserResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdatePauserResponse>, I>>(
    base?: I,
  ): MsgUpdatePauserResponse {
    return MsgUpdatePauserResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdatePauserResponse>, I>>(
    _: I,
  ): MsgUpdatePauserResponse {
    const message = createBaseMsgUpdatePauserResponse();
    return message;
  },
};

function createBaseMsgAcceptOwner(): MsgAcceptOwner {
  return { from: '' };
}

export const MsgAcceptOwner = {
  encode(message: MsgAcceptOwner, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAcceptOwner {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAcceptOwner();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgAcceptOwner {
    return { from: isSet(object.from) ? gt.String(object.from) : '' };
  },

  toJSON(message: MsgAcceptOwner): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgAcceptOwner>, I>>(base?: I): MsgAcceptOwner {
    return MsgAcceptOwner.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgAcceptOwner>, I>>(object: I): MsgAcceptOwner {
    const message = createBaseMsgAcceptOwner();
    message.from = object.from ?? '';
    return message;
  },
};

function createBaseMsgAcceptOwnerResponse(): MsgAcceptOwnerResponse {
  return {};
}

export const MsgAcceptOwnerResponse = {
  encode(_: MsgAcceptOwnerResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAcceptOwnerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAcceptOwnerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgAcceptOwnerResponse {
    return {};
  },

  toJSON(_: MsgAcceptOwnerResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgAcceptOwnerResponse>, I>>(
    base?: I,
  ): MsgAcceptOwnerResponse {
    return MsgAcceptOwnerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgAcceptOwnerResponse>, I>>(
    _: I,
  ): MsgAcceptOwnerResponse {
    const message = createBaseMsgAcceptOwnerResponse();
    return message;
  },
};

function createBaseMsgEnableAttester(): MsgEnableAttester {
  return { from: '', attester: '' };
}

export const MsgEnableAttester = {
  encode(message: MsgEnableAttester, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.attester !== '') {
      writer.uint32(18).string(message.attester);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgEnableAttester {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEnableAttester();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.attester = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgEnableAttester {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      attester: isSet(object.attester) ? gt.String(object.attester) : '',
    };
  },

  toJSON(message: MsgEnableAttester): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.attester !== '') {
      obj.attester = message.attester;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgEnableAttester>, I>>(base?: I): MsgEnableAttester {
    return MsgEnableAttester.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgEnableAttester>, I>>(object: I): MsgEnableAttester {
    const message = createBaseMsgEnableAttester();
    message.from = object.from ?? '';
    message.attester = object.attester ?? '';
    return message;
  },
};

function createBaseMsgEnableAttesterResponse(): MsgEnableAttesterResponse {
  return {};
}

export const MsgEnableAttesterResponse = {
  encode(_: MsgEnableAttesterResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgEnableAttesterResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEnableAttesterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgEnableAttesterResponse {
    return {};
  },

  toJSON(_: MsgEnableAttesterResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgEnableAttesterResponse>, I>>(
    base?: I,
  ): MsgEnableAttesterResponse {
    return MsgEnableAttesterResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgEnableAttesterResponse>, I>>(
    _: I,
  ): MsgEnableAttesterResponse {
    const message = createBaseMsgEnableAttesterResponse();
    return message;
  },
};

function createBaseMsgDisableAttester(): MsgDisableAttester {
  return { from: '', attester: '' };
}

export const MsgDisableAttester = {
  encode(message: MsgDisableAttester, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.attester !== '') {
      writer.uint32(18).string(message.attester);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDisableAttester {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDisableAttester();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.attester = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgDisableAttester {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      attester: isSet(object.attester) ? gt.String(object.attester) : '',
    };
  },

  toJSON(message: MsgDisableAttester): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.attester !== '') {
      obj.attester = message.attester;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgDisableAttester>, I>>(base?: I): MsgDisableAttester {
    return MsgDisableAttester.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgDisableAttester>, I>>(object: I): MsgDisableAttester {
    const message = createBaseMsgDisableAttester();
    message.from = object.from ?? '';
    message.attester = object.attester ?? '';
    return message;
  },
};

function createBaseMsgDisableAttesterResponse(): MsgDisableAttesterResponse {
  return {};
}

export const MsgDisableAttesterResponse = {
  encode(_: MsgDisableAttesterResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDisableAttesterResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDisableAttesterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgDisableAttesterResponse {
    return {};
  },

  toJSON(_: MsgDisableAttesterResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgDisableAttesterResponse>, I>>(
    base?: I,
  ): MsgDisableAttesterResponse {
    return MsgDisableAttesterResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgDisableAttesterResponse>, I>>(
    _: I,
  ): MsgDisableAttesterResponse {
    const message = createBaseMsgDisableAttesterResponse();
    return message;
  },
};

function createBaseMsgPauseBurningAndMinting(): MsgPauseBurningAndMinting {
  return { from: '' };
}

export const MsgPauseBurningAndMinting = {
  encode(message: MsgPauseBurningAndMinting, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgPauseBurningAndMinting {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseBurningAndMinting();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgPauseBurningAndMinting {
    return { from: isSet(object.from) ? gt.String(object.from) : '' };
  },

  toJSON(message: MsgPauseBurningAndMinting): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgPauseBurningAndMinting>, I>>(
    base?: I,
  ): MsgPauseBurningAndMinting {
    return MsgPauseBurningAndMinting.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgPauseBurningAndMinting>, I>>(
    object: I,
  ): MsgPauseBurningAndMinting {
    const message = createBaseMsgPauseBurningAndMinting();
    message.from = object.from ?? '';
    return message;
  },
};

function createBaseMsgPauseBurningAndMintingResponse(): MsgPauseBurningAndMintingResponse {
  return {};
}

export const MsgPauseBurningAndMintingResponse = {
  encode(
    _: MsgPauseBurningAndMintingResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgPauseBurningAndMintingResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseBurningAndMintingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgPauseBurningAndMintingResponse {
    return {};
  },

  toJSON(_: MsgPauseBurningAndMintingResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgPauseBurningAndMintingResponse>, I>>(
    base?: I,
  ): MsgPauseBurningAndMintingResponse {
    return MsgPauseBurningAndMintingResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgPauseBurningAndMintingResponse>, I>>(
    _: I,
  ): MsgPauseBurningAndMintingResponse {
    const message = createBaseMsgPauseBurningAndMintingResponse();
    return message;
  },
};

function createBaseMsgUnpauseBurningAndMinting(): MsgUnpauseBurningAndMinting {
  return { from: '' };
}

export const MsgUnpauseBurningAndMinting = {
  encode(
    message: MsgUnpauseBurningAndMinting,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnpauseBurningAndMinting {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseBurningAndMinting();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUnpauseBurningAndMinting {
    return { from: isSet(object.from) ? gt.String(object.from) : '' };
  },

  toJSON(message: MsgUnpauseBurningAndMinting): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUnpauseBurningAndMinting>, I>>(
    base?: I,
  ): MsgUnpauseBurningAndMinting {
    return MsgUnpauseBurningAndMinting.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUnpauseBurningAndMinting>, I>>(
    object: I,
  ): MsgUnpauseBurningAndMinting {
    const message = createBaseMsgUnpauseBurningAndMinting();
    message.from = object.from ?? '';
    return message;
  },
};

function createBaseMsgUnpauseBurningAndMintingResponse(): MsgUnpauseBurningAndMintingResponse {
  return {};
}

export const MsgUnpauseBurningAndMintingResponse = {
  encode(
    _: MsgUnpauseBurningAndMintingResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnpauseBurningAndMintingResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseBurningAndMintingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUnpauseBurningAndMintingResponse {
    return {};
  },

  toJSON(_: MsgUnpauseBurningAndMintingResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUnpauseBurningAndMintingResponse>, I>>(
    base?: I,
  ): MsgUnpauseBurningAndMintingResponse {
    return MsgUnpauseBurningAndMintingResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUnpauseBurningAndMintingResponse>, I>>(
    _: I,
  ): MsgUnpauseBurningAndMintingResponse {
    const message = createBaseMsgUnpauseBurningAndMintingResponse();
    return message;
  },
};

function createBaseMsgPauseSendingAndReceivingMessages(): MsgPauseSendingAndReceivingMessages {
  return { from: '' };
}

export const MsgPauseSendingAndReceivingMessages = {
  encode(
    message: MsgPauseSendingAndReceivingMessages,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgPauseSendingAndReceivingMessages {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseSendingAndReceivingMessages();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgPauseSendingAndReceivingMessages {
    return { from: isSet(object.from) ? gt.String(object.from) : '' };
  },

  toJSON(message: MsgPauseSendingAndReceivingMessages): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgPauseSendingAndReceivingMessages>, I>>(
    base?: I,
  ): MsgPauseSendingAndReceivingMessages {
    return MsgPauseSendingAndReceivingMessages.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgPauseSendingAndReceivingMessages>, I>>(
    object: I,
  ): MsgPauseSendingAndReceivingMessages {
    const message = createBaseMsgPauseSendingAndReceivingMessages();
    message.from = object.from ?? '';
    return message;
  },
};

function createBaseMsgPauseSendingAndReceivingMessagesResponse(): MsgPauseSendingAndReceivingMessagesResponse {
  return {};
}

export const MsgPauseSendingAndReceivingMessagesResponse = {
  encode(
    _: MsgPauseSendingAndReceivingMessagesResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgPauseSendingAndReceivingMessagesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPauseSendingAndReceivingMessagesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgPauseSendingAndReceivingMessagesResponse {
    return {};
  },

  toJSON(_: MsgPauseSendingAndReceivingMessagesResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgPauseSendingAndReceivingMessagesResponse>, I>>(
    base?: I,
  ): MsgPauseSendingAndReceivingMessagesResponse {
    return MsgPauseSendingAndReceivingMessagesResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgPauseSendingAndReceivingMessagesResponse>, I>>(
    _: I,
  ): MsgPauseSendingAndReceivingMessagesResponse {
    const message = createBaseMsgPauseSendingAndReceivingMessagesResponse();
    return message;
  },
};

function createBaseMsgUnpauseSendingAndReceivingMessages(): MsgUnpauseSendingAndReceivingMessages {
  return { from: '' };
}

export const MsgUnpauseSendingAndReceivingMessages = {
  encode(
    message: MsgUnpauseSendingAndReceivingMessages,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnpauseSendingAndReceivingMessages {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseSendingAndReceivingMessages();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUnpauseSendingAndReceivingMessages {
    return { from: isSet(object.from) ? gt.String(object.from) : '' };
  },

  toJSON(message: MsgUnpauseSendingAndReceivingMessages): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUnpauseSendingAndReceivingMessages>, I>>(
    base?: I,
  ): MsgUnpauseSendingAndReceivingMessages {
    return MsgUnpauseSendingAndReceivingMessages.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUnpauseSendingAndReceivingMessages>, I>>(
    object: I,
  ): MsgUnpauseSendingAndReceivingMessages {
    const message = createBaseMsgUnpauseSendingAndReceivingMessages();
    message.from = object.from ?? '';
    return message;
  },
};

function createBaseMsgUnpauseSendingAndReceivingMessagesResponse(): MsgUnpauseSendingAndReceivingMessagesResponse {
  return {};
}

export const MsgUnpauseSendingAndReceivingMessagesResponse = {
  encode(
    _: MsgUnpauseSendingAndReceivingMessagesResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MsgUnpauseSendingAndReceivingMessagesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnpauseSendingAndReceivingMessagesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUnpauseSendingAndReceivingMessagesResponse {
    return {};
  },

  toJSON(_: MsgUnpauseSendingAndReceivingMessagesResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUnpauseSendingAndReceivingMessagesResponse>, I>>(
    base?: I,
  ): MsgUnpauseSendingAndReceivingMessagesResponse {
    return MsgUnpauseSendingAndReceivingMessagesResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUnpauseSendingAndReceivingMessagesResponse>, I>>(
    _: I,
  ): MsgUnpauseSendingAndReceivingMessagesResponse {
    const message = createBaseMsgUnpauseSendingAndReceivingMessagesResponse();
    return message;
  },
};

function createBaseMsgUpdateMaxMessageBodySize(): MsgUpdateMaxMessageBodySize {
  return { from: '', messageSize: Long.UZERO };
}

export const MsgUpdateMaxMessageBodySize = {
  encode(
    message: MsgUpdateMaxMessageBodySize,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (!message.messageSize.isZero()) {
      writer.uint32(16).uint64(message.messageSize);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateMaxMessageBodySize {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateMaxMessageBodySize();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.messageSize = reader.uint64() as Long;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateMaxMessageBodySize {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      messageSize: isSet(object.messageSize) ? Long.fromValue(object.messageSize) : Long.UZERO,
    };
  },

  toJSON(message: MsgUpdateMaxMessageBodySize): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (!message.messageSize.isZero()) {
      obj.messageSize = (message.messageSize || Long.UZERO).toString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateMaxMessageBodySize>, I>>(
    base?: I,
  ): MsgUpdateMaxMessageBodySize {
    return MsgUpdateMaxMessageBodySize.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateMaxMessageBodySize>, I>>(
    object: I,
  ): MsgUpdateMaxMessageBodySize {
    const message = createBaseMsgUpdateMaxMessageBodySize();
    message.from = object.from ?? '';
    message.messageSize =
      object.messageSize !== undefined && object.messageSize !== null
        ? Long.fromValue(object.messageSize)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgUpdateMaxMessageBodySizeResponse(): MsgUpdateMaxMessageBodySizeResponse {
  return {};
}

export const MsgUpdateMaxMessageBodySizeResponse = {
  encode(
    _: MsgUpdateMaxMessageBodySizeResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateMaxMessageBodySizeResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateMaxMessageBodySizeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUpdateMaxMessageBodySizeResponse {
    return {};
  },

  toJSON(_: MsgUpdateMaxMessageBodySizeResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateMaxMessageBodySizeResponse>, I>>(
    base?: I,
  ): MsgUpdateMaxMessageBodySizeResponse {
    return MsgUpdateMaxMessageBodySizeResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateMaxMessageBodySizeResponse>, I>>(
    _: I,
  ): MsgUpdateMaxMessageBodySizeResponse {
    const message = createBaseMsgUpdateMaxMessageBodySizeResponse();
    return message;
  },
};

function createBaseMsgSetMaxBurnAmountPerMessage(): MsgSetMaxBurnAmountPerMessage {
  return { from: '', localToken: '', amount: '' };
}

export const MsgSetMaxBurnAmountPerMessage = {
  encode(
    message: MsgSetMaxBurnAmountPerMessage,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.localToken !== '') {
      writer.uint32(18).string(message.localToken);
    }
    if (message.amount !== '') {
      writer.uint32(26).string(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetMaxBurnAmountPerMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetMaxBurnAmountPerMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.localToken = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.amount = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgSetMaxBurnAmountPerMessage {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      localToken: isSet(object.localToken) ? gt.String(object.localToken) : '',
      amount: isSet(object.amount) ? gt.String(object.amount) : '',
    };
  },

  toJSON(message: MsgSetMaxBurnAmountPerMessage): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.localToken !== '') {
      obj.localToken = message.localToken;
    }
    if (message.amount !== '') {
      obj.amount = message.amount;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSetMaxBurnAmountPerMessage>, I>>(
    base?: I,
  ): MsgSetMaxBurnAmountPerMessage {
    return MsgSetMaxBurnAmountPerMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSetMaxBurnAmountPerMessage>, I>>(
    object: I,
  ): MsgSetMaxBurnAmountPerMessage {
    const message = createBaseMsgSetMaxBurnAmountPerMessage();
    message.from = object.from ?? '';
    message.localToken = object.localToken ?? '';
    message.amount = object.amount ?? '';
    return message;
  },
};

function createBaseMsgSetMaxBurnAmountPerMessageResponse(): MsgSetMaxBurnAmountPerMessageResponse {
  return {};
}

export const MsgSetMaxBurnAmountPerMessageResponse = {
  encode(
    _: MsgSetMaxBurnAmountPerMessageResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetMaxBurnAmountPerMessageResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetMaxBurnAmountPerMessageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgSetMaxBurnAmountPerMessageResponse {
    return {};
  },

  toJSON(_: MsgSetMaxBurnAmountPerMessageResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSetMaxBurnAmountPerMessageResponse>, I>>(
    base?: I,
  ): MsgSetMaxBurnAmountPerMessageResponse {
    return MsgSetMaxBurnAmountPerMessageResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSetMaxBurnAmountPerMessageResponse>, I>>(
    _: I,
  ): MsgSetMaxBurnAmountPerMessageResponse {
    const message = createBaseMsgSetMaxBurnAmountPerMessageResponse();
    return message;
  },
};

function createBaseMsgDepositForBurn(): MsgDepositForBurn {
  return {
    from: '',
    amount: '',
    destinationDomain: 0,
    mintRecipient: new Uint8Array(0),
    burnToken: '',
  };
}

export const MsgDepositForBurn = {
  encode(message: MsgDepositForBurn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.destinationDomain !== 0) {
      writer.uint32(24).uint32(message.destinationDomain);
    }
    if (message.mintRecipient.length !== 0) {
      writer.uint32(34).bytes(message.mintRecipient);
    }
    if (message.burnToken !== '') {
      writer.uint32(42).string(message.burnToken);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositForBurn {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositForBurn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.amount = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.destinationDomain = reader.uint32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.mintRecipient = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.burnToken = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgDepositForBurn {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      amount: isSet(object.amount) ? gt.String(object.amount) : '',
      destinationDomain: isSet(object.destinationDomain) ? gt.Number(object.destinationDomain) : 0,
      mintRecipient: isSet(object.mintRecipient)
        ? bytesFromBase64(object.mintRecipient)
        : new Uint8Array(0),
      burnToken: isSet(object.burnToken) ? gt.String(object.burnToken) : '',
    };
  },

  toJSON(message: MsgDepositForBurn): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.amount !== '') {
      obj.amount = message.amount;
    }
    if (message.destinationDomain !== 0) {
      obj.destinationDomain = Math.round(message.destinationDomain);
    }
    if (message.mintRecipient.length !== 0) {
      obj.mintRecipient = base64FromBytes(message.mintRecipient);
    }
    if (message.burnToken !== '') {
      obj.burnToken = message.burnToken;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgDepositForBurn>, I>>(base?: I): MsgDepositForBurn {
    return MsgDepositForBurn.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgDepositForBurn>, I>>(object: I): MsgDepositForBurn {
    const message = createBaseMsgDepositForBurn();
    message.from = object.from ?? '';
    message.amount = object.amount ?? '';
    message.destinationDomain = object.destinationDomain ?? 0;
    message.mintRecipient = object.mintRecipient ?? new Uint8Array(0);
    message.burnToken = object.burnToken ?? '';
    return message;
  },
};

function createBaseMsgDepositForBurnResponse(): MsgDepositForBurnResponse {
  return { nonce: Long.UZERO };
}

export const MsgDepositForBurnResponse = {
  encode(message: MsgDepositForBurnResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.nonce.isZero()) {
      writer.uint32(8).uint64(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositForBurnResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositForBurnResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.nonce = reader.uint64() as Long;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgDepositForBurnResponse {
    return { nonce: isSet(object.nonce) ? Long.fromValue(object.nonce) : Long.UZERO };
  },

  toJSON(message: MsgDepositForBurnResponse): unknown {
    const obj: any = {};
    if (!message.nonce.isZero()) {
      obj.nonce = (message.nonce || Long.UZERO).toString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgDepositForBurnResponse>, I>>(
    base?: I,
  ): MsgDepositForBurnResponse {
    return MsgDepositForBurnResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgDepositForBurnResponse>, I>>(
    object: I,
  ): MsgDepositForBurnResponse {
    const message = createBaseMsgDepositForBurnResponse();
    message.nonce =
      object.nonce !== undefined && object.nonce !== null
        ? Long.fromValue(object.nonce)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgDepositForBurnWithCaller(): MsgDepositForBurnWithCaller {
  return {
    from: '',
    amount: '',
    destinationDomain: 0,
    mintRecipient: new Uint8Array(0),
    burnToken: '',
    destinationCaller: new Uint8Array(0),
  };
}

export const MsgDepositForBurnWithCaller = {
  encode(
    message: MsgDepositForBurnWithCaller,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.destinationDomain !== 0) {
      writer.uint32(24).uint32(message.destinationDomain);
    }
    if (message.mintRecipient.length !== 0) {
      writer.uint32(34).bytes(message.mintRecipient);
    }
    if (message.burnToken !== '') {
      writer.uint32(42).string(message.burnToken);
    }
    if (message.destinationCaller.length !== 0) {
      writer.uint32(50).bytes(message.destinationCaller);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositForBurnWithCaller {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositForBurnWithCaller();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.amount = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.destinationDomain = reader.uint32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.mintRecipient = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.burnToken = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.destinationCaller = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgDepositForBurnWithCaller {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      amount: isSet(object.amount) ? gt.String(object.amount) : '',
      destinationDomain: isSet(object.destinationDomain) ? gt.Number(object.destinationDomain) : 0,
      mintRecipient: isSet(object.mintRecipient)
        ? bytesFromBase64(object.mintRecipient)
        : new Uint8Array(0),
      burnToken: isSet(object.burnToken) ? gt.String(object.burnToken) : '',
      destinationCaller: isSet(object.destinationCaller)
        ? bytesFromBase64(object.destinationCaller)
        : new Uint8Array(0),
    };
  },

  toJSON(message: MsgDepositForBurnWithCaller): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.amount !== '') {
      obj.amount = message.amount;
    }
    if (message.destinationDomain !== 0) {
      obj.destinationDomain = Math.round(message.destinationDomain);
    }
    if (message.mintRecipient.length !== 0) {
      obj.mintRecipient = base64FromBytes(message.mintRecipient);
    }
    if (message.burnToken !== '') {
      obj.burnToken = message.burnToken;
    }
    if (message.destinationCaller.length !== 0) {
      obj.destinationCaller = base64FromBytes(message.destinationCaller);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgDepositForBurnWithCaller>, I>>(
    base?: I,
  ): MsgDepositForBurnWithCaller {
    return MsgDepositForBurnWithCaller.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgDepositForBurnWithCaller>, I>>(
    object: I,
  ): MsgDepositForBurnWithCaller {
    const message = createBaseMsgDepositForBurnWithCaller();
    message.from = object.from ?? '';
    message.amount = object.amount ?? '';
    message.destinationDomain = object.destinationDomain ?? 0;
    message.mintRecipient = object.mintRecipient ?? new Uint8Array(0);
    message.burnToken = object.burnToken ?? '';
    message.destinationCaller = object.destinationCaller ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgDepositForBurnWithCallerResponse(): MsgDepositForBurnWithCallerResponse {
  return { nonce: Long.UZERO };
}

export const MsgDepositForBurnWithCallerResponse = {
  encode(
    message: MsgDepositForBurnWithCallerResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.nonce.isZero()) {
      writer.uint32(8).uint64(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositForBurnWithCallerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositForBurnWithCallerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.nonce = reader.uint64() as Long;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgDepositForBurnWithCallerResponse {
    return { nonce: isSet(object.nonce) ? Long.fromValue(object.nonce) : Long.UZERO };
  },

  toJSON(message: MsgDepositForBurnWithCallerResponse): unknown {
    const obj: any = {};
    if (!message.nonce.isZero()) {
      obj.nonce = (message.nonce || Long.UZERO).toString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgDepositForBurnWithCallerResponse>, I>>(
    base?: I,
  ): MsgDepositForBurnWithCallerResponse {
    return MsgDepositForBurnWithCallerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgDepositForBurnWithCallerResponse>, I>>(
    object: I,
  ): MsgDepositForBurnWithCallerResponse {
    const message = createBaseMsgDepositForBurnWithCallerResponse();
    message.nonce =
      object.nonce !== undefined && object.nonce !== null
        ? Long.fromValue(object.nonce)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgReplaceDepositForBurn(): MsgReplaceDepositForBurn {
  return {
    from: '',
    originalMessage: new Uint8Array(0),
    originalAttestation: new Uint8Array(0),
    newDestinationCaller: new Uint8Array(0),
    newMintRecipient: new Uint8Array(0),
  };
}

export const MsgReplaceDepositForBurn = {
  encode(message: MsgReplaceDepositForBurn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.originalMessage.length !== 0) {
      writer.uint32(18).bytes(message.originalMessage);
    }
    if (message.originalAttestation.length !== 0) {
      writer.uint32(26).bytes(message.originalAttestation);
    }
    if (message.newDestinationCaller.length !== 0) {
      writer.uint32(34).bytes(message.newDestinationCaller);
    }
    if (message.newMintRecipient.length !== 0) {
      writer.uint32(42).bytes(message.newMintRecipient);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReplaceDepositForBurn {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReplaceDepositForBurn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.originalMessage = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.originalAttestation = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.newDestinationCaller = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.newMintRecipient = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgReplaceDepositForBurn {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      originalMessage: isSet(object.originalMessage)
        ? bytesFromBase64(object.originalMessage)
        : new Uint8Array(0),
      originalAttestation: isSet(object.originalAttestation)
        ? bytesFromBase64(object.originalAttestation)
        : new Uint8Array(0),
      newDestinationCaller: isSet(object.newDestinationCaller)
        ? bytesFromBase64(object.newDestinationCaller)
        : new Uint8Array(0),
      newMintRecipient: isSet(object.newMintRecipient)
        ? bytesFromBase64(object.newMintRecipient)
        : new Uint8Array(0),
    };
  },

  toJSON(message: MsgReplaceDepositForBurn): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.originalMessage.length !== 0) {
      obj.originalMessage = base64FromBytes(message.originalMessage);
    }
    if (message.originalAttestation.length !== 0) {
      obj.originalAttestation = base64FromBytes(message.originalAttestation);
    }
    if (message.newDestinationCaller.length !== 0) {
      obj.newDestinationCaller = base64FromBytes(message.newDestinationCaller);
    }
    if (message.newMintRecipient.length !== 0) {
      obj.newMintRecipient = base64FromBytes(message.newMintRecipient);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgReplaceDepositForBurn>, I>>(
    base?: I,
  ): MsgReplaceDepositForBurn {
    return MsgReplaceDepositForBurn.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgReplaceDepositForBurn>, I>>(
    object: I,
  ): MsgReplaceDepositForBurn {
    const message = createBaseMsgReplaceDepositForBurn();
    message.from = object.from ?? '';
    message.originalMessage = object.originalMessage ?? new Uint8Array(0);
    message.originalAttestation = object.originalAttestation ?? new Uint8Array(0);
    message.newDestinationCaller = object.newDestinationCaller ?? new Uint8Array(0);
    message.newMintRecipient = object.newMintRecipient ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgReplaceDepositForBurnResponse(): MsgReplaceDepositForBurnResponse {
  return {};
}

export const MsgReplaceDepositForBurnResponse = {
  encode(
    _: MsgReplaceDepositForBurnResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReplaceDepositForBurnResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReplaceDepositForBurnResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgReplaceDepositForBurnResponse {
    return {};
  },

  toJSON(_: MsgReplaceDepositForBurnResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgReplaceDepositForBurnResponse>, I>>(
    base?: I,
  ): MsgReplaceDepositForBurnResponse {
    return MsgReplaceDepositForBurnResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgReplaceDepositForBurnResponse>, I>>(
    _: I,
  ): MsgReplaceDepositForBurnResponse {
    const message = createBaseMsgReplaceDepositForBurnResponse();
    return message;
  },
};

function createBaseMsgReceiveMessage(): MsgReceiveMessage {
  return { from: '', message: new Uint8Array(0), attestation: new Uint8Array(0) };
}

export const MsgReceiveMessage = {
  encode(message: MsgReceiveMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.message.length !== 0) {
      writer.uint32(18).bytes(message.message);
    }
    if (message.attestation.length !== 0) {
      writer.uint32(26).bytes(message.attestation);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReceiveMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReceiveMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.message = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.attestation = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgReceiveMessage {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      message: isSet(object.message) ? bytesFromBase64(object.message) : new Uint8Array(0),
      attestation: isSet(object.attestation)
        ? bytesFromBase64(object.attestation)
        : new Uint8Array(0),
    };
  },

  toJSON(message: MsgReceiveMessage): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.message.length !== 0) {
      obj.message = base64FromBytes(message.message);
    }
    if (message.attestation.length !== 0) {
      obj.attestation = base64FromBytes(message.attestation);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgReceiveMessage>, I>>(base?: I): MsgReceiveMessage {
    return MsgReceiveMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgReceiveMessage>, I>>(object: I): MsgReceiveMessage {
    const message = createBaseMsgReceiveMessage();
    message.from = object.from ?? '';
    message.message = object.message ?? new Uint8Array(0);
    message.attestation = object.attestation ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgReceiveMessageResponse(): MsgReceiveMessageResponse {
  return { success: false };
}

export const MsgReceiveMessageResponse = {
  encode(message: MsgReceiveMessageResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReceiveMessageResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReceiveMessageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.success = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgReceiveMessageResponse {
    return { success: isSet(object.success) ? gt.Boolean(object.success) : false };
  },

  toJSON(message: MsgReceiveMessageResponse): unknown {
    const obj: any = {};
    if (message.success === true) {
      obj.success = message.success;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgReceiveMessageResponse>, I>>(
    base?: I,
  ): MsgReceiveMessageResponse {
    return MsgReceiveMessageResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgReceiveMessageResponse>, I>>(
    object: I,
  ): MsgReceiveMessageResponse {
    const message = createBaseMsgReceiveMessageResponse();
    message.success = object.success ?? false;
    return message;
  },
};

function createBaseMsgSendMessage(): MsgSendMessage {
  return {
    from: '',
    destinationDomain: 0,
    recipient: new Uint8Array(0),
    messageBody: new Uint8Array(0),
  };
}

export const MsgSendMessage = {
  encode(message: MsgSendMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.destinationDomain !== 0) {
      writer.uint32(16).uint32(message.destinationDomain);
    }
    if (message.recipient.length !== 0) {
      writer.uint32(26).bytes(message.recipient);
    }
    if (message.messageBody.length !== 0) {
      writer.uint32(34).bytes(message.messageBody);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.destinationDomain = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.recipient = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.messageBody = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgSendMessage {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      destinationDomain: isSet(object.destinationDomain) ? gt.Number(object.destinationDomain) : 0,
      recipient: isSet(object.recipient) ? bytesFromBase64(object.recipient) : new Uint8Array(0),
      messageBody: isSet(object.messageBody)
        ? bytesFromBase64(object.messageBody)
        : new Uint8Array(0),
    };
  },

  toJSON(message: MsgSendMessage): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.destinationDomain !== 0) {
      obj.destinationDomain = Math.round(message.destinationDomain);
    }
    if (message.recipient.length !== 0) {
      obj.recipient = base64FromBytes(message.recipient);
    }
    if (message.messageBody.length !== 0) {
      obj.messageBody = base64FromBytes(message.messageBody);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendMessage>, I>>(base?: I): MsgSendMessage {
    return MsgSendMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSendMessage>, I>>(object: I): MsgSendMessage {
    const message = createBaseMsgSendMessage();
    message.from = object.from ?? '';
    message.destinationDomain = object.destinationDomain ?? 0;
    message.recipient = object.recipient ?? new Uint8Array(0);
    message.messageBody = object.messageBody ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgSendMessageResponse(): MsgSendMessageResponse {
  return { nonce: Long.UZERO };
}

export const MsgSendMessageResponse = {
  encode(message: MsgSendMessageResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.nonce.isZero()) {
      writer.uint32(8).uint64(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendMessageResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendMessageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.nonce = reader.uint64() as Long;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgSendMessageResponse {
    return { nonce: isSet(object.nonce) ? Long.fromValue(object.nonce) : Long.UZERO };
  },

  toJSON(message: MsgSendMessageResponse): unknown {
    const obj: any = {};
    if (!message.nonce.isZero()) {
      obj.nonce = (message.nonce || Long.UZERO).toString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendMessageResponse>, I>>(
    base?: I,
  ): MsgSendMessageResponse {
    return MsgSendMessageResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSendMessageResponse>, I>>(
    object: I,
  ): MsgSendMessageResponse {
    const message = createBaseMsgSendMessageResponse();
    message.nonce =
      object.nonce !== undefined && object.nonce !== null
        ? Long.fromValue(object.nonce)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgSendMessageWithCaller(): MsgSendMessageWithCaller {
  return {
    from: '',
    destinationDomain: 0,
    recipient: new Uint8Array(0),
    messageBody: new Uint8Array(0),
    destinationCaller: new Uint8Array(0),
  };
}

export const MsgSendMessageWithCaller = {
  encode(message: MsgSendMessageWithCaller, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.destinationDomain !== 0) {
      writer.uint32(16).uint32(message.destinationDomain);
    }
    if (message.recipient.length !== 0) {
      writer.uint32(26).bytes(message.recipient);
    }
    if (message.messageBody.length !== 0) {
      writer.uint32(34).bytes(message.messageBody);
    }
    if (message.destinationCaller.length !== 0) {
      writer.uint32(42).bytes(message.destinationCaller);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendMessageWithCaller {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendMessageWithCaller();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.destinationDomain = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.recipient = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.messageBody = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.destinationCaller = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgSendMessageWithCaller {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      destinationDomain: isSet(object.destinationDomain) ? gt.Number(object.destinationDomain) : 0,
      recipient: isSet(object.recipient) ? bytesFromBase64(object.recipient) : new Uint8Array(0),
      messageBody: isSet(object.messageBody)
        ? bytesFromBase64(object.messageBody)
        : new Uint8Array(0),
      destinationCaller: isSet(object.destinationCaller)
        ? bytesFromBase64(object.destinationCaller)
        : new Uint8Array(0),
    };
  },

  toJSON(message: MsgSendMessageWithCaller): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.destinationDomain !== 0) {
      obj.destinationDomain = Math.round(message.destinationDomain);
    }
    if (message.recipient.length !== 0) {
      obj.recipient = base64FromBytes(message.recipient);
    }
    if (message.messageBody.length !== 0) {
      obj.messageBody = base64FromBytes(message.messageBody);
    }
    if (message.destinationCaller.length !== 0) {
      obj.destinationCaller = base64FromBytes(message.destinationCaller);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendMessageWithCaller>, I>>(
    base?: I,
  ): MsgSendMessageWithCaller {
    return MsgSendMessageWithCaller.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSendMessageWithCaller>, I>>(
    object: I,
  ): MsgSendMessageWithCaller {
    const message = createBaseMsgSendMessageWithCaller();
    message.from = object.from ?? '';
    message.destinationDomain = object.destinationDomain ?? 0;
    message.recipient = object.recipient ?? new Uint8Array(0);
    message.messageBody = object.messageBody ?? new Uint8Array(0);
    message.destinationCaller = object.destinationCaller ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgSendMessageWithCallerResponse(): MsgSendMessageWithCallerResponse {
  return { nonce: Long.UZERO };
}

export const MsgSendMessageWithCallerResponse = {
  encode(
    message: MsgSendMessageWithCallerResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (!message.nonce.isZero()) {
      writer.uint32(8).uint64(message.nonce);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendMessageWithCallerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendMessageWithCallerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.nonce = reader.uint64() as Long;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgSendMessageWithCallerResponse {
    return { nonce: isSet(object.nonce) ? Long.fromValue(object.nonce) : Long.UZERO };
  },

  toJSON(message: MsgSendMessageWithCallerResponse): unknown {
    const obj: any = {};
    if (!message.nonce.isZero()) {
      obj.nonce = (message.nonce || Long.UZERO).toString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSendMessageWithCallerResponse>, I>>(
    base?: I,
  ): MsgSendMessageWithCallerResponse {
    return MsgSendMessageWithCallerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSendMessageWithCallerResponse>, I>>(
    object: I,
  ): MsgSendMessageWithCallerResponse {
    const message = createBaseMsgSendMessageWithCallerResponse();
    message.nonce =
      object.nonce !== undefined && object.nonce !== null
        ? Long.fromValue(object.nonce)
        : Long.UZERO;
    return message;
  },
};

function createBaseMsgReplaceMessage(): MsgReplaceMessage {
  return {
    from: '',
    originalMessage: new Uint8Array(0),
    originalAttestation: new Uint8Array(0),
    newMessageBody: new Uint8Array(0),
    newDestinationCaller: new Uint8Array(0),
  };
}

export const MsgReplaceMessage = {
  encode(message: MsgReplaceMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.originalMessage.length !== 0) {
      writer.uint32(18).bytes(message.originalMessage);
    }
    if (message.originalAttestation.length !== 0) {
      writer.uint32(26).bytes(message.originalAttestation);
    }
    if (message.newMessageBody.length !== 0) {
      writer.uint32(34).bytes(message.newMessageBody);
    }
    if (message.newDestinationCaller.length !== 0) {
      writer.uint32(42).bytes(message.newDestinationCaller);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReplaceMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReplaceMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.originalMessage = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.originalAttestation = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.newMessageBody = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.newDestinationCaller = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgReplaceMessage {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      originalMessage: isSet(object.originalMessage)
        ? bytesFromBase64(object.originalMessage)
        : new Uint8Array(0),
      originalAttestation: isSet(object.originalAttestation)
        ? bytesFromBase64(object.originalAttestation)
        : new Uint8Array(0),
      newMessageBody: isSet(object.newMessageBody)
        ? bytesFromBase64(object.newMessageBody)
        : new Uint8Array(0),
      newDestinationCaller: isSet(object.newDestinationCaller)
        ? bytesFromBase64(object.newDestinationCaller)
        : new Uint8Array(0),
    };
  },

  toJSON(message: MsgReplaceMessage): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.originalMessage.length !== 0) {
      obj.originalMessage = base64FromBytes(message.originalMessage);
    }
    if (message.originalAttestation.length !== 0) {
      obj.originalAttestation = base64FromBytes(message.originalAttestation);
    }
    if (message.newMessageBody.length !== 0) {
      obj.newMessageBody = base64FromBytes(message.newMessageBody);
    }
    if (message.newDestinationCaller.length !== 0) {
      obj.newDestinationCaller = base64FromBytes(message.newDestinationCaller);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgReplaceMessage>, I>>(base?: I): MsgReplaceMessage {
    return MsgReplaceMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgReplaceMessage>, I>>(object: I): MsgReplaceMessage {
    const message = createBaseMsgReplaceMessage();
    message.from = object.from ?? '';
    message.originalMessage = object.originalMessage ?? new Uint8Array(0);
    message.originalAttestation = object.originalAttestation ?? new Uint8Array(0);
    message.newMessageBody = object.newMessageBody ?? new Uint8Array(0);
    message.newDestinationCaller = object.newDestinationCaller ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgReplaceMessageResponse(): MsgReplaceMessageResponse {
  return {};
}

export const MsgReplaceMessageResponse = {
  encode(_: MsgReplaceMessageResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgReplaceMessageResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReplaceMessageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgReplaceMessageResponse {
    return {};
  },

  toJSON(_: MsgReplaceMessageResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgReplaceMessageResponse>, I>>(
    base?: I,
  ): MsgReplaceMessageResponse {
    return MsgReplaceMessageResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgReplaceMessageResponse>, I>>(
    _: I,
  ): MsgReplaceMessageResponse {
    const message = createBaseMsgReplaceMessageResponse();
    return message;
  },
};

function createBaseMsgUpdateSignatureThreshold(): MsgUpdateSignatureThreshold {
  return { from: '', amount: 0 };
}

export const MsgUpdateSignatureThreshold = {
  encode(
    message: MsgUpdateSignatureThreshold,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.amount !== 0) {
      writer.uint32(16).uint32(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateSignatureThreshold {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateSignatureThreshold();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.amount = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateSignatureThreshold {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      amount: isSet(object.amount) ? gt.Number(object.amount) : 0,
    };
  },

  toJSON(message: MsgUpdateSignatureThreshold): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.amount !== 0) {
      obj.amount = Math.round(message.amount);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateSignatureThreshold>, I>>(
    base?: I,
  ): MsgUpdateSignatureThreshold {
    return MsgUpdateSignatureThreshold.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateSignatureThreshold>, I>>(
    object: I,
  ): MsgUpdateSignatureThreshold {
    const message = createBaseMsgUpdateSignatureThreshold();
    message.from = object.from ?? '';
    message.amount = object.amount ?? 0;
    return message;
  },
};

function createBaseMsgUpdateSignatureThresholdResponse(): MsgUpdateSignatureThresholdResponse {
  return {};
}

export const MsgUpdateSignatureThresholdResponse = {
  encode(
    _: MsgUpdateSignatureThresholdResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateSignatureThresholdResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateSignatureThresholdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUpdateSignatureThresholdResponse {
    return {};
  },

  toJSON(_: MsgUpdateSignatureThresholdResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUpdateSignatureThresholdResponse>, I>>(
    base?: I,
  ): MsgUpdateSignatureThresholdResponse {
    return MsgUpdateSignatureThresholdResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUpdateSignatureThresholdResponse>, I>>(
    _: I,
  ): MsgUpdateSignatureThresholdResponse {
    const message = createBaseMsgUpdateSignatureThresholdResponse();
    return message;
  },
};

function createBaseMsgLinkTokenPair(): MsgLinkTokenPair {
  return { from: '', remoteDomain: 0, remoteToken: new Uint8Array(0), localToken: '' };
}

export const MsgLinkTokenPair = {
  encode(message: MsgLinkTokenPair, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.remoteDomain !== 0) {
      writer.uint32(16).uint32(message.remoteDomain);
    }
    if (message.remoteToken.length !== 0) {
      writer.uint32(26).bytes(message.remoteToken);
    }
    if (message.localToken !== '') {
      writer.uint32(34).string(message.localToken);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLinkTokenPair {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLinkTokenPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.remoteDomain = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.remoteToken = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.localToken = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgLinkTokenPair {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      remoteDomain: isSet(object.remoteDomain) ? gt.Number(object.remoteDomain) : 0,
      remoteToken: isSet(object.remoteToken)
        ? bytesFromBase64(object.remoteToken)
        : new Uint8Array(0),
      localToken: isSet(object.localToken) ? gt.String(object.localToken) : '',
    };
  },

  toJSON(message: MsgLinkTokenPair): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.remoteDomain !== 0) {
      obj.remoteDomain = Math.round(message.remoteDomain);
    }
    if (message.remoteToken.length !== 0) {
      obj.remoteToken = base64FromBytes(message.remoteToken);
    }
    if (message.localToken !== '') {
      obj.localToken = message.localToken;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgLinkTokenPair>, I>>(base?: I): MsgLinkTokenPair {
    return MsgLinkTokenPair.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgLinkTokenPair>, I>>(object: I): MsgLinkTokenPair {
    const message = createBaseMsgLinkTokenPair();
    message.from = object.from ?? '';
    message.remoteDomain = object.remoteDomain ?? 0;
    message.remoteToken = object.remoteToken ?? new Uint8Array(0);
    message.localToken = object.localToken ?? '';
    return message;
  },
};

function createBaseMsgLinkTokenPairResponse(): MsgLinkTokenPairResponse {
  return {};
}

export const MsgLinkTokenPairResponse = {
  encode(_: MsgLinkTokenPairResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLinkTokenPairResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLinkTokenPairResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgLinkTokenPairResponse {
    return {};
  },

  toJSON(_: MsgLinkTokenPairResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgLinkTokenPairResponse>, I>>(
    base?: I,
  ): MsgLinkTokenPairResponse {
    return MsgLinkTokenPairResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgLinkTokenPairResponse>, I>>(
    _: I,
  ): MsgLinkTokenPairResponse {
    const message = createBaseMsgLinkTokenPairResponse();
    return message;
  },
};

function createBaseMsgUnlinkTokenPair(): MsgUnlinkTokenPair {
  return { from: '', remoteDomain: 0, remoteToken: new Uint8Array(0), localToken: '' };
}

export const MsgUnlinkTokenPair = {
  encode(message: MsgUnlinkTokenPair, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.remoteDomain !== 0) {
      writer.uint32(16).uint32(message.remoteDomain);
    }
    if (message.remoteToken.length !== 0) {
      writer.uint32(26).bytes(message.remoteToken);
    }
    if (message.localToken !== '') {
      writer.uint32(34).string(message.localToken);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnlinkTokenPair {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnlinkTokenPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.remoteDomain = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.remoteToken = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.localToken = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgUnlinkTokenPair {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      remoteDomain: isSet(object.remoteDomain) ? gt.Number(object.remoteDomain) : 0,
      remoteToken: isSet(object.remoteToken)
        ? bytesFromBase64(object.remoteToken)
        : new Uint8Array(0),
      localToken: isSet(object.localToken) ? gt.String(object.localToken) : '',
    };
  },

  toJSON(message: MsgUnlinkTokenPair): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.remoteDomain !== 0) {
      obj.remoteDomain = Math.round(message.remoteDomain);
    }
    if (message.remoteToken.length !== 0) {
      obj.remoteToken = base64FromBytes(message.remoteToken);
    }
    if (message.localToken !== '') {
      obj.localToken = message.localToken;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUnlinkTokenPair>, I>>(base?: I): MsgUnlinkTokenPair {
    return MsgUnlinkTokenPair.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUnlinkTokenPair>, I>>(object: I): MsgUnlinkTokenPair {
    const message = createBaseMsgUnlinkTokenPair();
    message.from = object.from ?? '';
    message.remoteDomain = object.remoteDomain ?? 0;
    message.remoteToken = object.remoteToken ?? new Uint8Array(0);
    message.localToken = object.localToken ?? '';
    return message;
  },
};

function createBaseMsgUnlinkTokenPairResponse(): MsgUnlinkTokenPairResponse {
  return {};
}

export const MsgUnlinkTokenPairResponse = {
  encode(_: MsgUnlinkTokenPairResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUnlinkTokenPairResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnlinkTokenPairResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgUnlinkTokenPairResponse {
    return {};
  },

  toJSON(_: MsgUnlinkTokenPairResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgUnlinkTokenPairResponse>, I>>(
    base?: I,
  ): MsgUnlinkTokenPairResponse {
    return MsgUnlinkTokenPairResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgUnlinkTokenPairResponse>, I>>(
    _: I,
  ): MsgUnlinkTokenPairResponse {
    const message = createBaseMsgUnlinkTokenPairResponse();
    return message;
  },
};

function createBaseMsgAddRemoteTokenMessenger(): MsgAddRemoteTokenMessenger {
  return { from: '', domainId: 0, address: new Uint8Array(0) };
}

export const MsgAddRemoteTokenMessenger = {
  encode(
    message: MsgAddRemoteTokenMessenger,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.domainId !== 0) {
      writer.uint32(16).uint32(message.domainId);
    }
    if (message.address.length !== 0) {
      writer.uint32(26).bytes(message.address);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddRemoteTokenMessenger {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddRemoteTokenMessenger();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.domainId = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.address = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgAddRemoteTokenMessenger {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      domainId: isSet(object.domainId) ? gt.Number(object.domainId) : 0,
      address: isSet(object.address) ? bytesFromBase64(object.address) : new Uint8Array(0),
    };
  },

  toJSON(message: MsgAddRemoteTokenMessenger): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.domainId !== 0) {
      obj.domainId = Math.round(message.domainId);
    }
    if (message.address.length !== 0) {
      obj.address = base64FromBytes(message.address);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgAddRemoteTokenMessenger>, I>>(
    base?: I,
  ): MsgAddRemoteTokenMessenger {
    return MsgAddRemoteTokenMessenger.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgAddRemoteTokenMessenger>, I>>(
    object: I,
  ): MsgAddRemoteTokenMessenger {
    const message = createBaseMsgAddRemoteTokenMessenger();
    message.from = object.from ?? '';
    message.domainId = object.domainId ?? 0;
    message.address = object.address ?? new Uint8Array(0);
    return message;
  },
};

function createBaseMsgAddRemoteTokenMessengerResponse(): MsgAddRemoteTokenMessengerResponse {
  return {};
}

export const MsgAddRemoteTokenMessengerResponse = {
  encode(
    _: MsgAddRemoteTokenMessengerResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddRemoteTokenMessengerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddRemoteTokenMessengerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgAddRemoteTokenMessengerResponse {
    return {};
  },

  toJSON(_: MsgAddRemoteTokenMessengerResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgAddRemoteTokenMessengerResponse>, I>>(
    base?: I,
  ): MsgAddRemoteTokenMessengerResponse {
    return MsgAddRemoteTokenMessengerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgAddRemoteTokenMessengerResponse>, I>>(
    _: I,
  ): MsgAddRemoteTokenMessengerResponse {
    const message = createBaseMsgAddRemoteTokenMessengerResponse();
    return message;
  },
};

function createBaseMsgRemoveRemoteTokenMessenger(): MsgRemoveRemoteTokenMessenger {
  return { from: '', domainId: 0 };
}

export const MsgRemoveRemoteTokenMessenger = {
  encode(
    message: MsgRemoveRemoteTokenMessenger,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.from !== '') {
      writer.uint32(10).string(message.from);
    }
    if (message.domainId !== 0) {
      writer.uint32(16).uint32(message.domainId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRemoveRemoteTokenMessenger {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveRemoteTokenMessenger();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.from = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.domainId = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgRemoveRemoteTokenMessenger {
    return {
      from: isSet(object.from) ? gt.String(object.from) : '',
      domainId: isSet(object.domainId) ? gt.Number(object.domainId) : 0,
    };
  },

  toJSON(message: MsgRemoveRemoteTokenMessenger): unknown {
    const obj: any = {};
    if (message.from !== '') {
      obj.from = message.from;
    }
    if (message.domainId !== 0) {
      obj.domainId = Math.round(message.domainId);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgRemoveRemoteTokenMessenger>, I>>(
    base?: I,
  ): MsgRemoveRemoteTokenMessenger {
    return MsgRemoveRemoteTokenMessenger.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgRemoveRemoteTokenMessenger>, I>>(
    object: I,
  ): MsgRemoveRemoteTokenMessenger {
    const message = createBaseMsgRemoveRemoteTokenMessenger();
    message.from = object.from ?? '';
    message.domainId = object.domainId ?? 0;
    return message;
  },
};

function createBaseMsgRemoveRemoteTokenMessengerResponse(): MsgRemoveRemoteTokenMessengerResponse {
  return {};
}

export const MsgRemoveRemoteTokenMessengerResponse = {
  encode(
    _: MsgRemoveRemoteTokenMessengerResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRemoveRemoteTokenMessengerResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveRemoteTokenMessengerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): MsgRemoveRemoteTokenMessengerResponse {
    return {};
  },

  toJSON(_: MsgRemoveRemoteTokenMessengerResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgRemoveRemoteTokenMessengerResponse>, I>>(
    base?: I,
  ): MsgRemoveRemoteTokenMessengerResponse {
    return MsgRemoveRemoteTokenMessengerResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgRemoveRemoteTokenMessengerResponse>, I>>(
    _: I,
  ): MsgRemoveRemoteTokenMessengerResponse {
    const message = createBaseMsgRemoveRemoteTokenMessengerResponse();
    return message;
  },
};

/** Msg defines the Msg service. */
export interface Msg {
  AcceptOwner(request: MsgAcceptOwner): Promise<MsgAcceptOwnerResponse>;
  AddRemoteTokenMessenger(
    request: MsgAddRemoteTokenMessenger,
  ): Promise<MsgAddRemoteTokenMessengerResponse>;
  DepositForBurn(request: MsgDepositForBurn): Promise<MsgDepositForBurnResponse>;
  DepositForBurnWithCaller(
    request: MsgDepositForBurnWithCaller,
  ): Promise<MsgDepositForBurnWithCallerResponse>;
  DisableAttester(request: MsgDisableAttester): Promise<MsgDisableAttesterResponse>;
  EnableAttester(request: MsgEnableAttester): Promise<MsgEnableAttesterResponse>;
  LinkTokenPair(request: MsgLinkTokenPair): Promise<MsgLinkTokenPairResponse>;
  PauseBurningAndMinting(
    request: MsgPauseBurningAndMinting,
  ): Promise<MsgPauseBurningAndMintingResponse>;
  PauseSendingAndReceivingMessages(
    request: MsgPauseSendingAndReceivingMessages,
  ): Promise<MsgPauseSendingAndReceivingMessagesResponse>;
  ReceiveMessage(request: MsgReceiveMessage): Promise<MsgReceiveMessageResponse>;
  RemoveRemoteTokenMessenger(
    request: MsgRemoveRemoteTokenMessenger,
  ): Promise<MsgRemoveRemoteTokenMessengerResponse>;
  ReplaceDepositForBurn(
    request: MsgReplaceDepositForBurn,
  ): Promise<MsgReplaceDepositForBurnResponse>;
  ReplaceMessage(request: MsgReplaceMessage): Promise<MsgReplaceMessageResponse>;
  SendMessage(request: MsgSendMessage): Promise<MsgSendMessageResponse>;
  SendMessageWithCaller(
    request: MsgSendMessageWithCaller,
  ): Promise<MsgSendMessageWithCallerResponse>;
  UnlinkTokenPair(request: MsgUnlinkTokenPair): Promise<MsgUnlinkTokenPairResponse>;
  UnpauseBurningAndMinting(
    request: MsgUnpauseBurningAndMinting,
  ): Promise<MsgUnpauseBurningAndMintingResponse>;
  UnpauseSendingAndReceivingMessages(
    request: MsgUnpauseSendingAndReceivingMessages,
  ): Promise<MsgUnpauseSendingAndReceivingMessagesResponse>;
  UpdateOwner(request: MsgUpdateOwner): Promise<MsgUpdateOwnerResponse>;
  UpdateAttesterManager(
    request: MsgUpdateAttesterManager,
  ): Promise<MsgUpdateAttesterManagerResponse>;
  UpdateTokenController(
    request: MsgUpdateTokenController,
  ): Promise<MsgUpdateTokenControllerResponse>;
  UpdatePauser(request: MsgUpdatePauser): Promise<MsgUpdatePauserResponse>;
  UpdateMaxMessageBodySize(
    request: MsgUpdateMaxMessageBodySize,
  ): Promise<MsgUpdateMaxMessageBodySizeResponse>;
  SetMaxBurnAmountPerMessage(
    request: MsgSetMaxBurnAmountPerMessage,
  ): Promise<MsgSetMaxBurnAmountPerMessageResponse>;
  UpdateSignatureThreshold(
    request: MsgUpdateSignatureThreshold,
  ): Promise<MsgUpdateSignatureThresholdResponse>;
}

export const MsgServiceName = 'circle.cctp.v1.Msg';
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || MsgServiceName;
    this.rpc = rpc;
    this.AcceptOwner = this.AcceptOwner.bind(this);
    this.AddRemoteTokenMessenger = this.AddRemoteTokenMessenger.bind(this);
    this.DepositForBurn = this.DepositForBurn.bind(this);
    this.DepositForBurnWithCaller = this.DepositForBurnWithCaller.bind(this);
    this.DisableAttester = this.DisableAttester.bind(this);
    this.EnableAttester = this.EnableAttester.bind(this);
    this.LinkTokenPair = this.LinkTokenPair.bind(this);
    this.PauseBurningAndMinting = this.PauseBurningAndMinting.bind(this);
    this.PauseSendingAndReceivingMessages = this.PauseSendingAndReceivingMessages.bind(this);
    this.ReceiveMessage = this.ReceiveMessage.bind(this);
    this.RemoveRemoteTokenMessenger = this.RemoveRemoteTokenMessenger.bind(this);
    this.ReplaceDepositForBurn = this.ReplaceDepositForBurn.bind(this);
    this.ReplaceMessage = this.ReplaceMessage.bind(this);
    this.SendMessage = this.SendMessage.bind(this);
    this.SendMessageWithCaller = this.SendMessageWithCaller.bind(this);
    this.UnlinkTokenPair = this.UnlinkTokenPair.bind(this);
    this.UnpauseBurningAndMinting = this.UnpauseBurningAndMinting.bind(this);
    this.UnpauseSendingAndReceivingMessages = this.UnpauseSendingAndReceivingMessages.bind(this);
    this.UpdateOwner = this.UpdateOwner.bind(this);
    this.UpdateAttesterManager = this.UpdateAttesterManager.bind(this);
    this.UpdateTokenController = this.UpdateTokenController.bind(this);
    this.UpdatePauser = this.UpdatePauser.bind(this);
    this.UpdateMaxMessageBodySize = this.UpdateMaxMessageBodySize.bind(this);
    this.SetMaxBurnAmountPerMessage = this.SetMaxBurnAmountPerMessage.bind(this);
    this.UpdateSignatureThreshold = this.UpdateSignatureThreshold.bind(this);
  }
  AcceptOwner(request: MsgAcceptOwner): Promise<MsgAcceptOwnerResponse> {
    const data = MsgAcceptOwner.encode(request).finish();
    const promise = this.rpc.request(this.service, 'AcceptOwner', data);
    return promise.then((data) => MsgAcceptOwnerResponse.decode(_m0.Reader.create(data)));
  }

  AddRemoteTokenMessenger(
    request: MsgAddRemoteTokenMessenger,
  ): Promise<MsgAddRemoteTokenMessengerResponse> {
    const data = MsgAddRemoteTokenMessenger.encode(request).finish();
    const promise = this.rpc.request(this.service, 'AddRemoteTokenMessenger', data);
    return promise.then((data) =>
      MsgAddRemoteTokenMessengerResponse.decode(_m0.Reader.create(data)),
    );
  }

  DepositForBurn(request: MsgDepositForBurn): Promise<MsgDepositForBurnResponse> {
    const data = MsgDepositForBurn.encode(request).finish();
    const promise = this.rpc.request(this.service, 'DepositForBurn', data);
    return promise.then((data) => MsgDepositForBurnResponse.decode(_m0.Reader.create(data)));
  }

  DepositForBurnWithCaller(
    request: MsgDepositForBurnWithCaller,
  ): Promise<MsgDepositForBurnWithCallerResponse> {
    const data = MsgDepositForBurnWithCaller.encode(request).finish();
    const promise = this.rpc.request(this.service, 'DepositForBurnWithCaller', data);
    return promise.then((data) =>
      MsgDepositForBurnWithCallerResponse.decode(_m0.Reader.create(data)),
    );
  }

  DisableAttester(request: MsgDisableAttester): Promise<MsgDisableAttesterResponse> {
    const data = MsgDisableAttester.encode(request).finish();
    const promise = this.rpc.request(this.service, 'DisableAttester', data);
    return promise.then((data) => MsgDisableAttesterResponse.decode(_m0.Reader.create(data)));
  }

  EnableAttester(request: MsgEnableAttester): Promise<MsgEnableAttesterResponse> {
    const data = MsgEnableAttester.encode(request).finish();
    const promise = this.rpc.request(this.service, 'EnableAttester', data);
    return promise.then((data) => MsgEnableAttesterResponse.decode(_m0.Reader.create(data)));
  }

  LinkTokenPair(request: MsgLinkTokenPair): Promise<MsgLinkTokenPairResponse> {
    const data = MsgLinkTokenPair.encode(request).finish();
    const promise = this.rpc.request(this.service, 'LinkTokenPair', data);
    return promise.then((data) => MsgLinkTokenPairResponse.decode(_m0.Reader.create(data)));
  }

  PauseBurningAndMinting(
    request: MsgPauseBurningAndMinting,
  ): Promise<MsgPauseBurningAndMintingResponse> {
    const data = MsgPauseBurningAndMinting.encode(request).finish();
    const promise = this.rpc.request(this.service, 'PauseBurningAndMinting', data);
    return promise.then((data) =>
      MsgPauseBurningAndMintingResponse.decode(_m0.Reader.create(data)),
    );
  }

  PauseSendingAndReceivingMessages(
    request: MsgPauseSendingAndReceivingMessages,
  ): Promise<MsgPauseSendingAndReceivingMessagesResponse> {
    const data = MsgPauseSendingAndReceivingMessages.encode(request).finish();
    const promise = this.rpc.request(this.service, 'PauseSendingAndReceivingMessages', data);
    return promise.then((data) =>
      MsgPauseSendingAndReceivingMessagesResponse.decode(_m0.Reader.create(data)),
    );
  }

  ReceiveMessage(request: MsgReceiveMessage): Promise<MsgReceiveMessageResponse> {
    const data = MsgReceiveMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, 'ReceiveMessage', data);
    return promise.then((data) => MsgReceiveMessageResponse.decode(_m0.Reader.create(data)));
  }

  RemoveRemoteTokenMessenger(
    request: MsgRemoveRemoteTokenMessenger,
  ): Promise<MsgRemoveRemoteTokenMessengerResponse> {
    const data = MsgRemoveRemoteTokenMessenger.encode(request).finish();
    const promise = this.rpc.request(this.service, 'RemoveRemoteTokenMessenger', data);
    return promise.then((data) =>
      MsgRemoveRemoteTokenMessengerResponse.decode(_m0.Reader.create(data)),
    );
  }

  ReplaceDepositForBurn(
    request: MsgReplaceDepositForBurn,
  ): Promise<MsgReplaceDepositForBurnResponse> {
    const data = MsgReplaceDepositForBurn.encode(request).finish();
    const promise = this.rpc.request(this.service, 'ReplaceDepositForBurn', data);
    return promise.then((data) => MsgReplaceDepositForBurnResponse.decode(_m0.Reader.create(data)));
  }

  ReplaceMessage(request: MsgReplaceMessage): Promise<MsgReplaceMessageResponse> {
    const data = MsgReplaceMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, 'ReplaceMessage', data);
    return promise.then((data) => MsgReplaceMessageResponse.decode(_m0.Reader.create(data)));
  }

  SendMessage(request: MsgSendMessage): Promise<MsgSendMessageResponse> {
    const data = MsgSendMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, 'SendMessage', data);
    return promise.then((data) => MsgSendMessageResponse.decode(_m0.Reader.create(data)));
  }

  SendMessageWithCaller(
    request: MsgSendMessageWithCaller,
  ): Promise<MsgSendMessageWithCallerResponse> {
    const data = MsgSendMessageWithCaller.encode(request).finish();
    const promise = this.rpc.request(this.service, 'SendMessageWithCaller', data);
    return promise.then((data) => MsgSendMessageWithCallerResponse.decode(_m0.Reader.create(data)));
  }

  UnlinkTokenPair(request: MsgUnlinkTokenPair): Promise<MsgUnlinkTokenPairResponse> {
    const data = MsgUnlinkTokenPair.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UnlinkTokenPair', data);
    return promise.then((data) => MsgUnlinkTokenPairResponse.decode(_m0.Reader.create(data)));
  }

  UnpauseBurningAndMinting(
    request: MsgUnpauseBurningAndMinting,
  ): Promise<MsgUnpauseBurningAndMintingResponse> {
    const data = MsgUnpauseBurningAndMinting.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UnpauseBurningAndMinting', data);
    return promise.then((data) =>
      MsgUnpauseBurningAndMintingResponse.decode(_m0.Reader.create(data)),
    );
  }

  UnpauseSendingAndReceivingMessages(
    request: MsgUnpauseSendingAndReceivingMessages,
  ): Promise<MsgUnpauseSendingAndReceivingMessagesResponse> {
    const data = MsgUnpauseSendingAndReceivingMessages.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UnpauseSendingAndReceivingMessages', data);
    return promise.then((data) =>
      MsgUnpauseSendingAndReceivingMessagesResponse.decode(_m0.Reader.create(data)),
    );
  }

  UpdateOwner(request: MsgUpdateOwner): Promise<MsgUpdateOwnerResponse> {
    const data = MsgUpdateOwner.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UpdateOwner', data);
    return promise.then((data) => MsgUpdateOwnerResponse.decode(_m0.Reader.create(data)));
  }

  UpdateAttesterManager(
    request: MsgUpdateAttesterManager,
  ): Promise<MsgUpdateAttesterManagerResponse> {
    const data = MsgUpdateAttesterManager.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UpdateAttesterManager', data);
    return promise.then((data) => MsgUpdateAttesterManagerResponse.decode(_m0.Reader.create(data)));
  }

  UpdateTokenController(
    request: MsgUpdateTokenController,
  ): Promise<MsgUpdateTokenControllerResponse> {
    const data = MsgUpdateTokenController.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UpdateTokenController', data);
    return promise.then((data) => MsgUpdateTokenControllerResponse.decode(_m0.Reader.create(data)));
  }

  UpdatePauser(request: MsgUpdatePauser): Promise<MsgUpdatePauserResponse> {
    const data = MsgUpdatePauser.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UpdatePauser', data);
    return promise.then((data) => MsgUpdatePauserResponse.decode(_m0.Reader.create(data)));
  }

  UpdateMaxMessageBodySize(
    request: MsgUpdateMaxMessageBodySize,
  ): Promise<MsgUpdateMaxMessageBodySizeResponse> {
    const data = MsgUpdateMaxMessageBodySize.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UpdateMaxMessageBodySize', data);
    return promise.then((data) =>
      MsgUpdateMaxMessageBodySizeResponse.decode(_m0.Reader.create(data)),
    );
  }

  SetMaxBurnAmountPerMessage(
    request: MsgSetMaxBurnAmountPerMessage,
  ): Promise<MsgSetMaxBurnAmountPerMessageResponse> {
    const data = MsgSetMaxBurnAmountPerMessage.encode(request).finish();
    const promise = this.rpc.request(this.service, 'SetMaxBurnAmountPerMessage', data);
    return promise.then((data) =>
      MsgSetMaxBurnAmountPerMessageResponse.decode(_m0.Reader.create(data)),
    );
  }

  UpdateSignatureThreshold(
    request: MsgUpdateSignatureThreshold,
  ): Promise<MsgUpdateSignatureThresholdResponse> {
    const data = MsgUpdateSignatureThreshold.encode(request).finish();
    const promise = this.rpc.request(this.service, 'UpdateSignatureThreshold', data);
    return promise.then((data) =>
      MsgUpdateSignatureThresholdResponse.decode(_m0.Reader.create(data)),
    );
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const gt: any = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw 'Unable to locate global object';
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (gt.Buffer) {
    return Uint8Array.from(gt.Buffer.from(b64, 'base64'));
  } else {
    const bin = gt.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (gt.Buffer) {
    return gt.Buffer.from(arr).toString('base64');
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(gt.String.fromCharCode(byte));
    });
    return gt.btoa(bin.join(''));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
    ? string | number | Long
    : T extends globalThis.Array<infer U>
      ? globalThis.Array<DeepPartial<U>>
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : T extends {}
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
