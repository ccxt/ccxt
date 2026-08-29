namespace Org.BouncyCastle.Asn1.X509
{
	/**
	 * PolicyQualifierId, used in the CertificatePolicies
	 * X509V3 extension.
	 *
	 * <pre>
	 *    id-qt          OBJECT IDENTIFIER ::=  { id-pkix 2 }
	 *    id-qt-cps      OBJECT IDENTIFIER ::=  { id-qt 1 }
	 *    id-qt-unotice  OBJECT IDENTIFIER ::=  { id-qt 2 }
	 *  PolicyQualifierId ::=
	 *       OBJECT IDENTIFIER ( id-qt-cps | id-qt-unotice )
	 * </pre>
	 */
	public sealed class PolicyQualifierID : DerObjectIdentifier
	{
		private const string IdQt = "1.3.6.1.5.5.7.2";

		private PolicyQualifierID(
			string id)
			: base(id)
		{
		}

		public static readonly PolicyQualifierID IdQtCps = new PolicyQualifierID(IdQt + ".1");
		public static readonly PolicyQualifierID IdQtUnotice = new PolicyQualifierID(IdQt + ".2");
	}
}
