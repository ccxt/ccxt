namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The KeyUsage object.
     * <pre>
     *    id-ce-keyUsage OBJECT IDENTIFIER ::=  { id-ce 15 }
     *
     *    KeyUsage ::= BIT STRING {
     *         digitalSignature        (0),
     *         nonRepudiation          (1),
     *         keyEncipherment         (2),
     *         dataEncipherment        (3),
     *         keyAgreement            (4),
     *         keyCertSign             (5),
     *         cRLSign                 (6),
     *         encipherOnly            (7),
     *         decipherOnly            (8) }
     * </pre>
     */
    public class KeyUsage
        : DerBitString
    {
        public const int DigitalSignature = (1 << 7);
        public const int NonRepudiation   = (1 << 6);
        public const int KeyEncipherment  = (1 << 5);
        public const int DataEncipherment = (1 << 4);
        public const int KeyAgreement     = (1 << 3);
        public const int KeyCertSign      = (1 << 2);
        public const int CrlSign          = (1 << 1);
        public const int EncipherOnly     = (1 << 0);
        public const int DecipherOnly     = (1 << 15);

		public static new KeyUsage GetInstance(object obj)
		{
			if (obj is KeyUsage)
				return (KeyUsage)obj;
            if (obj is X509Extension)
				return GetInstance(X509Extension.ConvertValueToObject((X509Extension)obj));
            if (obj == null)
                return null;
			return new KeyUsage(DerBitString.GetInstance(obj));
		}

        public static KeyUsage FromExtensions(X509Extensions extensions)
        {
            return GetInstance(X509Extensions.GetExtensionParsedValue(extensions, X509Extensions.KeyUsage));
        }

        /**
         * Basic constructor.
         *
         * @param usage - the bitwise OR of the Key Usage flags giving the
         * allowed uses for the key.
         * e.g. (KeyUsage.keyEncipherment | KeyUsage.dataEncipherment)
         */
        public KeyUsage(int usage)
			: base(usage)
        {
        }

		private KeyUsage(
			DerBitString usage)
			: base(usage.GetBytes(), usage.PadBits)
        {
        }

		public override string ToString()
        {
			byte[] data = GetBytes();
            if (data.Length == 1)
            {
				return "KeyUsage: 0x" + (data[0] & 0xff).ToString("X");
            }

			return "KeyUsage: 0x" + ((data[1] & 0xff) << 8 | (data[0] & 0xff)).ToString("X");
        }
    }
}
