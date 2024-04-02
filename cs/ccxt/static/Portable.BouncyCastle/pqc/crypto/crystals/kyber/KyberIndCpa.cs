using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Utilities;
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    internal class KyberIndCpa
    {
        KyberEngine Engine;
        int K;
        public KyberIndCpa(KyberEngine engine)
        {
            Engine = engine;
            this.K = engine.K;
            return;
        }

        private int XOFBlockBytes => Symmetric.Shake128Rate;

        private int GenerateMatrixNBlocks => ((12 * KyberEngine.N / 8 * (1 << 12) / KyberEngine.Q + XOFBlockBytes) / XOFBlockBytes);

        private void GenerateMatrix(PolyVec[] a, byte[] seed, bool transposed)
        {
            int ctr, i, j, k;
            int buflen, off;
            ShakeDigest XOF = new ShakeDigest(128);
            byte[] buf = new byte[GenerateMatrixNBlocks * XOFBlockBytes + 2];
            for (i = 0; i < K; i++)
            {
                for (j = 0; j < K; j++)
                {
                    if (transposed)
                    {
                        XOF = Symmetric.XOF(seed, (byte) i, (byte) j);
                    }
                    else
                    {
                        XOF = Symmetric.XOF(seed, (byte) j, (byte) i);
                    }
                    XOF.DoOutput(buf, 0, GenerateMatrixNBlocks * XOFBlockBytes);
                    buflen = GenerateMatrixNBlocks * XOFBlockBytes;
                    ctr = RejectionSampling(a[i].Vec[j].Coeffs, 0, KyberEngine.N, buf, buflen);
                    while (ctr < KyberEngine.N)
                    {
                        off = buflen % 3;
                        for (k = 0; k < off; k++)
                        {
                            buf[k] = buf[buflen - off + k];
                        }
                        XOF.DoOutput(buf, off, XOFBlockBytes * 2);
                        buflen = off + XOFBlockBytes;
                        ctr += RejectionSampling(a[i].Vec[j].Coeffs, ctr, KyberEngine.N - ctr, buf, buflen);
                    }

                }
            }
            return;
        }

        private int RejectionSampling(short[] r, int off, int len, byte[] buf, int buflen)
        {
            int ctr, pos;
            ushort val0, val1;
            ctr = pos = 0;
            while (ctr < len && pos + 3 <= buflen)
            {
                val0 = (ushort) ((((ushort) (buf[pos + 0] & 0xFF) >> 0) | ((ushort)(buf[pos + 1] & 0xFF) << 8)) & 0xFFF);
                val1 = (ushort) ((((ushort) (buf[pos + 1] & 0xFF) >> 4) | ((ushort)(buf[pos + 2] & 0xFF)  << 4)) & 0xFFF);
                pos += 3;

                if (val0 < KyberEngine.Q)
                {
                    r[off + ctr++] = (short) val0;
                }
                if (ctr < len && val1 < KyberEngine.Q)
                {
                    r[off + ctr++] = (short) val1;
                }
            }

            return ctr;
        }

        public void GenerateKeyPair(byte[] pk, byte[] sk)
        {
            uint i;
            byte[] buf = new byte[2 * KyberEngine.SymBytes];
            byte nonce = 0;
            PolyVec[] Matrix = new PolyVec[K];
            PolyVec e = new PolyVec(Engine), pkpv = new PolyVec(Engine), skpv = new PolyVec(Engine);
            Sha3Digest Sha3Digest512 = new Sha3Digest(512);

            Engine.RandomBytes(buf, KyberEngine.SymBytes);
            
            Sha3Digest512.BlockUpdate(buf, 0, KyberEngine.SymBytes);
            Sha3Digest512.DoFinal(buf, 0);

            //Console.WriteLine(string.Format("buf = {0}", Convert.ToHexString(buf)));
            byte[] PublicSeed = Arrays.CopyOfRange(buf, 0, KyberEngine.SymBytes);
            byte[] NoiseSeed = Arrays.CopyOfRange(buf, KyberEngine.SymBytes, 2 * KyberEngine.SymBytes);

            for (i = 0; i < K; i++)
            {
                Matrix[i] = new PolyVec(Engine);
            }

            GenerateMatrix(Matrix, PublicSeed, false);

            for (i = 0; i < K; i++) 
            {
                skpv.Vec[i].GetNoiseEta1(NoiseSeed, nonce++);
            }

            for (i = 0; i < K; i++)
            {
                e.Vec[i].GetNoiseEta1(NoiseSeed, nonce++);
            }



            skpv.Ntt();
            e.Ntt();

            //Console.WriteLine("skpv = ");
            //for (i = 0; i < K; i++)
            //{
            //    Console.Write(String.Format("{0} [", i));
            //    foreach (short coeff in skpv.Vec[i].Coeffs)
            //    {
            //        Console.Write(String.Format("{0}, ", coeff));
            //    }
            //    Console.Write("]\n");
            //}

            //for (i = 0; i < K; i++)
            //{
            //    Console.Write("[");
            //    for (int j = 0; j < K; j++)
            //    {
            //        Console.Write("[");
            //        for (int k = 0; k < KyberEngine.N; k++)
            //        {
            //            Console.Write(String.Format("{0:G}, ", Matrix[i].Vec[j].Coeffs[k]));
            //        }
            //        Console.Write("], \n");
            //    }
            //    Console.Write("] \n");
            //}

            for (i = 0; i < K; i++)
            {
                PolyVec.PointwiseAccountMontgomery(pkpv.Vec[i], Matrix[i], skpv, Engine);
                pkpv.Vec[i].ToMont();
            }

            //Console.WriteLine("pkpv = ");
            //for (i = 0; i < K; i++)
            //{
            //    Console.Write(String.Format("{0} [", i));
            //    foreach (short coeff in pkpv.Vec[i].Coeffs)
            //    {
            //        Console.Write(String.Format("{0}, ", coeff));
            //    }
            //    Console.Write("]\n");
            //}
            pkpv.Add(e);
            pkpv.Reduce();




            PackSecretKey(sk, skpv);
            PackPublicKey(pk, pkpv, PublicSeed);
        

            return;
        }

        private void PackSecretKey(byte[] sk, PolyVec skpv)
        {
            skpv.ToBytes(sk);
        }

        private void UnpackSecretKey(PolyVec skpv, byte[] sk)
        {
            skpv.FromBytes(sk);
        }

        private void PackPublicKey(byte[] pk, PolyVec pkpv, byte[] seed)
        {
            int i;
            pkpv.ToBytes(pk);
            Array.Copy(seed, 0, pk, Engine.PolyVecBytes, KyberEngine.SymBytes);
        }

        private void UnpackPublicKey(PolyVec pkpv, byte[] seed, byte[] pk)
        {
            int i;
            pkpv.FromBytes(pk);
            Array.Copy(pk, Engine.PolyVecBytes, seed, 0, KyberEngine.SymBytes);
        }

        public void Encrypt(byte[] c, byte[] m, byte[] pk, byte[] coins)
        {
            int i;
            byte[] seed = new byte[KyberEngine.SymBytes];
            byte nonce = (byte)0;
            PolyVec sp = new PolyVec(Engine), pkpv = new PolyVec(Engine), ep = new PolyVec(Engine), bp = new PolyVec(Engine);
            PolyVec[] MatrixTransposed = new PolyVec[K];
            Poly v = new Poly(Engine), k = new Poly(Engine), epp = new Poly(Engine);

            UnpackPublicKey(pkpv, seed, pk);

            k.FromMsg(m);

            for (i = 0; i < K; i++)
            {
                MatrixTransposed[i] = new PolyVec(Engine);
            }

            GenerateMatrix(MatrixTransposed, seed, true);

            for (i = 0; i < K; i++)
            {
                sp.Vec[i].GetNoiseEta1(coins, nonce++);
            }

            for (i = 0; i < K; i++)
            {
                ep.Vec[i].GetNoiseEta2(coins, nonce++);
            }
            epp.GetNoiseEta2(coins, nonce++);

            sp.Ntt();

            for (i = 0; i < K; i++)
            {
                PolyVec.PointwiseAccountMontgomery(bp.Vec[i], MatrixTransposed[i], sp, Engine);
            }

            PolyVec.PointwiseAccountMontgomery(v, pkpv, sp, Engine);

            bp.InverseNttToMont();

            v.PolyInverseNttToMont();

            bp.Add(ep);

            v.Add(epp);
            v.Add(k);

            bp.Reduce();
            v.PolyReduce();

            PackCipherText(c, bp, v);
        }

        private void PackCipherText(byte[] r, PolyVec b, Poly v)
        {
            b.CompressPolyVec(r);
            v.CompressPoly(r, Engine.PolyVecCompressedBytes);
        }

        private void UnpackCipherText(PolyVec b, Poly v, byte[] c)
        {
            b.DecompressPolyVec(c);
            v.DecompressPoly(c, Engine.PolyVecCompressedBytes);
        }

        public void Decrypt(byte[] m, byte[] c, byte[] sk)
        {
            PolyVec bp = new PolyVec(Engine),
                skpv = new PolyVec(Engine);
            Poly v = new Poly(Engine),
                mp = new Poly(Engine);
            int i;

            UnpackCipherText(bp, v, c);

            UnpackSecretKey(skpv, sk);

            bp.Ntt();

            PolyVec.PointwiseAccountMontgomery(mp, skpv, bp, Engine);

            mp.PolyInverseNttToMont();
            mp.Subtract(v);
            mp.PolyReduce();
            mp.ToMsg(m);

        }
    }
}
