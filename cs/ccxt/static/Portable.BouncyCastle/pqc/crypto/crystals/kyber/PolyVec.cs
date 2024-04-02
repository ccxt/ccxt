using Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber;
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    class PolyVec
    {
        private KyberEngine Engine;
        private int K;
        private int PolyVecBytes;
        public Poly[] Vec;




        public PolyVec(KyberEngine engine)
        {
            Engine = engine;
            K = engine.K;
            PolyVecBytes = engine.PolyVecBytes;
            Vec = new Poly[engine.K];
            for (int i = 0; i < K; i++)
            {
                Vec[i] = new Poly(engine);
            }
        }

        public void Ntt()
        {
            int i;
            for (i = 0; i < K; i++)
            {
                Vec[i].PolyNtt();
            }
        }

        public void InverseNttToMont()
        {
            int i;
            for (i = 0; i < K; i++)
            {
                Vec[i].PolyInverseNttToMont();
            }
        }
        
        public static void PointwiseAccountMontgomery(Poly r, PolyVec a, PolyVec b, KyberEngine engine)
        {
            int i;
            Poly t = new Poly(engine);
            Poly.BaseMultMontgomery(r, a.Vec[0], b.Vec[0]);
            for (i = 1; i < engine.K; i++)
            {
                Poly.BaseMultMontgomery(t, a.Vec[i], b.Vec[i]);
                r.Add(t);
            }
            r.PolyReduce();
        }

        public void Add(PolyVec a)
        {
            uint i;
            for (i = 0; i < K; i++)
            {
                Vec[i].Add(a.Vec[i]);
            }
        }

        public void Reduce()
        {
            int i;
            for (i = 0; i < K; i++)
            {
                Vec[i].PolyReduce();
            }
        }

        public void CompressPolyVec(byte[] r)
        {
            int i, j, k;
            ConditionalSubQ();
            short[] t;
            int count = 0;
            if (Engine.PolyVecCompressedBytes == K * 320)
            {
                t = new short[4];
                for (i = 0; i < K; i++)
                {
                    for (j = 0; j < KyberEngine.N / 4; j++)
                    {
                        for (k = 0; k < 4; k++)
                        {
                            t[k] = (short)
                                (
                                    (
                                        (((uint) Vec[i].Coeffs[4 * j + k] << 10)
                                            + (KyberEngine.Q / 2))
                                            / KyberEngine.Q)
                                        & 0x3ff);
                        }
                        r[count + 0] = (byte)(t[0] >> 0);
                        r[count + 1] = (byte)((t[0] >> 8) | (t[1] << 2));
                        r[count + 2] = (byte)((t[1] >> 6) | (t[2] << 4));
                        r[count + 3] = (byte)((t[2] >> 4) | (t[3] << 6));
                        r[count + 4] = (byte)((t[3] >> 2));
                        count += 5;
                    }
                }
            }
            else if (Engine.PolyVecCompressedBytes == K * 352)
            {
                t = new short[8];
                for (i = 0; i < K; i++)
                {
                    for (j = 0; j < KyberEngine.N / 8; j++)
                    {
                        for (k = 0; k < 8; k++)
                        {
                            t[k] = (short)
                                (
                                    (
                                        (((uint) Vec[i].Coeffs[8 * j + k] << 11)
                                            + (KyberEngine.Q / 2))
                                            / KyberEngine.Q)
                                        & 0x7ff);
                        }
                        r[count + 0] = (byte)((t[0] >> 0));
                        r[count + 1] = (byte)((t[0] >> 8) | (t[1] << 3));
                        r[count + 2] = (byte)((t[1] >> 5) | (t[2] << 6));
                        r[count + 3] = (byte)((t[2] >> 2));
                        r[count + 4] = (byte)((t[2] >> 10) | (t[3] << 1));
                        r[count + 5] = (byte)((t[3] >> 7) | (t[4] << 4));
                        r[count + 6] = (byte)((t[4] >> 4) | (t[5] << 7));
                        r[count + 7] = (byte)((t[5] >> 1));
                        r[count + 8] = (byte)((t[5] >> 9) | (t[6] << 2));
                        r[count + 9] = (byte)((t[6] >> 6) | (t[7] << 5));
                        r[count + 10] = (byte)((t[7] >> 3));
                        count += 11;
                    }
                }
            }
            else
            {
                throw new ArgumentException("Kyber PolyVecCompressedBytes neither 320 * KyberK or 352 * KyberK!");
            }
        }

        public void DecompressPolyVec(byte[] CompressedCipherText)
        {
            int i, j, k, count = 0;

            if (Engine.PolyVecCompressedBytes == (K * 320))
            {
                short[] t = new short[4];
                for (i = 0; i < K; i++)
                {
                    for (j = 0; j < KyberEngine.N / 4; j++)
                    {
                        t[0] = (short)(((CompressedCipherText[count] & 0xFF) >> 0) | ((ushort)(CompressedCipherText[count + 1] & 0xFF) << 8));
                        t[1] = (short)(((CompressedCipherText[count + 1] & 0xFF) >> 2) | ((ushort)(CompressedCipherText[count + 2] & 0xFF) << 6));
                        t[2] = (short)(((CompressedCipherText[count + 2] & 0xFF) >> 4) | ((ushort)(CompressedCipherText[count + 3] & 0xFF) << 4));
                        t[3] = (short)(((CompressedCipherText[count + 3] & 0xFF) >> 6) | ((ushort)(CompressedCipherText[count + 4] & 0xFF) << 2));
                        count += 5;
                        for (k = 0; k < 4; k++)
                        {
                            Vec[i].Coeffs[4 * j + k] = (short)(((t[k] & 0x3FF) * KyberEngine.Q + 512) >> 10);
                        }
                    }

                }

            }
            else if (Engine.PolyVecCompressedBytes == (K * 352))
            {
                short[] t = new short[8];
                for (i = 0; i < K; i++)
                {
                    for (j = 0; j < KyberEngine.N / 8; j++)
                    {
                        t[0] = (short)(((CompressedCipherText[count] & 0xFF) >> 0) | ((ushort)(CompressedCipherText[count + 1] & 0xFF) << 8));
                        t[1] = (short)(((CompressedCipherText[count + 1] & 0xFF) >> 3) | ((ushort)(CompressedCipherText[count + 2] & 0xFF) << 5));
                        t[2] = (short)(((CompressedCipherText[count + 2] & 0xFF) >> 6) | ((ushort)(CompressedCipherText[count + 3] & 0xFF) << 2) | ((ushort)((CompressedCipherText[count + 4] & 0xFF) << 10)));
                        t[3] = (short)(((CompressedCipherText[count + 4] & 0xFF) >> 1) | ((ushort)(CompressedCipherText[count + 5] & 0xFF) << 7));
                        t[4] = (short)(((CompressedCipherText[count + 5] & 0xFF) >> 4) | ((ushort)(CompressedCipherText[count + 6] & 0xFF) << 4));
                        t[5] = (short)(((CompressedCipherText[count + 6] & 0xFF) >> 7) | ((ushort)(CompressedCipherText[count + 7] & 0xFF) << 1) | ((ushort)((CompressedCipherText[count + 8] & 0xFF) << 9)));
                        t[6] = (short)(((CompressedCipherText[count + 8] & 0xFF) >> 2) | ((ushort)(CompressedCipherText[count + 9] & 0xFF) << 6));
                        t[7] = (short)(((CompressedCipherText[count + 9] & 0xFF) >> 5) | ((ushort)(CompressedCipherText[count + 10] & 0xFF) << 3));
                        count += 11;
                        for (k = 0; k < 8; k++)
                        {
                            Vec[i].Coeffs[8 * j + k] = (short)(((t[k] & 0x7FF) * KyberEngine.Q + 1024) >> 11);
                        }
                    }
                }
            }
            else
            {
                throw new ArgumentException("Kyber PolyVecCompressedBytes neither 320 * KyberK or 352 * KyberK!");
            }
        }

        public void ToBytes(byte[] r)
        {
            int i;
            for (i = 0; i < K; i++)
            {
                Vec[i].ToBytes(r, i * KyberEngine.PolyBytes);
            }
        }

        public void FromBytes(byte[] pk)
        {
            int i;
            for (i = 0; i < K; i++)
            {
                Vec[i].FromBytes(pk, i * KyberEngine.PolyBytes);
            }
        }

        private void ConditionalSubQ()
        {
            int i;
            for (i = 0; i < K; i++)
            {
                Vec[i].CondSubQ();
            }
        }

    }
}
