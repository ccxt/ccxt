import { CairoEnum } from './cairoEnum.js';
import {
  BigNumberish,
  BlockIdentifier,
  Calldata,
  ParsedStruct,
  RawArgsArray,
  Signature,
} from './lib';

export type AsyncContractFunction<T = any> = (...args: ArgsOrCalldataWithOptions) => Promise<T>;
export type ContractFunction = (...args: ArgsOrCalldataWithOptions) => any;

export type Result =
  | {
      [key: string]: any;
    }
  | Result[]
  | bigint
  | string
  | boolean
  | CairoEnum;

export type ArgsOrCalldata = RawArgsArray | [Calldata] | Calldata;
export type ArgsOrCalldataWithOptions = ArgsOrCalldata & ContractOptions;
export type ContractOptions = {
  blockIdentifier?: BlockIdentifier;
  parseRequest?: boolean;
  parseResponse?: boolean;
  formatResponse?: { [key: string]: any };
  maxFee?: BigNumberish;
  nonce?: BigNumberish;
  signature?: Signature;
  addressSalt?: string;
};

export type CallOptions = Pick<
  ContractOptions,
  'blockIdentifier' | 'parseRequest' | 'parseResponse' | 'formatResponse'
>;

export type InvokeOptions = Pick<
  ContractOptions,
  'maxFee' | 'nonce' | 'signature' | 'parseRequest'
>;

export type ParsedEvent = { [name: string]: ParsedStruct };

export type ParsedEvents = Array<ParsedEvent>;
