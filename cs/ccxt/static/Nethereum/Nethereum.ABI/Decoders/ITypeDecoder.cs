using System;

namespace Nethereum.ABI.Decoders
{
    public interface ITypeDecoder
    {
        object Decode(byte[] encoded, Type type);

        T Decode<T>(byte[] encoded);

        object Decode(string hexString, Type type);

        T Decode<T>(string hexString);
        Type GetDefaultDecodingType();
        bool IsSupportedType(Type type);
    }
}