
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    internal class SABEREngine
    {
        // constant parameters
        public static int SABER_EQ = 13;
        public static int SABER_EP = 10;
        public static int SABER_N = 256;

        private static int SABER_SEEDBYTES = 32;
        private static int SABER_NOISE_SEEDBYTES = 32;
        private static int SABER_KEYBYTES = 32;
        private static int SABER_HASHBYTES = 32;


        // parameters for SABER{n}
        private int SABER_L;
        private int SABER_MU;
        private int SABER_ET;

        private int SABER_POLYCOINBYTES;
        private int SABER_POLYBYTES;
        private int SABER_POLYVECBYTES;
        private int SABER_POLYCOMPRESSEDBYTES;
        private int SABER_POLYVECCOMPRESSEDBYTES;
        private int SABER_SCALEBYTES_KEM;
        private int SABER_INDCPA_PUBLICKEYBYTES;
        private int SABER_INDCPA_SECRETKEYBYTES;
        private int SABER_PUBLICKEYBYTES;
        private int SABER_SECRETKEYBYTES;
        private int SABER_BYTES_CCA_DEC;
        private int defaultKeySize;

        //
        private int h1;
        private int h2;

        private Utils utils;
        private Poly poly;

        public int getSABER_N()
        {
            return SABER_N;
        }

        public int getSABER_EP()
        {
            return SABER_EP;
        }

        public int getSABER_KEYBYTES()
        {
            return SABER_KEYBYTES;
        }

        public int getSABER_L()
        {
            return SABER_L;
        }

        public int getSABER_ET()
        {
            return SABER_ET;
        }

        public int getSABER_POLYBYTES()
        {
            return SABER_POLYBYTES;
        }

        public int getSABER_POLYVECBYTES()
        {
            return SABER_POLYVECBYTES;
        }

        public int getSABER_SEEDBYTES()
        {
            return SABER_SEEDBYTES;
        }

        public int getSABER_POLYCOINBYTES()
        {
            return SABER_POLYCOINBYTES;
        }

        public int getSABER_NOISE_SEEDBYTES()
        {
            return SABER_NOISE_SEEDBYTES;
        }

        public int getSABER_MU()
        {
            return SABER_MU;
        }

        public Utils GetUtils()
        {
            return utils;
        }

        public int GetSessionKeySize()
        {
//        return SABER_KEYBYTES;
            return defaultKeySize / 8;
        }

        public int GetCipherTextSize()
        {
            return SABER_BYTES_CCA_DEC;
        }

        public int GetPublicKeySize()
        {
            return SABER_PUBLICKEYBYTES;
        }

        public int GetPrivateKeySize()
        {
            return SABER_SECRETKEYBYTES;
        }

        public SABEREngine(int l, int defaultKeySize)
        {
            this.defaultKeySize = defaultKeySize;

            this.SABER_L = l;
            if (l == 2)
            {
                this.SABER_MU = 10;
                this.SABER_ET = 3;
            }
            else if (l == 3)
            {
                this.SABER_MU = 8;
                this.SABER_ET = 4;
            }
            else // l == 4
            {
                this.SABER_MU = 6;
                this.SABER_ET = 6;
            }

            this.SABER_POLYCOINBYTES = (SABER_MU * SABER_N / 8);
            this.SABER_POLYBYTES = (SABER_EQ * SABER_N / 8);
            this.SABER_POLYVECBYTES = (SABER_L * SABER_POLYBYTES);
            this.SABER_POLYCOMPRESSEDBYTES = (SABER_EP * SABER_N / 8);
            this.SABER_POLYVECCOMPRESSEDBYTES = (SABER_L * SABER_POLYCOMPRESSEDBYTES);
            this.SABER_SCALEBYTES_KEM = (SABER_ET * SABER_N / 8);
            this.SABER_INDCPA_PUBLICKEYBYTES = (SABER_POLYVECCOMPRESSEDBYTES + SABER_SEEDBYTES);
            this.SABER_INDCPA_SECRETKEYBYTES = (SABER_POLYVECBYTES);
            this.SABER_PUBLICKEYBYTES = (SABER_INDCPA_PUBLICKEYBYTES);
            this.SABER_SECRETKEYBYTES = (SABER_INDCPA_SECRETKEYBYTES + SABER_INDCPA_PUBLICKEYBYTES + SABER_HASHBYTES +
                                         SABER_KEYBYTES);
            this.SABER_BYTES_CCA_DEC = (SABER_POLYVECCOMPRESSEDBYTES + SABER_SCALEBYTES_KEM);

            this.h1 = (1 << (SABER_EQ - SABER_EP - 1));
            this.h2 = ((1 << (SABER_EP - 2)) - (1 << (SABER_EP - SABER_ET - 1)) + (1 << (SABER_EQ - SABER_EP - 1)));
            utils = new Utils(this);
            poly = new Poly(this);
        }

        private void indcpa_kem_keypair(byte[] pk, byte[] sk, SecureRandom random)
        {
            int i, j;
            short[][][] A = new short[SABER_L][ /*SABER_L*/][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[][] temp2d = new short[SABER_L][];
                for (j = 0; j < SABER_L; j++)
                {
                    short[] temp = new short[SABER_N];
                    temp2d[j] = temp;
                }

                A[i] = temp2d;
            }

            short[][] s = new short[SABER_L][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[] temp = new short[SABER_N];
                s[i] = temp;
            }

            short[][] b = new short[SABER_L][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[] temp = new short[SABER_N];
                b[i] = temp;
            }


            byte[] seed_A = new byte[SABER_SEEDBYTES];
            byte[] seed_s = new byte[SABER_NOISE_SEEDBYTES];

            random.NextBytes(seed_A);

            IXof digest = new ShakeDigest(128);
            digest.BlockUpdate(seed_A, 0, SABER_SEEDBYTES);
            digest.DoFinal(seed_A, 0, SABER_SEEDBYTES);

            random.NextBytes(seed_s);

            poly.GenMatrix(A, seed_A);

            poly.GenSecret(s, seed_s);

            poly.MatrixVectorMul(A, s, b, 1);

            for (i = 0; i < SABER_L; i++)
            {
                for (j = 0; j < SABER_N; j++)
                {
                    b[i][j] = (short) (((b[i][j] + h1) & 0xffff) >> (SABER_EQ - SABER_EP));
                }
            }

            utils.POLVECq2BS(sk, s);
            utils.POLVECp2BS(pk, b);
            Array.Copy(seed_A, 0, pk, SABER_POLYVECCOMPRESSEDBYTES, seed_A.Length);

        }

        public int crypto_kem_keypair(byte[] pk, byte[] sk, SecureRandom random)
        {
            int i;
            indcpa_kem_keypair(pk, sk, random); // sk[0:SABER_INDCPA_SECRETKEYBYTES-1] <-- sk
            for (i = 0; i < SABER_INDCPA_PUBLICKEYBYTES; i++)
                sk[i + SABER_INDCPA_SECRETKEYBYTES] =
                    pk[i]; // sk[SABER_INDCPA_SECRETKEYBYTES:SABER_INDCPA_SECRETKEYBYTES+SABER_INDCPA_SECRETKEYBYTES-1] <-- pk

            // Then hash(pk) is appended.
            Sha3Digest digest = new Sha3Digest(256);
            digest.BlockUpdate(pk, 0, SABER_INDCPA_PUBLICKEYBYTES);
            digest.DoFinal(sk, SABER_SECRETKEYBYTES - 64);

            // Remaining part of sk contains a pseudo-random number.
            byte[] nonce = new byte[SABER_KEYBYTES];
            random.NextBytes(nonce);
            Array.Copy(nonce, 0, sk, SABER_SECRETKEYBYTES - SABER_KEYBYTES, nonce.Length);

            // This is output when check in crypto_kem_Dec() fails.
            return 0;
        }


        private void indcpa_kem_enc(byte[] m, byte[] seed_sp, byte[] pk, byte[] ciphertext)
        {
            int i, j;
            short[][][] A = new short[SABER_L][ /*SABER_L*/][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[][] temp2d = new short[SABER_L][];
                for (j = 0; j < SABER_L; j++)
                {
                    short[] temp = new short[SABER_N];
                    temp2d[j] = temp;
                }

                A[i] = temp2d;
            }

            short[][] sp = new short[SABER_L][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[] temp = new short[SABER_N];
                sp[i] = temp;
            }

            short[][] bp = new short[SABER_L][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[] temp = new short[SABER_N];
                bp[i] = temp;
            }

            short[][] b = new short[SABER_L][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[] temp = new short[SABER_N];
                b[i] = temp;
            }

            short[] mp = new short[SABER_N];
            ;
            short[] vp = new short[SABER_N];
            byte[] seed_A = Arrays.CopyOfRange(pk, SABER_POLYVECCOMPRESSEDBYTES, pk.Length);

            poly.GenMatrix(A, seed_A);
            poly.GenSecret(sp, seed_sp);
            poly.MatrixVectorMul(A, sp, bp, 0);

            for (i = 0; i < SABER_L; i++)
            {
                for (j = 0; j < SABER_N; j++)
                {
                    bp[i][j] = (short) (((bp[i][j] + h1) & 0xffff) >> (SABER_EQ - SABER_EP));
                }
            }

            utils.POLVECp2BS(ciphertext, bp);
            utils.BS2POLVECp(pk, b);
            poly.InnerProd(b, sp, vp);

            utils.BS2POLmsg(m, mp);

            for (j = 0; j < SABER_N; j++)
            {
                vp[j] = (short) (((vp[j] - (mp[j] << (SABER_EP - 1)) + h1) & 0xffff) >> (SABER_EP - SABER_ET));
            }

            utils.POLT2BS(ciphertext, SABER_POLYVECCOMPRESSEDBYTES, vp);
        }

        public int crypto_kem_enc(byte[] c, byte[] k, byte[] pk, SecureRandom random)
        {
            byte[] kr = new byte[64]; // Will contain key, coins
            byte[] buf = new byte[64];

            byte[] nonce = new byte[32];
            random.NextBytes(nonce);

            Sha3Digest digest_256 = new Sha3Digest(256);
            Sha3Digest digest_512 = new Sha3Digest(512);

            // BUF[0:31] <-- random message (will be used as the key for client) Note: hash doesnot release system RNG output
            digest_256.BlockUpdate(nonce, 0, 32);
            digest_256.DoFinal(nonce, 0);
            Array.Copy(nonce, 0, buf, 0, 32);

            // BUF[32:63] <-- Hash(public key);  Multitarget countermeasure for coins + contributory KEM
            digest_256.BlockUpdate(pk, 0, SABER_INDCPA_PUBLICKEYBYTES);
            digest_256.DoFinal(buf, 32);

            // kr[0:63] <-- Hash(buf[0:63]);
            digest_512.BlockUpdate(buf, 0, 64);
            digest_512.DoFinal(kr, 0);

            // K^ <-- kr[0:31]
            // noiseseed (r) <-- kr[32:63];
            // buf[0:31] contains message; kr[32:63] contains randomness r;
            indcpa_kem_enc(buf, Arrays.CopyOfRange(kr, 32, kr.Length), pk, c);

            digest_256.BlockUpdate(c, 0, SABER_BYTES_CCA_DEC);
            digest_256.DoFinal(kr, 32);

            // hash concatenation of pre-k and h(c) to k
            //todo support 128 and 192 bit keys
            byte[] temp_k = new byte[32];
            digest_256.BlockUpdate(kr, 0, 64);
            digest_256.DoFinal(temp_k, 0);

            Array.Copy(temp_k, 0, k, 0, defaultKeySize / 8);

            return 0;
        }

        private void indcpa_kem_dec(byte[] sk, byte[] ciphertext, byte[] m)
        {
            int i;
            short[][] s = new short[SABER_L][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[] temp = new short[SABER_N];
                s[i] = temp;
            }

            short[][] b = new short[SABER_L][ /*SABER_N*/];
            for (i = 0; i < SABER_L; i++)
            {
                short[] temp = new short[SABER_N];
                b[i] = temp;
            }

            short[] v = new short[SABER_N];
            short[] cm = new short[SABER_N];

            utils.BS2POLVECq(sk, 0, s);
            utils.BS2POLVECp(ciphertext, b);
            poly.InnerProd(b, s, v);
            utils.BS2POLT(ciphertext, SABER_POLYVECCOMPRESSEDBYTES, cm);

            for (i = 0; i < SABER_N; i++)
            {
                v[i] = (short) (((v[i] + h2 - (cm[i] << (SABER_EP - SABER_ET))) & 0xffff) >> (SABER_EP - 1));
            }

            utils.POLmsg2BS(m, v);
        }

        public int crypto_kem_dec(byte[] k, byte[] c, byte[] sk)
        {
            int i, fail;
            byte[] cmp = new byte[SABER_BYTES_CCA_DEC];
            byte[] buf = new byte[64];
            byte[] kr = new byte[64]; // Will contain key, coins
            byte[] pk = Arrays.CopyOfRange(sk, SABER_INDCPA_SECRETKEYBYTES, sk.Length);

            indcpa_kem_dec(sk, c, buf); // buf[0:31] <-- message

            // Multitarget countermeasure for coins + contributory KEM
            for (i = 0; i < 32; i++) // Save hash by storing h(pk) in sk
                buf[32 + i] = sk[SABER_SECRETKEYBYTES - 64 + i];


            Sha3Digest digest_256 = new Sha3Digest(256);
            Sha3Digest digest_512 = new Sha3Digest(512);

            digest_512.BlockUpdate(buf, 0, 64);
            digest_512.DoFinal(kr, 0);

            indcpa_kem_enc(buf, Arrays.CopyOfRange(kr, 32, kr.Length), pk, cmp);

            fail = verify(c, cmp, SABER_BYTES_CCA_DEC);

            // overwrite coins in kr with h(c)

            digest_256.BlockUpdate(c, 0, SABER_BYTES_CCA_DEC);
            digest_256.DoFinal(kr, 32);

            cmov(kr, sk, SABER_SECRETKEYBYTES - SABER_KEYBYTES, SABER_KEYBYTES, (byte) fail);

            // hash concatenation of pre-k and h(c) to k
            //todo support 128 and 192 bit keys
            byte[] temp_k = new byte[32];
            digest_256.BlockUpdate(kr, 0, 64);
            digest_256.DoFinal(temp_k, 0);

            Array.Copy(temp_k, 0, k, 0, defaultKeySize / 8);
            return 0;

        }

        /* returns 0 for equal strings, 1 for non-equal strings */
        static int verify(byte[] a, byte[] b, int len)
        {
            int r = 0;
            for (int i = 0; i < len; i++)
            {
                r |= a[i] ^ b[i];
            }
            return (int)((uint)-r >> 31);
        }

        /* b = 1 means mov, b = 0 means don't mov*/
        static void cmov(byte[] r, byte[] x, int x_offset, int len, byte b)
        {
            int i;

            b = (byte) -b;
            for (i = 0; i < len; i++)
                r[i] ^= (byte) (b & (x[i + x_offset] ^ r[i]));
        }


    }
}