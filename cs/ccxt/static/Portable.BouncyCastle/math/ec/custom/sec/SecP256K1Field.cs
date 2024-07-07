using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP256K1Field
    {
        // 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1
        internal static readonly uint[] P = new uint[]{ 0xFFFFFC2F, 0xFFFFFFFE, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF,
            0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF };
        private static readonly uint[] PExt = new uint[]{ 0x000E90A1, 0x000007A2, 0x00000001, 0x00000000, 0x00000000,
            0x00000000, 0x00000000, 0x00000000, 0xFFFFF85E, 0xFFFFFFFD, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF,
            0xFFFFFFFF, 0xFFFFFFFF };
        private static readonly uint[] PExtInv = new uint[]{ 0xFFF16F5F, 0xFFFFF85D, 0xFFFFFFFE, 0xFFFFFFFF,
            0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x000007A1, 0x00000002 };
        private const uint P7 = 0xFFFFFFFF;
        private const uint PExt15 = 0xFFFFFFFF;
        private const uint PInv33 = 0x3D1;

        public static void Add(uint[] x, uint[] y, uint[] z)
        {
            uint c = Nat256.Add(x, y, z);
            if (c != 0 || (z[7] == P7 && Nat256.Gte(z, P)))
            {
                Nat.Add33To(8, PInv33, z);
            }
        }

        public static void AddExt(uint[] xx, uint[] yy, uint[] zz)
        {
            uint c = Nat.Add(16, xx, yy, zz);
            if (c != 0 || (zz[15] == PExt15 && Nat.Gte(16, zz, PExt)))
            {
                if (Nat.AddTo(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.IncAt(16, zz, PExtInv.Length);
                }
            }
        }

        public static void AddOne(uint[] x, uint[] z)
        {
            uint c = Nat.Inc(8, x, z);
            if (c != 0 || (z[7] == P7 && Nat256.Gte(z, P)))
            {
                Nat.Add33To(8, PInv33, z);
            }
        }

        public static uint[] FromBigInteger(BigInteger x)
        {
            uint[] z = Nat.FromBigInteger(256, x);
            if (z[7] == P7 && Nat256.Gte(z, P))
            {
                Nat256.SubFrom(P, z);
            }
            return z;
        }

        public static void Half(uint[] x, uint[] z)
        {
            if ((x[0] & 1) == 0)
            {
                Nat.ShiftDownBit(8, x, 0, z);
            }
            else
            {
                uint c = Nat256.Add(x, P, z);
                Nat.ShiftDownBit(8, z, c);
            }
        }

        public static void Inv(uint[] x, uint[] z)
        {
            Mod.CheckedModOddInverse(P, x, z);
        }

        public static int IsZero(uint[] x)
        {
            uint d = 0;
            for (int i = 0; i < 8; ++i)
            {
                d |= x[i];
            }
            d = (d >> 1) | (d & 1);
            return ((int)d - 1) >> 31;
        }

        public static void Multiply(uint[] x, uint[] y, uint[] z)
        {
            uint[] tt = Nat256.CreateExt();
            Nat256.Mul(x, y, tt);
            Reduce(tt, z);
        }

        public static void Multiply(uint[] x, uint[] y, uint[] z, uint[] tt)
        {
            Nat256.Mul(x, y, tt);
            Reduce(tt, z);
        }

        public static void MultiplyAddToExt(uint[] x, uint[] y, uint[] zz)
        {
            uint c = Nat256.MulAddTo(x, y, zz);
            if (c != 0 || (zz[15] == PExt15 && Nat.Gte(16, zz, PExt)))
            {
                if (Nat.AddTo(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.IncAt(16, zz, PExtInv.Length);
                }
            }
        }

        public static void Negate(uint[] x, uint[] z)
        {
            if (0 != IsZero(x))
            {
                Nat256.Sub(P, P, z);
            }
            else
            {
                Nat256.Sub(P, x, z);
            }
        }

        public static void Random(SecureRandom r, uint[] z)
        {
            byte[] bb = new byte[8 * 4];
            do
            {
                r.NextBytes(bb);
                Pack.LE_To_UInt32(bb, 0, z, 0, 8);
            }
            while (0 == Nat.LessThan(8, z, P));
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
            ulong cc = Nat256.Mul33Add(PInv33, xx, 8, xx, 0, z, 0);
            uint c = Nat256.Mul33DWordAdd(PInv33, cc, z, 0);

            Debug.Assert(c == 0 || c == 1);

            if (c != 0 || (z[7] == P7 && Nat256.Gte(z, P)))
            {
                Nat.Add33To(8, PInv33, z);
            }
        }

        public static void Reduce32(uint x, uint[] z)
        {
            if ((x != 0 && Nat256.Mul33WordAdd(PInv33, x, z, 0) != 0)
                || (z[7] == P7 && Nat256.Gte(z, P)))
            {
                Nat.Add33To(8, PInv33, z);
            }
        }

        public static void Square(uint[] x, uint[] z)
        {
            uint[] tt = Nat256.CreateExt();
            Nat256.Square(x, tt);
            Reduce(tt, z);
        }

        public static void Square(uint[] x, uint[] z, uint[] tt)
        {
            Nat256.Square(x, tt);
            Reduce(tt, z);
        }

        public static void SquareN(uint[] x, int n, uint[] z)
        {
            Debug.Assert(n > 0);

            uint[] tt = Nat256.CreateExt();
            Nat256.Square(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                Nat256.Square(z, tt);
                Reduce(tt, z);
            }
        }

        public static void SquareN(uint[] x, int n, uint[] z, uint[] tt)
        {
            Debug.Assert(n > 0);

            Nat256.Square(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                Nat256.Square(z, tt);
                Reduce(tt, z);
            }
        }

        public static void Subtract(uint[] x, uint[] y, uint[] z)
        {
            int c = Nat256.Sub(x, y, z);
            if (c != 0)
            {
                Nat.Sub33From(8, PInv33, z);
            }
        }

        public static void SubtractExt(uint[] xx, uint[] yy, uint[] zz)
        {
            int c = Nat.Sub(16, xx, yy, zz);
            if (c != 0)
            {
                if (Nat.SubFrom(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.DecAt(16, zz, PExtInv.Length);
                }
            }
        }

        public static void Twice(uint[] x, uint[] z)
        {
            uint c = Nat.ShiftUpBit(8, x, 0, z);
            if (c != 0 || (z[7] == P7 && Nat256.Gte(z, P)))
            {
                Nat.Add33To(8, PInv33, z);
            }
        }
    }
}
