namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    class SIG_XMSS
    {
        internal byte[] sig;
        internal byte[][] auth;

        public SIG_XMSS(byte[] sig, byte[][] auth)
        {
            this.sig = sig;
            this.auth = auth;
        }

        public byte[] GetWOTSSig()
        {
            return sig;
        }

        public byte[][] GetXMSSAUTH()
        {
            return auth;
        }
    }
}