using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP224R1Field
    {
        // 2^224 - 2^96 + 1
        internal static readonly uint[] P = new uint[]{ 0x00000001, 0x00000000, 0x00000000, 0xFFFFFFFF, 0xFFFFFFFF,
            0xFFFFFFFF, 0xFFFFFFFF };
        private static readonly uint[] PExt = new uint[]{ 0x00000001, 0x00000000, 0x00000000, 0xFFFFFFFE, 0xFFFFFFFF,
            0xFFFFFFFF, 0x00000000, 0x00000002, 0x00000000, 0x00000000, 0xFFFFFFFE, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF
        };
        private static readonly uint[] PExtInv = new uint[]{ 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x00000001,
            0x00000000, 0x00000000, 0xFFFFFFFF, 0xFFFFFFFD, 0xFFFFFFFF, 0xFFFFFFFF, 0x00000001 };
        private const uint P6 = 0xFFFFFFFF;
        private const uint PExt13 = 0xFFFFFFFF;

        public static void Add(uint[] x, uint[] y, uint[] z)
        {
            uint c = Nat224.Add(x, y, z);
            if (c != 0 || (z[6] == P6 && Nat224.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        public static void AddExt(uint[] xx, uint[] yy, uint[] zz)
        {
            uint c = Nat.Add(14, xx, yy, zz);
            if (c != 0 || (zz[13] == PExt13 && Nat.Gte(14, zz, PExt)))
            {
                if (Nat.AddTo(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.IncAt(14, zz, PExtInv.Length);
                }
            }
        }

        public static void AddOne(uint[] x, uint[] z)
        {
            uint c = Nat.Inc(7, x, z);
            if (c != 0 || (z[6] == P6 && Nat224.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        public static uint[] FromBigInteger(BigInteger x)
        {
            uint[] z = Nat.FromBigInteger(224, x);
            if (z[6] == P6 && Nat224.Gte(z, P))
            {
                Nat224.SubFrom(P, z);
            }
            return z;
        }

        public static void Half(uint[] x, uint[] z)
        {
            if ((x[0] & 1) == 0)
            {
                Nat.ShiftDownBit(7, x, 0, z);
            }
            else
            {
                uint c = Nat224.Add(x, P, z);
                Nat.ShiftDownBit(7, z, c);
            }
        }

        public static void Inv(uint[] x, uint[] z)
        {
            Mod.CheckedModOddInverse(P, x, z);
        }

        public static int IsZero(uint[] x)
        {
            uint d = 0;
            for (int i = 0; i < 7; ++i)
            {
                d |= x[i];
            }
            d = (d >> 1) | (d & 1);
            return ((int)d - 1) >> 31;
        }

        public static void Multiply(uint[] x, uint[] y, uint[] z)
        {
            uint[] tt = Nat224.CreateExt();
            Nat224.Mul(x, y, tt);
            Reduce(tt, z);
        }

        public static void MultiplyAddToExt(uint[] x, uint[] y, uint[] zz)
        {
            uint c = Nat224.MulAddTo(x, y, zz);
            if (c != 0 || (zz[13] == PExt13 && Nat.Gte(14, zz, PExt)))
            {
                if (Nat.AddTo(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.IncAt(14, zz, PExtInv.Length);
                }
            }
        }

        public static void Negate(uint[] x, uint[] z)
        {
            if (0 != IsZero(x))
            {
                Nat224.Sub(P, P, z);
            }
            else
            {
                Nat224.Sub(P, x, z);
            }
        }

        public static void Random(SecureRandom r, uint[] z)
        {
            byte[] bb = new byte[7 * 4];
            do
            {
                r.NextBytes(bb);
                Pack.LE_To_UInt32(bb, 0, z, 0, 7);
            }
            while (0 == Nat.LessThan(7, z, P));
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
            long xx10 = xx[10], xx11 = xx[11], xx12 = xx[12], xx13 = xx[13];

            const long n = 1;

            long t0 = (long)xx[7] + xx11 - n;
            long t1 = (long)xx[8] + xx12;
            long t2 = (long)xx[9] + xx13;

            long cc = 0;
            cc += (long)xx[0] - t0;
            long z0 = (uint)cc;
            cc >>= 32;
            cc += (long)xx[1] - t1;
            z[1] = (uint)cc;
            cc >>= 32;
            cc += (long)xx[2] - t2;
            z[2] = (uint)cc;
            cc >>= 32;
            cc += (long)xx[3] + t0 - xx10;
            long z3 = (uint)cc;
            cc >>= 32;
            cc += (long)xx[4] + t1 - xx11;
            z[4] = (uint)cc;
            cc >>= 32;
            cc += (long)xx[5] + t2 - xx12;
            z[5] = (uint)cc;
            cc >>= 32;
            cc += (long)xx[6] + xx10 - xx13;
            z[6] = (uint)cc;
            cc >>= 32;
            cc += n;

            Debug.Assert(cc >= 0);

            z3 += cc;

            z0 -= cc;
            z[0] = (uint)z0;
            cc = z0 >> 32;
            if (cc != 0)
            {
                cc += (long)z[1];
                z[1] = (uint)cc;
                cc >>= 32;
                cc += (long)z[2];
                z[2] = (uint)cc;
                z3 += cc >> 32;
            }
            z[3] = (uint)z3;
            cc = z3 >> 32;

            Debug.Assert(cc == 0 || cc == 1);

            if ((cc != 0 && Nat.IncAt(7, z, 4) != 0)
                || (z[6] == P6 && Nat224.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        public static void Reduce32(uint x, uint[] z)
        {
            long cc = 0;

            if (x != 0)
            {
                long xx07 = x;

                cc += (long)z[0] - xx07;
                z[0] = (uint)cc;
                cc >>= 32;
                if (cc != 0)
                {
                    cc += (long)z[1];
                    z[1] = (uint)cc;
                    cc >>= 32;
                    cc += (long)z[2];
                    z[2] = (uint)cc;
                    cc >>= 32;
                }
                cc += (long)z[3] + xx07;
                z[3] = (uint)cc;
                cc >>= 32;

                Debug.Assert(cc == 0 || cc == 1);
            }

            if ((cc != 0 && Nat.IncAt(7, z, 4) != 0)
                || (z[6] == P6 && Nat224.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        public static void Square(uint[] x, uint[] z)
        {
            uint[] tt = Nat224.CreateExt();
            Nat224.Square(x, tt);
            Reduce(tt, z);
        }

        public static void SquareN(uint[] x, int n, uint[] z)
        {
            Debug.Assert(n > 0);

            uint[] tt = Nat224.CreateExt();
            Nat224.Square(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                Nat224.Square(z, tt);
                Reduce(tt, z);
            }
        }

        public static void Subtract(uint[] x, uint[] y, uint[] z)
        {
            int c = Nat224.Sub(x, y, z);
            if (c != 0)
            {
                SubPInvFrom(z);
            }
        }

        public static void SubtractExt(uint[] xx, uint[] yy, uint[] zz)
        {
            int c = Nat.Sub(14, xx, yy, zz);
            if (c != 0)
            {
                if (Nat.SubFrom(PExtInv.Length, PExtInv, zz) != 0)
                {
                    Nat.DecAt(14, zz, PExtInv.Length);
                }
            }
        }

        public static void Twice(uint[] x, uint[] z)
        {
            uint c = Nat.ShiftUpBit(7, x, 0, z);
            if (c != 0 || (z[6] == P6 && Nat224.Gte(z, P)))
            {
                AddPInvTo(z);
            }
        }

        private static void AddPInvTo(uint[] z)
        {
            long c = (long)z[0] - 1;
            z[0] = (uint)c;
            c >>= 32;
            if (c != 0)
            {
                c += (long)z[1];
                z[1] = (uint)c;
                c >>= 32;
                c += (long)z[2];
                z[2] = (uint)c;
                c >>= 32;
            }
            c += (long)z[3] + 1;
            z[3] = (uint)c;
            c >>= 32;
            if (c != 0)
            {
                Nat.IncAt(7, z, 4);
            }
        }

        private static void SubPInvFrom(uint[] z)
        {
            long c = (long)z[0] + 1;
            z[0] = (uint)c;
            c >>= 32;
            if (c != 0)
            {
                c += (long)z[1];
                z[1] = (uint)c;
                c >>= 32;
                c += (long)z[2];
                z[2] = (uint)c;
                c >>= 32;
            }
            c += (long)z[3] - 1;
            z[3] = (uint)c;
            c >>= 32;
            if (c != 0)
            {
                Nat.DecAt(7, z, 4);
            }
        }
    }
}
