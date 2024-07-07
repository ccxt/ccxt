namespace Cryptography.ECDSA.Internal.Sha256
{
    internal class Rfc6979HmacSha256T
    {
        public byte[] V;
        public byte[] K;
        public bool Retry;

        public Rfc6979HmacSha256T()
        {
            V = new byte[32];
            K = new byte[32];
            Retry = false;
        }
    }
}