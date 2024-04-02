
using System;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    class WotsPlus
    {
        private SPHINCSPlusEngine engine;
        private uint w;

        internal WotsPlus(SPHINCSPlusEngine engine)
        {
            this.engine = engine;
            this.w = this.engine.WOTS_W;
        }

        internal byte[] PKGen(byte[] skSeed, byte[] pkSeed, Adrs paramAdrs)
        {
            Adrs wotspkAdrs = new Adrs(paramAdrs); // copy address to create OTS public key address

            byte[][] tmp = new byte[engine.WOTS_LEN][];
            for (uint i = 0; i < engine.WOTS_LEN; i++)
            {
                Adrs adrs = new Adrs(paramAdrs);
                adrs.SetType(Adrs.WOTS_PRF);
                adrs.SetKeyPairAddress(paramAdrs.GetKeyPairAddress());
                adrs.SetChainAddress(i);
                adrs.SetHashAddress(0);
                
                byte[] sk = engine.PRF(pkSeed, skSeed, adrs);
                adrs.SetType(Adrs.WOTS_HASH);
                adrs.SetKeyPairAddress(paramAdrs.GetKeyPairAddress());
                adrs.SetChainAddress(i);
                adrs.SetHashAddress(0);

                tmp[i] = Chain(sk, 0, w - 1, pkSeed, adrs);
            }

            wotspkAdrs.SetType(Adrs.WOTS_PK);
            wotspkAdrs.SetKeyPairAddress(paramAdrs.GetKeyPairAddress());

            return engine.T_l(pkSeed, wotspkAdrs, Arrays.ConcatenateAll(tmp));
        }

        //    #Input: Input string X, start index i, number of steps s, public seed PK.seed,
        //    address Adrs
        //    #Output: value of F iterated s times on X
        byte[] Chain(byte[] X, uint i, uint s, byte[] pkSeed, Adrs adrs)
        {
            if (s == 0)
            {
                return Arrays.Clone(X);
            }

            if ((i + s) > (this.w - 1))
            {
                return null;
            }

            byte[] tmp = Chain(X, i, s - 1, pkSeed, adrs);
            adrs.SetHashAddress(i + s - 1);
            tmp = engine.F(pkSeed, adrs, tmp);

            return tmp;
        }

        //
        // #Input: Message M, secret seed SK.seed, public seed PK.seed, address Adrs
        // #Output: WOTS+ signature sig
        public byte[] Sign(byte[] M, byte[] skSeed, byte[] pkSeed, Adrs paramAdrs)
        {
            Adrs adrs = new Adrs(paramAdrs);

            uint csum = 0;
            // convert message to base w
            uint[] msg = BaseW(M, w, engine.WOTS_LEN1);
            // compute checksum
            for (int i = 0; i < engine.WOTS_LEN1; i++)
            {
                csum += w - 1 - msg[i];
            }

            // convert csum to base w
            if ((engine.WOTS_LOGW % 8) != 0)
            {
                csum = csum << (8 - ((engine.WOTS_LEN2 * engine.WOTS_LOGW) % 8));
            }

            int len_2_bytes = (engine.WOTS_LEN2 * engine.WOTS_LOGW + 7) / 8;
            byte[] bytes = Pack.UInt32_To_BE(csum);
            msg = Arrays.Concatenate(msg,
                BaseW(Arrays.CopyOfRange(bytes, len_2_bytes, bytes.Length), w, engine.WOTS_LEN2));
            byte[][] sig = new byte[engine.WOTS_LEN][];
            for (uint i = 0; i < engine.WOTS_LEN; i++)
            {
                adrs.SetType(Adrs.WOTS_PRF);
                adrs.SetKeyPairAddress(paramAdrs.GetKeyPairAddress());
                adrs.SetChainAddress(i);
                adrs.SetHashAddress(0);
                byte[] sk = engine.PRF(pkSeed, skSeed, adrs);
                adrs.SetType(Adrs.WOTS_HASH);
                adrs.SetKeyPairAddress(paramAdrs.GetKeyPairAddress());
                adrs.SetChainAddress(i);
                adrs.SetHashAddress(0);

                sig[i] = Chain(sk, 0, msg[i], pkSeed, adrs);
            }

            return Arrays.ConcatenateAll(sig);
        }

        //
        // Input: len_X-byte string X, int w, output length out_len
        // Output: out_len int array basew
        uint[] BaseW(byte[] X, uint w, int out_len)
        {
            int input = 0;
            int outputIndex = 0;
            int total = 0;
            int bits = 0;
            uint[] output = new uint[out_len];

            for (int consumed = 0; consumed < out_len; consumed++)
            {
                if (bits == 0)
                {
                    total = X[input];
                    input++;
                    bits += 8;
                }

                bits -= engine.WOTS_LOGW;
                output[outputIndex] = (uint) ((total >> bits) & (w - 1));
                outputIndex++;
            }

            return output;
        }

        public byte[] PKFromSig(byte[] sig, byte[] M, byte[] pkSeed, Adrs adrs)
        {
            uint csum = 0;
            Adrs wotspkAdrs = new Adrs(adrs);
            // convert message to base w
            uint[] msg = BaseW(M, w, engine.WOTS_LEN1);
            // compute checksum
            for (int i = 0; i < engine.WOTS_LEN1; i++)
            {
                csum += (uint) (w - 1 - msg[i]);
            }

            // convert csum to base w
            csum = csum << (8 - ((engine.WOTS_LEN2 * engine.WOTS_LOGW) % 8));
            int len_2_bytes = (engine.WOTS_LEN2 * engine.WOTS_LOGW + 7) / 8;

            msg = Arrays.Concatenate(msg,
                BaseW(Arrays.CopyOfRange(Pack.UInt32_To_BE(csum), 4 - len_2_bytes, 4), w, engine.WOTS_LEN2));

            byte[] sigI = new byte[engine.N];
            byte[][] tmp = new byte[engine.WOTS_LEN][];
            for (uint i = 0; i < engine.WOTS_LEN; i++)
            {
                adrs.SetChainAddress(i);
                Array.Copy(sig, i * engine.N, sigI, 0, engine.N);
                tmp[i] = Chain(sigI, msg[i], w - 1 - msg[i], pkSeed, adrs);
            } // f6be78d057cc8056907ad2bf83cc8be7

            wotspkAdrs.SetType(Adrs.WOTS_PK);
            wotspkAdrs.SetKeyPairAddress(adrs.GetKeyPairAddress());

            return engine.T_l(pkSeed, wotspkAdrs, Arrays.ConcatenateAll(tmp));
        }
    }
}