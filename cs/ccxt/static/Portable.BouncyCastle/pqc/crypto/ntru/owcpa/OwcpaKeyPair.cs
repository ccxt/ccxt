namespace Org.BouncyCastle.Pqc.Crypto.Ntru.Owcpa
{
    internal class OwcpaKeyPair
    {
        internal readonly byte[] PublicKey;
        internal readonly byte[] PrivateKey;

        internal OwcpaKeyPair(byte[] publicKey, byte[] privateKey)
        {
            PublicKey = publicKey;
            PrivateKey = privateKey;
        }
    }
}