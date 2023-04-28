export namespace KJUR {
    namespace asn1 {
        const ASN1Util: Class;
        /**
         * base class for ASN.1 DER encoder object
         * @name KJUR.asn1.ASN1Object
         * @class base class for ASN.1 DER encoder object
         * @property {Boolean} isModified flag whether internal data was changed
         * @property {String} hTLV hexadecimal string of ASN.1 TLV
         * @property {String} hT hexadecimal string of ASN.1 TLV tag(T)
         * @property {String} hL hexadecimal string of ASN.1 TLV length(L)
         * @property {String} hV hexadecimal string of ASN.1 TLV value(V)
         * @description
         */
        function ASN1Object(): void;
        /**
         * base class for ASN.1 DER string classes
         * @name KJUR.asn1.DERAbstractString
         * @class base class for ASN.1 DER string classes
         * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
         * @property {String} s internal string of value
         * @extends KJUR.asn1.ASN1Object
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>str - specify initial ASN.1 value(V) by a string</li>
         * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
         * </ul>
         * NOTE: 'params' can be omitted.
         */
        function DERAbstractString(params: any[]): void;
        /**
         * base class for ASN.1 DER Generalized/UTCTime class
         * @name KJUR.asn1.DERAbstractTime
         * @class base class for ASN.1 DER Generalized/UTCTime class
         * @param {Array} params associative array of parameters (ex. {'str': '130430235959Z'})
         * @extends KJUR.asn1.ASN1Object
         * @description
         * @see KJUR.asn1.ASN1Object - superclass
         */
        function DERAbstractTime(params: any[]): void;
        /**
         * base class for ASN.1 DER structured class
         * @name KJUR.asn1.DERAbstractStructured
         * @class base class for ASN.1 DER structured class
         * @property {Array} asn1Array internal array of ASN1Object
         * @extends KJUR.asn1.ASN1Object
         * @description
         * @see KJUR.asn1.ASN1Object - superclass
         */
        function DERAbstractStructured(params: any): void;
        /**
         * class for ASN.1 DER Boolean
         * @name KJUR.asn1.DERBoolean
         * @class class for ASN.1 DER Boolean
         * @extends KJUR.asn1.ASN1Object
         * @description
         * @see KJUR.asn1.ASN1Object - superclass
         */
        function DERBoolean(): void;
        /**
         * class for ASN.1 DER Integer
         * @name KJUR.asn1.DERInteger
         * @class class for ASN.1 DER Integer
         * @extends KJUR.asn1.ASN1Object
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>int - specify initial ASN.1 value(V) by integer value</li>
         * <li>bigint - specify initial ASN.1 value(V) by BigInteger object</li>
         * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
         * </ul>
         * NOTE: 'params' can be omitted.
         */
        function DERInteger(params: any): void;
        /**
         * class for ASN.1 DER encoded BitString primitive
         * @name KJUR.asn1.DERBitString
         * @class class for ASN.1 DER encoded BitString primitive
         * @extends KJUR.asn1.ASN1Object
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>bin - specify binary string (ex. '10111')</li>
         * <li>array - specify array of boolean (ex. [true,false,true,true])</li>
         * <li>hex - specify hexadecimal string of ASN.1 value(V) including unused bits</li>
         * <li>obj - specify {@link KJUR.asn1.ASN1Util.newObject}
         * argument for "BitString encapsulates" structure.</li>
         * </ul>
         * NOTE1: 'params' can be omitted.<br/>
         * NOTE2: 'obj' parameter have been supported since
         * asn1 1.0.11, jsrsasign 6.1.1 (2016-Sep-25).<br/>
         * @example
         * // default constructor
         * o = new KJUR.asn1.DERBitString();
         * // initialize with binary string
         * o = new KJUR.asn1.DERBitString({bin: "1011"});
         * // initialize with boolean array
         * o = new KJUR.asn1.DERBitString({array: [true,false,true,true]});
         * // initialize with hexadecimal string (04 is unused bits)
         * o = new KJUR.asn1.DEROctetString({hex: "04bac0"});
         * // initialize with ASN1Util.newObject argument for encapsulated
         * o = new KJUR.asn1.DERBitString({obj: {seq: [{int: 3}, {prnstr: 'aaa'}]}});
         * // above generates a ASN.1 data like this:
         * // BIT STRING, encapsulates {
         * //   SEQUENCE {
         * //     INTEGER 3
         * //     PrintableString 'aaa'
         * //     }
         * //   }
         */
        function DERBitString(params: any): void;
        /**
         * class for ASN.1 DER OctetString<br/>
         * @name KJUR.asn1.DEROctetString
         * @class class for ASN.1 DER OctetString
         * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
         * @extends KJUR.asn1.DERAbstractString
         * @description
         * This class provides ASN.1 OctetString simple type.<br/>
         * Supported "params" attributes are:
         * <ul>
         * <li>str - to set a string as a value</li>
         * <li>hex - to set a hexadecimal string as a value</li>
         * <li>obj - to set a encapsulated ASN.1 value by JSON object
         * which is defined in {@link KJUR.asn1.ASN1Util.newObject}</li>
         * </ul>
         * NOTE: A parameter 'obj' have been supported
         * for "OCTET STRING, encapsulates" structure.
         * since asn1 1.0.11, jsrsasign 6.1.1 (2016-Sep-25).
         * @see KJUR.asn1.DERAbstractString - superclass
         * @example
         * // default constructor
         * o = new KJUR.asn1.DEROctetString();
         * // initialize with string
         * o = new KJUR.asn1.DEROctetString({str: "aaa"});
         * // initialize with hexadecimal string
         * o = new KJUR.asn1.DEROctetString({hex: "616161"});
         * // initialize with ASN1Util.newObject argument
         * o = new KJUR.asn1.DEROctetString({obj: {seq: [{int: 3}, {prnstr: 'aaa'}]}});
         * // above generates a ASN.1 data like this:
         * // OCTET STRING, encapsulates {
         * //   SEQUENCE {
         * //     INTEGER 3
         * //     PrintableString 'aaa'
         * //     }
         * //   }
         */
        function DEROctetString(params: any[]): void;
        /**
         * class for ASN.1 DER Null
         * @name KJUR.asn1.DERNull
         * @class class for ASN.1 DER Null
         * @extends KJUR.asn1.ASN1Object
         * @description
         * @see KJUR.asn1.ASN1Object - superclass
         */
        function DERNull(): void;
        /**
         * class for ASN.1 DER ObjectIdentifier
         * @name KJUR.asn1.DERObjectIdentifier
         * @class class for ASN.1 DER ObjectIdentifier
         * @param {Array} params associative array of parameters (ex. {'oid': '2.5.4.5'})
         * @extends KJUR.asn1.ASN1Object
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>oid - specify initial ASN.1 value(V) by a oid string (ex. 2.5.4.13)</li>
         * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
         * </ul>
         * NOTE: 'params' can be omitted.
         */
        function DERObjectIdentifier(params: any[]): void;
        /**
         * class for ASN.1 DER Enumerated
         * @name KJUR.asn1.DEREnumerated
         * @class class for ASN.1 DER Enumerated
         * @extends KJUR.asn1.ASN1Object
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>int - specify initial ASN.1 value(V) by integer value</li>
         * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
         * </ul>
         * NOTE: 'params' can be omitted.
         * @example
         * new KJUR.asn1.DEREnumerated(123);
         * new KJUR.asn1.DEREnumerated({int: 123});
         * new KJUR.asn1.DEREnumerated({hex: '1fad'});
         */
        function DEREnumerated(params: any): void;
        /**
         * class for ASN.1 DER UTF8String
         * @name KJUR.asn1.DERUTF8String
         * @class class for ASN.1 DER UTF8String
         * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
         * @extends KJUR.asn1.DERAbstractString
         * @description
         * @see KJUR.asn1.DERAbstractString - superclass
         */
        function DERUTF8String(params: any[]): void;
        /**
         * class for ASN.1 DER NumericString
         * @name KJUR.asn1.DERNumericString
         * @class class for ASN.1 DER NumericString
         * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
         * @extends KJUR.asn1.DERAbstractString
         * @description
         * @see KJUR.asn1.DERAbstractString - superclass
         */
        function DERNumericString(params: any[]): void;
        /**
         * class for ASN.1 DER PrintableString
         * @name KJUR.asn1.DERPrintableString
         * @class class for ASN.1 DER PrintableString
         * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
         * @extends KJUR.asn1.DERAbstractString
         * @description
         * @see KJUR.asn1.DERAbstractString - superclass
         */
        function DERPrintableString(params: any[]): void;
        /**
         * class for ASN.1 DER TeletexString
         * @name KJUR.asn1.DERTeletexString
         * @class class for ASN.1 DER TeletexString
         * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
         * @extends KJUR.asn1.DERAbstractString
         * @description
         * @see KJUR.asn1.DERAbstractString - superclass
         */
        function DERTeletexString(params: any[]): void;
        /**
         * class for ASN.1 DER IA5String
         * @name KJUR.asn1.DERIA5String
         * @class class for ASN.1 DER IA5String
         * @param {Array} params associative array of parameters (ex. {'str': 'aaa'})
         * @extends KJUR.asn1.DERAbstractString
         * @description
         * @see KJUR.asn1.DERAbstractString - superclass
         */
        function DERIA5String(params: any[]): void;
        /**
         * class for ASN.1 DER UTCTime
         * @name KJUR.asn1.DERUTCTime
         * @class class for ASN.1 DER UTCTime
         * @param {Array} params associative array of parameters (ex. {'str': '130430235959Z'})
         * @extends KJUR.asn1.DERAbstractTime
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>str - specify initial ASN.1 value(V) by a string (ex.'130430235959Z')</li>
         * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
         * <li>date - specify Date object.</li>
         * </ul>
         * NOTE: 'params' can be omitted.
         * <h4>EXAMPLES</h4>
         * @example
         * d1 = new KJUR.asn1.DERUTCTime();
         * d1.setString('130430125959Z');
         *
         * d2 = new KJUR.asn1.DERUTCTime({'str': '130430125959Z'});
         * d3 = new KJUR.asn1.DERUTCTime({'date': new Date(Date.UTC(2015, 0, 31, 0, 0, 0, 0))});
         * d4 = new KJUR.asn1.DERUTCTime('130430125959Z');
         */
        function DERUTCTime(params: any[]): void;
        /**
         * class for ASN.1 DER GeneralizedTime
         * @name KJUR.asn1.DERGeneralizedTime
         * @class class for ASN.1 DER GeneralizedTime
         * @param {Array} params associative array of parameters (ex. {'str': '20130430235959Z'})
         * @property {Boolean} withMillis flag to show milliseconds or not
         * @extends KJUR.asn1.DERAbstractTime
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>str - specify initial ASN.1 value(V) by a string (ex.'20130430235959Z')</li>
         * <li>hex - specify initial ASN.1 value(V) by a hexadecimal string</li>
         * <li>date - specify Date object.</li>
         * <li>millis - specify flag to show milliseconds (from 1.0.6)</li>
         * </ul>
         * NOTE1: 'params' can be omitted.
         * NOTE2: 'withMillis' property is supported from asn1 1.0.6.
         */
        function DERGeneralizedTime(params: any[]): void;
        /**
         * class for ASN.1 DER Sequence
         * @name KJUR.asn1.DERSequence
         * @class class for ASN.1 DER Sequence
         * @extends KJUR.asn1.DERAbstractStructured
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>array - specify array of ASN1Object to set elements of content</li>
         * </ul>
         * NOTE: 'params' can be omitted.
         */
        function DERSequence(params: any): void;
        /**
         * class for ASN.1 DER Set
         * @name KJUR.asn1.DERSet
         * @class class for ASN.1 DER Set
         * @extends KJUR.asn1.DERAbstractStructured
         * @description
         * <br/>
         * As for argument 'params' for constructor, you can specify one of
         * following properties:
         * <ul>
         * <li>array - specify array of ASN1Object to set elements of content</li>
         * <li>sortflag - flag for sort (default: true). ASN.1 BER is not sorted in 'SET OF'.</li>
         * </ul>
         * NOTE1: 'params' can be omitted.<br/>
         * NOTE2: sortflag is supported since 1.0.5.
         */
        function DERSet(params: any): void;
        /**
         * class for ASN.1 DER TaggedObject
         * @name KJUR.asn1.DERTaggedObject
         * @class class for ASN.1 DER TaggedObject
         * @extends KJUR.asn1.ASN1Object
         * @description
         * <br/>
         * Parameter 'tagNoNex' is ASN.1 tag(T) value for this object.
         * For example, if you find '[1]' tag in a ASN.1 dump,
         * 'tagNoHex' will be 'a1'.
         * <br/>
         * As for optional argument 'params' for constructor, you can specify *ANY* of
         * following properties:
         * <ul>
         * <li>explicit - specify true if this is explicit tag otherwise false
         *     (default is 'true').</li>
         * <li>tag - specify tag (default is 'a0' which means [0])</li>
         * <li>obj - specify ASN1Object which is tagged</li>
         * </ul>
         * @example
         * d1 = new KJUR.asn1.DERUTF8String({'str':'a'});
         * d2 = new KJUR.asn1.DERTaggedObject({'obj': d1});
         * hex = d2.getEncodedHex();
         */
        function DERTaggedObject(params: any): void;
    }
}
