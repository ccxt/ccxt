using System.Numerics;

namespace Nethereum.Hex.HexTypes
{
    public static class HexBigIntegerNumberExtensions
    {
        public static HexBigInteger ToHexBigInteger(this ulong val)
        {
            return new HexBigInteger(val);
        }

        public static HexBigInteger ToHexBigInteger(this int val)
        {
            return new HexBigInteger(val);
        }

        public static HexBigInteger ToHexBigInteger(this BigInteger val)
        {
            return new HexBigInteger(val);
        }

        public static ulong ToUlong(this HexBigInteger val)
        {
            return (ulong)val.Value;
        }
    }
}