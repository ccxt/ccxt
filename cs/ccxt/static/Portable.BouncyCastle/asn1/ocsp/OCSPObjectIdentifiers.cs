using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public abstract class OcspObjectIdentifiers
    {
        internal const string PkixOcspId = "1.3.6.1.5.5.7.48.1";

		public static readonly DerObjectIdentifier PkixOcsp = new DerObjectIdentifier(PkixOcspId);
        public static readonly DerObjectIdentifier PkixOcspBasic = new DerObjectIdentifier(PkixOcspId + ".1");

		//
		// extensions
		//
		public static readonly DerObjectIdentifier PkixOcspNonce = new DerObjectIdentifier(PkixOcsp + ".2");
		public static readonly DerObjectIdentifier PkixOcspCrl = new DerObjectIdentifier(PkixOcsp + ".3");

		public static readonly DerObjectIdentifier PkixOcspResponse = new DerObjectIdentifier(PkixOcsp + ".4");
		public static readonly DerObjectIdentifier PkixOcspNocheck = new DerObjectIdentifier(PkixOcsp + ".5");
		public static readonly DerObjectIdentifier PkixOcspArchiveCutoff = new DerObjectIdentifier(PkixOcsp + ".6");
		public static readonly DerObjectIdentifier PkixOcspServiceLocator = new DerObjectIdentifier(PkixOcsp + ".7");
	}
}
