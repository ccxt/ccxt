using System;
using System.Diagnostics;

using Org.BouncyCastle.Math.EC.Rfc8032;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Rfc7748
{
    using F = X25519Field;

    public static class X25519
    {
        public const int PointSize = 32;
        public const int ScalarSize = 32;

        private const int C_A = 486662;
        private const int C_A24 = (C_A + 2)/4;

        //private static readonly int[] SqrtNeg486664 = { 0x03457E06, 0x03812ABF, 0x01A82CC6, 0x028A5BE8, 0x018B43A7,
        //    0x03FC4F7E, 0x02C23700, 0x006BBD27, 0x03A30500, 0x001E4DDB };

        public static bool CalculateAgreement(byte[] k, int kOff, byte[] u, int uOff, byte[] r, int rOff)
        {
            ScalarMult(k, kOff, u, uOff, r, rOff);
            return !Arrays.AreAllZeroes(r, rOff, PointSize);
        }

        private static uint Decode32(byte[] bs, int off)
        {
            uint n = bs[off];
            n |= (uint)bs[++off] << 8;
            n |= (uint)bs[++off] << 16;
            n |= (uint)bs[++off] << 24;
            return n;
        }

        private static void DecodeScalar(byte[] k, int kOff, uint[] n)
        {
            for (int i = 0; i < 8; ++i)
            {
                n[i] = Decode32(k, kOff + i * 4);
            }

            n[0] &= 0xFFFFFFF8U;
            n[7] &= 0x7FFFFFFFU;
            n[7] |= 0x40000000U;
        }

        public static void GeneratePrivateKey(SecureRandom random, byte[] k)
        {
            random.NextBytes(k);

            k[0] &= 0xF8;
            k[ScalarSize - 1] &= 0x7F;
            k[ScalarSize - 1] |= 0x40;
        }

        public static void GeneratePublicKey(byte[] k, int kOff, byte[] r, int rOff)
        {
            ScalarMultBase(k, kOff, r, rOff);
        }

        private static void PointDouble(int[] x, int[] z)
        {
            int[] a = F.Create();
            int[] b = F.Create();

            F.Apm(x, z, a, b);
            F.Sqr(a, a);
            F.Sqr(b, b);
            F.Mul(a, b, x);
            F.Sub(a, b, a);
            F.Mul(a, C_A24, z);
            F.Add(z, b, z);
            F.Mul(z, a, z);
        }

        public static void Precompute()
        {
            Ed25519.Precompute();
        }

        public static void ScalarMult(byte[] k, int kOff, byte[] u, int uOff, byte[] r, int rOff)
        {
            uint[] n = new uint[8];     DecodeScalar(k, kOff, n);

            int[] x1 = F.Create();      F.Decode(u, uOff, x1);
            int[] x2 = F.Create();      F.Copy(x1, 0, x2, 0);
            int[] z2 = F.Create();      z2[0] = 1;
            int[] x3 = F.Create();      x3[0] = 1;
            int[] z3 = F.Create();

            int[] t1 = F.Create();
            int[] t2 = F.Create();

            Debug.Assert(n[7] >> 30 == 1U);

            int bit = 254, swap = 1;
            do
            {
                F.Apm(x3, z3, t1, x3);
                F.Apm(x2, z2, z3, x2);
                F.Mul(t1, x2, t1);
                F.Mul(x3, z3, x3);
                F.Sqr(z3, z3);
                F.Sqr(x2, x2);

                F.Sub(z3, x2, t2);
                F.Mul(t2, C_A24, z2);
                F.Add(z2, x2, z2);
                F.Mul(z2, t2, z2);
                F.Mul(x2, z3, x2);

                F.Apm(t1, x3, x3, z3);
                F.Sqr(x3, x3);
                F.Sqr(z3, z3);
                F.Mul(z3, x1, z3);

                --bit;

                int word = bit >> 5, shift = bit & 0x1F;
                int kt = (int)(n[word] >> shift) & 1;
                swap ^= kt;
                F.CSwap(swap, x2, x3);
                F.CSwap(swap, z2, z3);
                swap = kt;
            }
            while (bit >= 3);

            Debug.Assert(swap == 0);

            for (int i = 0; i < 3; ++i)
            {
                PointDouble(x2, z2);
            }

            F.Inv(z2, z2);
            F.Mul(x2, z2, x2);

            F.Normalize(x2);
            F.Encode(x2, r, rOff);
        }

        public static void ScalarMultBase(byte[] k, int kOff, byte[] r, int rOff)
        {
            int[] y = F.Create();
            int[] z = F.Create();

            Ed25519.ScalarMultBaseYZ(k, kOff, y, z);

            F.Apm(z, y, y, z);

            F.Inv(z, z);
            F.Mul(y, z, y);

            F.Normalize(y);
            F.Encode(y, r, rOff);
        }
    }
}
