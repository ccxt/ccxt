using System;
using System.Diagnostics;
#if NETCOREAPP3_0_OR_GREATER
using System.Runtime.Intrinsics;
using System.Runtime.Intrinsics.X86;
#endif

using Org.BouncyCastle.Math.Raw;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT131Field
    {
        private const ulong M03 = ulong.MaxValue >> 61;
        private const ulong M44 = ulong.MaxValue >> 20;

        private static readonly ulong[] ROOT_Z = new ulong[]{ 0x26BC4D789AF13523UL, 0x26BC4D789AF135E2UL, 0x6UL };

        public static void Add(ulong[] x, ulong[] y, ulong[] z)
        {
            z[0] = x[0] ^ y[0];
            z[1] = x[1] ^ y[1];
            z[2] = x[2] ^ y[2];
        }

        public static void AddExt(ulong[] xx, ulong[] yy, ulong[] zz)
        {
            zz[0] = xx[0] ^ yy[0];
            zz[1] = xx[1] ^ yy[1];
            zz[2] = xx[2] ^ yy[2];
            zz[3] = xx[3] ^ yy[3];
            zz[4] = xx[4] ^ yy[4];
        }

        public static void AddOne(ulong[] x, ulong[] z)
        {
            z[0] = x[0] ^ 1UL;
            z[1] = x[1];
            z[2] = x[2];
        }

        private static void AddTo(ulong[] x, ulong[] z)
        {
            z[0] ^= x[0];
            z[1] ^= x[1];
            z[2] ^= x[2];
        }

        public static ulong[] FromBigInteger(BigInteger x)
        {
            return Nat.FromBigInteger64(131, x);
        }

        public static void HalfTrace(ulong[] x, ulong[] z)
        {
            ulong[] tt = Nat.Create64(5);

            Nat192.Copy64(x, z);
            for (int i = 1; i < 131; i += 2)
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
            if (Nat192.IsZero64(x))
                throw new InvalidOperationException();

            // Itoh-Tsujii inversion

            ulong[] t0 = Nat192.Create64();
            ulong[] t1 = Nat192.Create64();

            Square(x, t0);
            Multiply(t0, x, t0);
            SquareN(t0, 2, t1);
            Multiply(t1, t0, t1);
            SquareN(t1, 4, t0);
            Multiply(t0, t1, t0);
            SquareN(t0, 8, t1);
            Multiply(t1, t0, t1);
            SquareN(t1, 16, t0);
            Multiply(t0, t1, t0);
            SquareN(t0, 32, t1);
            Multiply(t1, t0, t1);
            Square(t1, t1);
            Multiply(t1, x, t1);
            SquareN(t1, 65, t0);
            Multiply(t0, t1, t0);
            Square(t0, z);
        }

        public static void Multiply(ulong[] x, ulong[] y, ulong[] z)
        {
            ulong[] tt = new ulong[8];
            ImplMultiply(x, y, tt);
            Reduce(tt, z);
        }

        public static void MultiplyAddToExt(ulong[] x, ulong[] y, ulong[] zz)
        {
            ulong[] tt = new ulong[8];
            ImplMultiply(x, y, tt);
            AddExt(zz, tt, zz);
        }

        public static void Reduce(ulong[] xx, ulong[] z)
        {
            ulong x0 = xx[0], x1 = xx[1], x2 = xx[2], x3 = xx[3], x4 = xx[4];

            x1 ^= (x4 << 61) ^ (x4 << 63);
            x2 ^= (x4 >>  3) ^ (x4 >>  1) ^ x4 ^ (x4 <<  5);
            x3 ^=                                (x4 >> 59);

            x0 ^= (x3 << 61) ^ (x3 << 63);
            x1 ^= (x3 >>  3) ^ (x3 >>  1) ^ x3 ^ (x3 <<  5);
            x2 ^=                                (x3 >> 59);

            ulong t = x2 >> 3;
            z[0]    = x0 ^ t ^ (t << 2) ^ (t << 3) ^ (t <<  8);
            z[1]    = x1                           ^ (t >> 56);
            z[2]    = x2 & M03;
        }

        public static void Reduce61(ulong[] z, int zOff)
        {
            ulong z2     = z[zOff + 2], t = z2 >> 3;
            z[zOff    ] ^= t ^ (t << 2) ^ (t << 3) ^ (t <<  8);
            z[zOff + 1] ^=                           (t >> 56);
            z[zOff + 2]  = z2 & M03;
        }

        public static void Sqrt(ulong[] x, ulong[] z)
        {
            ulong[] odd = Nat192.Create64();

            odd[0] = Interleave.Unshuffle(x[0], x[1], out ulong e0);
            odd[1] = Interleave.Unshuffle(x[2]      , out ulong e1);

            Multiply(odd, ROOT_Z, z);

            z[0] ^= e0;
            z[1] ^= e1;
        }

        public static void Square(ulong[] x, ulong[] z)
        {
            ulong[] tt = Nat.Create64(5);
            ImplSquare(x, tt);
            Reduce(tt, z);
        }

        public static void SquareAddToExt(ulong[] x, ulong[] zz)
        {
            ulong[] tt = Nat.Create64(5);
            ImplSquare(x, tt);
            AddExt(zz, tt, zz);
        }

        public static void SquareN(ulong[] x, int n, ulong[] z)
        {
            Debug.Assert(n > 0);

            ulong[] tt = Nat.Create64(5);
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
            // Non-zero-trace bits: 0, 123, 129
            return (uint)(x[0] ^ (x[1] >> 59) ^ (x[2] >> 1)) & 1U;
        }

        protected static void ImplCompactExt(ulong[] zz)
        {
            ulong z0 = zz[0], z1 = zz[1], z2 = zz[2], z3 = zz[3], z4 = zz[4], z5 = zz[5];
            zz[0] =  z0        ^ (z1 << 44);
            zz[1] = (z1 >> 20) ^ (z2 << 24);
            zz[2] = (z2 >> 40) ^ (z3 <<  4)
                               ^ (z4 << 48);
            zz[3] = (z3 >> 60) ^ (z5 << 28)
                  ^ (z4 >> 16);
            zz[4] = (z5 >> 36);
            zz[5] = 0;
        }

        protected static void ImplMultiply(ulong[] x, ulong[] y, ulong[] zz)
        {
#if NETCOREAPP3_0_OR_GREATER
            if (Pclmulqdq.IsSupported)
            {
                var X01 = Vector128.Create(x[0], x[1]);
                var X2_ = Vector128.CreateScalar(x[2]);
                var Y01 = Vector128.Create(y[0], y[1]);
                var Y2_ = Vector128.CreateScalar(y[2]);

                var Z01 =          Pclmulqdq.CarrylessMultiply(X01, Y01, 0x00);
                var Z12 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y01, 0x01),
                                   Pclmulqdq.CarrylessMultiply(X01, Y01, 0x10));
                var Z23 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y2_, 0x00),
                          Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y01, 0x11),
                                   Pclmulqdq.CarrylessMultiply(X2_, Y01, 0x00)));
                var Z34 = Sse2.Xor(Pclmulqdq.CarrylessMultiply(X01, Y2_, 0x01),
                                   Pclmulqdq.CarrylessMultiply(X2_, Y01, 0x10));
                var Z4_ =          Pclmulqdq.CarrylessMultiply(X2_, Y2_, 0x00);

                zz[0] = Z01.GetElement(0);
                zz[1] = Z01.GetElement(1) ^ Z12.GetElement(0);
                zz[2] = Z23.GetElement(0) ^ Z12.GetElement(1);
                zz[3] = Z23.GetElement(1) ^ Z34.GetElement(0);
                zz[4] = Z4_.GetElement(0) ^ Z34.GetElement(1);
                return;
            }
