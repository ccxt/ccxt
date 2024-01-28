//import { TypedDataDomain, TypedDataField } from "@ethersproject/providerabstract-signer";
import { getAddress } from "../address/index.js";
import {
    concat, defineProperties, getBigInt, getBytes, hexlify, isHexString, mask, toBeHex, toQuantity, toTwos, zeroPadValue,
    assertArgument,
    keccak256,
    id
} from "../utils/index.js";

import type { BigNumberish, BytesLike } from "../utils/index.js";
import * as functions from '../../../base/functions.js';
const { base16ToBinary } = functions;

const padding = new Uint8Array(32);
padding.fill(0);

const BN__1 = BigInt(-1);
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

// @TODO: in v7, verifyingContract should be an AddressLike and use resolveAddress

/**
 *  The domain for an [[link-eip-712]] payload.
 */
export interface TypedDataDomain {
    /**
     *  The human-readable name of the signing domain.
     */
    name?: null | string;

    /**
     *  The major version of the signing domain.
     */
    version?: null | string;

    /**
     *  The chain ID of the signing domain.
     */
    chainId?: null | BigNumberish;

    /**
     *  The the address of the contract that will verify the signature.
     */
    verifyingContract?: null | string;

    /**
     *  A salt used for purposes decided by the specific domain.
     */
    salt?: null | BytesLike;
};

/**
 *  A specific field of a structured [[link-eip-712]] type.
 */
export interface TypedDataField {
    /**
     *  The field name.
     */
    name: string;

    /**
     *  The type of the field.
     */
    type: string;
};

function hexPadRight(value: BytesLike): string {
    const bytes = getBytes(value);
    const padOffset = bytes.length % 32
    if (padOffset) {
        return concat([ bytes, padding.slice(padOffset) ]);
    }
    return hexlify(bytes);
}

const hexTrue = toBeHex(BN_1, 32);
const hexFalse = toBeHex(BN_0, 32);

const domainFieldTypes: Record<string, string> = {
    name: "string",
    version: "string",
    chainId: "uint256",
    verifyingContract: "address",
    salt: "bytes32"
};

const domainFieldNames: Array<string> = [
    "name", "version", "chainId", "verifyingContract", "salt"
];

function checkString(key: string): (value: any) => string {
    return function (value: any){
        assertArgument(typeof(value) === "string", `invalid domain value for ${ JSON.stringify(key) }`, `domain.${ key }`, value);
        return value;
    }
}

const domainChecks: Record<string, (value: any) => any> = {
    name: checkString("name"),
    version: checkString("version"),
    chainId: function(_value: any) {
        const value = getBigInt(_value, "domain.chainId");
        assertArgument(value >= 0, "invalid chain ID", "domain.chainId", _value);
        if (Number.isSafeInteger(value)) { return Number(value); }
        return toQuantity(value);
    },
    verifyingContract: function(value: any) {
        try {
            return getAddress(value).toLowerCase();
        } catch (error) { }
        assertArgument(false, `invalid domain value "verifyingContract"`, "domain.verifyingContract", value);
    },
    salt: function(value: any) {
        const bytes = getBytes(value, "domain.salt");
        assertArgument(bytes.length === 32, `invalid domain value "salt"`, "domain.salt", value);
        return hexlify(bytes);
    }
}

function getBaseEncoder(type: string): null | ((value: any) => string) {
    // intXX and uintXX
    {
        const match = type.match(/^(u?)int(\d*)$/);
        if (match) {
            const signed = (match[1] === "");

            const width = parseInt(match[2] || "256");
            assertArgument(width % 8 === 0 && width !== 0 && width <= 256 && (match[2] == null || match[2] === String(width)), "invalid numeric width", "type", type);

            const boundsUpper = mask(BN_MAX_UINT256, signed ? (width - 1): width);
            const boundsLower = signed ? ((boundsUpper + BN_1) * BN__1): BN_0;

            return function(_value: BigNumberish) {
                const value = getBigInt(_value, "value");

                assertArgument(value >= boundsLower && value <= boundsUpper, `value out-of-bounds for ${ type }`, "value", value);

                return toBeHex(signed ? toTwos(value, 256): value, 32);
            };
        }
    }

    // bytesXX
    {
        const match = type.match(/^bytes(\d+)$/);
        if (match) {
            const width = parseInt(match[1]);
            assertArgument(width !== 0 && width <= 32 && match[1] === String(width), "invalid bytes width", "type", type);

            return function(value: BytesLike) {
                const bytes = getBytes(value);
                assertArgument(bytes.length === width, `invalid length for ${ type }`, "value", value);
                return hexPadRight(value);
            };
        }
    }

    switch (type) {
        case "address": return function(value: string) {
            return zeroPadValue(getAddress(value), 32);
        };
        case "bool": return function(value: boolean) {
            return ((!value) ? hexFalse: hexTrue);
        };
        case "bytes": return function(value: BytesLike) {
            return keccak256(value);
        };
        case "string": return function(value: string) {
            return id(value);
        };
    }

    return null;
}

