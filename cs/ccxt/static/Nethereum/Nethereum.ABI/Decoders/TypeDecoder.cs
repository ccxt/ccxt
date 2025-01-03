using System;
using Nethereum.Hex.HexConvertors.Extensions;

namespace Nethereum.ABI.Decoders
{
    public abstract class TypeDecoder : ITypeDecoder
    {
        public abstract bool IsSupportedType(Type type);
        public abstract object Decode(byte[] encoded, Type type);

        public T Decode<T>(byte[] encoded)
        {
            return (T) Decode(encoded, typeof(T));
        }

        public object Decode(string encoded, Type type)
        {
            if (!encoded.StartsWith("0x"))
                encoded = "0x" + encoded;

            return Decode(encoded.HexToByteArray(), type);
        }

        public T Decode<T>(string encoded)
        {
            return (T) Decode(encoded, typeof(T));
        }

        public abstract Type GetDefaultDecodingType();
    }
}