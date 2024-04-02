
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    public class FrodoEngine
    {
        // constant parameters
        internal static int nbar = 8;
        private static int mbar = 8;
        private static int len_seedA = 128;
        private static int len_z = 128;
        private static int len_chi = 16;

        private static int len_seedA_bytes = len_seedA / 8;
        private static int len_z_bytes = len_z / 8;
        private static int len_chi_bytes = len_chi / 8;

        // parameters for Frodo{n}
        private int D;
        private int q;
        private int n;
        private int B;

        private int len_sk_bytes;
        private int len_pk_bytes;
        private int len_ct_bytes;

        private short[] T_chi;

        // all same size
        private int len_mu;
        private int len_seedSE;
        private int len_s;
        private int len_k;
        private int len_pkh;
        private int len_ss;

        private int len_mu_bytes;
        private int len_seedSE_bytes;
        private int len_s_bytes;
        private int len_k_bytes;
        private int len_pkh_bytes;

        private int len_ss_bytes;

        //
        private IDigest digest;
        private FrodoMatrixGenerator gen;

        public int CipherTextSize => len_ct_bytes;

        public int SessionKeySize => len_ss_bytes;

        public int PrivateKeySize => len_sk_bytes;
        public int PublicKeySize => len_pk_bytes;

        public FrodoEngine(int n, int D, int B, short[] cdf_table, IDigest digest, FrodoMatrixGenerator mGen)
        {
            this.n = n;
            this.D = D;
            this.q = (1 << D);
            this.B = B;

            this.len_mu = (B * nbar * nbar);
            this.len_seedSE = len_mu;
            this.len_s = len_mu;
            this.len_k = len_mu;
            this.len_pkh = len_mu;
            this.len_ss = len_mu;

            this.len_mu_bytes = len_mu / 8;
            this.len_seedSE_bytes = len_seedSE / 8;
            this.len_s_bytes = len_s / 8;
            this.len_k_bytes = len_k / 8;
            this.len_pkh_bytes = len_pkh / 8;
            this.len_ss_bytes = len_ss / 8;

            this.len_ct_bytes = (D * n * nbar) / 8 + (D * nbar * nbar) / 8;
            this.len_pk_bytes = len_seedA_bytes + (D * n * nbar) / 8;
            this.len_sk_bytes = len_s_bytes + len_pk_bytes + (2 * n * nbar + len_pkh_bytes);

            this.T_chi = cdf_table;
            this.digest = digest;
            this.gen = mGen;
        }

        private short Sample(short r)
        {
            short t, e;
            // 1. t = sum_{i=1}^{len_x - 1} r_i * 2^{i-1}
            t = (short) ((r & 0xffff) >> 1);
            e = 0; // 2. e = 0
            for (int z = 0; z < T_chi.Length; z++)
            {
                if (t > T_chi[z]) // 4. if t > T_chi(z)
                    e++; // 5. e = e + 1
            }
            // 6. e = (-1)^{r_0} * e

            if (((r & 0xffff) % 2) == 1)
                e = (short) ((e) * (-1) & 0xffff);

            return e;
        }

        private short[] SampleMatrix(short[] r, int offset, int n1, int n2)
        {
            short[] E = new short[n1 * n2];
            for (int i = 0; i < n1; i++)
            for (int j = 0; j < n2; j++)
                E[i * n2 + j] = Sample(r[i * n2 + j + offset]);
            return E;
        }

        private short[] MatrixTranspose(short[] X, int n1, int n2)
        {
            short[] res = new short[n1 * n2];

            for (int i = 0; i < n2; i++)
            for (int j = 0; j < n1; j++)
                res[i * n1 + j] = X[j * n2 + i];
            return res;
        }

        private short[] MatrixMul(short[] X, int Xrow, int Xcol, short[] Y, int Yrow, int Ycol)
        {
            short[] res = new short[Xrow * Ycol];
            for (int i = 0; i < Xrow; i++)
            {
                for (int j = 0; j < Ycol; j++)
                {
                    for (int k = 0; k < Xcol; k++)
                    {
                        short a_test =  (short) (res[i * Ycol + j] & 0xffff);
                        short b_test =  (short) (X[i * Xcol + k] & 0xffff);
                        short c_test =  (short) (Y[k * Ycol + j] & 0xffff);
                        short bc_test = (short) (((X[i * Xcol + k] & 0xffff) * (Y[k * Ycol + j] & 0xffff)) & 0xffff);
                        short abc_test = (short) (((res[i * Ycol + j] & 0xffff) + ((X[i * Xcol + k] & 0xffff) * (Y[k * Ycol + j] & 0xffff)) & 0xffff));
                        res[i * Ycol + j] = (short) ((res[i * Ycol + j] & 0xffff) +
                            ((X[i * Xcol + k] & 0xffff) * (Y[k * Ycol + j] & 0xffff)) & 0xffff);
                    }
                    res[i * Ycol + j] = (short) (((res[i * Ycol + j] & 0xffff) % q) & 0xffff);
                }
            }

            return res;
        }

        private short[] MatrixAdd(short[] X, short[] Y, int n1, int m1)
        {
            short[] res = new short[n1 * m1];
            for (int i = 0; i < n1; i++)
            for (int j = 0; j < m1; j++)
                res[i * m1 + j] = (short) (((X[i * m1 + j] & 0xffff) + (Y[i * m1 + j] & 0xffff)) % q);

            return res;
        }

        // Packs a short array into a byte array using only the D amount of least significant bits
        private byte[] FrodoPack(short[] C)
        {
            int n = C.Length;
            byte[] output = new byte[D * n / 8];
            short i = 0; // whole bytes already filled in
            short j = 0; // whole uint16_t already copied
            short w = 0; // the leftover, not yet copied
            byte bits = 0; // the number of lsb in w

            while (i < output.Length && (j < n || ((j == n) && (bits > 0))))
            {

                byte b = 0; // bits in output[i] already filled in
                while (b < 8)
                {
                    int nbits = System.Math.Min(8 - b, bits);
                    short mask = (short) ((1 << nbits) - 1);
                    byte t = (byte) ((w >> (bits - nbits)) & mask); // the bits to copy from w to out
                    output[i] = (byte) (output[i] + (t << (8 - b - nbits)));
                    b += (byte) nbits;
                    bits -= (byte) nbits;

                    if (bits == 0)
                    {
                        if (j < n)
                        {
                            w = C[j];
                            bits = (byte) D;
                            j++;
                        }
                        else
                        {
                            break; // the input vector is exhausted
                        }
                    }
                }

                if (b == 8)
                {
                    // output[i] is filled in
                    i++;
                }
            }

            return output;
        }

        public void kem_keypair(byte[] pk, byte[] sk, SecureRandom random)
        {
            // 1. Choose uniformly random seeds s || seedSE || z
            byte[] s_seedSE_z = new byte[len_s_bytes + len_seedSE_bytes + len_z_bytes];
            random.NextBytes(s_seedSE_z);

            byte[] s = Arrays.CopyOfRange(s_seedSE_z, 0, len_s_bytes);
            byte[] seedSE = Arrays.CopyOfRange(s_seedSE_z, len_s_bytes, len_s_bytes + len_seedSE_bytes);
            byte[] z = Arrays.CopyOfRange(s_seedSE_z, len_s_bytes + len_seedSE_bytes,
                len_s_bytes + len_seedSE_bytes + len_z_bytes);

            // 2. Generate pseudorandom seed seedA = SHAKE(z, len_seedA) (length in bits)
            byte[] seedA = new byte[len_seedA_bytes];
            digest.BlockUpdate(z, 0, z.Length);
            ((IXof) digest).DoFinal(seedA, 0, seedA.Length);

            // 3. A = Frodo.Gen(seedA)
            short[] A = gen.GenMatrix(seedA);

            // 4. r = SHAKE(0x5F || seedSE, 2*n*nbar*len_chi) (length in bits), parsed as 2*n*nbar len_chi-bit integers in little-endian byte order
            byte[] rbytes = new byte[2 * n * nbar * len_chi_bytes];

            digest.Update((byte) 0x5f);
            digest.BlockUpdate(seedSE, 0, seedSE.Length);
            ((IXof) digest).DoFinal(rbytes, 0, rbytes.Length);

            short[] r = new short[2 * n * nbar];
            for (int i = 0; i < r.Length; i++)
                r[i] = (short) Pack.LE_To_UInt16(rbytes, i * 2);

            // 5. S^T = Frodo.SampleMatrix(r[0 .. n*nbar-1], nbar, n)
            short[] S_T = SampleMatrix(r, 0, nbar, n);
            short[] S = MatrixTranspose(S_T, nbar, n);

            // 6. E = Frodo.SampleMatrix(r[n*nbar .. 2*n*nbar-1], n, nbar)
            short[] E = SampleMatrix(r, n * nbar, n, nbar);

            // 7. B = A * S + E
            short[] B = MatrixAdd(MatrixMul(A, n, n, S, n, nbar), E, n, nbar);

            // 8. b = Pack(B)
            byte[] b = FrodoPack(B);

            // 9. pkh = SHAKE(seedA || b, len_pkh) (length in bits)
            // 10. pk = seedA || b
            Array.Copy(Arrays.Concatenate(seedA, b), 0, pk, 0, len_pk_bytes);

            byte[] pkh = new byte[len_pkh_bytes];
            digest.BlockUpdate(pk, 0, pk.Length);
            ((IXof) digest).DoFinal(pkh, 0, pkh.Length);

            //10. sk = (s || seedA || b, S^T, pkh)
            Array.Copy(Arrays.Concatenate(s, pk), 0,
                sk, 0, len_s_bytes + len_pk_bytes);

            byte[] temp = new byte[4];
            for (int i = 0; i < nbar; i++)
            {
                for (int j = 0; j < n; j++)
                {
                    Pack.UInt16_To_LE((ushort)S_T[i * n + j], temp);
                    Array.Copy(temp, 0,
                        sk, len_s_bytes + len_pk_bytes + i * n * 2 + j * 2, 2);
                }
            }

            Array.Copy(pkh, 0, sk, len_sk_bytes - len_pkh_bytes, len_pkh_bytes);
        }

        private short[] FrodoUnpack(byte[] input, int n1, int n2)
        {
            short[] output = new short[n1 * n2];

            short i = 0; // whole uint16_t already filled in
            short j = 0; // whole bytes already copied
            byte w = 0; // the leftover, not yet copied
            byte bits = 0; // the number of lsb bits of w

            while (i < output.Length && (j < input.Length || ((j == input.Length) && (bits > 0))))
            {
                byte b = 0; // bits in output[i] already filled in
                while (b < D)
                {
                    int nbits = System.Math.Min(D - b, bits);
                    short mask = (short) (((1 << nbits) - 1) & 0xffff); // todo <<<?
                    byte t = (byte) ((((w & 0xff) >> ((bits & 0xff) - nbits)) & (mask & 0xffff)) &
                                     0xff); // the bits to copy from w to out
                    output[i] = (short) ((output[i] & 0xffff) + (((t & 0xff) << (D - (b & 0xff) - nbits))) & 0xffff);
                    b += (byte) nbits;
                    bits -= (byte) nbits;
                    w &= (byte) ~(mask << bits);

                    if (bits == 0)
                    {
                        if (j < input.Length)
                        {
                            w = input[j];
                            bits = 8;
                            j++;
                        }
                        else
                        {
                            break; // the input vector is exhausted
                        }
                    }
                }

                if (b == D)
                {
                    // output[i] is filled in
                    i++;
                }
            }

            return output;
        }

        private short[] Encode(byte[] k)
        {
            int l, byte_index = 0;
            byte mask = 1;
            short[] K = new short[mbar * nbar];
            int temp;
            // 1. for i = 0; i < mbar; i += 1
            for (int i = 0; i < mbar; i++)
            {
                // 2. for j = 0; j < nbar; j += 1
                for (int j = 0; j < nbar; j++)
                {
                    // 3. tmp = sum_{l=0}^{B-1} k_{(i*nbar+j)*B+l} 2^l
                    temp = 0;
                    for (l = 0; l < B; l++)
                    {
                        //mask
                        if ((k[byte_index] & mask) == mask)
                        {
                            temp += (1 << l);
                        }

                        mask <<= 1;
                        if (mask == 0)
                        {
                            mask = 1;
                            byte_index++;
                        }
                    }

                    // 4. K[i][j] = ec(tmp) = tmp * q/2^B
                    K[i * nbar + j] = (short) (temp * (q / (1 << B)));
                }
            }

            return K;
        }

        public void kem_enc(byte[] ct, byte[] ss, byte[] pk, SecureRandom random)
        {
            // Parse pk = seedA || b
            byte[] seedA = Arrays.CopyOfRange(pk, 0, len_seedA_bytes);
            byte[] b = Arrays.CopyOfRange(pk, len_seedA_bytes, len_pk_bytes);

            // 1. Choose a uniformly random key mu in {0,1}^len_mu (length in bits)
            byte[] mu = new byte[len_mu_bytes];
            random.NextBytes(mu);

            // 2. pkh = SHAKE(pk, len_pkh)
            byte[] pkh = new byte[len_pkh_bytes];
            digest.BlockUpdate(pk, 0, len_pk_bytes);
            ((IXof) digest).DoFinal(pkh, 0, len_pkh_bytes);

            // 3. seedSE || k = SHAKE(pkh || mu, len_seedSE + len_k) (length in bits)
            byte[] seedSE_k = new byte[len_seedSE + len_k];
            digest.BlockUpdate(pkh, 0, len_pkh_bytes);
            digest.BlockUpdate(mu, 0, len_mu_bytes);
            ((IXof) digest).DoFinal(seedSE_k, 0, len_seedSE_bytes + len_k_bytes);

            byte[] seedSE = Arrays.CopyOfRange(seedSE_k, 0, len_seedSE_bytes);
            byte[] k = Arrays.CopyOfRange(seedSE_k, len_seedSE_bytes, len_seedSE_bytes + len_k_bytes);

            // 4. r = SHAKE(0x96 || seedSE, 2*mbar*n + mbar*nbar*len_chi) (length in bits)
            byte[] rbytes = new byte[(2 * mbar * n + mbar * nbar) * len_chi_bytes];
            digest.Update((byte) 0x96);
            digest.BlockUpdate(seedSE, 0, seedSE.Length);
            ((IXof) digest).DoFinal(rbytes, 0, rbytes.Length);

            short[] r = new short[rbytes.Length / 2];
            for (int i = 0; i < r.Length; i++)
                r[i] = (short) Pack.LE_To_UInt16(rbytes, i * 2);

            // 5. S' = Frodo.SampleMatrix(r[0 .. mbar*n-1], mbar, n)
            short[] Sprime = SampleMatrix(r, 0, mbar, n);

            // 6. E' = Frodo.SampleMatrix(r[mbar*n .. 2*mbar*n-1], mbar, n)
            short[] Eprime = SampleMatrix(r, mbar * n, mbar, n);

            // 7. A = Frodo.Gen(seedA)
            short[] A = gen.GenMatrix(seedA);

            // 8. B' = S' A + E'
            short[] Bprime = MatrixAdd(MatrixMul(Sprime, mbar, n, A, n, n), Eprime, mbar, n);

            // 9. c1 = Frodo.Pack(B')
            byte[] c1 = FrodoPack(Bprime);

            // 10. E'' = Frodo.SampleMatrix(r[2*mbar*n .. 2*mbar*n + mbar*nbar-1], mbar, n)
            short[] Eprimeprime = SampleMatrix(r, 2 * mbar * n, mbar, nbar);

            // 11. B = Frodo.Unpack(b, n, nbar)
            short[] B = FrodoUnpack(b, n, nbar);


            // 12. V = S' B + E''
            short[] V = MatrixAdd(MatrixMul(Sprime, mbar, n, B, n, nbar), Eprimeprime, mbar, nbar);

            // 13. C = V + Frodo.Encode(mu)
            short[] EncodedMU = Encode(mu);
            short[] C = MatrixAdd(V, EncodedMU, nbar, mbar);

            // 14. c2 = Frodo.Pack(C)
            byte[] c2 = FrodoPack(C);

            // 15. ss = SHAKE(c1 || c2 || k, len_ss)
            // ct = c1 + c2
            Array.Copy(Arrays.Concatenate(c1, c2), 0, ct, 0, len_ct_bytes);
            digest.BlockUpdate(c1, 0, c1.Length);
            digest.BlockUpdate(c2, 0, c2.Length);
            digest.BlockUpdate(k, 0, len_k_bytes);
            ((IXof) digest).DoFinal(ss, 0, len_s_bytes);
        }

        private short[] MatrixSub(short[] X, short[] Y, int n1, int n2)
        {
            short[] res = new short[n1 * n2];
            for (int i = 0; i < n1; i++)
            for (int j = 0; j < n2; j++)
                res[i * n2 + j] = (short) ((((X[i * n2 + j]) - (Y[i * n2 + j])) & 0xffff) % q);

            return res;
        }

        private byte[] Decode(short[] input)
        {
            int i, j, index = 0, npieces_word = 8;
            int nwords = (nbar * nbar) / 8;
            short temp;
            short maskex = (short) ((1 << B) - 1);
            short maskq = (short) ((1 << D) - 1);
            byte[] output = new byte[npieces_word * B];
            long templong;

            for (i = 0; i < nwords; i++)
            {
                templong = 0;
                for (j = 0; j < npieces_word; j++)
                {
                    // temp = floor(in*2^{-11}+0.5)
                    temp = (short) (((input[index] & maskq) + (1 << (D - B - 1))) >> (D - B));
                    templong |= ((long) (temp & maskex)) << (B * j);
                    index++;
                }

                for (j = 0; j < B; j++)
                    output[i * B + j] = (byte) ((templong >> (8 * j)) & 0xFF);
            }

            return output;
        }


        private short CTVerify(short[] a1, short[] a2, short[] b1, short[] b2)
        {
            // Compare two arrays in constant time.
            // Returns 0 if the byte arrays are equal, -1 otherwise.
            short r = 0;

            for (short i = 0; i < a1.Length; i++)
            {
                r |= (short) (a1[i] ^ b1[i]);
            }

            for (short i = 0; i < a2.Length; i++)
                r |= (short) (a2[i] ^ b2[i]);

//        r = (short) ((-(short)(r >> 1) | -(short)(r & 1)) >> (8*2-1));
            if (r == 0)
                return 0;
            return -1;
        }

        private byte[] CTSelect(byte[] a, byte[] b, short selector)
        {
            // Select one of the two input arrays to be moved to r
            // If (selector == 0) then load r with a, else if (selector == -1) load r with b
            byte[] r = new byte[a.Length];
            for (int i = 0; i < a.Length; i++)
                r[i] = (byte) (((~selector & a[i]) & 0xff) | ((selector & b[i]) & 0xff));

            return r;
        }

        public void kem_dec(byte[] ss, byte[] ct, byte[] sk)
        {
            // Parse ct = c1 || c2
            int offset = 0;
            int length = mbar * n * D / 8;
            byte[] c1 = Arrays.CopyOfRange(ct, offset, offset + length);

            offset += length;
            length = mbar * nbar * D / 8;
            byte[] c2 = Arrays.CopyOfRange(ct, offset, offset + length);

            // Parse sk = (s || seedA || b, S^T, pkh)
            offset = 0;
            length = len_s_bytes;
            byte[] s = Arrays.CopyOfRange(sk, offset, offset + length);

            offset += length;
            length = len_seedA_bytes;
            byte[] seedA = Arrays.CopyOfRange(sk, offset, offset + length);

            offset += length;
            length = (D * n * nbar) / 8;
            byte[] b = Arrays.CopyOfRange(sk, offset, offset + length);

            offset += length;
            length = n * nbar * 16 / 8;
            byte[] Sbytes = Arrays.CopyOfRange(sk, offset, offset + length);

            short[] Stransposed = new short[nbar * n];

            for (int i = 0; i < nbar; i++)
            for (int j = 0; j < n; j++)
                Stransposed[i * n + j] = (short) Pack.LE_To_UInt16(Sbytes, i * n * 2 + j * 2);

            short[] S = MatrixTranspose(Stransposed, nbar, n);

            offset += length;
            length = len_pkh_bytes;
            byte[] pkh = Arrays.CopyOfRange(sk, offset, offset + length);

            // 1. B' = Frodo.Unpack(c1, mbar, n)
            short[] Bprime = FrodoUnpack(c1, mbar, n);

            // 2. C = Frodo.Unpack(c2, mbar, nbar)
            short[] C = FrodoUnpack(c2, mbar, nbar);

            // 3. M = C - B' S
            short[] BprimeS = MatrixMul(Bprime, mbar, n, S, n, nbar);
            short[] M = MatrixSub(C, BprimeS, mbar, nbar);

            // 4. mu' = Frodo.Decode(M)
            byte[] muprime = Decode(M);

            // 5. Parse pk = seedA || b  (done above)

            // 6. seedSE' || k' = SHAKE(pkh || mu', len_seedSE + len_k) (length in bits)
            byte[] seedSEprime_kprime = new byte[len_seedSE_bytes + len_k_bytes];
            digest.BlockUpdate(pkh, 0, len_pkh_bytes);
            digest.BlockUpdate(muprime, 0, len_mu_bytes);
            ((IXof) digest).DoFinal(seedSEprime_kprime, 0, len_seedSE_bytes + len_k_bytes);

            byte[] kprime = Arrays.CopyOfRange(seedSEprime_kprime, len_seedSE_bytes, len_seedSE_bytes + len_k_bytes);

            // 7. r = SHAKE(0x96 || seedSE', 2*mbar*n + mbar*nbar*len_chi) (length in bits)
            byte[] rbytes = new byte[(2 * mbar * n + mbar * mbar) * len_chi_bytes];
            digest.Update((byte) 0x96);
            digest.BlockUpdate(seedSEprime_kprime, 0, len_seedSE_bytes);
            ((IXof) digest).DoFinal(rbytes, 0, rbytes.Length);

            short[] r = new short[2 * mbar * n + mbar * nbar];
            for (int i = 0; i < r.Length; i++)
            {
                r[i] = (short) Pack.LE_To_UInt16(rbytes, i * 2);
            }

            // 8. S' = Frodo.SampleMatrix(r[0 .. mbar*n-1], mbar, n)
            short[] Sprime = SampleMatrix(r, 0, mbar, n);

            // 9. E' = Frodo.SampleMatrix(r[mbar*n .. 2*mbar*n-1], mbar, n)
            short[] Eprime = SampleMatrix(r, mbar * n, mbar, n);

            // 10. A = Frodo.Gen(seedA)
            short[] A = gen.GenMatrix(seedA);

            // 11. B'' = S' A + E'
            short[] Bprimeprime = MatrixAdd(MatrixMul(Sprime, mbar, n, A, n, n), Eprime, mbar, n);

            // 12. E'' = Frodo.SampleMatrix(r[2*mbar*n .. 2*mbar*n + mbar*nbar-1], mbar, n)
            short[] Eprimeprime = SampleMatrix(r, 2 * mbar * n, mbar, nbar);

            // 13. B = Frodo.Unpack(b, n, nbar)
            short[] B = FrodoUnpack(b, n, nbar);

            // 14. V = S' B + E''
            short[] V = MatrixAdd(MatrixMul(Sprime, mbar, n, B, n, nbar), Eprimeprime, mbar, nbar);

            // 15. C' = V + Frodo.Encode(muprime)
            short[] Cprime = MatrixAdd(V, Encode(muprime), mbar, nbar);

            // 16. (in constant time) kbar = kprime if (B' || C == B'' || C') else kbar = s
            // Needs to avoid branching on secret data as per:
            // Qian Guo, Thomas Johansson, Alexander Nilsson. A key-recovery timing attack on post-quantum
            // primitives using the Fujisaki-Okamoto transformation and its application on FrodoKEM. In CRYPTO 2020.
            //TODO change it so Bprime and C are in the same array same with B'' and C'
            short use_kprime = CTVerify(Bprime, C, Bprimeprime, Cprime);
            byte[] kbar = CTSelect(kprime, s, use_kprime);

            // 17. ss = SHAKE(c1 || c2 || kbar, len_ss) (length in bits)
            digest.BlockUpdate(c1, 0, c1.Length);
            digest.BlockUpdate(c2, 0, c2.Length);
            digest.BlockUpdate(kbar, 0, kbar.Length);
            ((IXof) digest).DoFinal(ss, 0, len_ss_bytes);
        }

    }
}