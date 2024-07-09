using System;
using Nethereum.ABI.Decoders;
using Nethereum.ABI.Encoders;

namespace Nethereum.ABI
{
    /// <summary>
    ///     Generic ABI type
    /// </summary>
    public abstract class ABIType
    {
        public ABIType(string name)
        {
            Name = name;
        }

        protected ITypeDecoder Decoder { get; set; }
        protected ITypeEncoder Encoder { get; set; }

        /// <summary>
        ///     The type name as it was specified in the interface description
        /// </summary>
        public virtual string Name { get; }

        /// <summary>
        ///     The canonical type name (used for the method signature creation)
        ///     E.g. 'int' - canonical 'int256'
        /// </summary>
        public virtual string CanonicalName => Name;

        /// <returns> fixed size in bytes or negative value if the type is dynamic </returns>
        public virtual int FixedSize => 32;

        public static ABIType CreateABIType(string typeName)
        {
            if (typeName == "tuple") return new TupleType();

            if (typeName.Contains("["))
                return ArrayType.CreateABIType(typeName);
            if ("bool".Equals(typeName))
                return new BoolType();
            if (typeName.StartsWith("int", StringComparison.Ordinal) ||
                typeName.StartsWith("uint", StringComparison.Ordinal))
                return new IntType(typeName);
            if ("address".Equals(typeName))
                return new AddressType();
            if ("string".Equals(typeName))
                return new StringType();
            if ("bytes".Equals(typeName))
                return new BytesType();
            if (typeName.StartsWith("bytes", StringComparison.Ordinal))
            {
                var size = Convert.ToInt32(typeName.Substring(5));
                if (size == 32)
                    return new Bytes32Type(typeName);
                return new BytesElementaryType(typeName, size);
            }

            throw new ArgumentException("Unknown type: " + typeName);
        }

        public object Decode(byte[] encoded, Type type)
        {
            return Decoder.Decode(encoded, type);
        }

        public object Decode(string encoded, Type type)
        {
            return Decoder.Decode(encoded, type);
        }

        public T Decode<T>(string encoded)
        {
            return Decoder.Decode<T>(encoded);
        }

        public T Decode<T>(byte[] encoded)
        {
            return Decoder.Decode<T>(encoded);
        }

        public byte[] Encode(object value)
        {
            return Encoder.Encode(value);
        }

        public byte[] EncodePacked(object value)
        {
            return Encoder.EncodePacked(value);
        }

        public Type GetDefaultDecodingType()
        {
            return Decoder.GetDefaultDecodingType();
        }

        public bool IsDynamic()
        {
            return FixedSize < 0;
        }

        public override string ToString()
        {
            return Name;
        }
    }
}