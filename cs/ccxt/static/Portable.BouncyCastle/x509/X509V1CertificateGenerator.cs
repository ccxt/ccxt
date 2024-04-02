using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.X509
{
	/// <summary>
	/// Class to Generate X509V1 Certificates.
	/// </summary>
	public class X509V1CertificateGenerator
	{
		private V1TbsCertificateGenerator tbsGen;

		/// <summary>
		/// Default Constructor.
		/// </summary>
		public X509V1CertificateGenerator()
		{
			tbsGen = new V1TbsCertificateGenerator();
		}

		/// <summary>
		/// Reset the generator.
		/// </summary>
		public void Reset()
		{
			tbsGen = new V1TbsCertificateGenerator();
		}

		/// <summary>
		/// Set the certificate's serial number.
		/// </summary>
		/// <remarks>Make serial numbers long, if you have no serial number policy make sure the number is at least 16 bytes of secure random data.
		/// You will be surprised how ugly a serial number collision can get.</remarks>
		/// <param name="serialNumber">The serial number.</param>
		public void SetSerialNumber(
			BigInteger serialNumber)
		{
			if (serialNumber.SignValue <= 0)
			{
				throw new ArgumentException("serial number must be a positive integer", "serialNumber");
			}

			tbsGen.SetSerialNumber(new DerInteger(serialNumber));
		}

		/// <summary>
		/// Set the issuer distinguished name.
		/// The issuer is the entity whose private key is used to sign the certificate.
		/// </summary>
		/// <param name="issuer">The issuers DN.</param>
		public void SetIssuerDN(
			X509Name issuer)
		{
			tbsGen.SetIssuer(issuer);
		}

		/// <summary>
		/// Set the date that this certificate is to be valid from.
		/// </summary>
		/// <param name="date"/>
		public void SetNotBefore(
			DateTime date)
		{
			tbsGen.SetStartDate(new Time(date));
		}

		/// <summary>
		/// Set the date after which this certificate will no longer be valid.
		/// </summary>
		/// <param name="date"/>
		public void SetNotAfter(
			DateTime date)
		{
			tbsGen.SetEndDate(new Time(date));
		}

		/// <summary>
		/// Set the subject distinguished name.
		/// The subject describes the entity associated with the public key.
		/// </summary>
		/// <param name="subject"/>
		public void SetSubjectDN(
			X509Name subject)
		{
			tbsGen.SetSubject(subject);
		}

        /// <summary>
        /// Set the public key that this certificate identifies.
        /// </summary>
        /// <param name="publicKey"/>
		public void SetPublicKey(
			AsymmetricKeyParameter publicKey)
		{
			try
			{
				tbsGen.SetSubjectPublicKeyInfo(
					SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(publicKey));
			}
			catch (Exception e)
			{
				throw new ArgumentException("unable to process key - " + e.ToString());
			}
		}

		/// <summary>
		/// Generate a new <see cref="X509Certificate"/> using the provided <see cref="ISignatureFactory"/>.
		/// </summary>
		/// <param name="signatureFactory">A <see cref="ISignatureFactory">signature factory</see> with the necessary
		/// algorithm details.</param>
		/// <returns>An <see cref="X509Certificate"/>.</returns>
		public X509Certificate Generate(ISignatureFactory signatureFactory)
		{
			var sigAlgID = (AlgorithmIdentifier)signatureFactory.AlgorithmDetails;

			tbsGen.SetSignature(sigAlgID);

			TbsCertificateStructure tbsCert = tbsGen.GenerateTbsCertificate();

			IStreamCalculator streamCalculator = signatureFactory.CreateCalculator();
			using (Stream sigStream = streamCalculator.Stream)
			{
				tbsCert.EncodeTo(sigStream, Asn1Encodable.Der);
			}

			var signature = ((IBlockResult)streamCalculator.GetResult()).Collect();

			return new X509Certificate(
				new X509CertificateStructure(tbsCert, sigAlgID, new DerBitString(signature)));
		}

		/// <summary>
		/// Allows enumeration of the signature names supported by the generator.
		/// </summary>
		public IEnumerable<string> SignatureAlgNames
		{
			get { return X509Utilities.GetAlgNames(); }
		}
	}
}
