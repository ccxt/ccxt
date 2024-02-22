using System.Numerics;

namespace Nethereum.ABI.Decoders
{
    public static class ByteUtilExtensions
    {
        public static BigInteger ConvertToInt256(this byte[] bytes)
        {
            var value = new IntType("int256").Decode<BigInteger>(bytes);

            if (value > IntType.MAX_INT256_VALUE)
            {
                value = 1 + IntType.MAX_UINT256_VALUE - value;
            }

            return value;
        }

        public static BigInteger ConvertToUInt256(this byte[] bytes)
        {
            return new IntType("uint256").Decode<BigInteger>(bytes);
        }

    }
}