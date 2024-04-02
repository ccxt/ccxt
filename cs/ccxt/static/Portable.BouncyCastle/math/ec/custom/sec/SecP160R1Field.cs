using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP160R1Field
    {
        // 2^160 - 2^31 - 1
        internal static readonly uint[] P = new uint[]{ 0x7FFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF };
        private static readonly uint[] PExt = new uint[]{ 0x00000001, 0x40000001, 0x00000000, 0x00000000, 0x00000000,
            0xFFFFFFFE, 0xFFFFFFFE, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF };
        private static readonly uint[] PExtInv = new uint[]{ 0xFFFFFFFF, 0xBFFFFFFE, 0xFFFFFFFF, 0xFFFFFFFF,
            0xFFFFFFFF, 0x00000001, 0x00000001 };
        private const uint P4 = 0xFFFFFFFF;
        private const uint PExt9 = 0xFFFFFFFF;
        private const uint PInv = 0x80000001;

        public static void Add(uint[] x, uint[] y, uint[] z)
        {
            uint c = Nat160.Add(x, y, z);
            if (c != 0 || (z[4] == P4 && Nat160.Gte(z, P)))
            {
                Nat.AddWordTo(5, PInv, z);
            }
        }

        public static void AddExt(uint[] xx, uint[] yy, uint[] zz)
        {
            uint c = Nat.Add(10, xx, yy, zz);
            if (c != 0 || (zz[9] == PExt9 && Nat.Gte(10, zz, PExt)))
            {
                if (Nat.AddTo(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.IncAt(10, zz, PExtInv.Length);
                }
            }
        }

        public static void AddOne(uint[] x, uint[] z)
        {
            uint c = Nat.Inc(5, x, z);
            if (c != 0 || (z[4] == P4 && Nat160.Gte(z, P)))
            {
                Nat.AddWordTo(5, PInv, z);
            }
        }

        public static uint[] FromBigInteger(BigInteger x)
        {
            uint[] z = Nat.FromBigInteger(160, x);
            if (z[4] == P4 && Nat160.Gte(z, P))
            {
                Nat160.SubFrom(P, z);
            }
            return z;
        }

        public static void Half(uint[] x, uint[] z)
        {
            if ((x[0] & 1) == 0)
            {
                Nat.ShiftDownBit(5, x, 0, z);
            }
            else
            {
                uint c = Nat160.Add(x, P, z);
                Nat.ShiftDownBit(5, z, c);
            }
        }

        public static void Inv(uint[] x, uint[] z)
        {
            Mod.CheckedModOddInverse(P, x, z);
        }

        public static int IsZero(uint[] x)
        {
            uint d = 0;
            for (int i = 0; i < 5; ++i)
            {
                d |= x[i];
            }
            d = (d >> 1) | (d & 1);
            return ((int)d - 1) >> 31;
        }

        public static void Multiply(uint[] x, uint[] y, uint[] z)
        {
            uint[] tt = Nat160.CreateExt();
            Nat160.Mul(x, y, tt);
            Reduce(tt, z);
        }

        public static void MultiplyAddToExt(uint[] x, uint[] y, uint[] zz)
        {
            uint c = Nat160.MulAddTo(x, y, zz);
            if (c != 0 || (zz[9] == PExt9 && Nat.Gte(10, zz, PExt)))
            {
                if (Nat.AddTo(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.IncAt(10, zz, PExtInv.Length);
                }
            }
        }

        public static void Negate(uint[] x, uint[] z)
        {
            if (0 != IsZero(x))
            {
                Nat160.Sub(P, P, z);
            }
            else
            {
                Nat160.Sub(P, x, z);
            }
        }

        public static void Random(SecureRandom r, uint[] z)
        {
            byte[] bb = new byte[5 * 4];
            do
            {
                r.NextBytes(bb);
                Pack.LE_To_UInt32(bb, 0, z, 0, 5);
            }
            while (0 == Nat.LessThan(5, z, P));
        }

        public static void RandomMult(SecureRandom r, uint[] z)
        {
            do
            {
                Random(r, z);
            }
            while (0 != IsZero(z));
        }

        public static void Reduce(uint[] xx, uint[] z)
        {
            ulong x5 = xx[5], x6 = xx[6], x7 = xx[7], x8 = xx[8], x9 = xx[9];

            ulong c = 0;
            c += (ulong)xx[0] + x5 + (x5 << 31);
            z[0] = (uint)c; c >>= 32;
            c += (ulong)xx[1] + x6 + (x6 << 31);
            z[1] = (uint)c; c >>= 32;
            c += (ulong)xx[2] + x7 + (x7 << 31);
            z[2] = (uint)c; c >>= 32;
            c += (ulong)xx[3] + x8 + (x8 << 31);
            z[3] = (uint)c; c >>= 32;
            c += (ulong)xx[4] + x9 + (x9 << 31);
            z[4] = (uint)c; c >>= 32;

            Debug.Assert(c >> 32 == 0);

            Reduce32((uint)c, z);
        }

        public static void Reduce32(uint x, uint[] z)
        {
            if ((x != 0 && Nat160.MulWordsAdd(PInv, x, z, 0) != 0)
                || (z[4] == P4 && Nat160.Gte(z, P)))
            {
                Nat.AddWordTo(5, PInv, z);
            }
        }

        public static void Square(uint[] x, uint[] z)
        {
            uint[] tt = Nat160.CreateExt();
            Nat160.Square(x, tt);
            Reduce(tt, z);
        }

        public static void SquareN(uint[] x, int n, uint[] z)
        {
            Debug.Assert(n > 0);

            uint[] tt = Nat160.CreateExt();
            Nat160.Square(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                Nat160.Square(z, tt);
                Reduce(tt, z);
            }
        }

        public static void Subtract(uint[] x, uint[] y, uint[] z)
        {
            int c = Nat160.Sub(x, y, z);
            if (c != 0)
            {
                Nat.SubWordFrom(5, PInv, z);
            }
        }

        public static void SubtractExt(uint[] xx, uint[] yy, uint[] zz)
        {
            int c = Nat.Sub(10, xx, yy, zz);
            if (c != 0)
            {
                if (Nat.SubFrom(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.DecAt(10, zz, PExtInv.Length);
                }
            }
        }

        public static void Twice(uint[] x, uint[] z)
        {
            uint c = Nat.ShiftUpBit(5, x, 0, z);
            if (c != 0 || (z[4] == P4 && Nat160.Gte(z, P)))
            {
                Nat.AddWordTo(5, PInv, z);
            }
        }
    }
}
