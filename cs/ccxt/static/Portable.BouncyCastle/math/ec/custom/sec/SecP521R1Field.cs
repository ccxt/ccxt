using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP521R1Field
    {
        // 2^521 - 1
        internal static readonly uint[] P = new uint[]{ 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF,
            0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF,
            0xFFFFFFFF, 0xFFFFFFFF, 0x1FF };
        private const uint P16 = 0x1FFU;

        public static void Add(uint[] x, uint[] y, uint[] z)
        {
            uint c = Nat.Add(16, x, y, z) + x[16] + y[16];
            if (c > P16 || (c == P16 && Nat.Eq(16, z, P)))
            {
                c += Nat.Inc(16, z);
                c &= P16;
            }
            z[16] = c;
        }

        public static void AddOne(uint[] x, uint[] z)
        {
            uint c = Nat.Inc(16, x, z) + x[16];
            if (c > P16 || (c == P16 && Nat.Eq(16, z, P)))
            {
                c += Nat.Inc(16, z);
                c &= P16;
            }
            z[16] = c;
        }

        public static uint[] FromBigInteger(BigInteger x)
        {
            uint[] z = Nat.FromBigInteger(521, x);
            if (Nat.Eq(17, z, P))
            {
                Nat.Zero(17, z);
            }
            return z;
        }

        public static void Half(uint[] x, uint[] z)
        {
            uint x16 = x[16];
            uint c = Nat.ShiftDownBit(16, x, x16, z);
            z[16] = (x16 >> 1) | (c >> 23);
        }

        public static void Inv(uint[] x, uint[] z)
        {
            Mod.CheckedModOddInverse(P, x, z);
        }

        public static int IsZero(uint[] x)
        {
            uint d = 0;
            for (int i = 0; i < 17; ++i)
            {
                d |= x[i];
            }
            d = (d >> 1) | (d & 1);
            return ((int)d - 1) >> 31;
        }

        public static void Multiply(uint[] x, uint[] y, uint[] z)
        {
            uint[] tt = Nat.Create(33);
            ImplMultiply(x, y, tt);
            Reduce(tt, z);
        }

        public static void Multiply(uint[] x, uint[] y, uint[] z, uint[] tt)
        {
            ImplMultiply(x, y, tt);
            Reduce(tt, z);
        }

        public static void Negate(uint[] x, uint[] z)
        {
            if (0 != IsZero(x))
            {
                Nat.Sub(17, P, P, z);
            }
            else
            {
                Nat.Sub(17, P, x, z);
            }
        }

        public static void Random(SecureRandom r, uint[] z)
        {
            byte[] bb = new byte[17 * 4];
            do
            {
                r.NextBytes(bb);
                Pack.LE_To_UInt32(bb, 0, z, 0, 17);
                z[16] &= P16;
            }
            while (0 == Nat.LessThan(17, z, P));
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
            Debug.Assert(xx[32] >> 18 == 0);
            uint xx32 = xx[32];
            uint c = Nat.ShiftDownBits(16, xx, 16, 9, xx32, z, 0) >> 23;
            c += xx32 >> 9;
            c += Nat.AddTo(16, xx, z);
            if (c > P16 || (c == P16 && Nat.Eq(16, z, P)))
            {
                c += Nat.Inc(16, z);
                c &= P16;
            }
            z[16] = c;
        }

        public static void Reduce23(uint[] z)
        {
            uint z16 = z[16];
            uint c = Nat.AddWordTo(16, z16 >> 9, z) + (z16 & P16);
            if (c > P16 || (c == P16 && Nat.Eq(16, z, P)))
            {
                c += Nat.Inc(16, z);
                c &= P16;
            }
            z[16] = c;
        }

        public static void Square(uint[] x, uint[] z)
        {
            uint[] tt = Nat.Create(33);
            ImplSquare(x, tt);
            Reduce(tt, z);
        }

        public static void Square(uint[] x, uint[] z, uint[] tt)
        {
            ImplSquare(x, tt);
            Reduce(tt, z);
        }

        public static void SquareN(uint[] x, int n, uint[] z)
        {
            Debug.Assert(n > 0);

            uint[] tt = Nat.Create(33);
            ImplSquare(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                ImplSquare(z, tt);
                Reduce(tt, z);
            }
        }

        public static void SquareN(uint[] x, int n, uint[] z, uint[] tt)
        {
            Debug.Assert(n > 0);

            ImplSquare(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                ImplSquare(z, tt);
                Reduce(tt, z);
            }
        }

        public static void Subtract(uint[] x, uint[] y, uint[] z)
        {
            int c = Nat.Sub(16, x, y, z) + (int)(x[16] - y[16]);
            if (c < 0)
            {
                c += Nat.Dec(16, z);
                c &= (int)P16;
            }
            z[16] = (uint)c;
        }

        public static void Twice(uint[] x, uint[] z)
        {
            uint x16 = x[16];
            uint c = Nat.ShiftUpBit(16, x, x16 << 23, z) | (x16 << 1);
            z[16] = c & P16;
        }

        protected static void ImplMultiply(uint[] x, uint[] y, uint[] zz)
        {
            Nat512.Mul(x, y, zz);

            uint x16 = x[16], y16 = y[16];
            zz[32] = Nat.Mul31BothAdd(16, x16, y, y16, x, zz, 16) + (x16 * y16);
        }

        protected static void ImplSquare(uint[] x, uint[] zz)
        {
            Nat512.Square(x, zz);

            uint x16 = x[16];
            zz[32] = Nat.MulWordAddTo(16, x16 << 1, x, 0, zz, 16) + (x16 * x16);
        }
    }
}
