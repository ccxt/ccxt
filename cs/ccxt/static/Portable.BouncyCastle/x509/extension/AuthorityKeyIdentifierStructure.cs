using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Security.Certificates;

namespace Org.BouncyCastle.X509.Extension
{
	/// <remarks>A high level authority key identifier.</remarks>
	public class AuthorityKeyIdentifierStructure
		: AuthorityKeyIdentifier
	{
		/**
		 * Constructor which will take the byte[] returned from getExtensionValue()
		 *
		 * @param encodedValue a DER octet encoded string with the extension structure in it.
		 * @throws IOException on parsing errors.
		 */
		// TODO Add a functional constructor from byte[]?
		public AuthorityKeyIdentifierStructure(
			Asn1OctetString encodedValue)
			: base((Asn1Sequence) X509ExtensionUtilities.FromExtensionValue(encodedValue))
		{
		}

		private static Asn1Sequence FromCertificate(
			X509Certificate certificate)
		{
			try
			{
				GeneralName genName = new GeneralName(
					PrincipalUtilities.GetIssuerX509Principal(certificate));

				if (certificate.Version == 3)
				{
					Asn1OctetString ext = certificate.GetExtensionValue(X509Extensions.SubjectKeyIdentifier);

					if (ext != null)
					{
						Asn1OctetString str = (Asn1OctetString) X509ExtensionUtilities.FromExtensionValue(ext);

						return (Asn1Sequence) new AuthorityKeyIdentifier(
							str.GetOctets(), new GeneralNames(genName), certificate.SerialNumber).ToAsn1Object();
					}
				}

				SubjectPublicKeyInfo info = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(
					certificate.GetPublicKey());

				return (Asn1Sequence) new AuthorityKeyIdentifier(
					info, new GeneralNames(genName), certificate.SerialNumber).ToAsn1Object();
			}
			catch (Exception e)
			{
				throw new CertificateParsingException("Exception extracting certificate details", e);
			}
		}

		private static Asn1Sequence FromKey(
			AsymmetricKeyParameter pubKey)
		{
			try
			{
				SubjectPublicKeyInfo info = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(pubKey);

				return (Asn1Sequence) new AuthorityKeyIdentifier(info).ToAsn1Object();
			}
			catch (Exception e)
			{
				throw new InvalidKeyException("can't process key: " + e);
			}
		}

		/**
		 * Create an AuthorityKeyIdentifier using the passed in certificate's public
		 * key, issuer and serial number.
		 *
		 * @param certificate the certificate providing the information.
		 * @throws CertificateParsingException if there is a problem processing the certificate
		 */
		public AuthorityKeyIdentifierStructure(
			X509Certificate certificate)
			: base(FromCertificate(certificate))
		{
		}

		/**
		 * Create an AuthorityKeyIdentifier using just the hash of the
		 * public key.
		 *
		 * @param pubKey the key to generate the hash from.
		 * @throws InvalidKeyException if there is a problem using the key.
		 */
		public AuthorityKeyIdentifierStructure(
			AsymmetricKeyParameter pubKey)
			: base(FromKey(pubKey))
		{
		}
	}
}
