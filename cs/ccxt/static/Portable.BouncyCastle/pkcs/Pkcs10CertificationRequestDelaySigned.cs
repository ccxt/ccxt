using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Pkcs
{
	/// <remarks>
	/// A class for creating and verifying Pkcs10 Certification requests (this is an extension on <see cref="Pkcs10CertificationRequest"/>).
	/// The requests are made using delay signing. This is useful for situations where
	/// the private key is in another environment and not directly accessible (e.g. HSM)
	/// So the first step creates the request, then the signing is done outside this
	/// object and the signature is then used to complete the request.
	/// </remarks>
	/// <code>
	/// CertificationRequest ::= Sequence {
	///   certificationRequestInfo  CertificationRequestInfo,
	///   signatureAlgorithm        AlgorithmIdentifier{{ SignatureAlgorithms }},
	///   signature                 BIT STRING
	/// }
	///
	/// CertificationRequestInfo ::= Sequence {
	///   version             Integer { v1(0) } (v1,...),
	///   subject             Name,
	///   subjectPKInfo   SubjectPublicKeyInfo{{ PKInfoAlgorithms }},
	///   attributes          [0] Attributes{{ CRIAttributes }}
	///  }
	///
	///  Attributes { ATTRIBUTE:IOSet } ::= Set OF Attr{{ IOSet }}
	///
	///  Attr { ATTRIBUTE:IOSet } ::= Sequence {
	///    type    ATTRIBUTE.&amp;id({IOSet}),
	///    values  Set SIZE(1..MAX) OF ATTRIBUTE.&amp;Type({IOSet}{\@type})
	///  }
	/// </code>
	/// see <a href="http://www.rsasecurity.com/rsalabs/node.asp?id=2132"/>
	public class Pkcs10CertificationRequestDelaySigned : Pkcs10CertificationRequest
	{
		protected Pkcs10CertificationRequestDelaySigned()
			: base()
		{
		}
		public Pkcs10CertificationRequestDelaySigned(
			byte[] encoded)
			: base(encoded)
		{
		}
		public Pkcs10CertificationRequestDelaySigned(
			Asn1Sequence seq)
			: base(seq)
		{
		}
		public Pkcs10CertificationRequestDelaySigned(
			Stream input)
			: base(input)
		{
		}
		public Pkcs10CertificationRequestDelaySigned(
			string					signatureAlgorithm,
			X509Name				subject,
			AsymmetricKeyParameter	publicKey,
			Asn1Set					attributes,
			AsymmetricKeyParameter	signingKey)
			: base(signatureAlgorithm, subject, publicKey, attributes, signingKey)
		{
		}
		/// <summary>
		/// Instantiate a Pkcs10CertificationRequest object with the necessary credentials.
		/// </summary>
		/// <param name="signatureAlgorithm">Name of Sig Alg.</param>
		/// <param name="subject">X509Name of subject eg OU="My unit." O="My Organisatioin" C="au" </param>
		/// <param name="publicKey">Public Key to be included in cert reqest.</param>
		/// <param name="attributes">ASN1Set of Attributes.</param>
		/// <remarks>
        /// After the object is constructed use the <see cref="GetDataToSign"/> and finally the
        /// SignRequest methods to finalize the request.
		/// </remarks>
		public Pkcs10CertificationRequestDelaySigned(
			string					signatureAlgorithm,
			X509Name				subject,
			AsymmetricKeyParameter	publicKey,
			Asn1Set					attributes)
		{
			if (signatureAlgorithm == null)
				throw new ArgumentNullException("signatureAlgorithm");
			if (subject == null)
				throw new ArgumentNullException("subject");
			if (publicKey == null)
				throw new ArgumentNullException("publicKey");
			if (publicKey.IsPrivate)
				throw new ArgumentException("expected public key", "publicKey");

			DerObjectIdentifier sigOid = CollectionUtilities.GetValueOrNull(m_algorithms, signatureAlgorithm);
			if (sigOid == null)
			{
				try
				{
					sigOid = new DerObjectIdentifier(signatureAlgorithm);
				}
				catch (Exception e)
				{
					throw new ArgumentException("Unknown signature type requested", e);
				}
			}
			if (m_noParams.Contains(sigOid))
			{
				this.sigAlgId = new AlgorithmIdentifier(sigOid);
			}
			else if (m_exParams.TryGetValue(signatureAlgorithm, out var explicitParameters))
			{
				this.sigAlgId = new AlgorithmIdentifier(sigOid, explicitParameters);
			}
			else
			{
				this.sigAlgId = new AlgorithmIdentifier(sigOid, DerNull.Instance);
			}
			SubjectPublicKeyInfo pubInfo = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(publicKey);
			this.reqInfo = new CertificationRequestInfo(subject, pubInfo, attributes);
		}

		public byte[] GetDataToSign()
		{
			return reqInfo.GetDerEncoded();
		}
		public void SignRequest(byte[] signedData)
		{
			//build the signature from the signed data
			sigBits = new DerBitString(signedData);
		}
		public void SignRequest(DerBitString signedData)
		{
			//build the signature from the signed data
			sigBits = signedData;
		}
	}
}
