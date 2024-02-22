using System;
using System.Security;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class Util
    {
        public static void Memcpy(Array src, UInt32 srcOffset, Array dst, UInt32 dstOffset, UInt32 count)
        {
            if (count > int.MaxValue)
                throw new InvalidCastException(nameof(count));

            if (dstOffset > int.MaxValue)
                throw new InvalidCastException(nameof(dstOffset));

            if (srcOffset > int.MaxValue)
                throw new InvalidCastException(nameof(srcOffset));

            Buffer.BlockCopy(src, (int)srcOffset, dst, (int)dstOffset, (int)count);
        }

        public static void Memcpy(Array src, int srcOffset, Array dst, int dstOffset, int count)
        {
            Buffer.BlockCopy(src, srcOffset, dst, dstOffset, count);
        }

        internal static void MemSet(byte[] dest, byte val, int size)
        {
            for (var i = 0; i < size && i < dest.Length; i++)
                dest[i] = val;
        }

        internal static void MemSet(byte[] dest, UInt32 skip, byte val, UInt32 size)
        {
            for (var i = skip; i < size && i < dest.Length; i++)
                dest[i] = val;
        }

        internal static UInt32 BitToUInt32Invers(byte[] b32, int index)
        {
            return b32[index + 3] | (UInt32)b32[index + 2] << 8 | (UInt32)b32[index + 1] << 16 | (UInt32)b32[index] << 24;
        }
    }
}
