namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * CertPolicyId, used in the CertificatePolicies and PolicyMappings
     * X509V3 Extensions.
     *
     * <pre>
     *     CertPolicyId ::= OBJECT IDENTIFIER
     * </pre>
     */
     public class CertPolicyID
		 : DerObjectIdentifier
    {
       public CertPolicyID(
		   string id)
		   : base(id)
       {
       }
    }
}
