using System;
using System.IO;
using System.Text;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Pkix
{
	/// <summary>
	/// A trust anchor or most-trusted Certification Authority (CA).
	/// 
	/// This class represents a "most-trusted CA", which is used as a trust anchor
	/// for validating X.509 certification paths. A most-trusted CA includes the
	/// public key of the CA, the CA's name, and any constraints upon the set of
	/// paths which may be validated using this key. These parameters can be
	/// specified in the form of a trusted X509Certificate or as individual
	/// parameters.
	/// </summary>
	public class TrustAnchor
	{
		private readonly AsymmetricKeyParameter pubKey;
		private readonly string caName;
		private readonly X509Name caPrincipal;
		private readonly X509Certificate trustedCert;
		private byte[] ncBytes;
		private NameConstraints nc;

		/// <summary>
		/// Creates an instance of TrustAnchor with the specified X509Certificate and
	    /// optional name constraints, which are intended to be used as additional
	    /// constraints when validating an X.509 certification path.
	    ///	The name constraints are specified as a byte array. This byte array
	    ///	should contain the DER encoded form of the name constraints, as they
	    ///	would appear in the NameConstraints structure defined in RFC 2459 and
	    ///	X.509. The ASN.1 definition of this structure appears below.
	    ///	
	    ///	<pre>
	    ///	NameConstraints ::= SEQUENCE {
	    ///		permittedSubtrees       [0]     GeneralSubtrees OPTIONAL,
	    ///		excludedSubtrees        [1]     GeneralSubtrees OPTIONAL }
	    ///	   
        /// GeneralSubtrees ::= SEQUENCE SIZE (1..MAX) OF GeneralSubtree
        /// 
        ///		GeneralSubtree ::= SEQUENCE {
        ///		base                    GeneralName,
        ///		minimum         [0]     BaseDistance DEFAULT 0,
        ///		maximum         [1]     BaseDistance OPTIONAL }
        ///		
        ///		BaseDistance ::= INTEGER (0..MAX)
		///
		///		GeneralName ::= CHOICE {
		///		otherName                       [0]     OtherName,
		///		rfc822Name                      [1]     IA5String,
		///		dNSName                         [2]     IA5String,
		///		x400Address                     [3]     ORAddress,
		///		directoryName                   [4]     Name,
		///		ediPartyName                    [5]     EDIPartyName,
		///		uniformResourceIdentifier       [6]     IA5String,
		///		iPAddress                       [7]     OCTET STRING,
		///		registeredID                    [8]     OBJECT IDENTIFIER}
		///	</pre>
		///	
		///	Note that the name constraints byte array supplied is cloned to protect
		///	against subsequent modifications.
		/// </summary>
		/// <param name="trustedCert">a trusted X509Certificate</param>
		/// <param name="nameConstraints">a byte array containing the ASN.1 DER encoding of a
		/// NameConstraints extension to be used for checking name
		/// constraints. Only the value of the extension is included, not
		/// the OID or criticality flag. Specify null to omit the
		/// parameter.</param>
		/// <exception cref="ArgumentNullException">if the specified X509Certificate is null</exception>
		public TrustAnchor(
			X509Certificate	trustedCert,
			byte[]			nameConstraints)
		{
			if (trustedCert == null)
				throw new ArgumentNullException("trustedCert");

			this.trustedCert = trustedCert;
			this.pubKey = null;
			this.caName = null;
			this.caPrincipal = null;
			setNameConstraints(nameConstraints);
		}

		/// <summary>
		/// Creates an instance of <c>TrustAnchor</c> where the
		/// most-trusted CA is specified as an X500Principal and public key.
		/// </summary>
		/// <remarks>
		/// <p>
		/// Name constraints are an optional parameter, and are intended to be used
		/// as additional constraints when validating an X.509 certification path.
		/// </p><p>
		/// The name constraints are specified as a byte array. This byte array
		/// contains the DER encoded form of the name constraints, as they
		/// would appear in the NameConstraints structure defined in RFC 2459
		/// and X.509. The ASN.1 notation for this structure is supplied in the
		/// documentation for the other constructors.
		/// </p><p>
		/// Note that the name constraints byte array supplied here is cloned to
		/// protect against subsequent modifications.
		/// </p>
		/// </remarks>
		/// <param name="caPrincipal">the name of the most-trusted CA as X509Name</param>
		/// <param name="pubKey">the public key of the most-trusted CA</param>
		/// <param name="nameConstraints">
		/// a byte array containing the ASN.1 DER encoding of a NameConstraints extension to
		/// be used for checking name constraints. Only the value of the extension is included,
		/// not the OID or criticality flag. Specify <c>null</c> to omit the parameter.
		/// </param>
		/// <exception cref="ArgumentNullException">
		/// if <c>caPrincipal</c> or <c>pubKey</c> is null
		/// </exception>
		public TrustAnchor(
			X509Name				caPrincipal,
			AsymmetricKeyParameter	pubKey,
			byte[]					nameConstraints) 
		{
			if (caPrincipal == null)
				throw new ArgumentNullException("caPrincipal");
			if (pubKey == null)
				throw new ArgumentNullException("pubKey");

			this.trustedCert = null;
			this.caPrincipal = caPrincipal;
			this.caName = caPrincipal.ToString();
			this.pubKey = pubKey;
			setNameConstraints(nameConstraints);
		}

		/// <summary>
		/// Creates an instance of <code>TrustAnchor</code> where the most-trusted
		/// CA is specified as a distinguished name and public key. Name constraints
		/// are an optional parameter, and are intended to be used as additional
		/// constraints when validating an X.509 certification path.
		/// <br/>
		/// The name constraints are specified as a byte array. This byte array
		/// contains the DER encoded form of the name constraints, as they would
		/// appear in the NameConstraints structure defined in RFC 2459 and X.509.
		/// </summary>
		/// <param name="caName">the X.500 distinguished name of the most-trusted CA in RFC
		/// 2253 string format</param>
		/// <param name="pubKey">the public key of the most-trusted CA</param>
		/// <param name="nameConstraints">a byte array containing the ASN.1 DER encoding of a
		/// NameConstraints extension to be used for checking name
		/// constraints. Only the value of the extension is included, not 
		/// the OID or criticality flag. Specify null to omit the 
		/// parameter.</param>
		/// throws NullPointerException, IllegalArgumentException
		public TrustAnchor(
			string					caName,
			AsymmetricKeyParameter	pubKey,
			byte[]					nameConstraints)
		{
			if (caName == null)
				throw new ArgumentNullException("caName");
			if (pubKey == null)
				throw new ArgumentNullException("pubKey");
			if (caName.Length == 0)
				throw new ArgumentException("caName can not be an empty string");

			this.caPrincipal = new X509Name(caName);
			this.pubKey = pubKey;
			this.caName = caName;
			this.trustedCert = null;
			setNameConstraints(nameConstraints);
		}

		/// <summary>
		/// Returns the most-trusted CA certificate.
		/// </summary>
		public X509Certificate TrustedCert
		{
			get { return this.trustedCert; }
		}

		/// <summary>
		/// Returns the name of the most-trusted CA as an X509Name.
		/// </summary>
		public X509Name CA
		{
			get { return this.caPrincipal; }
		}

		/// <summary>
		/// Returns the name of the most-trusted CA in RFC 2253 string format.
		/// </summary>
		public string CAName
		{
			get { return this.caName; }
		}

		/// <summary>
		/// Returns the public key of the most-trusted CA.
		/// </summary>
		public AsymmetricKeyParameter CAPublicKey
		{
			get { return this.pubKey; }
		}

		/// <summary>
		/// Decode the name constraints and clone them if not null.
		/// </summary>
		private void setNameConstraints(
			byte[] bytes) 
		{
			if (bytes == null) 
			{
				ncBytes = null;
				nc = null;
			} 
			else 
			{
				ncBytes = (byte[]) bytes.Clone();
				// validate DER encoding
				//nc = new NameConstraintsExtension(Boolean.FALSE, bytes);
				nc = NameConstraints.GetInstance(Asn1Object.FromByteArray(bytes));
			}
		}

		public byte[] GetNameConstraints
		{
			get { return Arrays.Clone(ncBytes); }
		}

		/// <summary>
		/// Returns a formatted string describing the <code>TrustAnchor</code>.
		/// </summary>
		/// <returns>a formatted string describing the <code>TrustAnchor</code></returns>
		public override string ToString()
		{
			// TODO Some of the sub-objects might not implement ToString() properly
			StringBuilder sb = new StringBuilder();
			sb.AppendLine("[");
			if (this.pubKey != null)
			{
				sb.Append("  Trusted CA Public Key: ").Append(this.pubKey).AppendLine();
				sb.Append("  Trusted CA Issuer Name: ").Append(this.caName).AppendLine();
			}
			else
			{
				sb.Append("  Trusted CA cert: ").Append(this.TrustedCert).AppendLine();
			}
			if (nc != null)
			{
				sb.Append("  Name Constraints: ").Append(nc).AppendLine();
			}
			return sb.ToString();
		}
	}
}