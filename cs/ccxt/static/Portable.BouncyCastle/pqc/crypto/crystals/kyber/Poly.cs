
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    class Poly
    {
        private KyberEngine Engine;
        public short[] Coeffs { get; set; }
        private int PolyCompressedBytes;
        private int Eta1;
        private int Eta2;
        private int N;
        public Poly(KyberEngine engine)
        {
            Engine = engine;
            Coeffs = new short[KyberEngine.N];
            PolyCompressedBytes = engine.PolyCompressedBytes;
            Eta1 = engine.Eta1;
            N = KyberEngine.N;
        }

        public void GetNoiseEta1(byte[] seed, byte nonce)
        {
           byte[] buf = new byte[Engine.Eta1 * KyberEngine.N / 4];
            Symmetric.PRF(buf, buf.Length, seed, nonce);
            CBD.Eta(this, buf, Engine.Eta1);
        }

        public void GetNoiseEta2(byte[] seed, byte nonce)
        {
            byte[] buf = new byte[KyberEngine.Eta2 * KyberEngine.N / 4];
            Symmetric.PRF(buf, buf.Length, seed, nonce);
            CBD.Eta(this, buf, KyberEngine.Eta2);
        }

        public void PolyNtt()
        {
            Ntt.NTT(Coeffs);
            PolyReduce();
        }

        public void PolyInverseNttToMont()
        {
            Ntt.InvNTT(Coeffs);
        }

        public static void BaseMultMontgomery(Poly r, Poly a, Poly b)
        {
            int i;
            for (i = 0; i < KyberEngine.N/4; i++)
            {
                Ntt.BaseMult(r.Coeffs, 4 * i,
                    a.Coeffs[4 * i], a.Coeffs[4 * i + 1],
                    b.Coeffs[4 * i], b.Coeffs[4 * i + 1],
                    Ntt.Zetas[64 + i]);
                Ntt.BaseMult(r.Coeffs, 4 * i + 2,
                    a.Coeffs[4 * i + 2], a.Coeffs[4 * i + 3],
                    b.Coeffs[4 * i + 2], b.Coeffs[4 * i + 3],
                    (short) (-1  * Ntt.Zetas[64 + i]));
            }
        }

        public void ToMont()
        {
            int i;
            const short f = (short) ((1UL << 32) % KyberEngine.Q);
            for (i = 0; i < KyberEngine.N; i++)
            {
                Coeffs[i] = Reduce.MontgomeryReduce(Coeffs[i] * f);
            }
        }

        public void Add(Poly a)
        {
            int i;
            for (i = 0; i < N; i++)
            {
                Coeffs[i] += a.Coeffs[i];
            }
        }

        public void Subtract(Poly a)
        {
            int i;
            for (i = 0; i < N; i++)
            {
                Coeffs[i] = (short) (a.Coeffs[i] - Coeffs[i]);
            }
        }

        public void PolyReduce()
        {
            int i;
            for (i = 0; i < KyberEngine.N; i++)
            {
                Coeffs[i] = Reduce.BarrettReduce(Coeffs[i]);
            }
        }

        public void CompressPoly(byte[] r, int off)
        {
            int i, j;
            byte[] t = new byte[8];
            int count = 0;
            CondSubQ();

            if (Engine.PolyCompressedBytes == 128)
            {
                for (i = 0; i < KyberEngine.N / 8; i++)
                {
                    for (j = 0; j < 8; j++)
                    {
                        t[j] =
                            (byte)(((((Coeffs[8 * i + j]) << 4)
                                +
                                (KyberEngine.Q / 2)
                            ) / KyberEngine.Q)
                                & 15);
                    }

                    r[off + count + 0] = (byte)(t[0] | (t[1] << 4));
                    r[off + count + 1] = (byte)(t[2] | (t[3] << 4));
                    r[off + count + 2] = (byte)(t[4] | (t[5] << 4));
                    r[off + count + 3] = (byte)(t[6] | (t[7] << 4));
                    count += 4;
                }
            }
            else if (Engine.PolyCompressedBytes == 160)
            {
                for (i = 0; i < KyberEngine.N / 8; i++)
                {
                    for (j = 0; j < 8; j++)
                    {
                        t[j] =
                            (byte)((((Coeffs[8 * i + j] << 5)
                                +
                                (KyberEngine.Q / 2)
                            ) / KyberEngine.Q
                            ) & 31
                            );
                    }
                    r[off + count + 0] = (byte)((t[0] >> 0) | (t[1] << 5));
                    r[off + count + 1] = (byte)((t[1] >> 3) | (t[2] << 2) | (t[3] << 7));
                    r[off + count + 2] = (byte)((t[3] >> 1) | (t[4] << 4));
                    r[off + count + 3] = (byte)((t[4] >> 4) | (t[5] << 1) | (t[6] << 6));
                    r[off + count + 4] = (byte)((t[6] >> 2) | (t[7] << 3));
                    count += 5;
                }
            }
            else
            {
                throw new ArgumentException("PolyCompressedBytes is neither 128 or 160!");
            }
        }

        public void DecompressPoly(byte[] CompressedCipherText, int off)
        {
            int i, count = off;

            if (Engine.PolyCompressedBytes == 128)
            {
                for (i = 0; i < KyberEngine.N / 2; i++)
                {
                    Coeffs[2 * i + 0]  = (short)((((short)((CompressedCipherText[count] & 0xFF) & 15) * KyberEngine.Q) + 8) >> 4);
                    Coeffs[2 * i + 1] = (short)((((short)((CompressedCipherText[count] & 0xFF) >> 4) * KyberEngine.Q) + 8) >> 4);
                    count += 1;
                }
            }
            else if (Engine.PolyCompressedBytes == 160)
            {
                int j;
                byte[] t = new byte[8];
                for (i = 0; i < KyberEngine.N / 8; i++)
                {
                    t[0] = (byte)((CompressedCipherText[count + 0] & 0xFF) >> 0);
                    t[1] = (byte)(((CompressedCipherText[count + 0] & 0xFF) >> 5) | ((CompressedCipherText[count + 1] & 0xFF) << 3));
                    t[2] = (byte)((CompressedCipherText[count + 1] & 0xFF) >> 2);
                    t[3] = (byte)(((CompressedCipherText[count + 1] & 0xFF) >> 7) | ((CompressedCipherText[count + 2] & 0xFF) << 1));
                    t[4] = (byte)(((CompressedCipherText[count + 2] & 0xFF) >> 4) | ((CompressedCipherText[count + 3] & 0xFF) << 4));
                    t[5] = (byte)((CompressedCipherText[count + 3] & 0xFF) >> 1);
                    t[6] = (byte)(((CompressedCipherText[count + 3] & 0xFF) >> 6) | ((CompressedCipherText[count + 4] & 0xFF) << 2));
                    t[7] = (byte)((CompressedCipherText[count + 4] & 0xFF) >> 3);
                    count += 5;
                    for (j = 0; j < 8; j++)
                    {
                        Coeffs[8 * i + j] = (short)(((t[j] & 31) * KyberEngine.Q + 16) >> 5);
                    }
                }
            }
            else
            {
                throw new ArgumentException("PolyCompressedBytes is neither 128 or 160!");
            }
        }
        
        public void ToBytes(byte[] r, int off)
        {
            int i;
            ushort t0, t1;

            CondSubQ();

            for (i = 0; i < KyberEngine.N/2; i++)
            {
                t0 = (ushort) Coeffs[2 * i];
                t1 = (ushort) Coeffs[2 * i + 1];
                r[off + 3 * i + 0] = (byte) (ushort) (t0 >> 0);
                r[off + 3 * i + 1] = (byte)((t0 >> 8) | (ushort) (t1 << 4));
                r[off + 3 * i + 2] = (byte) (ushort) (t1 >> 4);
            }
        }

        public void FromBytes(byte[] a, int off)
        {
            int i;
            for (i = 0; i < KyberEngine.N / 2; i++)
            {
                Coeffs[2 * i] = (short) ((((a[off + 3 * i + 0] & 0xFF) >> 0) | (ushort)((a[off + 3 * i + 1] & 0xFF) << 8)) & 0xFFF);
                Coeffs[2 * i + 1] = (short) ((((a[off + 3 * i + 1] & 0xFF) >> 4) | (ushort)((a[off + 3 * i + 2] & 0xFF) << 4)) & 0xFFF);
            }
        }

        public void ToMsg(byte[] msg)
        {
            int i, j;
            short t;

            CondSubQ();

            for (i = 0; i < KyberEngine.N / 8; i++)
            {
                msg[i] = 0;
                for (j = 0; j < 8; j++)
                {
                    t = (short)(((((short)(Coeffs[8 * i + j] << 1) + KyberEngine.Q / 2) / KyberEngine.Q) & 1));
                    msg[i] |= (byte)(t << j);
                }
            }
        }

        public void FromMsg(byte[] m)
        {
            int i, j;
            short mask;
            if (m.Length != KyberEngine.N / 8)
            {
                throw new ArgumentException("KYBER_INDCPA_MSGBYTES must be equal to KYBER_N/8 bytes!");
            }
            for (i = 0; i < KyberEngine.N / 8; i++)
            {
                for (j = 0; j < 8; j++)
                {
                    mask = (short)((-1) * (short)(((m[i] & 0xFF) >> j) & 1));
                    Coeffs[8 * i + j] = (short)(mask & ((KyberEngine.Q + 1) / 2));
                }
            }
        }

        public void CondSubQ()
        {
            int i;
            for (i = 0; i < KyberEngine.N; i++)
            {
                Coeffs[i] = Reduce.CondSubQ(Coeffs[i]);
            }
        }
    }
}
