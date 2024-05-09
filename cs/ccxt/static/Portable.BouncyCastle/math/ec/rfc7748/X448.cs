using System;
using System.Diagnostics;

using Org.BouncyCastle.Math.EC.Rfc8032;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Rfc7748
{
    using F = X448Field;

    public static class X448
    {
        public const int PointSize = 56;
        public const int ScalarSize = 56;

        private const uint C_A = 156326;
        private const uint C_A24 = (C_A + 2)/4;

        //private static readonly uint[] Sqrt156324 = { 0x0551B193U, 0x07A21E17U, 0x0E635AD3U, 0x00812ABBU, 0x025B3F99U, 0x01605224U,
        //    0x0AF8CB32U, 0x0D2E7D68U, 0x06BA50FDU, 0x08E55693U, 0x0CB08EB4U, 0x02ABEBC1U, 0x051BA0BBU, 0x02F8812EU, 0x0829B611U,
        //    0x0BA4D3A0U };

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
            for (int i = 0; i < 14; ++i)
            {
                n[i] = Decode32(k, kOff + i * 4);
            }

            n[ 0] &= 0xFFFFFFFCU;
            n[13] |= 0x80000000U;
        }

        public static void GeneratePrivateKey(SecureRandom random, byte[] k)
        {
            random.NextBytes(k);

            k[0] &= 0xFC;
            k[ScalarSize - 1] |= 0x80;
        }

        public static void GeneratePublicKey(byte[] k, int kOff, byte[] r, int rOff)
        {
            ScalarMultBase(k, kOff, r, rOff);
        }

        private static void PointDouble(uint[] x, uint[] z)
        {
            uint[] a = F.Create();
            uint[] b = F.Create();

            //F.Apm(x, z, a, b);
            F.Add(x, z, a);
            F.Sub(x, z, b);
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
            Ed448.Precompute();
        }

        public static void ScalarMult(byte[] k, int kOff, byte[] u, int uOff, byte[] r, int rOff)
        {
            uint[] n = new uint[14];    DecodeScalar(k, kOff, n);

            uint[] x1 = F.Create();     F.Decode(u, uOff, x1);
            uint[] x2 = F.Create();     F.Copy(x1, 0, x2, 0);
            uint[] z2 = F.Create();     z2[0] = 1;
            uint[] x3 = F.Create();     x3[0] = 1;
            uint[] z3 = F.Create();

            uint[] t1 = F.Create();
            uint[] t2 = F.Create();

            Debug.Assert(n[13] >> 31 == 1U);

            int bit = 447, swap = 1;
            do
            {
                //F.Apm(x3, z3, t1, x3);
                F.Add(x3, z3, t1);
                F.Sub(x3, z3, x3);
                //F.Apm(x2, z2, z3, x2);
                F.Add(x2, z2, z3);
                F.Sub(x2, z2, x2);

                F.Mul(t1, x2, t1);
                F.Mul(x3, z3, x3);
                F.Sqr(z3, z3);
                F.Sqr(x2, x2);

                F.Sub(z3, x2, t2);
                F.Mul(t2, C_A24, z2);
                F.Add(z2, x2, z2);
                F.Mul(z2, t2, z2);
                F.Mul(x2, z3, x2);

                //F.Apm(t1, x3, x3, z3);
                F.Sub(t1, x3, z3);
                F.Add(t1, x3, x3);
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
            while (bit >= 2);

            Debug.Assert(swap == 0);

            for (int i = 0; i < 2; ++i)
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
            uint[] x = F.Create();
            uint[] y = F.Create();

            Ed448.ScalarMultBaseXY(k, kOff, x, y);

            F.Inv(x, x);
            F.Mul(x, y, x);
            F.Sqr(x, x);

            F.Normalize(x);
            F.Encode(x, r, rOff);
        }
    }
}
