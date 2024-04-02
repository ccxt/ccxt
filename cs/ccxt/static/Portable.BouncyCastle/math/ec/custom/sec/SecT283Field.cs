using System;
using System.Diagnostics;
#if NETCOREAPP3_0_OR_GREATER
using System.Runtime.Intrinsics;
using System.Runtime.Intrinsics.X86;
#endif

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT283Field
    {
        private const ulong M27 = ulong.MaxValue >> 37;
        private const ulong M57 = ulong.MaxValue >> 7;

        private static readonly ulong[] ROOT_Z = new ulong[]{ 0x0C30C30C30C30808UL, 0x30C30C30C30C30C3UL,
            0x820820820820830CUL, 0x0820820820820820UL, 0x2082082UL };

        public static void Add(ulong[] x, ulong[] y, ulong[] z)
        {
            z[0] = x[0] ^ y[0];
            z[1] = x[1] ^ y[1];
            z[2] = x[2] ^ y[2];
            z[3] = x[3] ^ y[3];
            z[4] = x[4] ^ y[4];
        }

        public static void AddExt(ulong[] xx, ulong[] yy, ulong[] zz)
        {
            zz[0] = xx[0] ^ yy[0];
            zz[1] = xx[1] ^ yy[1];
            zz[2] = xx[2] ^ yy[2];
            zz[3] = xx[3] ^ yy[3];
            zz[4] = xx[4] ^ yy[4];
            zz[5] = xx[5] ^ yy[5];
            zz[6] = xx[6] ^ yy[6];
            zz[7] = xx[7] ^ yy[7];
            zz[8] = xx[8] ^ yy[8];
        }

        public static void AddOne(ulong[] x, ulong[] z)
        {
            z[0] = x[0] ^ 1UL;
            z[1] = x[1];
            z[2] = x[2];
            z[3] = x[3];
            z[4] = x[4];
        }

        private static void AddTo(ulong[] x, ulong[] z)
        {
            z[0] ^= x[0];
            z[1] ^= x[1];
            z[2] ^= x[2];
            z[3] ^= x[3];
            z[4] ^= x[4];
        }

        public static ulong[] FromBigInteger(BigInteger x)
        {
            return Nat.FromBigInteger64(283, x);
        }

        public static void HalfTrace(ulong[] x, ulong[] z)
        {
            ulong[] tt = Nat.Create64(9);

            Nat320.Copy64(x, z);
            for (int i = 1; i < 283; i += 2)
            {
                ImplSquare(z, tt);
                Reduce(tt, z);
                ImplSquare(z, tt);
                Reduce(tt, z);
                AddTo(x, z);
            }
        }

        public static void Invert(ulong[] x, ulong[] z)
        {
            if (Nat320.IsZero64(x))
                throw new InvalidOperationException();

            // Itoh-Tsujii inversion

            ulong[] t0 = Nat320.Create64();
            ulong[] t1 = Nat320.Create64();

            Square(x, t0);
            Multiply(t0, x, t0);
            SquareN(t0, 2, t1);
            Multiply(t1, t0, t1);
            SquareN(t1, 4, t0);
            Multiply(t0, t1, t0);
            SquareN(t0, 8, t1);
            Multiply(t1, t0, t1);
            Square(t1, t1);
            Multiply(t1, x, t1);
            SquareN(t1, 17, t0);
            Multiply(t0, t1, t0);
            Square(t0, t0);
            Multiply(t0, x, t0);
            SquareN(t0, 35, t1);
            Multiply(t1, t0, t1);
            SquareN(t1, 70, t0);
            Multiply(t0, t1, t0);
            Square(t0, t0);
            Multiply(t0, x, t0);
            SquareN(t0, 141, t1);
            Multiply(t1, t0, t1);
            Square(t1, z);
        }

        public static void Multiply(ulong[] x, ulong[] y, ulong[] z)
        {
            ulong[] tt = Nat320.CreateExt64();
            ImplMultiply(x, y, tt);
            Reduce(tt, z);
        }

        public static void MultiplyAddToExt(ulong[] x, ulong[] y, ulong[] zz)
        {
            ulong[] tt = Nat320.CreateExt64();
            ImplMultiply(x, y, tt);
            AddExt(zz, tt, zz);
        }

        public static void Reduce(ulong[] xx, ulong[] z)
        {
            ulong x0 = xx[0], x1 = xx[1], x2 = xx[2], x3 = xx[3], x4 = xx[4];
            ulong x5 = xx[5], x6 = xx[6], x7 = xx[7], x8 = xx[8];

            x3 ^= (x8 << 37) ^ (x8 << 42) ^ (x8 << 44) ^ (x8 << 49);
            x4 ^= (x8 >> 27) ^ (x8 >> 22) ^ (x8 >> 20) ^ (x8 >> 15);

            x2 ^= (x7 << 37) ^ (x7 << 42) ^ (x7 << 44) ^ (x7 << 49);
            x3 ^= (x7 >> 27) ^ (x7 >> 22) ^ (x7 >> 20) ^ (x7 >> 15);

            x1 ^= (x6 << 37) ^ (x6 << 42) ^ (x6 << 44) ^ (x6 << 49);
            x2 ^= (x6 >> 27) ^ (x6 >> 22) ^ (x6 >> 20) ^ (x6 >> 15);

            x0 ^= (x5 << 37) ^ (x5 << 42) ^ (x5 << 44) ^ (x5 << 49);
            x1 ^= (x5 >> 27) ^ (x5 >> 22) ^ (x5 >> 20) ^ (x5 >> 15);

            ulong t = x4 >> 27;
            z[0]    = x0 ^ t ^ (t << 5) ^ (t << 7) ^ (t << 12);
            z[1]    = x1; 
            z[2]    = x2; 
            z[3]    = x3; 
            z[4]    = x4 & M27; 
        }

        public static void Reduce37(ulong[] z, int zOff)
        {
            ulong z4     = z[zOff + 4], t = z4 >> 27;
            z[zOff    ] ^= t ^ (t << 5) ^ (t << 7) ^ (t << 12);
            z[zOff + 4]  = z4 & M27;
        }

        public static void Sqrt(ulong[] x, ulong[] z)
        {
            ulong[] odd = Nat320.Create64();

            odd[0] = Interleave.Unshuffle(x[0], x[1], out ulong e0);
            odd[1] = Interleave.Unshuffle(x[2], x[3], out ulong e1);
            odd[2] = Interleave.Unshuffle(x[4]      , out ulong e2);

            Multiply(odd, ROOT_Z, z);

            z[0] ^= e0;
            z[1] ^= e1;
            z[2] ^= e2;
        }

        public static void Square(ulong[] x, ulong[] z)
        {
            ulong[] tt = Nat.Create64(9);
            ImplSquare(x, tt);
            Reduce(tt, z);
        }

        public static void SquareAddToExt(ulong[] x, ulong[] zz)
        {
            ulong[] tt = Nat.Create64(9);
            ImplSquare(x, tt);
            AddExt(zz, tt, zz);
        }

        public static void SquareN(ulong[] x, int n, ulong[] z)
        {
            Debug.Assert(n > 0);

            ulong[] tt = Nat.Create64(9);
            ImplSquare(x, tt);
            Reduce(tt, z);

            while (--n > 0)
            {
                ImplSquare(z, tt);
                Reduce(tt, z);
            }
        }

        public static uint Trace(ulong[] x)
        {
            // Non-zero-trace bits: 0, 271
            return (uint)(x[0] ^ (x[4] >> 15)) & 1U;
        }

        protected static void ImplCompactExt(ulong[] zz)
        {
            ulong z0 = zz[0], z1 = zz[1], z2 = zz[2], z3 = zz[3], z4 = zz[4];
            ulong z5 = zz[5], z6 = zz[6], z7 = zz[7], z8 = zz[8], z9 = zz[9];
            zz[0] =  z0        ^ (z1 << 57);
            zz[1] = (z1 >>  7) ^ (z2 << 50);
            zz[2] = (z2 >> 14) ^ (z3 << 43);
            zz[3] = (z3 >> 21) ^ (z4 << 36);
            zz[4] = (z4 >> 28) ^ (z5 << 29);
            zz[5] = (z5 >> 35) ^ (z6 << 22);
            zz[6] = (z6 >> 42) ^ (z7 << 15);
            zz[7] = (z7 >> 49) ^ (z8 <<  8);
            zz[8] = (z8 >> 56) ^ (z9 <<  1);
            zz[9] = (z9 >> 63); // Zero!
        }

        protected static void ImplExpand(ulong[] x, ulong[] z)
        {
            ulong x0 = x[0], x1 = x[1], x2 = x[2], x3 = x[3], x4 = x[4];
            z[0] = x0 & M57;
            z[1] = ((x0 >> 57) ^ (x1 <<  7)) & M57;
            z[2] = ((x1 >> 50) ^ (x2 << 14)) & M57;
            z[3] = ((x2 >> 43) ^ (x3 << 21)) & M57;
            z[4] = ((x3 >> 36) ^ (x4 << 28));
        }

        //protected static void AddMs(ulong[] zz, int zOff, ulong[] p, params int[] ms)
        //{
        //    ulong t0 = 0, t1 = 0;
        //    foreach (int m in ms)
        //    {
        //        int i = (m - 1) << 1;
        //        t0 ^= p[i    ];
        //        t1 ^= p[i + 1];
        //    }
        //    zz[zOff    ] ^= t0;
        //    zz[zOff + 1] ^= t1;
        //}

        protected static void ImplMultiply(ulong[] x, ulong[] y, ulong[] zz)
        {
#if NETCOREAPP3_0_OR_GREATER
            if (Pclmulqdq.IsSupported)
            {
                var X01 = Vector128.Create(x[0], x[1]);
                var X23 = Vector128.Create(x[2], x[3]);
                var X4_ = Vector128.CreateScalar(x[4]);
                var Y01 = Vector128.Create(y[0], y[1]);
                var Y23 = Vector128.Create(y[2], y[3]);
                var Y4_ = Vector128.CreateScalar(y[4]);

                var Z01 =          Pclmulqdq.CarrylessMultiply(X01, Y01, 0x00);
                var Z12 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y01, 0x01),
                                   Pclmulqdq.CarrylessMultiply(X01, Y01, 0x10));
                var Z23 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y23, 0x00),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y01, 0x11),
                                   Pclmulqdq.CarrylessMultiply(X23, Y01, 0x00)));
                var Z34 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y23, 0x01),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y23, 0x10),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y01, 0x01),
                                   Pclmulqdq.CarrylessMultiply(X23, Y01, 0x10))));
                var Z45 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y4_, 0x00),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y23, 0x11),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y23, 0x00),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y01, 0x11),
                                   Pclmulqdq.CarrylessMultiply(X4_, Y01, 0x00)))));
                var Z56 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y4_, 0x01),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y23, 0x01),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y23, 0x10),
                                   Pclmulqdq.CarrylessMultiply(X4_, Y01, 0x10))));
                var Z67 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y4_, 0x00),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y23, 0x11),
                                   Pclmulqdq.CarrylessMultiply(X4_, Y23, 0x00)));
                var Z78 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X23, Y4_, 0x01),
                                   Pclmulqdq.CarrylessMultiply(X4_, Y23, 0x10));
                var Z89 =          Pclmulqdq.CarrylessMultiply(X4_, Y4_, 0x00);

                zz[0] = Z01.GetElement(0);
                zz[1] = Z01.GetElement(1) ^ Z12.GetElement(0);
                zz[2] = Z23.GetElement(0) ^ Z12.GetElement(1);
                zz[3] = Z23.GetElement(1) ^ Z34.GetElement(0);
                zz[4] = Z45.GetElement(0) ^ Z34.GetElement(1);
                zz[5] = Z45.GetElement(1) ^ Z56.GetElement(0);
                zz[6] = Z67.GetElement(0) ^ Z56.GetElement(1);
                zz[7] = Z67.GetElement(1) ^ Z78.GetElement(0);
                zz[8] = Z89.GetElement(0) ^ Z78.GetElement(1);
                zz[9] = Z89.GetElement(1);
                return;
            }
