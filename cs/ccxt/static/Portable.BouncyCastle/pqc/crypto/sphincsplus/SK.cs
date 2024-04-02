namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    class SK
    {
        internal byte[] seed;
        internal byte[] prf;

        internal SK(byte[] seed, byte[] prf)
        {
            this.seed = seed;
            this.prf = prf;
        }
    }
}