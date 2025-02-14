using System;
#if NETCOREAPP3_0_OR_GREATER
using System.Numerics;
using System.Runtime.Intrinsics.X86;
#endif

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Utilities
{
    public abstract class Longs
    {
        public const int NumBits = 64;
        public const int NumBytes = 8;

        private static readonly byte[] DeBruijnTZ = {
            0x3F, 0x00, 0x01, 0x34, 0x02, 0x06, 0x35, 0x1A, 0x03, 0x25, 0x28, 0x07, 0x21, 0x36, 0x2F, 0x1B,
            0x3D, 0x04, 0x26, 0x2D, 0x2B, 0x29, 0x15, 0x08, 0x17, 0x22, 0x3A, 0x37, 0x30, 0x11, 0x1C, 0x0A,
            0x3E, 0x33, 0x05, 0x19, 0x24, 0x27, 0x20, 0x2E, 0x3C, 0x2C, 0x2A, 0x14, 0x16, 0x39, 0x10, 0x09,
            0x32, 0x18, 0x23, 0x1F, 0x3B, 0x13, 0x38, 0x0F, 0x31, 0x1E, 0x12, 0x0E, 0x1D, 0x0D, 0x0C, 0x0B };

        public static long HighestOneBit(long i)
        {
            return (long)HighestOneBit((ulong)i);
        }

        [CLSCompliant(false)]
        public static ulong HighestOneBit(ulong i)
        {
            i |= i >>  1;
            i |= i >>  2;
            i |= i >>  4;
            i |= i >>  8;
            i |= i >> 16;
            i |= i >> 32;
            return i - (i >> 1);
        }

        public static long LowestOneBit(long i)
        {
            return i & -i;
        }

        [CLSCompliant(false)]
        public static ulong LowestOneBit(ulong i)
        {
            return (ulong)LowestOneBit((long)i);
        }

        public static int NumberOfLeadingZeros(long i)
        {
#if NETCOREAPP3_0_OR_GREATER
            if (Lzcnt.X64.IsSupported)
            {
                return (int)Lzcnt.X64.LeadingZeroCount((ulong)i);
            }
#endif

            int x = (int)(i >> 32), n = 0;
            if (x == 0)
            {
                n = 32;
                x = (int)i;
            }
            return n + Integers.NumberOfLeadingZeros(x);
        }

        public static int NumberOfTrailingZeros(long i)
        {
#if NETCOREAPP3_0_OR_GREATER
            if (Bmi1.X64.IsSupported)
            {
                return (int)Bmi1.X64.TrailingZeroCount((ulong)i);
            }
#endif

            int n = DeBruijnTZ[(uint)((ulong)((i & -i) * 0x045FBAC7992A70DAL) >> 58)];
            long m = (((i & 0xFFFFFFFFL) | (long)((ulong)i >> 32)) - 1L) >> 63;
            return n - (int)m;
        }

        public static long Reverse(long i)
        {
            return (long)Reverse((ulong)i);
        }

        [CLSCompliant(false)]
        public static ulong Reverse(ulong i)
        {
            i = Bits.BitPermuteStepSimple(i, 0x5555555555555555UL, 1);
            i = Bits.BitPermuteStepSimple(i, 0x3333333333333333UL, 2);
            i = Bits.BitPermuteStepSimple(i, 0x0F0F0F0F0F0F0F0FUL, 4);
            return ReverseBytes(i);
        }

        public static long ReverseBytes(long i)
        {
            return (long)ReverseBytes((ulong)i);
        }

        [CLSCompliant(false)]
        public static ulong ReverseBytes(ulong i)
        {
            return RotateLeft(i & 0xFF000000FF000000UL,  8) |
                   RotateLeft(i & 0x00FF000000FF0000UL, 24) |
                   RotateLeft(i & 0x0000FF000000FF00UL, 40) |
                   RotateLeft(i & 0x000000FF000000FFUL, 56);
        }

        public static long RotateLeft(long i, int distance)
        {
#if NETCOREAPP3_0_OR_GREATER
            return (long)BitOperations.RotateLeft((ulong)i, distance);
#else
            return (i << distance) | (long)((ulong)i >> -distance);
#endif
        }

        [CLSCompliant(false)]
        public static ulong RotateLeft(ulong i, int distance)
        {
#if NETCOREAPP3_0_OR_GREATER
            return BitOperations.RotateLeft(i, distance);
#else
            return (i << distance) | (i >> -distance);
#endif
        }

        public static long RotateRight(long i, int distance)
        {
#if NETCOREAPP3_0_OR_GREATER
            return (long)BitOperations.RotateRight((ulong)i, distance);
#else
            return (long)((ulong)i >> distance) | (i << -distance);
#endif
        }

        [CLSCompliant(false)]
        public static ulong RotateRight(ulong i, int distance)
        {
#if NETCOREAPP3_0_OR_GREATER
            return BitOperations.RotateRight(i, distance);
#else
            return (i >> distance) | (i << -distance);
#endif
        }
    }
}
