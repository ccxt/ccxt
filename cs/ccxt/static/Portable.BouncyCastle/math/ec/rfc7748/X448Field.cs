using System;
using System.Diagnostics;

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Rfc7748
{
    [CLSCompliant(false)]
    public static class X448Field
    {
        public const int Size = 16;

        private const uint M28 = 0x0FFFFFFFU;

        private static readonly uint[] P32 = new uint[]{ 0xFFFFFFFFU, 0xFFFFFFFFU, 0xFFFFFFFFU, 0xFFFFFFFFU,
            0xFFFFFFFFU, 0xFFFFFFFFU, 0xFFFFFFFFU, 0xFFFFFFFEU, 0xFFFFFFFFU, 0xFFFFFFFFU, 0xFFFFFFFFU, 0xFFFFFFFFU,
            0xFFFFFFFFU, 0xFFFFFFFFU };

        public static void Add(uint[] x, uint[] y, uint[] z)
        {
            for (int i = 0; i < Size; ++i)
            {
                z[i] = x[i] + y[i];
            }
        }

        public static void AddOne(uint[] z)
        {
            z[0] += 1;
        }

        public static void AddOne(uint[] z, int zOff)
        {
            z[zOff] += 1;
        }

        //public static void Apm(int[] x, int[] y, int[] zp, int[] zm)
        //{
        //    for (int i = 0; i < Size; ++i)
        //    {
        //        int xi = x[i], yi = y[i];
        //        zp[i] = xi + yi;
        //        zm[i] = xi - yi;
        //    }
        //}

        public static int AreEqual(uint[] x, uint[] y)
        {
            uint d = 0;
            for (int i = 0; i < Size; ++i)
            {
                d |= x[i] ^ y[i];
            }
            d |= d >> 16;
            d &= 0xFFFF;
            return ((int)d - 1) >> 31;
        }

        public static bool AreEqualVar(uint[] x, uint[] y)
        {
            return 0 != AreEqual(x, y);
        }

        public static void Carry(uint[] z)
        {
            uint z0 = z[0], z1 = z[1], z2 = z[2], z3 = z[3], z4 = z[4], z5 = z[5], z6 = z[6], z7 = z[7];
            uint z8 = z[8], z9 = z[9], z10 = z[10], z11 = z[11], z12 = z[12], z13 = z[13], z14 = z[14], z15 = z[15];

            z1   += (z0 >> 28); z0 &= M28;
            z5   += (z4 >> 28); z4 &= M28;
            z9   += (z8 >> 28); z8 &= M28;
            z13  += (z12 >> 28); z12 &= M28;

            z2   += (z1 >> 28); z1 &= M28;
            z6   += (z5 >> 28); z5 &= M28;
            z10  += (z9 >> 28); z9 &= M28;
            z14  += (z13 >> 28); z13 &= M28;

            z3   += (z2 >> 28); z2 &= M28;
            z7   += (z6 >> 28); z6 &= M28;
            z11  += (z10 >> 28); z10 &= M28;
            z15  += (z14 >> 28); z14 &= M28;

            uint t = z15 >> 28; z15 &= M28;
            z0   += t;
            z8   += t;

            z4   += (z3 >> 28); z3 &= M28;
            z8   += (z7 >> 28); z7 &= M28;
            z12  += (z11 >> 28); z11 &= M28;

            z1   += (z0 >> 28); z0 &= M28;
            z5   += (z4 >> 28); z4 &= M28;
            z9   += (z8 >> 28); z8 &= M28;
            z13  += (z12 >> 28); z12 &= M28;

            z[0] = z0; z[1] = z1; z[2] = z2; z[3] = z3; z[4] = z4; z[5] = z5; z[6] = z6; z[7] = z7;
            z[8] = z8; z[9] = z9; z[10] = z10; z[11] = z11; z[12] = z12; z[13] = z13; z[14] = z14; z[15] = z15;
        }

        public static void CMov(int cond, uint[] x, int xOff, uint[] z, int zOff)
        {
            Debug.Assert(0 == cond || -1 == cond);

            uint MASK = (uint)cond;

            for (int i = 0; i < Size; ++i)
            {
                uint z_i = z[zOff + i], diff = z_i ^ x[xOff + i];
                z_i ^= (diff & MASK);
                z[zOff + i] = z_i;
            }
        }

        public static void CNegate(int negate, uint[] z)
        {
            Debug.Assert(negate >> 1 == 0);

            uint[] t = Create();
            Sub(t, z, t);

            CMov(-negate, t, 0, z, 0);
        }

        public static void Copy(uint[] x, int xOff, uint[] z, int zOff)
        {
            for (int i = 0; i < Size; ++i)
            {
                z[zOff + i] = x[xOff + i];
            }
        }

        public static uint[] Create()
        {
            return new uint[Size];
        }

        public static uint[] CreateTable(int n)
        {
            return new uint[Size * n];
        }

        public static void CSwap(int swap, uint[] a, uint[] b)
        {
            Debug.Assert(swap >> 1 == 0);
            Debug.Assert(a != b);

            uint mask = (uint)(0 - swap);
            for (int i = 0; i < Size; ++i)
            {
                uint ai = a[i], bi = b[i];
                uint dummy = mask & (ai ^ bi);
                a[i] = ai ^ dummy; 
                b[i] = bi ^ dummy; 
            }
        }

        public static void Decode(uint[] x, int xOff, uint[] z)
        {
            Decode224(x, xOff, z, 0);
            Decode224(x, xOff + 7, z, 8);
        }

        public static void Decode(byte[] x, int xOff, uint[] z)
        {
            Decode56(x, xOff, z, 0);
            Decode56(x, xOff + 7, z, 2);
            Decode56(x, xOff + 14, z, 4);
            Decode56(x, xOff + 21, z, 6);
            Decode56(x, xOff + 28, z, 8);
            Decode56(x, xOff + 35, z, 10);
            Decode56(x, xOff + 42, z, 12);
            Decode56(x, xOff + 49, z, 14);
        }

        private static void Decode224(uint[] x, int xOff, uint[] z, int zOff)
        {
            uint x0 = x[xOff + 0], x1 = x[xOff + 1], x2 = x[xOff + 2], x3 = x[xOff + 3];
            uint x4 = x[xOff + 4], x5 = x[xOff + 5], x6 = x[xOff + 6];

            z[zOff + 0] = x0 & M28;
            z[zOff + 1] = (x0 >> 28 | x1 <<  4) & M28;
            z[zOff + 2] = (x1 >> 24 | x2 <<  8) & M28;
            z[zOff + 3] = (x2 >> 20 | x3 << 12) & M28;
            z[zOff + 4] = (x3 >> 16 | x4 << 16) & M28;
            z[zOff + 5] = (x4 >> 12 | x5 << 20) & M28;
            z[zOff + 6] = (x5 >>  8 | x6 << 24) & M28;
            z[zOff + 7] = x6 >> 4;
        }

        private static uint Decode24(byte[] bs, int off)
        {
            uint n = bs[off];
            n |= (uint)bs[++off] << 8;
            n |= (uint)bs[++off] << 16;
            return n;
        }

        private static uint Decode32(byte[] bs, int off)
        {
            uint n = bs[off];
            n |= (uint)bs[++off] << 8;
            n |= (uint)bs[++off] << 16;
            n |= (uint)bs[++off] << 24;
            return n;
        }

        private static void Decode56(byte[] bs, int off, uint[] z, int zOff)
        {
            uint lo = Decode32(bs, off);
            uint hi = Decode24(bs, off + 4);
            z[zOff] = lo & M28;
            z[zOff + 1] = (lo >> 28) | (hi << 4);
        }

        public static void Encode(uint[] x, uint[] z, int zOff)
        {
            Encode224(x, 0, z, zOff);
            Encode224(x, 8, z, zOff + 7);
        }

        public static void Encode(uint[] x, byte[] z, int zOff)
        {
            Encode56(x, 0, z, zOff);
            Encode56(x, 2, z, zOff + 7);
            Encode56(x, 4, z, zOff + 14);
            Encode56(x, 6, z, zOff + 21);
            Encode56(x, 8, z, zOff + 28);
            Encode56(x, 10, z, zOff + 35);
            Encode56(x, 12, z, zOff + 42);
            Encode56(x, 14, z, zOff + 49);
        }

        private static void Encode224(uint[] x, int xOff, uint[] z, int zOff)
        {
            uint x0 = x[xOff + 0], x1 = x[xOff + 1], x2 = x[xOff + 2], x3 = x[xOff + 3];
            uint x4 = x[xOff + 4], x5 = x[xOff + 5], x6 = x[xOff + 6], x7 = x[xOff + 7];

            z[zOff + 0] =  x0        | (x1 << 28);
            z[zOff + 1] = (x1 >>  4) | (x2 << 24);
            z[zOff + 2] = (x2 >>  8) | (x3 << 20);
            z[zOff + 3] = (x3 >> 12) | (x4 << 16);
            z[zOff + 4] = (x4 >> 16) | (x5 << 12);
            z[zOff + 5] = (x5 >> 20) | (x6 <<  8);
            z[zOff + 6] = (x6 >> 24) | (x7 <<  4);
        }

        private static void Encode24(uint n, byte[] bs, int off)
        {
            bs[  off] = (byte)(n      );
            bs[++off] = (byte)(n >>  8);
            bs[++off] = (byte)(n >> 16);
        }

        private static void Encode32(uint n, byte[] bs, int off)
        {
            bs[  off] = (byte)(n      );
            bs[++off] = (byte)(n >>  8);
            bs[++off] = (byte)(n >> 16);
            bs[++off] = (byte)(n >> 24);
        }

        private static void Encode56(uint[] x, int xOff, byte[] bs, int off)
        {
            uint lo = x[xOff], hi = x[xOff + 1];
            Encode32(lo | (hi << 28), bs, off);
            Encode24(hi >> 4, bs, off + 4);
        }

        public static void Inv(uint[] x, uint[] z)
        {
            //uint[] t = Create();
            //PowPm3d4(x, t);
            //Sqr(t, 2, t);
            //Mul(t, x, z);

            uint[] t = Create();
            uint[] u = new uint[14];

            Copy(x, 0, t, 0);
            Normalize(t);
            Encode(t, u, 0);

            Mod.ModOddInverse(P32, u, u);

            Decode(u, 0, z);
        }

        public static void InvVar(uint[] x, uint[] z)
        {
            uint[] t = Create();
            uint[] u = new uint[14];

            Copy(x, 0, t, 0);
            Normalize(t);
            Encode(t, u, 0);

            Mod.ModOddInverseVar(P32, u, u);

            Decode(u, 0, z);
        }

        public static int IsOne(uint[] x)
        {
            uint d = x[0] ^ 1;
            for (int i = 1; i < Size; ++i)
            {
                d |= x[i];
            }
            d |= d >> 16;
            d &= 0xFFFF;
            return ((int)d - 1) >> 31;
        }

        public static bool IsOneVar(uint[] x)
        {
            return 0 != IsOne(x);
        }

        public static int IsZero(uint[] x)
        {
            uint d = 0;
            for (int i = 0; i < Size; ++i)
            {
                d |= x[i];
            }
            d |= d >> 16;
            d &= 0xFFFF;
            return ((int)d - 1) >> 31;
        }

        public static bool IsZeroVar(uint[] x)
        {
            return 0U != IsZero(x);
        }

        public static void Mul(uint[] x, uint y, uint[] z)
        {
            uint x0 = x[0], x1 = x[1], x2 = x[2], x3 = x[3], x4 = x[4], x5 = x[5], x6 = x[6], x7 = x[7];
            uint x8 = x[8], x9 = x[9], x10 = x[10], x11 = x[11], x12 = x[12], x13 = x[13], x14 = x[14], x15 = x[15];

            uint z1, z5, z9, z13;
            ulong c, d, e, f;

            c     = (ulong)x1 * y;
            z1    = (uint)c & M28; c >>= 28;
            d     = (ulong)x5 * y;
            z5    = (uint)d & M28; d >>= 28;
            e     = (ulong)x9 * y;
            z9    = (uint)e & M28; e >>= 28;
            f     = (ulong)x13 * y;
            z13   = (uint)f & M28; f >>= 28;

            c    += (ulong)x2 * y;
            z[2]  = (uint)c & M28; c >>= 28;
            d    += (ulong)x6 * y;
            z[6]  = (uint)d & M28; d >>= 28;
            e    += (ulong)x10 * y;
            z[10] = (uint)e & M28; e >>= 28;
            f    += (ulong)x14 * y;
            z[14] = (uint)f & M28; f >>= 28;

            c    += (ulong)x3 * y;
            z[3]  = (uint)c & M28; c >>= 28;
            d    += (ulong)x7 * y;
            z[7]  = (uint)d & M28; d >>= 28;
            e    += (ulong)x11 * y;
            z[11] = (uint)e & M28; e >>= 28;
            f    += (ulong)x15 * y;
            z[15] = (uint)f & M28; f >>= 28;

            d    += f;

            c    += (ulong)x4 * y;
            z[4]  = (uint)c & M28; c >>= 28;
            d    += (ulong)x8 * y;
            z[8]  = (uint)d & M28; d >>= 28;
            e    += (ulong)x12 * y;
            z[12] = (uint)e & M28; e >>= 28;
            f    += (ulong)x0 * y;
            z[0]  = (uint)f & M28; f >>= 28;

            z[1]  = z1 + (uint)f;
            z[5]  = z5 + (uint)c;
            z[9]  = z9 + (uint)d;
            z[13] = z13 + (uint)e;
        }

        public static void Mul(uint[] x, uint[] y, uint[] z)
        {
            uint x0 = x[0];
            uint x1 = x[1];
            uint x2 = x[2];
            uint x3 = x[3];
            uint x4 = x[4];
            uint x5 = x[5];
            uint x6 = x[6];
            uint x7 = x[7];

            uint u0 = x[8];
            uint u1 = x[9];
            uint u2 = x[10];
            uint u3 = x[11];
            uint u4 = x[12];
            uint u5 = x[13];
            uint u6 = x[14];
            uint u7 = x[15];

            uint y0 = y[0];
            uint y1 = y[1];
            uint y2 = y[2];
            uint y3 = y[3];
            uint y4 = y[4];
            uint y5 = y[5];
            uint y6 = y[6];
            uint y7 = y[7];

            uint v0 = y[8];
            uint v1 = y[9];
            uint v2 = y[10];
            uint v3 = y[11];
            uint v4 = y[12];
            uint v5 = y[13];
            uint v6 = y[14];
            uint v7 = y[15];

            uint s0 = x0 + u0;
            uint s1 = x1 + u1;
            uint s2 = x2 + u2;
            uint s3 = x3 + u3;
            uint s4 = x4 + u4;
            uint s5 = x5 + u5;
            uint s6 = x6 + u6;
            uint s7 = x7 + u7;

            uint t0 = y0 + v0;
            uint t1 = y1 + v1;
            uint t2 = y2 + v2;
            uint t3 = y3 + v3;
            uint t4 = y4 + v4;
            uint t5 = y5 + v5;
            uint t6 = y6 + v6;
            uint t7 = y7 + v7;

            uint z0, z1, z2, z3, z4, z5, z6, z7, z8, z9, z10, z11, z12, z13, z14, z15;
            ulong c, d;

            ulong f0  = (ulong)x0 * y0;
            ulong f8  = (ulong)x7 * y1
                      + (ulong)x6 * y2
                      + (ulong)x5 * y3
                      + (ulong)x4 * y4
                      + (ulong)x3 * y5
                      + (ulong)x2 * y6
                      + (ulong)x1 * y7;
            ulong g0  = (ulong)u0 * v0;
            ulong g8  = (ulong)u7 * v1
                      + (ulong)u6 * v2
                      + (ulong)u5 * v3
                      + (ulong)u4 * v4
                      + (ulong)u3 * v5
                      + (ulong)u2 * v6
                      + (ulong)u1 * v7;
            ulong h0  = (ulong)s0 * t0;
            ulong h8  = (ulong)s7 * t1
                      + (ulong)s6 * t2
                      + (ulong)s5 * t3
                      + (ulong)s4 * t4
                      + (ulong)s3 * t5
                      + (ulong)s2 * t6
                      + (ulong)s1 * t7;

            c         = f0 + g0 + h8 - f8;
            z0        = (uint)c & M28; c >>= 28;
            d         = g8 + h0 - f0 + h8;
            z8        = (uint)d & M28; d >>= 28;

            ulong f1  = (ulong)x1 * y0
                      + (ulong)x0 * y1;
            ulong f9  = (ulong)x7 * y2
                      + (ulong)x6 * y3
                      + (ulong)x5 * y4
                      + (ulong)x4 * y5
                      + (ulong)x3 * y6
                      + (ulong)x2 * y7;
            ulong g1  = (ulong)u1 * v0
                      + (ulong)u0 * v1;
            ulong g9  = (ulong)u7 * v2
                      + (ulong)u6 * v3
                      + (ulong)u5 * v4
                      + (ulong)u4 * v5
                      + (ulong)u3 * v6
                      + (ulong)u2 * v7;
            ulong h1  = (ulong)s1 * t0
                      + (ulong)s0 * t1;
            ulong h9  = (ulong)s7 * t2
                      + (ulong)s6 * t3
                      + (ulong)s5 * t4
                      + (ulong)s4 * t5
                      + (ulong)s3 * t6
                      + (ulong)s2 * t7;

            c        += f1 + g1 + h9 - f9;
            z1        = (uint)c & M28; c >>= 28;
            d        += g9 + h1 - f1 + h9;
            z9        = (uint)d & M28; d >>= 28;

            ulong f2  = (ulong)x2 * y0
                      + (ulong)x1 * y1
                      + (ulong)x0 * y2;
            ulong f10 = (ulong)x7 * y3
                      + (ulong)x6 * y4
                      + (ulong)x5 * y5
                      + (ulong)x4 * y6
                      + (ulong)x3 * y7;
            ulong g2  = (ulong)u2 * v0
                      + (ulong)u1 * v1
                      + (ulong)u0 * v2;
            ulong g10 = (ulong)u7 * v3
                      + (ulong)u6 * v4
                      + (ulong)u5 * v5
                      + (ulong)u4 * v6
                      + (ulong)u3 * v7;
            ulong h2  = (ulong)s2 * t0
                      + (ulong)s1 * t1
                      + (ulong)s0 * t2;
            ulong h10 = (ulong)s7 * t3
                      + (ulong)s6 * t4
                      + (ulong)s5 * t5
                      + (ulong)s4 * t6
                      + (ulong)s3 * t7;

            c        += f2 + g2 + h10 - f10;
            z2        = (uint)c & M28; c >>= 28;
            d        += g10 + h2 - f2 + h10;
            z10       = (uint)d & M28; d >>= 28;

            ulong f3  = (ulong)x3 * y0
                      + (ulong)x2 * y1
                      + (ulong)x1 * y2
                      + (ulong)x0 * y3;
            ulong f11 = (ulong)x7 * y4
                      + (ulong)x6 * y5
                      + (ulong)x5 * y6
                      + (ulong)x4 * y7;
            ulong g3  = (ulong)u3 * v0
                      + (ulong)u2 * v1
                      + (ulong)u1 * v2
                      + (ulong)u0 * v3;
            ulong g11 = (ulong)u7 * v4
                      + (ulong)u6 * v5
                      + (ulong)u5 * v6
                      + (ulong)u4 * v7;
            ulong h3  = (ulong)s3 * t0
                      + (ulong)s2 * t1
                      + (ulong)s1 * t2
                      + (ulong)s0 * t3;
            ulong h11 = (ulong)s7 * t4
                      + (ulong)s6 * t5
                      + (ulong)s5 * t6
                      + (ulong)s4 * t7;

            c        += f3 + g3 + h11 - f11;
            z3        = (uint)c & M28; c >>= 28;
            d        += g11 + h3 - f3 + h11;
            z11       = (uint)d & M28; d >>= 28;

            ulong f4  = (ulong)x4 * y0
                      + (ulong)x3 * y1
                      + (ulong)x2 * y2
                      + (ulong)x1 * y3
                      + (ulong)x0 * y4;
            ulong f12 = (ulong)x7 * y5
                      + (ulong)x6 * y6
                      + (ulong)x5 * y7;
            ulong g4  = (ulong)u4 * v0
                      + (ulong)u3 * v1
                      + (ulong)u2 * v2
                      + (ulong)u1 * v3
                      + (ulong)u0 * v4;
            ulong g12 = (ulong)u7 * v5
                      + (ulong)u6 * v6
                      + (ulong)u5 * v7;
            ulong h4  = (ulong)s4 * t0
                      + (ulong)s3 * t1
                      + (ulong)s2 * t2
                      + (ulong)s1 * t3
                      + (ulong)s0 * t4;
            ulong h12 = (ulong)s7 * t5
                      + (ulong)s6 * t6
                      + (ulong)s5 * t7;

            c        += f4 + g4 + h12 - f12;
            z4        = (uint)c & M28; c >>= 28;
            d        += g12 + h4 - f4 + h12;
            z12       = (uint)d & M28; d >>= 28;

            ulong f5  = (ulong)x5 * y0
                      + (ulong)x4 * y1
                      + (ulong)x3 * y2
                      + (ulong)x2 * y3
                      + (ulong)x1 * y4
                      + (ulong)x0 * y5;
            ulong f13 = (ulong)x7 * y6
                      + (ulong)x6 * y7;
            ulong g5  = (ulong)u5 * v0
                      + (ulong)u4 * v1
                      + (ulong)u3 * v2
                      + (ulong)u2 * v3
                      + (ulong)u1 * v4
                      + (ulong)u0 * v5;
            ulong g13 = (ulong)u7 * v6
                      + (ulong)u6 * v7;
            ulong h5  = (ulong)s5 * t0
                      + (ulong)s4 * t1
                      + (ulong)s3 * t2
                      + (ulong)s2 * t3
                      + (ulong)s1 * t4
                      + (ulong)s0 * t5;
            ulong h13 = (ulong)s7 * t6
                      + (ulong)s6 * t7;

            c        += f5 + g5 + h13 - f13;
            z5        = (uint)c & M28; c >>= 28;
            d        += g13 + h5 - f5 + h13;
            z13       = (uint)d & M28; d >>= 28;

            ulong f6  = (ulong)x6 * y0
                      + (ulong)x5 * y1
                      + (ulong)x4 * y2
                      + (ulong)x3 * y3
                      + (ulong)x2 * y4
                      + (ulong)x1 * y5
                      + (ulong)x0 * y6;
            ulong f14 = (ulong)x7 * y7;
            ulong g6  = (ulong)u6 * v0
                      + (ulong)u5 * v1
                      + (ulong)u4 * v2
                      + (ulong)u3 * v3
                      + (ulong)u2 * v4
                      + (ulong)u1 * v5
                      + (ulong)u0 * v6;
            ulong g14 = (ulong)u7 * v7;
            ulong h6  = (ulong)s6 * t0
                      + (ulong)s5 * t1
                      + (ulong)s4 * t2
                      + (ulong)s3 * t3
                      + (ulong)s2 * t4
                      + (ulong)s1 * t5
                      + (ulong)s0 * t6;
            ulong h14 = (ulong)s7 * t7;

            c        += f6 + g6 + h14 - f14;
            z6        = (uint)c & M28; c >>= 28;
            d        += g14 + h6 - f6 + h14;
            z14       = (uint)d & M28; d >>= 28;

            ulong f7  = (ulong)x7 * y0
                      + (ulong)x6 * y1
                      + (ulong)x5 * y2
                      + (ulong)x4 * y3
                      + (ulong)x3 * y4
                      + (ulong)x2 * y5
                      + (ulong)x1 * y6
                      + (ulong)x0 * y7;
            ulong g7  = (ulong)u7 * v0
                      + (ulong)u6 * v1
                      + (ulong)u5 * v2
                      + (ulong)u4 * v3
                      + (ulong)u3 * v4
                      + (ulong)u2 * v5
                      + (ulong)u1 * v6
                      + (ulong)u0 * v7;
            ulong h7  = (ulong)s7 * t0
                      + (ulong)s6 * t1
                      + (ulong)s5 * t2
                      + (ulong)s4 * t3
                      + (ulong)s3 * t4
                      + (ulong)s2 * t5
                      + (ulong)s1 * t6
                      + (ulong)s0 * t7;

            c        += f7 + g7;
            z7        = (uint)c & M28; c >>= 28;
            d        += h7 - f7;
            z15       = (uint)d & M28; d >>= 28;

            c        += d;

            c        += z8;
            z8        = (uint)c & M28; c >>= 28;
            d        += z0;
            z0        = (uint)d & M28; d >>= 28;
            z9       += (uint)c;
            z1       += (uint)d;

            z[0] = z0;
            z[1] = z1;
            z[2] = z2;
            z[3] = z3;
            z[4] = z4;
            z[5] = z5;
            z[6] = z6;
            z[7] = z7;
            z[8] = z8;
            z[9] = z9;
            z[10] = z10;
            z[11] = z11;
            z[12] = z12;
            z[13] = z13;
            z[14] = z14;
            z[15] = z15;
        }

        public static void Negate(uint[] x, uint[] z)
        {
            uint[] zero = Create();
            Sub(zero, x, z);
        }

        public static void Normalize(uint[] z)
        {
            //int x = (z[15] >> (28 - 1)) & 1;
            Reduce(z, 1);
            Reduce(z, -1);
            Debug.Assert(z[15] >> 28 == 0U);
        }

        public static void One(uint[] z)
        {
            z[0] = 1U;
            for (int i = 1; i < Size; ++i)
            {
                z[i] = 0;
            }
        }

        private static void PowPm3d4(uint[] x, uint[] z)
        {
            // z = x^((p-3)/4) = x^(2^446 - 2^222 - 1)
            // (223 1s) (1 0s) (222 1s)
            // Addition chain: 1 2 3 6 9 18 19 37 74 111 [222] [223]
            uint[] x2 = Create();   Sqr(x, x2);             Mul(x, x2, x2);
            uint[] x3 = Create();   Sqr(x2, x3);            Mul(x, x3, x3);
            uint[] x6 = Create();   Sqr(x3, 3, x6);         Mul(x3, x6, x6);
            uint[] x9 = Create();   Sqr(x6, 3, x9);         Mul(x3, x9, x9);
            uint[] x18 = Create();  Sqr(x9, 9, x18);        Mul(x9, x18, x18);
            uint[] x19 = Create();  Sqr(x18, x19);          Mul(x, x19, x19);
            uint[] x37 = Create();  Sqr(x19, 18, x37);      Mul(x18, x37, x37);
            uint[] x74 = Create();  Sqr(x37, 37, x74);      Mul(x37, x74, x74);
            uint[] x111 = Create(); Sqr(x74, 37, x111);     Mul(x37, x111, x111);
            uint[] x222 = Create(); Sqr(x111, 111, x222);   Mul(x111, x222, x222);
            uint[] x223 = Create(); Sqr(x222, x223);        Mul(x, x223, x223);

            uint[] t = Create();
            Sqr(x223, 223, t);
            Mul(t, x222, z);
        }

        private static void Reduce(uint[] z, int x)
        {
            uint u = z[15], z15 = u & M28;
            int t = (int)(u >> 28) + x;

            long cc = t;
            for (int i = 0; i < 8; ++i)
            {
                cc += z[i]; z[i] = (uint)cc & M28; cc >>= 28;
            }
            cc += t;
            for (int i = 8; i < 15; ++i)
            {
                cc += z[i]; z[i] = (uint)cc & M28; cc >>= 28;
            }
            z[15] = z15 + (uint)cc;
        }

        public static void Sqr(uint[] x, uint[] z)
        {
            uint x0 = x[0];
            uint x1 = x[1];
            uint x2 = x[2];
            uint x3 = x[3];
            uint x4 = x[4];
            uint x5 = x[5];
            uint x6 = x[6];
            uint x7 = x[7];

            uint u0 = x[8];
            uint u1 = x[9];
            uint u2 = x[10];
            uint u3 = x[11];
            uint u4 = x[12];
            uint u5 = x[13];
            uint u6 = x[14];
            uint u7 = x[15];

            uint x0_2 = x0 * 2;
            uint x1_2 = x1 * 2;
            uint x2_2 = x2 * 2;
            uint x3_2 = x3 * 2;
            uint x4_2 = x4 * 2;
            uint x5_2 = x5 * 2;
            uint x6_2 = x6 * 2;

            uint u0_2 = u0 * 2;
            uint u1_2 = u1 * 2;
            uint u2_2 = u2 * 2;
            uint u3_2 = u3 * 2;
            uint u4_2 = u4 * 2;
            uint u5_2 = u5 * 2;
            uint u6_2 = u6 * 2;
        
            uint s0 = x0 + u0;
            uint s1 = x1 + u1;
            uint s2 = x2 + u2;
            uint s3 = x3 + u3;
            uint s4 = x4 + u4;
            uint s5 = x5 + u5;
            uint s6 = x6 + u6;
            uint s7 = x7 + u7;

            uint s0_2 = s0 * 2;
            uint s1_2 = s1 * 2;
            uint s2_2 = s2 * 2;
            uint s3_2 = s3 * 2;
            uint s4_2 = s4 * 2;
            uint s5_2 = s5 * 2;
            uint s6_2 = s6 * 2;

            uint z0, z1, z2, z3, z4, z5, z6, z7, z8, z9, z10, z11, z12, z13, z14, z15;
            ulong c, d;

            ulong f0  = (ulong)x0 * x0;
            ulong f8  = (ulong)x7 * x1_2
                      + (ulong)x6 * x2_2
                      + (ulong)x5 * x3_2
                      + (ulong)x4 * x4;
            ulong g0  = (ulong)u0 * u0;
            ulong g8  = (ulong)u7 * u1_2
                      + (ulong)u6 * u2_2
                      + (ulong)u5 * u3_2
                      + (ulong)u4 * u4;
            ulong h0  = (ulong)s0 * s0;
            ulong h8  = (ulong)s7 * s1_2
                      + (ulong)s6 * s2_2
                      + (ulong)s5 * s3_2
                      + (ulong)s4 * s4;

            c         = f0 + g0 + h8 - f8;
            z0        = (uint)c & M28; c >>= 28;
            d         = g8 + h0 - f0 + h8;
            z8        = (uint)d & M28; d >>= 28;

            ulong f1  = (ulong)x1 * x0_2;
            ulong f9  = (ulong)x7 * x2_2
                      + (ulong)x6 * x3_2
                      + (ulong)x5 * x4_2;
            ulong g1  = (ulong)u1 * u0_2;
            ulong g9  = (ulong)u7 * u2_2
                      + (ulong)u6 * u3_2
                      + (ulong)u5 * u4_2;
            ulong h1  = (ulong)s1 * s0_2;
            ulong h9  = (ulong)s7 * s2_2
                      + (ulong)s6 * s3_2
                      + (ulong)s5 * s4_2;

            c        += f1 + g1 + h9 - f9;
            z1        = (uint)c & M28; c >>= 28;
            d        += g9 + h1 - f1 + h9;
            z9        = (uint)d & M28; d >>= 28;

            ulong f2  = (ulong)x2 * x0_2
                      + (ulong)x1 * x1;
            ulong f10 = (ulong)x7 * x3_2
                      + (ulong)x6 * x4_2
                      + (ulong)x5 * x5;
            ulong g2  = (ulong)u2 * u0_2
                      + (ulong)u1 * u1;
            ulong g10 = (ulong)u7 * u3_2
                      + (ulong)u6 * u4_2
                      + (ulong)u5 * u5;
            ulong h2  = (ulong)s2 * s0_2
                      + (ulong)s1 * s1;
            ulong h10 = (ulong)s7 * s3_2
                      + (ulong)s6 * s4_2
                      + (ulong)s5 * s5;

            c        += f2 + g2 + h10 - f10;
            z2        = (uint)c & M28; c >>= 28;
            d        += g10 + h2 - f2 + h10;
            z10       = (uint)d & M28; d >>= 28;

            ulong f3  = (ulong)x3 * x0_2
                      + (ulong)x2 * x1_2;
            ulong f11 = (ulong)x7 * x4_2
                      + (ulong)x6 * x5_2;
            ulong g3  = (ulong)u3 * u0_2
                      + (ulong)u2 * u1_2;
            ulong g11 = (ulong)u7 * u4_2
                      + (ulong)u6 * u5_2;
            ulong h3  = (ulong)s3 * s0_2
                      + (ulong)s2 * s1_2;
            ulong h11 = (ulong)s7 * s4_2
                      + (ulong)s6 * s5_2;

            c        += f3 + g3 + h11 - f11;
            z3        = (uint)c & M28; c >>= 28;
            d        += g11 + h3 - f3 + h11;
            z11       = (uint)d & M28; d >>= 28;

            ulong f4  = (ulong)x4 * x0_2
                      + (ulong)x3 * x1_2
                      + (ulong)x2 * x2;
            ulong f12 = (ulong)x7 * x5_2
                      + (ulong)x6 * x6;
            ulong g4  = (ulong)u4 * u0_2
                      + (ulong)u3 * u1_2
                      + (ulong)u2 * u2;
            ulong g12 = (ulong)u7 * u5_2
                      + (ulong)u6 * u6;
            ulong h4  = (ulong)s4 * s0_2
                      + (ulong)s3 * s1_2
                      + (ulong)s2 * s2;
            ulong h12 = (ulong)s7 * s5_2
                      + (ulong)s6 * s6;

            c        += f4 + g4 + h12 - f12;
            z4        = (uint)c & M28; c >>= 28;
            d        += g12 + h4 - f4 + h12;
            z12       = (uint)d & M28; d >>= 28;

            ulong f5  = (ulong)x5 * x0_2
                      + (ulong)x4 * x1_2
                      + (ulong)x3 * x2_2;
            ulong f13 = (ulong)x7 * x6_2;
            ulong g5  = (ulong)u5 * u0_2
                      + (ulong)u4 * u1_2
                      + (ulong)u3 * u2_2;
            ulong g13 = (ulong)u7 * u6_2;
            ulong h5  = (ulong)s5 * s0_2
                      + (ulong)s4 * s1_2
                      + (ulong)s3 * s2_2;
            ulong h13 = (ulong)s7 * s6_2;

            c        += f5 + g5 + h13 - f13;
            z5        = (uint)c & M28; c >>= 28;
            d        += g13 + h5 - f5 + h13;
            z13       = (uint)d & M28; d >>= 28;

            ulong f6  = (ulong)x6 * x0_2
                      + (ulong)x5 * x1_2
                      + (ulong)x4 * x2_2
                      + (ulong)x3 * x3;
            ulong f14 = (ulong)x7 * x7;
            ulong g6  = (ulong)u6 * u0_2
                      + (ulong)u5 * u1_2
                      + (ulong)u4 * u2_2
                      + (ulong)u3 * u3;
            ulong g14 = (ulong)u7 * u7;
            ulong h6  = (ulong)s6 * s0_2
                      + (ulong)s5 * s1_2
                      + (ulong)s4 * s2_2
                      + (ulong)s3 * s3;
            ulong h14 = (ulong)s7 * s7;

            c        += f6 + g6 + h14 - f14;
            z6        = (uint)c & M28; c >>= 28;
            d        += g14 + h6 - f6 + h14;
            z14       = (uint)d & M28; d >>= 28;

            ulong f7  = (ulong)x7 * x0_2
                      + (ulong)x6 * x1_2
                      + (ulong)x5 * x2_2
                      + (ulong)x4 * x3_2;
            ulong g7  = (ulong)u7 * u0_2
                      + (ulong)u6 * u1_2
                      + (ulong)u5 * u2_2
                      + (ulong)u4 * u3_2;
            ulong h7  = (ulong)s7 * s0_2
                      + (ulong)s6 * s1_2
                      + (ulong)s5 * s2_2
                      + (ulong)s4 * s3_2;

            c        += f7 + g7;
            z7        = (uint)c & M28; c >>= 28;
            d        += h7 - f7;
            z15       = (uint)d & M28; d >>= 28;

            c        += d;

            c        += z8;
            z8        = (uint)c & M28; c >>= 28;
            d        += z0;
            z0        = (uint)d & M28; d >>= 28;
            z9       += (uint)c;
            z1       += (uint)d;

            z[0] = z0;
            z[1] = z1;
            z[2] = z2;
            z[3] = z3;
            z[4] = z4;
            z[5] = z5;
            z[6] = z6;
            z[7] = z7;
            z[8] = z8;
            z[9] = z9;
            z[10] = z10;
            z[11] = z11;
            z[12] = z12;
            z[13] = z13;
            z[14] = z14;
            z[15] = z15;
        }

        public static void Sqr(uint[] x, int n, uint[] z)
        {
            Debug.Assert(n > 0);

            Sqr(x, z);

            while (--n > 0)
            {
                Sqr(z, z);
            }
        }

        public static bool SqrtRatioVar(uint[] u, uint[] v, uint[] z)
        {
            uint[] u3v = Create();
            uint[] u5v3 = Create();

            Sqr(u, u3v);
            Mul(u3v, v, u3v);
            Sqr(u3v, u5v3);
            Mul(u3v, u, u3v);
            Mul(u5v3, u, u5v3);
            Mul(u5v3, v, u5v3);

            uint[] x = Create();
            PowPm3d4(u5v3, x);
            Mul(x, u3v, x);

            uint[] t = Create();
            Sqr(x, t);
            Mul(t, v, t);

            Sub(u, t, t);
            Normalize(t);

            if (IsZeroVar(t))
            {
                Copy(x, 0, z, 0);
                return true;
            }

            return false;
        }

        public static void Sub(uint[] x, uint[] y, uint[] z)
        {
            uint x0 = x[0], x1 = x[1], x2 = x[2], x3 = x[3], x4 = x[4], x5 = x[5], x6 = x[6], x7 = x[7];
            uint x8 = x[8], x9 = x[9], x10 = x[10], x11 = x[11], x12 = x[12], x13 = x[13], x14 = x[14], x15 = x[15];
            uint y0 = y[0], y1 = y[1], y2 = y[2], y3 = y[3], y4 = y[4], y5 = y[5], y6 = y[6], y7 = y[7];
            uint y8 = y[8], y9 = y[9], y10 = y[10], y11 = y[11], y12 = y[12], y13 = y[13], y14 = y[14], y15 = y[15];

            uint z0 = x0 + 0x1FFFFFFEU - y0;
            uint z1 = x1 + 0x1FFFFFFEU - y1;
            uint z2 = x2 + 0x1FFFFFFEU - y2;
            uint z3 = x3 + 0x1FFFFFFEU - y3;
            uint z4 = x4 + 0x1FFFFFFEU - y4;
            uint z5 = x5 + 0x1FFFFFFEU - y5;
            uint z6 = x6 + 0x1FFFFFFEU - y6;
            uint z7 = x7 + 0x1FFFFFFEU - y7;
            uint z8 = x8 + 0x1FFFFFFCU - y8;
            uint z9 = x9 + 0x1FFFFFFEU - y9;
            uint z10 = x10 + 0x1FFFFFFEU - y10;
            uint z11 = x11 + 0x1FFFFFFEU - y11;
            uint z12 = x12 + 0x1FFFFFFEU - y12;
            uint z13 = x13 + 0x1FFFFFFEU - y13;
            uint z14 = x14 + 0x1FFFFFFEU - y14;
            uint z15 = x15 + 0x1FFFFFFEU - y15;

            z2   += z1 >> 28; z1 &= M28;
            z6   += z5 >> 28; z5 &= M28;
            z10  += z9 >> 28; z9 &= M28;
            z14  += z13 >> 28; z13 &= M28;

            z3   += z2 >> 28; z2 &= M28;
            z7   += z6 >> 28; z6 &= M28;
            z11  += z10 >> 28; z10 &= M28;
            z15  += z14 >> 28; z14 &= M28;

            uint t = z15 >> 28; z15 &= M28;
            z0   += t;
            z8   += t;

            z4   += z3 >> 28; z3 &= M28;
            z8   += z7 >> 28; z7 &= M28;
            z12  += z11 >> 28; z11 &= M28;

            z1   += z0 >> 28; z0 &= M28;
            z5   += z4 >> 28; z4 &= M28;
            z9   += z8 >> 28; z8 &= M28;
            z13  += z12 >> 28; z12 &= M28;

            z[0] = z0;
            z[1] = z1;
            z[2] = z2;
            z[3] = z3;
            z[4] = z4;
            z[5] = z5;
            z[6] = z6;
            z[7] = z7;
            z[8] = z8;
            z[9] = z9;
            z[10] = z10;
            z[11] = z11;
            z[12] = z12;
            z[13] = z13;
            z[14] = z14;
            z[15] = z15;
        }

        public static void SubOne(uint[] z)
        {
            uint[] one = Create();
            one[0] = 1U;

            Sub(z, one, z);
        }

        public static void Zero(uint[] z)
        {
            for (int i = 0; i < Size; ++i)
            {
                z[i] = 0;
            }
        }
    }
}
