namespace Org.BouncyCastle.Asn1.IsisMtt
{
	public abstract class IsisMttObjectIdentifiers
	{
		public static readonly DerObjectIdentifier IdIsisMtt = new DerObjectIdentifier("1.3.36.8");

		public static readonly DerObjectIdentifier IdIsisMttCP = new DerObjectIdentifier(IdIsisMtt + ".1");

		/**
		 * The id-isismtt-cp-accredited OID indicates that the certificate is a
		 * qualified certificate according to Directive 1999/93/EC of the European
		 * Parliament and of the Council of 13 December 1999 on a Community
		 * Framework for Electronic Signatures, which additionally conforms the
		 * special requirements of the SigG and has been issued by an accredited CA.
		 */
		public static readonly DerObjectIdentifier IdIsisMttCPAccredited = new DerObjectIdentifier(IdIsisMttCP + ".1");

		public static readonly DerObjectIdentifier IdIsisMttAT = new DerObjectIdentifier(IdIsisMtt + ".3");

		/**
		 * Certificate extensionDate of certificate generation
		 * 
		 * <pre>
		 *		DateOfCertGenSyntax ::= GeneralizedTime
		 * </pre>
		 */
		public static readonly DerObjectIdentifier IdIsisMttATDateOfCertGen = new DerObjectIdentifier(IdIsisMttAT + ".1");

		/**
		 * Attribute to indicate that the certificate holder may sign in the name of
		 * a third person. May also be used as extension in a certificate.
		 */
		public static readonly DerObjectIdentifier IdIsisMttATProcuration = new DerObjectIdentifier(IdIsisMttAT + ".2");

		/**
		 * Attribute to indicate admissions to certain professions. May be used as
		 * attribute in attribute certificate or as extension in a certificate
		 */
		public static readonly DerObjectIdentifier IdIsisMttATAdmission = new DerObjectIdentifier(IdIsisMttAT + ".3");

		/**
		 * Monetary limit for transactions. The QcEuMonetaryLimit QC statement MUST
		 * be used in new certificates in place of the extension/attribute
		 * MonetaryLimit since January 1, 2004. For the sake of backward
		 * compatibility with certificates already in use, SigG conforming
		 * components MUST support MonetaryLimit (as well as QcEuLimitValue).
		 */
		public static readonly DerObjectIdentifier IdIsisMttATMonetaryLimit = new DerObjectIdentifier(IdIsisMttAT + ".4");

		/**
		 * A declaration of majority. May be used as attribute in attribute
		 * certificate or as extension in a certificate
		 */
		public static readonly DerObjectIdentifier IdIsisMttATDeclarationOfMajority = new DerObjectIdentifier(IdIsisMttAT + ".5");

		/**
		 * 
		 * Serial number of the smart card containing the corresponding private key
		 * 
		 * <pre>
		 *		ICCSNSyntax ::= OCTET STRING (SIZE(8..20))
		 * </pre>
		 */
		public static readonly DerObjectIdentifier IdIsisMttATIccsn = new DerObjectIdentifier(IdIsisMttAT + ".6");

		/**
		 * 
		 * Reference for a file of a smartcard that stores the public key of this
		 * certificate and that is used as �security anchor�.
		 * 
		 * <pre>
		 *		PKReferenceSyntax ::= OCTET STRING (SIZE(20))
		 * </pre>
		 */
		public static readonly DerObjectIdentifier IdIsisMttATPKReference = new DerObjectIdentifier(IdIsisMttAT + ".7");

		/**
		 * Some other restriction regarding the usage of this certificate. May be
		 * used as attribute in attribute certificate or as extension in a
		 * certificate.
		 * 
		 * <pre>
		 *		RestrictionSyntax ::= DirectoryString (SIZE(1..1024))
		 * </pre>
		 * 
		 * @see Org.BouncyCastle.Asn1.IsisMtt.X509.Restriction
		 */
		public static readonly DerObjectIdentifier IdIsisMttATRestriction = new DerObjectIdentifier(IdIsisMttAT + ".8");

