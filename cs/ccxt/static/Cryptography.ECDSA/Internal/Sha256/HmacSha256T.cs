namespace Cryptography.ECDSA.Internal.Sha256
{
    internal class HmacSha256T
    {
        public Sha256T Inner;
        public Sha256T Outer;

        public HmacSha256T()
        {
            Inner = new Sha256T();
            Outer = new Sha256T();
        }
    }
}