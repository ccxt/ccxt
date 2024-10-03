using System;
using System.Numerics;

namespace Nethereum.Hex.HexTypes
{
    public class HexTypeFactory
    {
        public static object CreateFromHex<T>(string hex)
        {
            if (typeof(BigInteger) == typeof(T))
                return new HexBigInteger(hex);

            if (typeof(string) == typeof(T))
                return HexUTF8String.CreateFromHex(hex);
            throw new NotImplementedException();
        }

        public static object CreateFromObject<T>(object value)
        {
            if (value == null) return null; // if null
            if (typeof(BigInteger) == typeof(T))
                return new HexBigInteger((long) value);

            throw new NotImplementedException();
        }
    }
}