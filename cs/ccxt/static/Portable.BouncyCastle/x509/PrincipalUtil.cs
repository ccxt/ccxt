using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Security.Certificates;

namespace Org.BouncyCastle.X509
{
	/// <remarks>
	/// A utility class that will extract X509Principal objects from X.509 certificates.
	/// <p>
	/// Use this in preference to trying to recreate a principal from a string, not all
	/// DNs are what they should be, so it's best to leave them encoded where they
	/// can be.</p>
	/// </remarks>
	public class PrincipalUtilities
	{
		/// <summary>Return the issuer of the given cert as an X509Principal.</summary>
		public static X509Name GetIssuerX509Principal(
			X509Certificate cert)
		{
			try
			{
				TbsCertificateStructure tbsCert = TbsCertificateStructure.GetInstance(
					Asn1Object.FromByteArray(cert.GetTbsCertificate()));

				return tbsCert.Issuer;
			}
			catch (Exception e)
			{
				throw new CertificateEncodingException("Could not extract issuer", e);
			}
		}

		/// <summary>Return the subject of the given cert as an X509Principal.</summary>
		public static X509Name GetSubjectX509Principal(
			X509Certificate cert)
		{
			try
			{
				TbsCertificateStructure tbsCert = TbsCertificateStructure.GetInstance(
					Asn1Object.FromByteArray(cert.GetTbsCertificate()));

				return tbsCert.Subject;
			}
			catch (Exception e)
			{
				throw new CertificateEncodingException("Could not extract subject", e);
			}
		}

		/// <summary>Return the issuer of the given CRL as an X509Principal.</summary>
		public static X509Name GetIssuerX509Principal(
			X509Crl crl)
		{
			try
			{
				TbsCertificateList tbsCertList = TbsCertificateList.GetInstance(
					Asn1Object.FromByteArray(crl.GetTbsCertList()));

				return tbsCertList.Issuer;
			}
			catch (Exception e)
			{
				throw new CrlException("Could not extract issuer", e);
			}
		}
	}
}
