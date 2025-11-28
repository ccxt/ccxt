import _m0 from "protobufjs/minimal.js";
import { DeepPartial, Long } from "../../helpers.js";
/** Status of the CLOB. */

export enum ClobPair_Status {
  /** STATUS_UNSPECIFIED - Default value. This value is invalid and unused. */
  STATUS_UNSPECIFIED = 0,

  /** STATUS_ACTIVE - STATUS_ACTIVE represents an active clob pair. */
  STATUS_ACTIVE = 1,

  /**
   * STATUS_PAUSED - STATUS_PAUSED behavior is unfinalized.
   * TODO(DEC-600): update this documentation.
   */
  STATUS_PAUSED = 2,

  /**
   * STATUS_CANCEL_ONLY - STATUS_CANCEL_ONLY behavior is unfinalized.
   * TODO(DEC-600): update this documentation.
   */
  STATUS_CANCEL_ONLY = 3,

  /**
   * STATUS_POST_ONLY - STATUS_POST_ONLY behavior is unfinalized.
   * TODO(DEC-600): update this documentation.
   */
  STATUS_POST_ONLY = 4,

  /**
   * STATUS_INITIALIZING - STATUS_INITIALIZING represents a newly-added clob pair.
   * Clob pairs in this state only accept orders which are
   * both short-term and post-only.
   */
  STATUS_INITIALIZING = 5,