		/**
		 * 
		 * (Single)Request extension: Clients may include this extension in a
		 * (single) Request to request the responder to send the certificate in the
		 * response message along with the status information. Besides the LDAP
		 * service, this extension provides another mechanism for the distribution
		 * of certificates, which MAY optionally be provided by certificate
		 * repositories.
		 * 
		 * <pre>
		 *		RetrieveIfAllowed ::= BOOLEAN
		 * </pre>
		 */
		public static readonly DerObjectIdentifier IdIsisMttATRetrieveIfAllowed = new DerObjectIdentifier(IdIsisMttAT + ".9");

		/**
		 * SingleOCSPResponse extension: The certificate requested by the client by
		 * inserting the RetrieveIfAllowed extension in the request, will be
		 * returned in this extension.
		 * 
		 * @see Org.BouncyCastle.Asn1.IsisMtt.Ocsp.RequestedCertificate
		 */
		public static readonly DerObjectIdentifier IdIsisMttATRequestedCertificate = new DerObjectIdentifier(IdIsisMttAT + ".10");

		/**
		 * Base ObjectIdentifier for naming authorities
		 */
		public static readonly DerObjectIdentifier IdIsisMttATNamingAuthorities = new DerObjectIdentifier(IdIsisMttAT + ".11");

		/**
		 * SingleOCSPResponse extension: Date, when certificate has been published
		 * in the directory and status information has become available. Currently,
		 * accrediting authorities enforce that SigG-conforming OCSP servers include
		 * this extension in the responses.
		 * 
		 * <pre>
		 *		CertInDirSince ::= GeneralizedTime
		 * </pre>
		 */
		public static readonly DerObjectIdentifier IdIsisMttATCertInDirSince = new DerObjectIdentifier(IdIsisMttAT + ".12");

		/**
		 * Hash of a certificate in OCSP.
		 *
		 * @see Org.BouncyCastle.Asn1.IsisMtt.Ocsp.CertHash
		 */
		public static readonly DerObjectIdentifier IdIsisMttATCertHash = new DerObjectIdentifier(IdIsisMttAT + ".13");

		/**
		 * <pre>
		 *		NameAtBirth ::= DirectoryString(SIZE(1..64)
		 * </pre>
		 * 
		 * Used in
		 * {@link Org.BouncyCastle.Asn1.X509.SubjectDirectoryAttributes SubjectDirectoryAttributes}
		 */
		public static readonly DerObjectIdentifier IdIsisMttATNameAtBirth = new DerObjectIdentifier(IdIsisMttAT + ".14");

		/**
		 * Some other information of non-restrictive nature regarding the usage of
		 * this certificate. May be used as attribute in atribute certificate or as
		 * extension in a certificate.
		 * 
		 * <pre>
		 *               AdditionalInformationSyntax ::= DirectoryString (SIZE(1..2048))
		 * </pre>
		 * 
		 * @see Org.BouncyCastle.Asn1.IsisMtt.X509.AdditionalInformationSyntax
		 */
		public static readonly DerObjectIdentifier IdIsisMttATAdditionalInformation = new DerObjectIdentifier(IdIsisMttAT + ".15");

		/**
		 * Indicates that an attribute certificate exists, which limits the
		 * usability of this public key certificate. Whenever verifying a signature
		 * with the help of this certificate, the content of the corresponding
		 * attribute certificate should be concerned. This extension MUST be
		 * included in a PKC, if a corresponding attribute certificate (having the
		 * PKC as base certificate) contains some attribute that restricts the
		 * usability of the PKC too. Attribute certificates with restricting content
		 * MUST always be included in the signed document.
		 * 
		 * <pre>
		 *		LiabilityLimitationFlagSyntax ::= BOOLEAN
		 * </pre>
		 */
		public static readonly DerObjectIdentifier IdIsisMttATLiabilityLimitationFlag = new DerObjectIdentifier("0.2.262.1.10.12.0");
	}
}