#endif

            /*
             * "Five-way recursion" as described in "Batch binary Edwards", Daniel J. Bernstein.
             */

            ulong f0 = x[0], f1 = x[1], f2 = x[2];
            f2  = ((f1 >> 24) ^ (f2 << 40)) & M44;
            f1  = ((f0 >> 44) ^ (f1 << 20)) & M44;
            f0 &= M44;

            ulong g0 = y[0], g1 = y[1], g2 = y[2];
            g2  = ((g1 >> 24) ^ (g2 << 40)) & M44;
            g1  = ((g0 >> 44) ^ (g1 << 20)) & M44;
            g0 &= M44;

            ulong[] u = zz;
            ulong[] H = new ulong[10];

            ImplMulw(u, f0, g0, H, 0);              // H(0)       44/43 bits
            ImplMulw(u, f2, g2, H, 2);              // H(INF)     44/41 bits

            ulong t0 = f0 ^ f1 ^ f2;
            ulong t1 = g0 ^ g1 ^ g2;

            ImplMulw(u, t0, t1, H, 4);              // H(1)       44/43 bits
        
            ulong t2 = (f1 << 1) ^ (f2 << 2);
            ulong t3 = (g1 << 1) ^ (g2 << 2);

            ImplMulw(u, f0 ^ t2, g0 ^ t3, H, 6);    // H(t)       44/45 bits
            ImplMulw(u, t0 ^ t2, t1 ^ t3, H, 8);    // H(t + 1)   44/45 bits

            ulong t4 = H[6] ^ H[8];
            ulong t5 = H[7] ^ H[9];

            Debug.Assert(t5 >> 44 == 0);

            // Calculate V
            ulong v0 =      (t4 << 1) ^ H[6];
            ulong v1 = t4 ^ (t5 << 1) ^ H[7];
            ulong v2 = t5;

            // Calculate U
            ulong u0 = H[0];
            ulong u1 = H[1] ^ H[0] ^ H[4];
            ulong u2 =        H[1] ^ H[5];
        
            // Calculate W
            ulong w0 = u0 ^ v0 ^ (H[2] << 4) ^ (H[2] << 1);
            ulong w1 = u1 ^ v1 ^ (H[3] << 4) ^ (H[3] << 1);
            ulong w2 = u2 ^ v2;

            // Propagate carries
            w1 ^= (w0 >> 44); w0 &= M44;
            w2 ^= (w1 >> 44); w1 &= M44;

            Debug.Assert((w0 & 1UL) == 0);

            // Divide W by t

            w0 = (w0 >> 1) ^ ((w1 & 1UL) << 43);
            w1 = (w1 >> 1) ^ ((w2 & 1UL) << 43);
            w2 = (w2 >> 1);

            // Divide W by (t + 1)

            w0 ^= (w0 << 1);
            w0 ^= (w0 << 2);
            w0 ^= (w0 << 4);
            w0 ^= (w0 << 8);
            w0 ^= (w0 << 16);
            w0 ^= (w0 << 32);

            w0 &= M44; w1 ^= (w0 >> 43);

            w1 ^= (w1 << 1);
            w1 ^= (w1 << 2);
            w1 ^= (w1 << 4);
            w1 ^= (w1 << 8);
            w1 ^= (w1 << 16);
            w1 ^= (w1 << 32);

            w1 &= M44; w2 ^= (w1 >> 43);

            w2 ^= (w2 << 1);
            w2 ^= (w2 << 2);
            w2 ^= (w2 << 4);
            w2 ^= (w2 << 8);
            w2 ^= (w2 << 16);
            w2 ^= (w2 << 32);

            Debug.Assert(w2 >> 42 == 0);

            zz[0] = u0; 
            zz[1] = u1 ^ w0      ^ H[2]; 
            zz[2] = u2 ^ w1 ^ w0 ^ H[3]; 
            zz[3] =      w2 ^ w1; 
            zz[4] =           w2 ^ H[2]; 
            zz[5] =                H[3]; 

            ImplCompactExt(zz);
        }

        protected static void ImplMulw(ulong[] u, ulong x, ulong y, ulong[] z, int zOff)
        {
            Debug.Assert(x >> 45 == 0);
            Debug.Assert(y >> 45 == 0);

            //u[0] = 0;
            u[1] = y;
            u[2] = u[1] << 1;
            u[3] = u[2] ^  y;
            u[4] = u[2] << 1;
            u[5] = u[4] ^  y;
            u[6] = u[3] << 1;
            u[7] = u[6] ^  y;

            uint j = (uint)x;
            ulong g, h = 0, l = u[j & 7]
                              ^ u[(j >>  3) & 7] <<  3
                              ^ u[(j >>  6) & 7] <<  6
                              ^ u[(j >>  9) & 7] <<  9
                              ^ u[(j >> 12) & 7] << 12;
            int k = 30;
            do
            {
                j  = (uint)(x >> k);
                g  = u[j & 7]
                   ^ u[(j >>  3) & 7] <<  3
                   ^ u[(j >>  6) & 7] <<  6
                   ^ u[(j >>  9) & 7] <<  9
                   ^ u[(j >> 12) & 7] << 12;
                l ^= (g << k);
                h ^= (g >> -k);
            }
            while ((k -= 15) > 0);

            Debug.Assert(h >> 25 == 0);

            z[zOff    ] = l & M44;
            z[zOff + 1] = (l >> 44) ^ (h << 20);
        }

        protected static void ImplSquare(ulong[] x, ulong[] zz)
        {
            Interleave.Expand64To128(x, 0, 2, zz, 0);
            zz[4] = Interleave.Expand8to16((uint)x[2]);
        }
    }
}