  /**
   * STATUS_FINAL_SETTLEMENT - STATUS_FINAL_SETTLEMENT represents a clob pair which is deactivated
   * and trading has ceased. All open positions will be closed by the
   * protocol. Open stateful orders will be cancelled. Open short-term
   * orders will be left to expire.
   */
  STATUS_FINAL_SETTLEMENT = 6,
  UNRECOGNIZED = -1,
}
export const ClobPair_StatusSDKType = ClobPair_Status;
export function clobPair_StatusFromJSON(object: any): ClobPair_Status {
  switch (object) {
    case 0:
    case "STATUS_UNSPECIFIED":
      return ClobPair_Status.STATUS_UNSPECIFIED;

    case 1:
    case "STATUS_ACTIVE":
      return ClobPair_Status.STATUS_ACTIVE;

    case 2:
    case "STATUS_PAUSED":
      return ClobPair_Status.STATUS_PAUSED;

    case 3:
    case "STATUS_CANCEL_ONLY":
      return ClobPair_Status.STATUS_CANCEL_ONLY;

    case 4:
    case "STATUS_POST_ONLY":
      return ClobPair_Status.STATUS_POST_ONLY;

    case 5:
    case "STATUS_INITIALIZING":
      return ClobPair_Status.STATUS_INITIALIZING;

    case 6:
    case "STATUS_FINAL_SETTLEMENT":
      return ClobPair_Status.STATUS_FINAL_SETTLEMENT;

    case -1:
    case "UNRECOGNIZED":
    default:
      return ClobPair_Status.UNRECOGNIZED;
  }
}
export function clobPair_StatusToJSON(object: ClobPair_Status): string {
  switch (object) {
    case ClobPair_Status.STATUS_UNSPECIFIED:
      return "STATUS_UNSPECIFIED";

    case ClobPair_Status.STATUS_ACTIVE:
      return "STATUS_ACTIVE";

    case ClobPair_Status.STATUS_PAUSED:
      return "STATUS_PAUSED";

    case ClobPair_Status.STATUS_CANCEL_ONLY:
      return "STATUS_CANCEL_ONLY";

    case ClobPair_Status.STATUS_POST_ONLY:
      return "STATUS_POST_ONLY";

    case ClobPair_Status.STATUS_INITIALIZING:
      return "STATUS_INITIALIZING";

    case ClobPair_Status.STATUS_FINAL_SETTLEMENT:
      return "STATUS_FINAL_SETTLEMENT";

    case ClobPair_Status.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
/**
 * PerpetualClobMetadata contains metadata for a `ClobPair`
 * representing a Perpetual product.
 */

export interface PerpetualClobMetadata {
  /** Id of the Perpetual the CLOB allows trading of. */
  perpetualId: number;
}
/**
 * PerpetualClobMetadata contains metadata for a `ClobPair`
 * representing a Perpetual product.
 */

export interface PerpetualClobMetadataSDKType {
  perpetual_id: number;
}
/**
 * PerpetualClobMetadata contains metadata for a `ClobPair`
 * representing a Spot product.
 */

export interface SpotClobMetadata {
  /** Id of the base Asset in the trading pair. */
  baseAssetId: number;
  /** Id of the quote Asset in the trading pair. */

  quoteAssetId: number;
}
/**
 * PerpetualClobMetadata contains metadata for a `ClobPair`
 * representing a Spot product.
 */

export interface SpotClobMetadataSDKType {
  base_asset_id: number;
  quote_asset_id: number;
}
/**
 * ClobPair represents a single CLOB pair for a given product
 * in state.
 */

export interface ClobPair {
  /** ID of the orderbook that stores all resting liquidity for this CLOB. */
  id: number;
  perpetualClobMetadata?: PerpetualClobMetadata;
  spotClobMetadata?: SpotClobMetadata;
  /** Minimum increment in the size of orders on the CLOB, in base quantums. */

  stepBaseQuantums: Long;
  /**
   * Defines the tick size of the orderbook by defining how many subticks
   * are in one tick. That is, the subticks of any valid order must be a
   * multiple of this value. Generally this value should start `>= 100`to
   * allow room for decreasing it.
   */

  subticksPerTick: number;
  /**
   * `10^Exponent` gives the number of QuoteQuantums traded per BaseQuantum
   * per Subtick.
   */

  quantumConversionExponent: number;
  status: ClobPair_Status;
}
/**
 * ClobPair represents a single CLOB pair for a given product
 * in state.
 */

export interface ClobPairSDKType {
  id: number;
  perpetual_clob_metadata?: PerpetualClobMetadataSDKType;
  spot_clob_metadata?: SpotClobMetadataSDKType;
  step_base_quantums: Long;
  subticks_per_tick: number;
  quantum_conversion_exponent: number;
  status: ClobPair_Status;
}

function createBasePerpetualClobMetadata(): PerpetualClobMetadata {
  return {
    perpetualId: 0
  };
}

export const PerpetualClobMetadata = {
  encode(message: PerpetualClobMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.perpetualId !== 0) {
      writer.uint32(8).uint32(message.perpetualId);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PerpetualClobMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePerpetualClobMetadata();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.perpetualId = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<PerpetualClobMetadata>): PerpetualClobMetadata {
    const message = createBasePerpetualClobMetadata();
    message.perpetualId = object.perpetualId ?? 0;
    return message;
  }

};

function createBaseSpotClobMetadata(): SpotClobMetadata {
  return {
    baseAssetId: 0,
    quoteAssetId: 0
  };
}

export const SpotClobMetadata = {
  encode(message: SpotClobMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.baseAssetId !== 0) {
      writer.uint32(8).uint32(message.baseAssetId);
    }

    if (message.quoteAssetId !== 0) {
      writer.uint32(16).uint32(message.quoteAssetId);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SpotClobMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSpotClobMetadata();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.baseAssetId = reader.uint32();
          break;

        case 2:
          message.quoteAssetId = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<SpotClobMetadata>): SpotClobMetadata {
    const message = createBaseSpotClobMetadata();
    message.baseAssetId = object.baseAssetId ?? 0;
    message.quoteAssetId = object.quoteAssetId ?? 0;
    return message;
  }

};

function createBaseClobPair(): ClobPair {
  return {
    id: 0,
    perpetualClobMetadata: undefined,
    spotClobMetadata: undefined,
    stepBaseQuantums: Long.UZERO,
    subticksPerTick: 0,
    quantumConversionExponent: 0,
    status: 0
  };
}

export const ClobPair = {
  encode(message: ClobPair, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint32(message.id);
    }

    if (message.perpetualClobMetadata !== undefined) {
      PerpetualClobMetadata.encode(message.perpetualClobMetadata, writer.uint32(18).fork()).ldelim();
    }

    if (message.spotClobMetadata !== undefined) {
      SpotClobMetadata.encode(message.spotClobMetadata, writer.uint32(26).fork()).ldelim();
    }

    if (!message.stepBaseQuantums.isZero()) {
      writer.uint32(32).uint64(message.stepBaseQuantums);
    }

    if (message.subticksPerTick !== 0) {
      writer.uint32(40).uint32(message.subticksPerTick);
    }

    if (message.quantumConversionExponent !== 0) {
      writer.uint32(48).sint32(message.quantumConversionExponent);
    }

    if (message.status !== 0) {
      writer.uint32(56).int32(message.status);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClobPair {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClobPair();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint32();
          break;

        case 2:
          message.perpetualClobMetadata = PerpetualClobMetadata.decode(reader, reader.uint32());
          break;

        case 3:
          message.spotClobMetadata = SpotClobMetadata.decode(reader, reader.uint32());
          break;

        case 4:
          message.stepBaseQuantums = (reader.uint64() as Long);
          break;

        case 5:
          message.subticksPerTick = reader.uint32();
          break;

        case 6:
          message.quantumConversionExponent = reader.sint32();
          break;

        case 7:
          message.status = (reader.int32() as any);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<ClobPair>): ClobPair {
    const message = createBaseClobPair();
    message.id = object.id ?? 0;
    message.perpetualClobMetadata = object.perpetualClobMetadata !== undefined && object.perpetualClobMetadata !== null ? PerpetualClobMetadata.fromPartial(object.perpetualClobMetadata) : undefined;
    message.spotClobMetadata = object.spotClobMetadata !== undefined && object.spotClobMetadata !== null ? SpotClobMetadata.fromPartial(object.spotClobMetadata) : undefined;
    message.stepBaseQuantums = object.stepBaseQuantums !== undefined && object.stepBaseQuantums !== null ? Long.fromValue(object.stepBaseQuantums) : Long.UZERO;
    message.subticksPerTick = object.subticksPerTick ?? 0;
    message.quantumConversionExponent = object.quantumConversionExponent ?? 0;
    message.status = object.status ?? 0;
    return message;
  }

};