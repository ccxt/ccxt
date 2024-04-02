using System;
using Org.BouncyCastle.Crypto.Digests;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    internal class Poly
    {
        public int[] Coeffs { get; set; }

        private int N;
        private DilithiumEngine Engine;
        private int PolyUniformNBlocks = (768 + Symmetric.Shake128Rate - 1) / Symmetric.Shake128Rate;

        public Poly(DilithiumEngine engine)
        {
            N = DilithiumEngine.N;
            Coeffs = new int[N];
            Engine = engine;
        }

        public void UniformBlocks(byte[] seed, ushort nonce)
        {
            int i, ctr, off,
            buflen = PolyUniformNBlocks * Symmetric.Shake128Rate;
            byte[] buf = new byte[buflen + 2];
            ShakeDigest Shake128Digest = new ShakeDigest(128);

            Symmetric.ShakeStreamInit(Shake128Digest, seed, nonce);

            Shake128Digest.DoOutput(buf, 0, buflen + 2);

            ctr = RejectUniform(Coeffs, 0, N, buf, buflen);

            while (ctr < N)
            {
                off = buflen % 3;
                for (i = 0; i < off; ++i)
                {
                    buf[i] = buf[buflen - off + i];
                }
                Shake128Digest.DoOutput(buf, buflen + off, 1);
                buflen = Symmetric.Shake128Rate + off;
                ctr += RejectUniform(Coeffs, ctr, N, buf, buflen);
            }


        }

        private static int RejectUniform(int[] coeffs, int off, int len, byte[] buf, int buflen)
        {
            int ctr, pos;
            uint t;


            ctr = pos = 0;
            while (ctr < len && pos + 3 <= buflen)
            {
                t = (uint)(buf[pos++] & 0xFF);
                t |= (uint)(buf[pos++] & 0xFF) << 8;
                t |= (uint)(buf[pos++] & 0xFF) << 16;
                t &= 0x7FFFFF;

                if (t < DilithiumEngine.Q)
                {
                    coeffs[off + ctr++] = (int)t;
                }
            }
            return ctr;

        }

        public void UniformEta(byte[] seed, ushort nonce)
        {
            int ctr, PolyUniformEtaNBlocks, eta = Engine.Eta;


            if (Engine.Eta == 2)
            {
                PolyUniformEtaNBlocks = ((136 + Symmetric.Shake128Rate - 1) / Symmetric.Shake256Rate);
            }
            else if (Engine.Eta == 4)
            {
                PolyUniformEtaNBlocks = ((227 + Symmetric.Shake128Rate - 1) / Symmetric.Shake256Rate);
            }
            else
            {
                throw new ArgumentException("Wrong Dilithium Eta!");
            }

            int buflen = PolyUniformEtaNBlocks * Symmetric.Shake128Rate;

            byte[] buf = new byte[buflen];
            ShakeDigest Shake256Digest = new ShakeDigest(256);

            Symmetric.ShakeStreamInit(Shake256Digest, seed, nonce);
            Shake256Digest.DoOutput(buf, 0, buflen);
            ctr = RejectEta(Coeffs, 0, N, buf, buflen, eta);

            while (ctr < DilithiumEngine.N)
            {
                Shake256Digest.DoOutput(buf, buflen, Symmetric.Shake128Rate);
                ctr += RejectEta(Coeffs, ctr, N - ctr, buf, Symmetric.Shake128Rate, eta);
            }
        }

        private static int RejectEta(int[] coeffs, int off, int len, byte[] buf, int buflen, int eta)
        {
            int ctr, pos;
            uint t0, t1;

            ctr = pos = 0;

            while (ctr < len && pos < buflen)
            {
                t0 = (uint)(buf[pos] & 0xFF) & 0x0F;
                t1 = (uint)(buf[pos++] & 0xFF) >> 4;
                if (eta == 2)
                {
                    if (t0 < 15)
                    {
                        t0 = t0 - (205 * t0 >> 10) * 5;
                        coeffs[off + ctr++] = (int)(2 - t0);
                    }
                    if (t1 < 15 && ctr < len)
                    {
                        t1 = t1 - (205 * t1 >> 10) * 5;
                        coeffs[off + ctr++] = (int)(2 - t1);
                    }
                }
                else if (eta == 4)
                {
                    if (t0 < 9)
                    {
                        coeffs[off + ctr++] = (int)(4 - t0);
                    }
                    if (t1 < 9 && ctr < len)
                    {
                        coeffs[off + ctr++] = (int)(4 - t1);
                    }
                }
            }
            return ctr;
        }

        public void PointwiseMontgomery(Poly v, Poly w)
        {
            int i;
            for (i = 0; i < N; ++i)
            {
                Coeffs[i] = Reduce.MontgomeryReduce((long)((long)v.Coeffs[i] * (long)w.Coeffs[i]));
            }
        }

        public void PointwiseAccountMontgomery(PolyVecL u, PolyVecL v)
        {
            int i;
            Poly t = new Poly(Engine);

            PointwiseMontgomery(u.Vec[0], v.Vec[0]);
            //Console.Write("temp = [");
            //for (int j = 0; j < N; ++j)
            //{
            //    Console.Write("{0}, ", Coeffs[j]);
            //}
            //Console.Write("]\n");

            

            for (i = 1; i < Engine.L; ++i)
            {
                t.PointwiseMontgomery(u.Vec[i], v.Vec[i]);
                AddPoly(t);
            }
            //Console.Write("temp = [");
            //for (int j = 0; j < N; ++j)
            //{
            //    Console.Write("{0}, ", Coeffs[j]);
            //}
            //Console.Write("]\n");
        }

        public void AddPoly(Poly a)
        {
            int i;
            for (i = 0; i < N; i++)
            {
                Coeffs[i] += a.Coeffs[i];
            }
        }

        public void Subtract(Poly b)
        {
            for (int i = 0; i < N; ++i)
            {
                Coeffs[i] -= b.Coeffs[i];
            }
        }

        public void ReducePoly()
        {
            for (int i = 0; i < N; ++i)
            {
                Coeffs[i] = Reduce.Reduce32(Coeffs[i]);
            }
        }

        public void PolyNtt()
        {
            Ntt.NTT(Coeffs);
        }

        public void InverseNttToMont()
        {
            Ntt.InverseNttToMont(Coeffs);
        }

        public void ConditionalAddQ()
        {
            for (int i = 0; i < N; ++i)
            {
                Coeffs[i] = Reduce.ConditionalAddQ(Coeffs[i]);
            }
        }

        public void Power2Round(Poly a)
        {
            for (int i = 0; i < N; ++i)
            {
                int[] Power2Round = Rounding.Power2Round(Coeffs[i]);
                Coeffs[i] = Power2Round[0];
                a.Coeffs[i] = Power2Round[1];
            }
        }

        public void PolyT0Pack(byte[] r, int off)
        {
            int i;
            int[] t = new int[8];
            for (i = 0; i < N / 8; ++i)
            {
                t[0] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 0];
                t[1] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 1];
                t[2] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 2];
                t[3] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 3];
                t[4] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 4];
                t[5] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 5];
                t[6] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 6];
                t[7] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 7];

                r[off + 13 * i + 0] = (byte)(t[0]);

                r[off + 13 * i + 1] = (byte)(t[0] >> 8);
                r[off + 13 * i + 1] = (byte)(r[off + 13 * i + 1] | (byte)(t[1] << 5));
                r[off + 13 * i + 2] = (byte)(t[1] >> 3);
                r[off + 13 * i + 3] = (byte)(t[1] >> 11);
                r[off + 13 * i + 3] = (byte)(r[off + 13 * i + 3] | (byte)(t[2] << 2));
                r[off + 13 * i + 4] = (byte)(t[2] >> 6);
                r[off + 13 * i + 4] = (byte)(r[off + 13 * i + 4] | (byte)(t[3] << 7));
                r[off + 13 * i + 5] = (byte)(t[3] >> 1);
                r[off + 13 * i + 6] = (byte)(t[3] >> 9);
                r[off + 13 * i + 6] = (byte)(r[off + 13 * i + 6] | (byte)(t[4] << 4));
                r[off + 13 * i + 7] = (byte)(t[4] >> 4);
                r[off + 13 * i + 8] = (byte)(t[4] >> 12);
                r[off + 13 * i + 8] = (byte)(r[off + 13 * i + 8] | (byte)(t[5] << 1));
                r[off + 13 * i + 9] = (byte)(t[5] >> 7);
                r[off + 13 * i + 9] = (byte)(r[off + 13 * i + 9] | (byte)(t[6] << 6));
                r[off + 13 * i + 10] = (byte)(t[6] >> 2);
                r[off + 13 * i + 11] = (byte)(t[6] >> 10);
                r[off + 13 * i + 11] = (byte)(r[off + 13 * i + 11] | (byte)(t[7] << 3));
                r[off + 13 * i + 12] = (byte)(t[7] >> 5);
            }
        }

        public void PolyT0Unpack(byte[] a, int off)
        {
            int i;
            for (i = 0; i < N / 8; ++i)
            {
                Coeffs[8 * i + 0] =
                    (
                        (a[off + 13 * i + 0] & 0xFF) |
                            ((a[off + 13 * i + 1] & 0xFF) << 8)
                    ) & 0x1FFF;
                Coeffs[8 * i + 1] =
                    (
                        (((a[off + 13 * i + 1] & 0xFF) >> 5) |
                            ((a[off + 13 * i + 2] & 0xFF) << 3)) |
                            ((a[off + 13 * i + 3] & 0xFF) << 11)
                    ) & 0x1FFF;

                Coeffs[8 * i + 2] =
                    (
                        (((a[off + 13 * i + 3] & 0xFF) >> 2) |
                            ((a[off + 13 * i + 4] & 0xFF) << 6))
                    ) & 0x1FFF;

                Coeffs[8 * i + 3] =
                    (
                        (((a[off + 13 * i + 4] & 0xFF) >> 7) |
                            ((a[off + 13 * i + 5] & 0xFF) << 1)) |
                            ((a[off + 13 * i + 6] & 0xFF) << 9)
                    ) & 0x1FFF;

                Coeffs[8 * i + 4] =
                    (
                        (((a[off + 13 * i + 6] & 0xFF) >> 4) |
                            ((a[off + 13 * i + 7] & 0xFF) << 4)) |
                            ((a[off + 13 * i + 8] & 0xFF) << 12)
                    ) & 0x1FFF;

                Coeffs[8 * i + 5] =
                    (
                        (((a[off + 13 * i + 8] & 0xFF) >> 1) |
                            ((a[off + 13 * i + 9] & 0xFF) << 7))
                    ) & 0x1FFF;

                Coeffs[8 * i + 6] =
                    (
                        (((a[off + 13 * i + 9] & 0xFF) >> 6) |
                            ((a[off + 13 * i + 10] & 0xFF) << 2)) |
                            ((a[off + 13 * i + 11] & 0xFF) << 10)
                    ) & 0x1FFF;

                Coeffs[8 * i + 7] =
                    (
                        ((a[off + 13 * i + 11] & 0xFF) >> 3 |
                            ((a[off + 13 * i + 12] & 0xFF) << 5))
                    ) & 0x1FFF;


                Coeffs[8 * i + 0] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 0];
                Coeffs[8 * i + 1] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 1];
                Coeffs[8 * i + 2] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 2];
                Coeffs[8 * i + 3] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 3];
                Coeffs[8 * i + 4] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 4];
                Coeffs[8 * i + 5] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 5];
                Coeffs[8 * i + 6] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 6];
                Coeffs[8 * i + 7] = (1 << (DilithiumEngine.D - 1)) - Coeffs[8 * i + 7];
            }
        }

        public void PolyT1Pack(byte[] r, int off)
        {
            for (int i = 0; i < N / 4; ++i)
            {
                r[off + 5 * i + 0] = (byte)(Coeffs[4 * i + 0] >> 0);
                r[off + 5 * i + 1] = (byte)((Coeffs[4 * i + 0] >> 8) | (Coeffs[4 * i + 1] << 2));
                r[off + 5 * i + 2] = (byte)((Coeffs[4 * i + 1] >> 6) | (Coeffs[4 * i + 2] << 4));
                r[off + 5 * i + 3] = (byte)((Coeffs[4 * i + 2] >> 4) | (Coeffs[4 * i + 3] << 6));
                r[off + 5 * i + 4] = (byte)(Coeffs[4 * i + 3] >> 2);
            }
        }

        public void PolyT1Unpack(byte[] a, int off)
        {
            int i;

            for (i = 0; i < N / 4; ++i)
            {
                Coeffs[4 * i + 0] = (((a[off + 5 * i + 0] & 0xFF) >> 0) | ((int)(a[off + 5 * i + 1] & 0xFF) << 8)) & 0x3FF;
                Coeffs[4 * i + 1] = (((a[off + 5 * i + 1] & 0xFF) >> 2) | ((int)(a[off + 5 * i + 2] & 0xFF) << 6)) & 0x3FF;
                Coeffs[4 * i + 2] = (((a[off + 5 * i + 2] & 0xFF) >> 4) | ((int)(a[off + 5 * i + 3] & 0xFF) << 4)) & 0x3FF;
                Coeffs[4 * i + 3] = (((a[off + 5 * i + 3] & 0xFF) >> 6) | ((int)(a[off + 5 * i + 4] & 0xFF) << 2)) & 0x3FF;
            }
        }

        public void PolyEtaPack(byte[] r, int off)
        {
            int i;
            byte[] t = new byte[8];

            if (Engine.Eta == 2)
            {
                for (i = 0; i < N / 8; ++i)
                {
                    t[0] = (byte)(Engine.Eta - Coeffs[8 * i + 0]);
                    t[1] = (byte)(Engine.Eta - Coeffs[8 * i + 1]);
                    t[2] = (byte)(Engine.Eta - Coeffs[8 * i + 2]);
                    t[3] = (byte)(Engine.Eta - Coeffs[8 * i + 3]);
                    t[4] = (byte)(Engine.Eta - Coeffs[8 * i + 4]);
                    t[5] = (byte)(Engine.Eta - Coeffs[8 * i + 5]);
                    t[6] = (byte)(Engine.Eta - Coeffs[8 * i + 6]);
                    t[7] = (byte)(Engine.Eta - Coeffs[8 * i + 7]);

                    r[off + 3 * i + 0] = (byte)((t[0] >> 0) | (t[1] << 3) | (t[2] << 6));
                    r[off + 3 * i + 1] = (byte)((t[2] >> 2) | (t[3] << 1) | (t[4] << 4) | (t[5] << 7));
                    r[off + 3 * i + 2] = (byte)((t[5] >> 1) | (t[6] << 2) | (t[7] << 5));
                }
            }
            else if (Engine.Eta == 4)
            {
                for (i = 0; i < N / 2; ++i)
                {
                    t[0] = (byte)(Engine.Eta - Coeffs[2 * i + 0]);
                    t[1] = (byte)(Engine.Eta - Coeffs[2 * i + 1]);
                    r[off + i] = (byte)(t[0] | t[1] << 4);
                }
            }
            else
            {
                throw new ArgumentException("Eta needs to be 2 or 4!");
            }
        }

        public void PolyEtaUnpack(byte[] a, int off)
        {
            int i, eta = Engine.Eta;

            if (eta == 2)
            {
                for (i = 0; i < N / 8; ++i)
                {
                    Coeffs[8 * i + 0] = (((a[off + 3 * i + 0] & 0xFF) >> 0) & 7);
                    Coeffs[8 * i + 1] = ((((a[off + 3 * i + 0] & 0xFF) >> 3)) & 7);
                    Coeffs[8 * i + 2] = (((a[off + 3 * i + 0] & 0xFF) >> 6) | ((a[off + 3 * i + 1] & 0xFF) << 2) & 7);
                    Coeffs[8 * i + 3] = ((((a[off + 3 * i + 1] & 0xFF) >> 1)) & 7);
                    Coeffs[8 * i + 4] = ((((a[off + 3 * i + 1] & 0xFF) >> 4)) & 7);
                    Coeffs[8 * i + 5] = (((a[off + 3 * i + 1] & 0xFF) >> 7) | ((a[off + 3 * i + 2] & 0xFF) << 1) & 7);
                    Coeffs[8 * i + 6] = ((((a[off + 3 * i + 2] & 0xFF) >> 2)) & 7);
                    Coeffs[8 * i + 7] = ((((a[off + 3 * i + 2] & 0xFF) >> 5)) & 7);

                    Coeffs[8 * i + 0] = eta - Coeffs[8 * i + 0];
                    Coeffs[8 * i + 1] = eta - Coeffs[8 * i + 1];
                    Coeffs[8 * i + 2] = eta - Coeffs[8 * i + 2];
                    Coeffs[8 * i + 3] = eta - Coeffs[8 * i + 3];
                    Coeffs[8 * i + 4] = eta - Coeffs[8 * i + 4];
                    Coeffs[8 * i + 5] = eta - Coeffs[8 * i + 5];
                    Coeffs[8 * i + 6] = eta - Coeffs[8 * i + 6];
                    Coeffs[8 * i + 7] = eta - Coeffs[8 * i + 7];
                }
            }
            else if (eta == 4)
            {
                for (i = 0; i < N / 2; ++i)
                {
                    Coeffs[2 * i + 0] = ((a[off + i] & 0xFF) & 0x0F);
                    Coeffs[2 * i + 1] = ((a[off + i] & 0xFF) >> 4);
                    Coeffs[2 * i + 0] = eta - Coeffs[2 * i + 0];
                    Coeffs[2 * i + 1] = eta - Coeffs[2 * i + 1];
                }
            }
        }

        public void UniformGamma1(byte[] seed, ushort nonce)
        {
            byte[] buf = new byte[Engine.PolyUniformGamma1NBytes * Symmetric.Shake256Rate];
            ShakeDigest ShakeDigest256 = new ShakeDigest(256);
            Symmetric.ShakeStreamInit(ShakeDigest256, seed, nonce);
            ShakeDigest256.DoFinal(buf, 0, buf.Length);
            UnpackZ(buf, 0);

        }

        public void PackZ(byte[] r, int offset)
        {
            int i;
            uint[] t = new uint[4];
            if (Engine.Gamma1 == (1 << 17))
            {
                for (i = 0; i < N / 4; ++i)
                {
                    t[0] = (uint)(Engine.Gamma1 - Coeffs[4 * i + 0]);
                    t[1] = (uint)(Engine.Gamma1 - Coeffs[4 * i + 1]);
                    t[2] = (uint)(Engine.Gamma1 - Coeffs[4 * i + 2]);
                    t[3] = (uint)(Engine.Gamma1 - Coeffs[4 * i + 3]);

                    r[offset + 9 * i + 0] = (byte)t[0];
                    r[offset + 9 * i + 1] = (byte)(t[0] >> 8);
                    r[offset + 9 * i + 2] = (byte)((byte)(t[0] >> 16) | (t[1] << 2));
                    r[offset + 9 * i + 3] = (byte)(t[1] >> 6);
                    r[offset + 9 * i + 4] = (byte)((byte)(t[1] >> 14) | (t[2] << 4));
                    r[offset + 9 * i + 5] = (byte)(t[2] >> 4);
                    r[offset + 9 * i + 6] = (byte)((byte)(t[2] >> 12) | (t[3] << 6));
                    r[offset + 9 * i + 7] = (byte)(t[3] >> 2);
                    r[offset + 9 * i + 8] = (byte)(t[3] >> 10);
                }
            }
            else if (Engine.Gamma1 == (1 << 19))
            {
                for (i = 0; i < N / 2; ++i)
                {
                    t[0] = (uint)(Engine.Gamma1 - Coeffs[2 * i + 0]);
                    t[1] = (uint)(Engine.Gamma1 - Coeffs[2 * i + 1]);

                    r[offset + 5 * i + 0] = (byte)t[0];
                    r[offset + 5 * i + 1] = (byte)(t[0] >> 8);
                    r[offset + 5 * i + 2] = (byte)((byte)(t[0] >> 16) | (t[1] << 4));
                    r[offset + 5 * i + 3] = (byte)(t[1] >> 4);
                    r[offset + 5 * i + 4] = (byte)(t[1] >> 12);

                }
            }
            else
            {
                throw new ArgumentException("Wrong Dilithium Gamma1!");
            }
        }

        public void UnpackZ(byte[] a, int off)
        {
            int i;
            if (Engine.Gamma1 == (1 << 17))
            {
                for (i = 0; i < N / 4; ++i)
                {
                    Coeffs[4 * i + 0] =
                        (
                            (((a[off + 9 * i + 0] & 0xFF)) |
                                ((a[off + 9 * i + 1] & 0xFF) << 8)) |
                                ((a[off + 9 * i + 2] & 0xFF) << 16)
                        ) & 0x3FFFF;
                    Coeffs[4 * i + 1] =
                        (
                            (((a[off + 9 * i + 2] & 0xFF) >> 2) |
                                ((a[off + 9 * i + 3] & 0xFF) << 6)) |
                                ((a[off + 9 * i + 4] & 0xFF) << 14)
                        ) & 0x3FFFF;
                    Coeffs[4 * i + 2] =
                        (
                            (((a[off + 9 * i + 4] & 0xFF) >> 4) |
                                ((a[off + 9 * i + 5] & 0xFF) << 4)) |
                                ((a[off + 9 * i + 6] & 0xFF) << 12)
                        ) & 0x3FFFF;
                    Coeffs[4 * i + 3] =
                        (
                            (((a[off + 9 * i + 6] & 0xFF) >> 6) |
                                ((a[off + 9 * i + 7] & 0xFF) << 2)) |
                                ((a[off + 9 * i + 8] & 0xFF) << 10)
                        ) & 0x3FFFF;


                    Coeffs[4 * i + 0] = Engine.Gamma1 - Coeffs[4 * i + 0];
                    Coeffs[4 * i + 1] = Engine.Gamma1 - Coeffs[4 * i + 1];
                    Coeffs[4 * i + 2] = Engine.Gamma1 - Coeffs[4 * i + 2];
                    Coeffs[4 * i + 3] = Engine.Gamma1 - Coeffs[4 * i + 3];
                }
            }
            else if (Engine.Gamma1 == (1 << 19))
            {
                for (i = 0; i < N / 2; ++i)
                {
                    Coeffs[2 * i + 0] =
                        (
                            (((a[off + 5 * i + 0] & 0xFF)) |
                                ((a[off + 5 * i + 1] & 0xFF) << 8)) |
                                ((a[off + 5 * i + 2] & 0xFF) << 16)
                        ) & 0xFFFFF;
                    Coeffs[2 * i + 1] =
                        (
                            (((a[off + 5 * i + 2] & 0xFF) >> 4) |
                                ((a[off + 5 * i + 3] & 0xFF) << 4)) |
                                ((a[off + 5 * i + 4] & 0xFF) << 12)
                        ) & 0xFFFFF;

                    Coeffs[2 * i + 0] = Engine.Gamma1 - Coeffs[2 * i + 0];
                    Coeffs[2 * i + 1] = Engine.Gamma1 - Coeffs[2 * i + 1];
                }
            }
            else
            {
                throw new ArgumentException("Wrong Dilithiumn Gamma1!");
            }
        }

        public void Decompose(Poly a)
        {
            int i;
            for (i = 0; i < N; ++i)
            {
                int[] decomp = Rounding.Decompose(Coeffs[i], Engine.Gamma2);
                a.Coeffs[i] = decomp[0];
                Coeffs[i] = decomp[1];
            }
        }

        public void PackW1(byte[] r, int off)
        {
            int i;

            if (Engine.Gamma2 == (DilithiumEngine.Q - 1) / 88)
            {
                for (i = 0; i < N / 4; ++i)
                {
                    r[off + 3 * i + 0] = (byte)(((byte)Coeffs[4 * i + 0]) | (Coeffs[4 * i + 1] << 6));
                    r[off + 3 * i + 1] = (byte)((byte)(Coeffs[4 * i + 1] >> 2) | (Coeffs[4 * i + 2] << 4));
                    r[off + 3 * i + 2] = (byte)((byte)(Coeffs[4 * i + 2] >> 4) | (Coeffs[4 * i + 3] << 2));
                }
            }
            else if (Engine.Gamma2 == (DilithiumEngine.Q - 1) / 32)
            {
                for (i = 0; i < N / 2; ++i)
                {
                    r[off + i] = (byte)(Coeffs[2 * i + 0] | (Coeffs[2 * i + 1] << 4));
                }
            }
        }

        public void Challenge(byte[] seed)
        {
            int i, b, pos;
            ulong signs;
            byte[] buf = new byte[Symmetric.Shake256Rate];

            ShakeDigest ShakeDigest256 = new ShakeDigest(256);
            ShakeDigest256.BlockUpdate(seed, 0, DilithiumEngine.SeedBytes);
            ShakeDigest256.DoOutput(buf, 0, Symmetric.Shake256Rate);

            signs = 0;
            for (i = 0; i < 8; ++i)
            {
                signs |= (ulong)(buf[i] & 0xFF) << 8 * i;
            }

            pos = 8;

            for (i = 0; i < N; ++i)
            {
                Coeffs[i] = 0;
            }

            for (i = N - Engine.Tau; i < N; ++i)
            {
                do
                {
                    if (pos >= Symmetric.Shake256Rate)
                    {
                        ShakeDigest256.DoOutput(buf, 0, Symmetric.Shake256Rate);
                        pos = 0;
                    }
                    b = (buf[pos++] & 0xFF);
                }
                while (b > i);

                Coeffs[i] = Coeffs[b];
                Coeffs[b] = (int)(1 - 2 * (signs & 1));
                signs = signs >> 1;
            }
        }

        public bool CheckNorm(int B)
        {
            int i, t;

            if (B > (DilithiumEngine.Q - 1) / 8)
            {
                return true;
            }

            for (i = 0; i < N; ++i)
            {
                t = Coeffs[i] >> 31;
                t = Coeffs[i] - (t & 2 * Coeffs[i]);

                if (t >= B)
                {
                    return true;
                }
            }
            return false;
        }
        public int PolyMakeHint(Poly a0, Poly a1)
        {
            int i, s = 0;

            for (i = 0; i < N; ++i)
            {
                Coeffs[i] = Rounding.MakeHint(a0.Coeffs[i], a1.Coeffs[i], Engine);
                s += Coeffs[i];
            }
            return s;
        }

        public void PolyUseHint(Poly a, Poly h)
        {
            for (int i = 0; i < DilithiumEngine.N; ++i)
            {
                Coeffs[i] = Rounding.UseHint(a.Coeffs[i], h.Coeffs[i], Engine.Gamma2);
            }
        }

        public void ShiftLeft()
        {
            for (int i = 0; i < N; ++i)
            {
                Coeffs[i] <<= DilithiumEngine.D;
            }
        }

    }
}