#endif

            /*
             * Formula (17) from "Some New Results on Binary Polynomial Multiplication",
             * Murat Cenk and M. Anwar Hasan.
             * 
             * The formula as given contained an error in the term t25, as noted below
             */
            ulong[] a = new ulong[5], b = new ulong[5];
            ImplExpand(x, a);
            ImplExpand(y, b);

            ulong[] u = zz;
            ulong[] p = new ulong[26];

            ImplMulw(u, a[0], b[0], p, 0);                  // m1
            ImplMulw(u, a[1], b[1], p, 2);                  // m2
            ImplMulw(u, a[2], b[2], p, 4);                  // m3
            ImplMulw(u, a[3], b[3], p, 6);                  // m4
            ImplMulw(u, a[4], b[4], p, 8);                  // m5

            ulong u0 = a[0] ^ a[1], v0 = b[0] ^ b[1];
            ulong u1 = a[0] ^ a[2], v1 = b[0] ^ b[2];
            ulong u2 = a[2] ^ a[4], v2 = b[2] ^ b[4];
            ulong u3 = a[3] ^ a[4], v3 = b[3] ^ b[4];

            ImplMulw(u, u1 ^ a[3], v1 ^ b[3], p, 18);       // m10
            ImplMulw(u, u2 ^ a[1], v2 ^ b[1], p, 20);       // m11

            ulong A4 = u0 ^ u3  , B4 = v0 ^ v3;
            ulong A5 = A4 ^ a[2], B5 = B4 ^ b[2];

            ImplMulw(u, A4, B4, p, 22);                     // m12
            ImplMulw(u, A5, B5, p, 24);                     // m13

            ImplMulw(u, u0, v0, p, 10);                     // m6
            ImplMulw(u, u1, v1, p, 12);                     // m7
            ImplMulw(u, u2, v2, p, 14);                     // m8
            ImplMulw(u, u3, v3, p, 16);                     // m9


            // Original method, corresponding to formula (16)
            //AddMs(zz, 0, p, 1);
            //AddMs(zz, 1, p, 1, 2, 6);
            //AddMs(zz, 2, p, 1, 2, 3, 7);
            //AddMs(zz, 3, p, 1, 3, 4, 5, 8, 10, 12, 13);
            //AddMs(zz, 4, p, 1, 2, 4, 5, 6, 9, 10, 11, 13);
            //AddMs(zz, 5, p, 1, 2, 3, 5, 7, 11, 12, 13);
            //AddMs(zz, 6, p, 3, 4, 5, 8);
            //AddMs(zz, 7, p, 4, 5, 9);
            //AddMs(zz, 8, p, 5);

            // Improved method factors out common single-word terms
            // NOTE: p1,...,p26 in the paper maps to p[0],...,p[25] here

            zz[0]     = p[ 0];
            zz[9]     = p[ 9];

            ulong t1  = p[ 0] ^ p[ 1];
            ulong t2  = t1    ^ p[ 2];
            ulong t3  = t2    ^ p[10];
        
            zz[1]     = t3;

            ulong t4  = p[ 3] ^ p[ 4];
            ulong t5  = p[11] ^ p[12];
            ulong t6  = t4    ^ t5;
            ulong t7  = t2    ^ t6;

            zz[2]     = t7;

            ulong t8  = t1    ^ t4;
            ulong t9  = p[ 5] ^ p[ 6];
            ulong t10 = t8    ^ t9;
            ulong t11 = t10   ^ p[ 8];
            ulong t12 = p[13] ^ p[14];
            ulong t13 = t11   ^ t12;
            ulong t14 = p[18] ^ p[22];
            ulong t15 = t14   ^ p[24];
            ulong t16 = t13   ^ t15;

            zz[3]     = t16;

            ulong t17 = p[ 7] ^ p[ 8];
            ulong t18 = t17   ^ p[ 9];
            ulong t19 = t18   ^ p[17];

            zz[8]     = t19;

            ulong t20 = t18   ^ t9;
            ulong t21 = p[15] ^ p[16];
            ulong t22 = t20   ^ t21;

            zz[7]     = t22;

            ulong t23 = t22   ^ t3;
            ulong t24 = p[19] ^ p[20];
    //      ulong t25 = p[23] ^ p[24];
            ulong t25 = p[25] ^ p[24];       // Fixes an error in the paper: p[23] -> p{25]
            ulong t26 = p[18] ^ p[23];
            ulong t27 = t24   ^ t25;
            ulong t28 = t27   ^ t26;
            ulong t29 = t28   ^ t23;

            zz[4]     = t29;
        
            ulong t30 = t7    ^ t19;
            ulong t31 = t27   ^ t30;
            ulong t32 = p[21] ^ p[22];
            ulong t33 = t31   ^ t32;

            zz[5]     = t33;

            ulong t34 = t11   ^ p[0];
            ulong t35 = t34   ^ p[9];
            ulong t36 = t35   ^ t12;
            ulong t37 = t36   ^ p[21];
            ulong t38 = t37   ^ p[23];
            ulong t39 = t38   ^ p[25];

            zz[6]     = t39;

            ImplCompactExt(zz);
        }

        protected static void ImplMulw(ulong[] u, ulong x, ulong y, ulong[] z, int zOff)
        {
            Debug.Assert(x >> 57 == 0);
            Debug.Assert(y >> 57 == 0);

            //u[0] = 0;
            u[1] = y;
            u[2] = u[1] << 1;
            u[3] = u[2] ^  y;
            u[4] = u[2] << 1;
            u[5] = u[4] ^  y;
            u[6] = u[3] << 1;
            u[7] = u[6] ^  y;

            uint j = (uint)x;
            ulong g, h = 0, l = u[j & 7];
            int k = 48;
            do
            {
                j  = (uint)(x >> k);
                g  = u[j & 7]
                   ^ u[(j >> 3) & 7] << 3
                   ^ u[(j >> 6) & 7] << 6;
                l ^= (g <<  k);
                h ^= (g >> -k);
            }
            while ((k -= 9) > 0);

            h ^= ((x & 0x0100804020100800L) & (ulong)(((long)y << 7) >> 63)) >> 8;

            Debug.Assert(h >> 49 == 0);

            z[zOff    ] = l & M57;
            z[zOff + 1] = (l >> 57) ^ (h << 7);
        }

        protected static void ImplSquare(ulong[] x, ulong[] zz)
        {
            Interleave.Expand64To128(x, 0, 4, zz, 0);
            zz[8] = Interleave.Expand32to64((uint)x[4]);
        }
    }
}
