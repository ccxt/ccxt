using Org.BouncyCastle.Crypto.Digests;
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    internal static class Symmetric
    {
        public static readonly int Shake128Rate = 168;
        public static void PRF(byte[] outbuf, int outlen, byte[] key, byte nonce)
        {
            uint i;
            byte[] ExtraKey = new byte[KyberEngine.SymBytes + 1];
            Array.Copy(key, ExtraKey, KyberEngine.SymBytes);
            ExtraKey[KyberEngine.SymBytes] = nonce;
            ShakeDigest Shake256 = new ShakeDigest(256);
            Shake256.BlockUpdate(ExtraKey, 0, KyberEngine.SymBytes + 1);
            Shake256.DoFinal(outbuf, 0, outlen);
        }

        public static ShakeDigest XOF(byte[] seed, byte a, byte b)
        {
            ShakeDigest OutDigest = new ShakeDigest(128);
            byte[] buf = new byte[seed.Length + 2];
            Array.Copy(seed, buf, seed.Length);
            buf[seed.Length] = a;
            buf[seed.Length + 1] = b;
            OutDigest.BlockUpdate(buf, 0, buf.Length);
            return OutDigest;
        }

    }
}
