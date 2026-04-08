import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/** Status of the CLOB. */
export declare enum ClobPair_Status {
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
    UNRECOGNIZED = -1
}
export declare const ClobPair_StatusSDKType: typeof ClobPair_Status;
export declare function clobPair_StatusFromJSON(object: any): ClobPair_Status;
export declare function clobPair_StatusToJSON(object: ClobPair_Status): string;
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
export declare const PerpetualClobMetadata: {
    encode(message: PerpetualClobMetadata, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PerpetualClobMetadata;
    fromPartial(object: DeepPartial<PerpetualClobMetadata>): PerpetualClobMetadata;
};
export declare const SpotClobMetadata: {
    encode(message: SpotClobMetadata, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SpotClobMetadata;
    fromPartial(object: DeepPartial<SpotClobMetadata>): SpotClobMetadata;
};
export declare const ClobPair: {
    encode(message: ClobPair, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClobPair;
    fromPartial(object: DeepPartial<ClobPair>): ClobPair;
};
