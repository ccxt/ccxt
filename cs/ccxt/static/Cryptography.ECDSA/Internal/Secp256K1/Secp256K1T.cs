using System;
using Cryptography.ECDSA.Internal.Sha256;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    /* These rules specify the order of arguments in API calls:
     *
     * 1. Context pointers go first, followed by output arguments, combined
     *    output/input arguments, and finally input-only arguments.
     * 2. Array lengths always immediately the follow the argument whose length
     *    they describe, even if this violates rule 1.
     * 3. Within the OUT/OUTIN/IN groups, pointers to data that is typically generated
     *    later go first. This means: signatures, public nonces, private nonces,
     *    messages, public keys, secret keys, tweaks.
     * 4. Arguments that are not data pointers go last, from more complex to less
     *    complex: function pointers, algorithm names, messages, void pointers,
     *    counts, flags, booleans.
     * 5. Opaque data pointers follow the function pointer they are to be passed to.
     */
    internal class Secp256K1T
    {
        /// <summary>
        /// An implementation of RFC6979 (using HMAC-SHA256) as nonce generation function. 
        /// If a data pointer is passed, it is assumed to be a pointer to 32 bytes of extra entropy.
        /// </summary>
        public static NonceFunction NonceFunctionRfc6979;

        /// <summary>
        /// A default safe nonce generation function (currently equal to secp256k1_nonce_function_rfc6979).
        /// </summary>
        public static NonceFunction NonceFunctionDefault;

        static Secp256K1T()
        {
            NonceFunctionRfc6979 = nonce_function_rfc6979;
            NonceFunctionDefault = nonce_function_rfc6979;
        }

        public static bool nonce_function_rfc6979(byte[] nonce32, byte[] msg32, byte[] key32, byte[] algo16, byte[] data, uint counter)
        {
            var sizeofkeydata = 112;
            var keydata = new byte[sizeofkeydata];

            Rfc6979HmacSha256T rng = new Rfc6979HmacSha256T();
            uint i;
            // We feed a byte array to the PRNG as input, consisting of:
            // - the private key (32 bytes) and message (32 bytes), see RFC 6979 3.2d.
            // - optionally 32 extra bytes of data, see RFC 6979 3.6 Additional Data.
            // - optionally 16 extra bytes with the algorithm name.
            // Because the arguments have distinct fixed lengths it is not possible for
            //  different argument mixtures to emulate each other and result in the same
            //  nonces.
            UInt32 keylen = 0;
            Util.Memcpy(key32, 0, keydata, keylen, 32); //memcpy(keydata, key32, 32);
            keylen += 32;
            Util.Memcpy(msg32, 0, keydata, keylen, 32); //memcpy(keydata + 32, msg32, 32);
            keylen += 32;
            if (data != null)
            {
                Util.Memcpy(data, 0, keydata, 64, 32); //memcpy(keydata + 64, data, 32);
                keylen = 96;
            }
            if (algo16 != null)
            {
                Util.Memcpy(algo16, 0, keydata, keylen, 16); //memcpy(keydata + keylen, algo16, 16);
                keylen += 16;
            }
            Hash.Rfc6979HmacSha256Initialize(rng, keydata, keylen);
            Util.MemSet(keydata, 0, sizeofkeydata);//memset(keydata, 0, sizeof(keydata));
            for (i = 0; i <= counter; i++)
            {
                Hash.Rfc6979HmacSha256Generate(rng, nonce32, 32);
            }
            Hash.Rfc6979HmacSha256Finalize(rng);
            return true;
        }


        public static bool EcPubKeyCreate(Context ctx, PubKey pubkey, byte[] seckey)
        {
            GeJ pj = new GeJ();
            Ge p = new Ge();
            var sec = new Scalar();

            var overflow = Scalar.SetB32(sec, seckey);
            var ret = !overflow & !Scalar.IsZero(sec);
            if (ret)
            {
                EcMultGen.secp256k1_ecmult_gen(ctx.EcMultGenCtx, out pj, sec);
                Group.SetGeJ(p, pj);
                SavePubKey(pubkey, p);
            }
            Scalar.Clear(sec);
            return ret;
        }


        private static void SavePubKey(PubKey pubkey, Ge ge)
        {
            Field.NormalizeVar(ge.X);
            Field.NormalizeVar(ge.Y);
            Field.GetB32(pubkey.Data, ge.X);
            Field.GetB32(pubkey.Data, 32, ge.Y);
        }

        public static bool EcPubkeySerialize(byte[] output, ref int outputlen, PubKey pubkey, Options flags)
        {
            Ge q = new Ge();
            bool ret = false;

            var len = outputlen;
            outputlen = 0;

            if (LoadPubKey(q, pubkey))
            {
                ret = ECKey.PubkeySerialize(q, output, ref len, flags.HasFlag(Options.FlagsBitCompression));
                if (ret)
                {
                    outputlen = len;
                }
            }
            return ret;
        }

        private static bool LoadPubKey(Ge ge, PubKey pubkey)
        {
            var x = new Fe();
            Field.SetB32(x, pubkey.Data);
            var y = new Fe();
            Field.SetB32(y, pubkey.Data, 32);
            Group.SetXY(ge, x, y);
            return true;
        }
    }
}
