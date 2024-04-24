namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The KeyPurposeID object.
     * <pre>
     *     KeyPurposeID ::= OBJECT IDENTIFIER
     * </pre>
     */
    public sealed class KeyPurposeID
        : DerObjectIdentifier
    {
        private const string IdKP = "1.3.6.1.5.5.7.3";

		private KeyPurposeID(
			string id)
			: base(id)
        {
        }

		public static readonly KeyPurposeID AnyExtendedKeyUsage = new KeyPurposeID(X509Extensions.ExtendedKeyUsage.Id + ".0");
        public static readonly KeyPurposeID IdKPServerAuth = new KeyPurposeID(IdKP + ".1");
        public static readonly KeyPurposeID IdKPClientAuth = new KeyPurposeID(IdKP + ".2");
        public static readonly KeyPurposeID IdKPCodeSigning = new KeyPurposeID(IdKP + ".3");
        public static readonly KeyPurposeID IdKPEmailProtection = new KeyPurposeID(IdKP + ".4");
        public static readonly KeyPurposeID IdKPIpsecEndSystem = new KeyPurposeID(IdKP + ".5");
        public static readonly KeyPurposeID IdKPIpsecTunnel = new KeyPurposeID(IdKP + ".6");
        public static readonly KeyPurposeID IdKPIpsecUser = new KeyPurposeID(IdKP + ".7");
        public static readonly KeyPurposeID IdKPTimeStamping = new KeyPurposeID(IdKP + ".8");
        public static readonly KeyPurposeID IdKPOcspSigning = new KeyPurposeID(IdKP + ".9");

		//
        // microsoft key purpose ids
        //
        public static readonly KeyPurposeID IdKPSmartCardLogon = new KeyPurposeID("1.3.6.1.4.1.311.20.2.2");

        public static readonly KeyPurposeID IdKPMacAddress = new KeyPurposeID("1.3.6.1.1.1.1.22");
    }
}