function encodeType(name: string, fields: Array<TypedDataField>): string {
    return `${ name }(${ fields.map(({ name, type }) => (type + " " + name)).join(",") })`;
}

/**
 *  A **TypedDataEncode** prepares and encodes [[link-eip-712]] payloads
 *  for signed typed data.
 *
 *  This is useful for those that wish to compute various components of a
 *  typed data hash, primary types, or sub-components, but generally the
 *  higher level [[Signer-signTypedData]] is more useful.
 */
export class TypedDataEncoder {
    /**
     *  The primary type for the structured [[types]].
     *
     *  This is derived automatically from the [[types]], since no
     *  recursion is possible, once the DAG for the types is consturcted
     *  internally, the primary type must be the only remaining type with
     *  no parent nodes.
     */
    readonly primaryType!: string;

    readonly #types: string;

    /**
     *  The types.
     */
    get types(): Record<string, Array<TypedDataField>> {
        return JSON.parse(this.#types);
    }

    readonly #fullTypes: Map<string, string>

    readonly #encoderCache: Map<string, (value: any) => string>;

    /**
     *  Create a new **TypedDataEncoder** for %%types%%.
     *
     *  This performs all necessary checking that types are valid and
     *  do not violate the [[link-eip-712]] structural constraints as
     *  well as computes the [[primaryType]].
     */
    constructor(types: Record<string, Array<TypedDataField>>) {
        this.#types = JSON.stringify(types);
        this.#fullTypes = new Map();
        this.#encoderCache = new Map();

        // Link struct types to their direct child structs
        const links: Map<string, Set<string>> = new Map();

        // Link structs to structs which contain them as a child
        const parents: Map<string, Array<string>> = new Map();

        // Link all subtypes within a given struct
        const subtypes: Map<string, Set<string>> = new Map();

        Object.keys(types).forEach((type) => {
            links.set(type, new Set());
            parents.set(type, [ ]);
            subtypes.set(type, new Set());
        });

        for (const name in types) {
            const uniqueNames: Set<string> = new Set();

            for (const field of types[name]) {

                // Check each field has a unique name
                assertArgument(!uniqueNames.has(field.name), `duplicate variable name ${ JSON.stringify(field.name) } in ${ JSON.stringify(name) }`, "types", types);
                uniqueNames.add(field.name);

                // Get the base type (drop any array specifiers)
                const baseType = (<any>(field.type.match(/^([^\x5b]*)(\x5b|$)/)))[1] || null;
                assertArgument(baseType !== name, `circular type reference to ${ JSON.stringify(baseType) }`, "types", types);

                // Is this a base encoding type?
                const encoder = getBaseEncoder(baseType);
                if (encoder) { continue; }

                assertArgument(parents.has(baseType), `unknown type ${ JSON.stringify(baseType) }`, "types", types);

                // Add linkage
                (parents.get(baseType) as Array<string>).push(name);
                (links.get(name) as Set<string>).add(baseType);
            }
        }

        // Deduce the primary type
        const primaryTypes = Array.from(parents.keys()).filter((n) => ((parents.get(n) as Array<string>).length === 0));
        assertArgument(primaryTypes.length !== 0, "missing primary type", "types", types);
        assertArgument(primaryTypes.length === 1, `ambiguous primary types or unused types: ${ primaryTypes.map((t) => (JSON.stringify(t))).join(", ") }`, "types", types);

        defineProperties<TypedDataEncoder>(this, { primaryType: primaryTypes[0] });

        // Check for circular type references
        function checkCircular(type: string, found: Set<string>) {
            assertArgument(!found.has(type), `circular type reference to ${ JSON.stringify(type) }`, "types", types);

            found.add(type);

            for (const child of (links.get(type) as Set<string>)) {
                if (!parents.has(child)) { continue; }

                // Recursively check children
                checkCircular(child, found);

                // Mark all ancestors as having this decendant
                for (const subtype of found) {
                    (subtypes.get(subtype) as Set<string>).add(child);
                }
            }

            found.delete(type);
        }
        checkCircular(this.primaryType, new Set());

        // Compute each fully describe type
        for (const [ name, set ] of subtypes) {
            const st = Array.from(set);
            st.sort();
            this.#fullTypes.set(name, encodeType(name, types[name]) + st.map((t) => encodeType(t, types[t])).join(""));
        }
    }

    /**
     *  Returnthe encoder for the specific %%type%%.
     */
    getEncoder(type: string): (value: any) => string {
        let encoder = this.#encoderCache.get(type);
        if (!encoder) {
            encoder = this.#getEncoder(type);
            this.#encoderCache.set(type, encoder);
        }
        return encoder;
    }

    #getEncoder(type: string): (value: any) => string {

        // Basic encoder type (address, bool, uint256, etc)
        {
            const encoder = getBaseEncoder(type);
            if (encoder) { return encoder; }
        }

        // Array
        const match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
        if (match) {
            const subtype = match[1];
            const subEncoder = this.getEncoder(subtype);
            return (value: Array<any>) => {
                assertArgument(!match[3] || parseInt(match[3]) === value.length, `array length mismatch; expected length ${ parseInt(match[3]) }`, "value", value);

                let result = value.map(subEncoder);
                if (this.#fullTypes.has(subtype)) {
                    result = result.map(keccak256);
                }

                return keccak256(concat(result));
            };
        }

        // Struct
        const fields = this.types[type];
        if (fields) {
            const encodedType = id(this.#fullTypes.get(type) as string);
            return (value: Record<string, any>) => {
                const values = fields.map(({ name, type }) => {
                    const result = this.getEncoder(type)(value[name]);
                    if (this.#fullTypes.has(type)) { return keccak256(result); }
                    return result;
                });
                values.unshift(encodedType);
                return concat(values);
            }
        }

        assertArgument(false, `unknown type: ${ type }`, "type", type);
    }

    /**
     *  Return the full type for %%name%%.
     */
    encodeType(name: string): string {
        const result = this.#fullTypes.get(name);
        assertArgument(result, `unknown type: ${ JSON.stringify(name) }`, "name", name);
        return result;
    }

    /**
     *  Return the encoded %%value%% for the %%type%%.
     */
    encodeData(type: string, value: any): string {
        return this.getEncoder(type)(value);
    }

    /**
     *  Returns the hash of %%value%% for the type of %%name%%.
     */
    hashStruct(name: string, value: Record<string, any>): string {
        return keccak256(base16ToBinary(this.encodeData(name, value).slice(2)));
    }

    /**
     *  Return the fulled encoded %%value%% for the [[types]].
     */
    encode(value: Record<string, any>): string {
        return this.encodeData(this.primaryType, value);
    }

    /**
     *  Return the hash of the fully encoded %%value%% for the [[types]].
     */
    hash(value: Record<string, any>): string {
        return this.hashStruct(this.primaryType, value);
    }

    /**
     *  @_ignore:
     */
    _visit(type: string, value: any, callback: (type: string, data: any) => any): any {
        // Basic encoder type (address, bool, uint256, etc)
        {
            const encoder = getBaseEncoder(type);
            if (encoder) { return callback(type, value); }
        }

        // Array
        const match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
        if (match) {
            assertArgument(!match[3] || parseInt(match[3]) === value.length, `array length mismatch; expected length ${ parseInt(match[3]) }`, "value", value);
            return value.map((v: any) => this._visit(match[1], v, callback));
        }

        // Struct
        const fields = this.types[type];
        if (fields) {
            return fields.reduce((accum, { name, type }) => {
                accum[name] = this._visit(type, value[name], callback);
                return accum;
            }, <Record<string, any>>{});
        }

        assertArgument(false, `unknown type: ${ type }`, "type", type);
    }

    /**
     *  Call %%calback%% for each value in %%value%%, passing the type and
     *  component within %%value%%.
     *
     *  This is useful for replacing addresses or other transformation that
     *  may be desired on each component, based on its type.
     */
    visit(value: Record<string, any>, callback: (type: string, data: any) => any): any {
        return this._visit(this.primaryType, value, callback);
    }

    /**
     *  Create a new **TypedDataEncoder** for %%types%%.
     */
    static from(types: Record<string, Array<TypedDataField>>): TypedDataEncoder {
        return new TypedDataEncoder(types);
    }

    /**
     *  Return the primary type for %%types%%.
     */
    static getPrimaryType(types: Record<string, Array<TypedDataField>>): string {
        return TypedDataEncoder.from(types).primaryType;
    }

    /**
     *  Return the hashed struct for %%value%% using %%types%% and %%name%%.
     */
    static hashStruct(name: string, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): string {
        return TypedDataEncoder.from(types).hashStruct(name, value);
    }

    /**
     *  Return the domain hash for %%domain%%.
     */
    static hashDomain(domain: TypedDataDomain): string {
        const domainFields: Array<TypedDataField> = [ ];
        for (const name in domain) {
            if ((<Record<string, any>>domain)[name] == null) { continue; }
            const type = domainFieldTypes[name];
            assertArgument(type, `invalid typed-data domain key: ${ JSON.stringify(name) }`, "domain", domain);
            domainFields.push({ name, type });
        }

        domainFields.sort((a, b) => {
            return domainFieldNames.indexOf(a.name) - domainFieldNames.indexOf(b.name);
        });

        return TypedDataEncoder.hashStruct("EIP712Domain", { EIP712Domain: domainFields }, domain);
    }

    /**
     *  Return the fully encoded [[link-eip-712]] %%value%% for %%types%% with %%domain%%.
     */
    static encode(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): string {
        return concat([
            "0x1901",
            TypedDataEncoder.hashDomain(domain),
            TypedDataEncoder.from(types).hash(value)
        ]);
    }

    /**
     *  Return the hash of the fully encoded [[link-eip-712]] %%value%% for %%types%% with %%domain%%.
     */
    static hash(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): string {
        return keccak256(TypedDataEncoder.encode(domain, types, value));
    }

    // Replaces all address types with ENS names with their looked up address
    /**
     * Resolves to the value from resolving all addresses in %%value%% for
     * %%types%% and the %%domain%%.
     */
    static async resolveNames(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, resolveName: (name: string) => Promise<string>): Promise<{ domain: TypedDataDomain, value: any }> {
        // Make a copy to isolate it from the object passed in
        domain = Object.assign({ }, domain);

        // Allow passing null to ignore value
        for (const key in domain) {
            if ((<Record<string, any>>domain)[key] == null) {
                delete (<Record<string, any>>domain)[key];
            }
        }

        // Look up all ENS names
        const ensCache: Record<string, string> = { };

        // Do we need to look up the domain's verifyingContract?
        if (domain.verifyingContract && !isHexString(domain.verifyingContract, 20)) {
            ensCache[domain.verifyingContract] = "0x";
        }

        // We are going to use the encoder to visit all the base values
        const encoder = TypedDataEncoder.from(types);

        // Get a list of all the addresses
        encoder.visit(value, (type: string, value: any) => {
            if (type === "address" && !isHexString(value, 20)) {
                ensCache[value] = "0x";
            }
            return value;
        });

        // Lookup each name
        for (const name in ensCache) {
            ensCache[name] = await resolveName(name);
        }

        // Replace the domain verifyingContract if needed
        if (domain.verifyingContract && ensCache[domain.verifyingContract]) {
            domain.verifyingContract = ensCache[domain.verifyingContract];
        }

        // Replace all ENS names with their address
        value = encoder.visit(value, (type: string, value: any) => {
            if (type === "address" && ensCache[value]) { return ensCache[value]; }
            return value;
        });

        return { domain, value };
    }

    /**
     *  Returns the JSON-encoded payload expected by nodes which implement
     *  the JSON-RPC [[link-eip-712]] method.
     */
    static getPayload(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): any {
        // Validate the domain fields
        TypedDataEncoder.hashDomain(domain);

        // Derive the EIP712Domain Struct reference type
        const domainValues: Record<string, any> = { };
        const domainTypes: Array<{ name: string, type:string }> = [ ];

        domainFieldNames.forEach((name) => {
            const value = (<any>domain)[name];
            if (value == null) { return; }
            domainValues[name] = domainChecks[name](value);
            domainTypes.push({ name, type: domainFieldTypes[name] });
        });

        const encoder = TypedDataEncoder.from(types);

        const typesWithDomain = Object.assign({ }, types);
        assertArgument(typesWithDomain.EIP712Domain == null, "types must not contain EIP712Domain type", "types.EIP712Domain", types);

        typesWithDomain.EIP712Domain = domainTypes;

        // Validate the data structures and types
        encoder.encode(value);

        return {
            types: typesWithDomain,
            domain: domainValues,
            primaryType: encoder.primaryType,
            message: encoder.visit(value, (type: string, value: any) => {

                // bytes
                if (type.match(/^bytes(\d*)/)) {
                    return hexlify(getBytes(value));
                }

                // uint or int
                if (type.match(/^u?int/)) {
                    return getBigInt(value).toString();
                }

                switch (type) {
                    case "address":
                        return value.toLowerCase();
                    case "bool":
                        return !!value;
                    case "string":
                        assertArgument(typeof(value) === "string", "invalid string", "value", value);
                        return value;
                }

                assertArgument(false, "unsupported type", "type", type);
            })
        };
    }
}
