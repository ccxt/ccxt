using System;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class FalconNIST
    {
        private FalconCodec codec;
        private FalconVrfy vrfy;
        private FalconCommon common;
        private SecureRandom random;
        private uint logn;
        private uint noncelen;
        private int CRYPTO_BYTES;
        private int CRYPTO_PUBLICKEYBYTES;
        private int CRYPTO_SECRETKEYBYTES;

        internal uint GetNonceLength() {
            return this.noncelen;
        }
        internal uint GetLogn() {
            return this.logn;
        }
        internal int GetCryptoBytes() {
            return this.CRYPTO_BYTES;
        }

        internal FalconNIST(SecureRandom random, uint logn, uint noncelen) {
            this.logn = logn;
            this.codec = new FalconCodec();
            this.common = new FalconCommon();
            this.vrfy = new FalconVrfy(this.common);
            this.random = random;
            this.noncelen = noncelen;
            int n = (int)1 << (int)logn;
            this.CRYPTO_PUBLICKEYBYTES = 1 + (14 * n / 8);
            if (logn == 10)
            {
                this.CRYPTO_SECRETKEYBYTES = 2305;
                this.CRYPTO_BYTES = 1330;
            }
            else if (logn == 9 || logn == 8)
            {
                this.CRYPTO_SECRETKEYBYTES = 1 + (6 * n * 2 / 8) + n;
                this.CRYPTO_BYTES = 690; // TODO find what the byte length is here when not at degree 9 or 10
            }
            else if (logn == 7 || logn == 6)
            {
                this.CRYPTO_SECRETKEYBYTES = 1 + (7 * n * 2 / 8) + n;
                this.CRYPTO_BYTES = 690;
            }
            else
            {
                this.CRYPTO_SECRETKEYBYTES = 1 + (n * 2) + n;
                this.CRYPTO_BYTES = 690;
            }
        }

        internal int crypto_sign_keypair(byte[] pksrc, int pk, byte[] sksrc, int sk)
        {
            int n = (int)1 << (int)this.logn;
            SHAKE256 rng = new SHAKE256();
            sbyte[] f = new sbyte[n],
                    g = new sbyte[n],
                    F = new sbyte[n];
            ushort[] h = new ushort[n];
            byte[] seed = new byte[48];
            int u, v;
            FalconKeygen keygen = new FalconKeygen(this.codec, this.vrfy);

            /*
            * Generate key pair.
            */
            this.random.NextBytes(seed);
            rng.i_shake256_init();
            rng.i_shake256_inject(seed, 0, seed.Length);
            rng.i_shake256_flip();
            keygen.keygen(rng, f, 0, g, 0, F, 0, null, 0, h, 0, this.logn);

            /*
            * Encode private key.
            */
            sksrc[sk+0] = (byte)(0x50 + this.logn);
            u = 1;
            v = this.codec.trim_i8_encode(sksrc, sk + u, CRYPTO_SECRETKEYBYTES - u,
                f, 0, this.logn, this.codec.max_fg_bits[this.logn]);
            if (v == 0) {
                // TODO check which exception types to use here
                throw new InvalidOperationException("f encode failed");
            }
            u += v;
            v = this.codec.trim_i8_encode(sksrc, sk + u, CRYPTO_SECRETKEYBYTES - u,
                g, 0, this.logn, this.codec.max_fg_bits[this.logn]);
            if (v == 0) {
                throw new InvalidOperationException("g encode failed");
            }
            u += v;
            v = this.codec.trim_i8_encode(sksrc, sk + u, CRYPTO_SECRETKEYBYTES - u,
                F, 0, this.logn, this.codec.max_FG_bits[this.logn]);
            if (v == 0) {
                 throw new InvalidOperationException("F encode failed");
            }
            u += v;
            if (u != CRYPTO_SECRETKEYBYTES) {
                 throw new InvalidOperationException("secret key encoding failed");
            }

            /*
            * Encode public key.
            */
            pksrc[pk+0] = (byte)(0x00 + this.logn);
            v = this.codec.modq_encode(pksrc, pk + 1, CRYPTO_PUBLICKEYBYTES - 1, h, 0, this.logn);
            if (v != CRYPTO_PUBLICKEYBYTES - 1) {
                 throw new InvalidOperationException("public key encoding failed");
            }

            return 0;
        }

        internal byte[] crypto_sign(byte[] sm,
            byte[] msrc, int m, uint mlen,
            byte[] sksrc, int sk)
        {
            // TEMPALLOC union {
            //     uint8_t b[72 * 1024];
            //     uint64_t dummy_u64;
            //     fpr dummy_fpr;
            // } tmp;
            int u, v, sig_len;
            int n = (int)1 << (int)this.logn;
            sbyte[] f = new sbyte[n],
                    g = new sbyte[n],
                    F = new sbyte[n],
                    G = new sbyte[n];
            short[] sig = new short[n];
            ushort[] hm = new ushort[n];
            byte[] seed = new byte[48],
                    nonce = new byte[this.noncelen];
            byte[] esig = new byte[this.CRYPTO_BYTES - 2 - this.noncelen];
            SHAKE256 sc = new SHAKE256();
            FalconSign signer = new FalconSign(this.common);

            /*
            * Decode the private key.
            */
            if (sksrc[sk+0] != 0x50 + this.logn) {
                throw new ArgumentException("private key header incorrect");
            }
            u = 1;
            v = this.codec.trim_i8_decode(f, 0, this.logn, this.codec.max_fg_bits[this.logn],
                sksrc, sk + u, CRYPTO_SECRETKEYBYTES - u);
            if (v == 0) {
                throw new InvalidOperationException("f decode failed");
            }
            u += v;
            v = this.codec.trim_i8_decode(g, 0, this.logn, this.codec.max_fg_bits[this.logn],
                sksrc, sk + u, CRYPTO_SECRETKEYBYTES - u);
            if (v == 0) {
                throw new InvalidOperationException("g decode failed");
            }
            u += v;
            v = this.codec.trim_i8_decode(F, 0, this.logn, this.codec.max_FG_bits[this.logn],
                sksrc, sk + u, CRYPTO_SECRETKEYBYTES - u);
            if (v == 0) {
                throw new InvalidOperationException("F decode failed");
            }
            u += v;
            if (u != CRYPTO_SECRETKEYBYTES) {
                throw new InvalidOperationException("full Key not used");
            }
            if (this.vrfy.complete_private(G, 0, f, 0, g, 0, F, 0, this.logn, new ushort[2 * n],0) == 0) {
                throw new InvalidOperationException("complete private failed");
            }

            /*
            * Create a random nonce (40 bytes).
            */
            this.random.NextBytes(nonce);

            /*
            * Hash message nonce + message into a vector.
            */
            sc.i_shake256_init();
            sc.i_shake256_inject(nonce,0,nonce.Length);
            sc.i_shake256_inject(msrc,m, (int)mlen);
            sc.i_shake256_flip();
            this.common.hash_to_point_vartime(sc, hm, 0, this.logn);

            /*
            * Initialize a RNG.
            */
            this.random.NextBytes(seed);
            sc.i_shake256_init();
            sc.i_shake256_inject(seed, 0, seed.Length);
            sc.i_shake256_flip();

            /*
            * Compute the signature.
            */
            signer.sign_dyn(sig, 0, sc, f, 0, g, 0, F, 0, G, 0, hm, 0, this.logn, new FalconFPR[10 * n], 0);

            /*
             * Encode the signature. Format is:
             *   signature header     1 bytes
             *   nonce                40 bytes
             *   signature            slen bytes
             */
            esig[0] = (byte)(0x20 + logn);
            sig_len = codec.comp_encode(esig, 1, esig.Length - 1, sig, 0, logn);
            if (sig_len == 0)
            {
                throw new InvalidOperationException("signature failed to generate");
            }
            sig_len++;

            // header
            sm[0] = (byte)(0x30 + logn);
            // nonce
            Array.Copy(nonce, 0, sm, 1, noncelen);

            // signature
            Array.Copy(esig, 0, sm, 1 + noncelen, sig_len);

            return Arrays.CopyOfRange(sm, 0, 1 + (int)noncelen + sig_len);
        }

        internal int crypto_sign_open(byte[] sig_encoded, byte[] nonce, byte[] m,
            byte[] pksrc, int pk)
        {
            int sig_len, msg_len;
            int n = (int)1 << (int)this.logn;
            ushort[] h = new ushort[n],
                    hm = new ushort[n];
            short[] sig = new short[n];
            SHAKE256 sc = new SHAKE256();

            /*
            * Decode public key.
            */
            if (pksrc[pk+0] != 0x00 + this.logn) {
                return -1;
            }
            if (this.codec.modq_decode(h, 0, this.logn, pksrc, pk + 1, CRYPTO_PUBLICKEYBYTES - 1)
                != CRYPTO_PUBLICKEYBYTES - 1)
            {
                return -1;
            }
            this.vrfy.to_ntt_monty(h, 0, this.logn);

            /*
            * Find nonce, signature, message length.
            */
            // if (smlen < 2 + this.noncelen) {
            //     return -1;
            // }
            // sig_len = ((int)sm[0] << 8) | (int)sm[1];
            sig_len = sig_encoded.Length;
            // if (sig_len > (smlen - 2 - this.noncelen)) {
            //     return -1;
            // }
            // msg_len = smlen - 2 - this.noncelen - sig_len;
            msg_len = m.Length;

            /*
            * Decode signature.
            */
            // esig = sm + 2 + this.noncelen + msg_len;
            if (sig_len < 1 || sig_encoded[0] != (byte)(0x20 + this.logn)) {
                return -1;
            }
            if (this.codec.comp_decode(sig, 0, this.logn, sig_encoded,
                1, sig_len - 1) != sig_len - 1)
            {
                return -1;
            }

            /*
            * Hash nonce + message into a vector.
            */
            sc.i_shake256_init();
            // sc.i_shake256_inject(sm + 2, this.noncelen + msg_len);
            sc.i_shake256_inject(nonce, 0, (int)this.noncelen);
            sc.i_shake256_inject(m, 0, m.Length);
            sc.i_shake256_flip();
            this.common.hash_to_point_vartime(sc, hm, 0, this.logn);

            /*
            * Verify signature.
            */
            if (!this.vrfy.verify_raw(hm, 0, sig, 0, h, 0, this.logn, new ushort[n], 0)) {
                return -1;
            }

            /*
            * Return plaintext. - not in use
            */
            // Array.Copy(sm + 2 + this.noncelen, m, msg_len);
            // *mlen = msg_len;
            return 0;
        }
    }
}
