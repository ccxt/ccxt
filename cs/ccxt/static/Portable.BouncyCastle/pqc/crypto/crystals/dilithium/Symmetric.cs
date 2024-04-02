using Org.BouncyCastle.Crypto.Digests;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    static class Symmetric
    {
        public const int Shake128Rate = 168;
        public const int Shake256Rate = 136;
        public const int Sha3Rate256 = 136;
        public const int Sha3Rate512 = 72;

        public static void ShakeStreamInit(ShakeDigest Digest, byte[] seed, ushort nonce)
        {
            byte[] temp = new byte[2];
            temp[0] = (byte)nonce;
            temp[1] = (byte)(nonce >> 8);
            Digest.BlockUpdate(seed, 0, seed.Length);
            Digest.BlockUpdate(temp, 0, temp.Length);
        }
    }
}
