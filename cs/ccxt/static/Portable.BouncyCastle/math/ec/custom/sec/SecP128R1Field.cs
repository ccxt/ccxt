using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP128R1Field
    {
        // 2^128 - 2^97 - 1
        internal static readonly uint[] P = new uint[]{ 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFD };
        private static readonly uint[] PExt = new uint[]{ 0x00000001, 0x00000000, 0x00000000, 0x00000004, 0xFFFFFFFE,
            0xFFFFFFFF, 0x00000003, 0xFFFFFFFC };
        private static readonly uint[] PExtInv = new uint[]{ 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFB,
            0x00000001, 0x00000000, 0xFFFFFFFC, 0x00000003 };
        private const uint P3 = 0xFFFFFFFD;
        private const uint PExt7 = 0xFFFFFFFC;

        public static void Add(uint[] x, uint[] y, uint[] z)
        {
            uint c = Nat128.Add(x, y, z);
            if (c != 0 || (z[3] >= P3 && Nat128.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        public static void AddExt(uint[] xx, uint[] yy, uint[] zz)
        {
            uint c = Nat256.Add(xx, yy, zz);
            if (c != 0 || (zz[7] >= PExt7 && Nat256.Gte(zz, PExt)))
            {
                Nat.AddTo(PExtInv.Length, PExtInv, zz);
            }
        }

        public static void AddOne(uint[] x, uint[] z)
        {
            uint c = Nat.Inc(4, x, z);
            if (c != 0 || (z[3] >= P3 && Nat128.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        public static uint[] FromBigInteger(BigInteger x)
        {
            uint[] z = Nat.FromBigInteger(128, x);
            if (z[3] >= P3 && Nat128.Gte(z, P))
            {
                Nat128.SubFrom(P, z);
            }
            return z;
        }

        public static void Half(uint[] x, uint[] z)
        {
            if ((x[0] & 1) == 0)
            {
                Nat.ShiftDownBit(4, x, 0, z);
            }
            else
            {
                uint c = Nat128.Add(x, P, z);
                Nat.ShiftDownBit(4, z, c);
            }
        }

        public static void Inv(uint[] x, uint[] z)
        {
            Mod.CheckedModOddInverse(P, x, z);
        }

        public static int IsZero(uint[] x)
        {
            uint d = 0;
            for (int i = 0; i < 4; ++i)
            {
                d |= x[i];
            }
            d = (d >> 1) | (d & 1);
            return ((int)d - 1) >> 31;
        }

        public static void Multiply(uint[] x, uint[] y, uint[] z)
        {
            uint[] tt = Nat128.CreateExt();
            Nat128.Mul(x, y, tt);
            Reduce(tt, z);
        }

        public static void MultiplyAddToExt(uint[] x, uint[] y, uint[] zz)
        {
            uint c = Nat128.MulAddTo(x, y, zz);
            if (c != 0 || (zz[7] >= PExt7 && Nat256.Gte(zz, PExt)))
            {
                Nat.AddTo(PExtInv.Length, PExtInv, zz);
            }
        }

        public static void Negate(uint[] x, uint[] z)
        {
            if (0 != IsZero(x))
            {
                Nat128.Sub(P, P, z);
            }
            else
            {
                Nat128.Sub(P, x, z);
            }
        }

        public static void Random(SecureRandom r, uint[] z)
        {
            byte[] bb = new byte[4 * 4];
            do
            {
                r.NextBytes(bb);
                Pack.LE_To_UInt32(bb, 0, z, 0, 4);
            }
            while (0 == Nat.LessThan(4, z, P));
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
            ulong x0 = xx[0], x1 = xx[1], x2 = xx[2], x3 = xx[3];
            ulong x4 = xx[4], x5 = xx[5], x6 = xx[6], x7 = xx[7];

            x3 += x7; x6 += (x7 << 1);
            x2 += x6; x5 += (x6 << 1);
            x1 += x5; x4 += (x5 << 1);
            x0 += x4; x3 += (x4 << 1);

            z[0] = (uint)x0; x1 += (x0 >> 32);
            z[1] = (uint)x1; x2 += (x1 >> 32);
            z[2] = (uint)x2; x3 += (x2 >> 32);
            z[3] = (uint)x3;

            Reduce32((uint)(x3 >> 32), z);
        }

        public static void Reduce32(uint x, uint[] z)
        {
            while (x != 0)
            {
                ulong c, x4 = x;
    
                c = (ulong)z[0] + x4;
                z[0] = (uint)c; c >>= 32;
                if (c != 0)
                {
                    c += (ulong)z[1];
                    z[1] = (uint)c; c >>= 32;
                    c += (ulong)z[2];
                    z[2] = (uint)c; c >>= 32;
                }
                c += (ulong)z[3] + (x4 << 1);
                z[3] = (uint)c; c >>= 32;

                Debug.Assert(c >= 0 && c <= 2);

                x = (uint)c;
            }

            if (z[3] >= P3 && Nat128.Gte(z, P))
            {
                AddPInvTo(z);
            }
        }

        public static void Square(uint[] x, uint[] z)
        {
            uint[] tt = Nat128.CreateExt();
            Nat128.Square(x, tt);
            Reduce(tt, z);
        }

        public static void SquareN(uint[] x, int n, uint[] z)
        {
            Debug.Assert(n > 0);

            uint[] tt = Nat128.CreateExt();
            Nat128.Square(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                Nat128.Square(z, tt);
                Reduce(tt, z);
            }
        }

        public static void Subtract(uint[] x, uint[] y, uint[] z)
        {
            int c = Nat128.Sub(x, y, z);
            if (c != 0)
            {
                SubPInvFrom(z);
            }
        }

        public static void SubtractExt(uint[] xx, uint[] yy, uint[] zz)
        {
            int c = Nat.Sub(10, xx, yy, zz);
            if (c != 0)
            {
                Nat.SubFrom(PExtInv.Length, PExtInv, zz);
            }
        }

        public static void Twice(uint[] x, uint[] z)
        {
            uint c = Nat.ShiftUpBit(4, x, 0, z);
            if (c != 0 || (z[3] >= P3 && Nat128.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        private static void AddPInvTo(uint[] z)
        {
            long c = (long)z[0] + 1;
            z[0] = (uint)c; c >>= 32;
            if (c != 0)
            {
                c += (long)z[1];
                z[1] = (uint)c; c >>= 32;
                c += (long)z[2];
                z[2] = (uint)c; c >>= 32;
            }
            c += (long)z[3] + 2;
            z[3] = (uint)c;
        }

        private static void SubPInvFrom(uint[] z)
        {
            long c = (long)z[0] - 1;
            z[0] = (uint)c; c >>= 32;
            if (c != 0)
            {
                c += (long)z[1];
                z[1] = (uint)c; c >>= 32;
                c += (long)z[2];
                z[2] = (uint)c; c >>= 32;
            }
            c += (long)z[3] - 2;
            z[3] = (uint)c;
        }
    }
}
