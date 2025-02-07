using Nethereum.Hex.HexTypes;
using System;
using System.Linq;
using System.Numerics;

namespace Nethereum.Hex.HexConvertors.Extensions
{
    public static class HexBigIntegerConvertorExtensions
    {
        public static BigInteger? GetValue(this HexBigInteger hexBigInteger)
        {
            if (hexBigInteger == null)
            {
                return null;
            }
            return hexBigInteger.Value;
        }
        public static byte[] ToByteArray(this BigInteger value, bool littleEndian)
        {
            return ConvertToByteArray(value, littleEndian);
        }

        public static byte[] ConvertToByteArray(this BigInteger value, bool littleEndian)
        {
            byte[] bytes;
            if (BitConverter.IsLittleEndian != littleEndian)
                bytes = value.ToByteArray().Reverse().ToArray();
            else
                bytes = value.ToByteArray().ToArray();
            return bytes;
        }

        public static string ToHex(this BigInteger value, bool littleEndian, bool compact = true)
        {
            if (value.Sign < 0) throw new Exception("Hex Encoding of Negative BigInteger value is not supported");
            if (value == 0) return "0x0";

#if NETCOREAPP2_1 || NETCOREAPP3_1 || NET5_0_OR_GREATER
            var bytes = value.ToByteArray(true, !littleEndian);
#else
            var bytes = value.ConvertToByteArray(littleEndian);
#endif

            if (compact)
                return "0x" + bytes.ToHexCompact();

            return "0x" + bytes.ToHex();
        }


        public static BigInteger HexToBigInteger(this string hex, bool isHexLittleEndian)
        {
            if (hex == "0x0") return 0;

            var encoded = hex.HexToByteArray();

            if (BitConverter.IsLittleEndian != isHexLittleEndian)
            {
                var listEncoded = encoded.ToList();
                listEncoded.Insert(0, 0x00);
                encoded = listEncoded.ToArray().Reverse().ToArray();
            }
            return new BigInteger(encoded);
        }
    }
}