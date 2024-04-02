namespace Org.BouncyCastle.Pqc.Crypto.Ntru
{
    public class NtruPrivateKeyParameters : NtruKeyParameters
    {
        private byte[] _privateKey;

        public byte[] PrivateKey
        {
            get => (byte[])_privateKey.Clone();
            private set => _privateKey = (byte[])value.Clone();
        }

        public NtruPrivateKeyParameters(NtruParameters parameters, byte[] key) : base(true, parameters)
        {
            PrivateKey = key;
        }


        public override byte[] GetEncoded()
        {
            return PrivateKey;
        }
    }
}