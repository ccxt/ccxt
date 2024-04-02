using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Ocsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Ocsp
{
	/**
	 * <pre>
	 * OcspRequest     ::=     SEQUENCE {
	 *       tbsRequest                  TBSRequest,
	 *       optionalSignature   [0]     EXPLICIT Signature OPTIONAL }
	 *
	 *   TBSRequest      ::=     SEQUENCE {
	 *       version             [0]     EXPLICIT Version DEFAULT v1,
	 *       requestorName       [1]     EXPLICIT GeneralName OPTIONAL,
	 *       requestList                 SEQUENCE OF Request,
	 *       requestExtensions   [2]     EXPLICIT Extensions OPTIONAL }
	 *
	 *   Signature       ::=     SEQUENCE {
	 *       signatureAlgorithm      AlgorithmIdentifier,
	 *       signature               BIT STRING,
	 *       certs               [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL}
	 *
	 *   Version         ::=             INTEGER  {  v1(0) }
	 *
	 *   Request         ::=     SEQUENCE {
	 *       reqCert                     CertID,
	 *       singleRequestExtensions     [0] EXPLICIT Extensions OPTIONAL }
	 *
	 *   CertID          ::=     SEQUENCE {
	 *       hashAlgorithm       AlgorithmIdentifier,
	 *       issuerNameHash      OCTET STRING, -- Hash of Issuer's DN
	 *       issuerKeyHash       OCTET STRING, -- Hash of Issuers public key
	 *       serialNumber        CertificateSerialNumber }
	 * </pre>
	 */
	public class OcspReq
		: X509ExtensionBase
	{
		private OcspRequest req;

		public OcspReq(
			OcspRequest req)
		{
			this.req = req;
		}

		public OcspReq(
			byte[] req)
			: this(new Asn1InputStream(req))
		{
		}

		public OcspReq(
			Stream inStr)
			: this(new Asn1InputStream(inStr))
		{
		}

		private OcspReq(
			Asn1InputStream aIn)
		{
			try
			{
				this.req = OcspRequest.GetInstance(aIn.ReadObject());
			}
			catch (ArgumentException e)
			{
				throw new IOException("malformed request: " + e.Message);
			}
			catch (InvalidCastException e)
			{
				throw new IOException("malformed request: " + e.Message);
			}
		}

		/**
		 * Return the DER encoding of the tbsRequest field.
		 * @return DER encoding of tbsRequest
		 * @throws OcspException in the event of an encoding error.
		 */
		public byte[] GetTbsRequest()
		{
			try
			{
				return req.TbsRequest.GetEncoded();
			}
			catch (IOException e)
			{
				throw new OcspException("problem encoding tbsRequest", e);
			}
		}

		public int Version
		{
            get { return req.TbsRequest.Version.IntValueExact + 1; }
		}

		public GeneralName RequestorName
		{
			get { return GeneralName.GetInstance(req.TbsRequest.RequestorName); }
		}

		public Req[] GetRequestList()
		{
			Asn1Sequence seq = req.TbsRequest.RequestList;
			Req[] requests = new Req[seq.Count];

			for (int i = 0; i != requests.Length; i++)
			{
				requests[i] = new Req(Request.GetInstance(seq[i]));
			}

			return requests;
		}

		public X509Extensions RequestExtensions
		{
			get { return X509Extensions.GetInstance(req.TbsRequest.RequestExtensions); }
		}

		protected override X509Extensions GetX509Extensions()
		{
			return RequestExtensions;
		}

		/**
		 * return the object identifier representing the signature algorithm
		 */
		public string SignatureAlgOid
		{
			get
			{
				if (!this.IsSigned)
					return null;

                return req.OptionalSignature.SignatureAlgorithm.Algorithm.Id;
			}
		}

		public byte[] GetSignature()
		{
			if (!this.IsSigned)
				return null;

			return req.OptionalSignature.GetSignatureOctets();
		}

        private List<X509Certificate> GetCertList()
		{
			// load the certificates if we have any

			var result = new List<X509Certificate>();

			Asn1Sequence certs = req.OptionalSignature.Certs;
			if (certs != null)
			{
				foreach (Asn1Encodable ae in certs)
				{
                    if (ae != null && ae.ToAsn1Object() is Asn1Sequence s)
                    {
                        result.Add(new X509Certificate(X509CertificateStructure.GetInstance(s)));
                    }
                }
			}

			return result;
		}

		public X509Certificate[] GetCerts()
		{
			if (!this.IsSigned)
				return null;

			return this.GetCertList().ToArray();
		}

		/**
		 * If the request is signed return a possibly empty CertStore containing the certificates in the
		 * request. If the request is not signed the method returns null.
		 *
		 * @return null if not signed, a CertStore otherwise
		 * @throws OcspException
		 */
		public IStore<X509Certificate> GetCertificates()
		{
			if (!this.IsSigned)
				return null;

			return CollectionUtilities.CreateStore(this.GetCertList());
		}

		/**
		 * Return whether or not this request is signed.
		 *
		 * @return true if signed false otherwise.
		 */
		public bool IsSigned
		{
			get { return req.OptionalSignature != null; }
		}

		/**
		 * Verify the signature against the TBSRequest object we contain.
		 */
		public bool Verify(
			AsymmetricKeyParameter publicKey)
		{
			if (!this.IsSigned)
				throw new OcspException("attempt to Verify signature on unsigned object");

			try
			{
				ISigner signature = SignerUtilities.GetSigner(this.SignatureAlgOid);

				signature.Init(false, publicKey);

				byte[] encoded = req.TbsRequest.GetEncoded();

				signature.BlockUpdate(encoded, 0, encoded.Length);

				return signature.VerifySignature(this.GetSignature());
			}
			catch (Exception e)
			{
				throw new OcspException("exception processing sig: " + e, e);
			}
		}

		/**
		 * return the ASN.1 encoded representation of this object.
		 */
		public byte[] GetEncoded()
		{
			return req.GetEncoded();
		}
	}
}
