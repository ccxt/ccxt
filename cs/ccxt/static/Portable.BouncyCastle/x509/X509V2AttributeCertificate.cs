using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Operators;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.X509
{
	/// <summary>An implementation of a version 2 X.509 Attribute Certificate.</summary>
	public class X509V2AttributeCertificate
		: X509ExtensionBase
	{
		private readonly AttributeCertificate cert;
		private readonly DateTime notBefore;
		private readonly DateTime notAfter;

		private static AttributeCertificate GetObject(Stream input)
		{
			try
			{
				return AttributeCertificate.GetInstance(Asn1Object.FromStream(input));
			}
			catch (IOException e)
			{
				throw e;
			}
			catch (Exception e)
			{
				throw new IOException("exception decoding certificate structure", e);
			}
		}

		public X509V2AttributeCertificate(
			Stream encIn)
			: this(GetObject(encIn))
		{
		}

		public X509V2AttributeCertificate(
			byte[] encoded)
			: this(new MemoryStream(encoded, false))
		{
		}

		public X509V2AttributeCertificate(AttributeCertificate cert)
		{
			this.cert = cert;

			try
			{
				this.notAfter = cert.ACInfo.AttrCertValidityPeriod.NotAfterTime.ToDateTime();
				this.notBefore = cert.ACInfo.AttrCertValidityPeriod.NotBeforeTime.ToDateTime();
			}
			catch (Exception e)
			{
				throw new IOException("invalid data structure in certificate!", e);
			}
		}

		public virtual AttributeCertificate AttributeCertificate
		{
			get { return cert; }
		}

		public virtual int Version
		{
            get { return cert.ACInfo.Version.IntValueExact + 1; }
		}

		public virtual BigInteger SerialNumber
		{
			get { return cert.ACInfo.SerialNumber.Value; }
		}

		public virtual AttributeCertificateHolder Holder
		{
			get
			{
				return new AttributeCertificateHolder((Asn1Sequence)cert.ACInfo.Holder.ToAsn1Object());
			}
		}

		public virtual AttributeCertificateIssuer Issuer
		{
			get
			{
				return new AttributeCertificateIssuer(cert.ACInfo.Issuer);
			}
		}

		public virtual DateTime NotBefore
		{
			get { return notBefore; }
		}

		public virtual DateTime NotAfter
		{
			get { return notAfter; }
		}

		public virtual bool[] GetIssuerUniqueID()
		{
			DerBitString id = cert.ACInfo.IssuerUniqueID;

			if (id != null)
			{
				byte[] bytes = id.GetBytes();
				bool[] boolId = new bool[bytes.Length * 8 - id.PadBits];

				for (int i = 0; i != boolId.Length; i++)
				{
					//boolId[i] = (bytes[i / 8] & (0x80 >>> (i % 8))) != 0;
					boolId[i] = (bytes[i / 8] & (0x80 >> (i % 8))) != 0;
				}

				return boolId;
			}

			return null;
		}

		public virtual bool IsValidNow
		{
			get { return IsValid(DateTime.UtcNow); }
		}

		public virtual bool IsValid(
			DateTime date)
		{
			return date.CompareTo(NotBefore) >= 0 && date.CompareTo(NotAfter) <= 0;
		}

		public virtual void CheckValidity()
		{
			this.CheckValidity(DateTime.UtcNow);
		}

		public virtual void CheckValidity(
			DateTime date)
		{
			if (date.CompareTo(NotAfter) > 0)
				throw new CertificateExpiredException("certificate expired on " + NotAfter);
			if (date.CompareTo(NotBefore) < 0)
				throw new CertificateNotYetValidException("certificate not valid until " + NotBefore);
		}

        public virtual AlgorithmIdentifier SignatureAlgorithm
        {
            get { return cert.SignatureAlgorithm; }
        }

		public virtual byte[] GetSignature()
		{
            return cert.GetSignatureOctets();
		}

        public virtual void Verify(
            AsymmetricKeyParameter key)
        {
            CheckSignature(new Asn1VerifierFactory(cert.SignatureAlgorithm, key));
        }

        /// <summary>
        /// Verify the certificate's signature using a verifier created using the passed in verifier provider.
        /// </summary>
        /// <param name="verifierProvider">An appropriate provider for verifying the certificate's signature.</param>
        /// <returns>True if the signature is valid.</returns>
        /// <exception cref="Exception">If verifier provider is not appropriate or the certificate algorithm is invalid.</exception>
        public virtual void Verify(
            IVerifierFactoryProvider verifierProvider)
        {
            CheckSignature(verifierProvider.CreateVerifierFactory(cert.SignatureAlgorithm));
        }

        protected virtual void CheckSignature(
            IVerifierFactory verifier)
        {
            if (!cert.SignatureAlgorithm.Equals(cert.ACInfo.Signature))
			{
				throw new CertificateException("Signature algorithm in certificate info not same as outer certificate");
			}

            IStreamCalculator streamCalculator = verifier.CreateCalculator();

			try
			{
                byte[] b = this.cert.ACInfo.GetEncoded();

                streamCalculator.Stream.Write(b, 0, b.Length);

                Platform.Dispose(streamCalculator.Stream);
            }
			catch (IOException e)
			{
				throw new SignatureException("Exception encoding certificate info object", e);
			}

			if (!((IVerifier)streamCalculator.GetResult()).IsVerified(this.GetSignature()))
			{
				throw new InvalidKeyException("Public key presented not for certificate signature");
			}
		}

		public virtual byte[] GetEncoded()
		{
			return cert.GetEncoded();
		}

		protected override X509Extensions GetX509Extensions()
		{
			return cert.ACInfo.Extensions;
		}

		public virtual X509Attribute[] GetAttributes()
		{
			Asn1Sequence seq = cert.ACInfo.Attributes;
			X509Attribute[] attrs = new X509Attribute[seq.Count];

			for (int i = 0; i != seq.Count; i++)
			{
				attrs[i] = new X509Attribute((Asn1Encodable)seq[i]);
			}

			return attrs;
		}

		public virtual X509Attribute[] GetAttributes(
			string oid)
		{
			Asn1Sequence seq = cert.ACInfo.Attributes;
			var list = new List<X509Attribute>();

			for (int i = 0; i != seq.Count; i++)
			{
				X509Attribute attr = new X509Attribute((Asn1Encodable)seq[i]);
				if (attr.Oid.Equals(oid))
				{
					list.Add(attr);
				}
			}

			if (list.Count < 1)
			{
				return null;
			}

			return list.ToArray();
		}

		public override bool Equals(object obj)
		{
			if (obj == this)
				return true;

			X509V2AttributeCertificate other = obj as X509V2AttributeCertificate;

			if (other == null)
				return false;

			return cert.Equals(other.cert);

			// NB: May prefer this implementation of Equals if more than one certificate implementation in play
			//return Arrays.AreEqual(this.GetEncoded(), other.GetEncoded());
		}

		public override int GetHashCode()
		{
			return cert.GetHashCode();
		}
	}
}
