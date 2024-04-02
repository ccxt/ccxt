using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Ocsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Operators;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Ocsp
{
	/**
	 * Generator for basic OCSP response objects.
	 */
	public class BasicOcspRespGenerator
	{
		private readonly List<ResponseObject> list = new List<ResponseObject>();

		private X509Extensions responseExtensions;
		private RespID responderID;

		private class ResponseObject
		{
			internal CertificateID         certId;
			internal CertStatus            certStatus;
			internal DerGeneralizedTime    thisUpdate;
			internal DerGeneralizedTime    nextUpdate;
			internal X509Extensions        extensions;

			internal ResponseObject(
				CertificateID		certId,
				CertificateStatus	certStatus,
				DateTime			thisUpdate,
				DateTime?			nextUpdate,
				X509Extensions		extensions)
			{
				this.certId = certId;

				if (certStatus == null)
				{
					this.certStatus = new CertStatus();
				}
				else if (certStatus is UnknownStatus)
				{
					this.certStatus = new CertStatus(2, DerNull.Instance);
				}
				else
				{
					RevokedStatus rs = (RevokedStatus) certStatus;
					CrlReason revocationReason = rs.HasRevocationReason
						?	new CrlReason(rs.RevocationReason)
						:	null;

					this.certStatus = new CertStatus(
						new RevokedInfo(new DerGeneralizedTime(rs.RevocationTime), revocationReason));
				}

				this.thisUpdate = new DerGeneralizedTime(thisUpdate);
				this.nextUpdate = nextUpdate.HasValue ? new DerGeneralizedTime(nextUpdate.Value) : null;

				this.extensions = extensions;
			}

			public SingleResponse ToResponse()
			{
				return new SingleResponse(certId.ToAsn1Object(), certStatus, thisUpdate, nextUpdate, extensions);
			}
		}

		/**
		 * basic constructor
		 */
		public BasicOcspRespGenerator(
			RespID responderID)
		{
			this.responderID = responderID;
		}

		/**
		 * construct with the responderID to be the SHA-1 keyHash of the passed in public key.
		 */
		public BasicOcspRespGenerator(
			AsymmetricKeyParameter publicKey)
		{
			this.responderID = new RespID(publicKey);
		}

		/**
		 * Add a response for a particular Certificate ID.
		 *
		 * @param certID certificate ID details
		 * @param certStatus status of the certificate - null if okay
		 */
		public void AddResponse(
			CertificateID		certID,
			CertificateStatus	certStatus)
		{
			list.Add(new ResponseObject(certID, certStatus, DateTime.UtcNow, null, null));
		}

		/**
		 * Add a response for a particular Certificate ID.
		 *
		 * @param certID certificate ID details
		 * @param certStatus status of the certificate - null if okay
		 * @param singleExtensions optional extensions
		 */
		public void AddResponse(
			CertificateID		certID,
			CertificateStatus	certStatus,
			X509Extensions		singleExtensions)
		{
			list.Add(new ResponseObject(certID, certStatus, DateTime.UtcNow, null, singleExtensions));
		}

		/**
		 * Add a response for a particular Certificate ID.
		 *
		 * @param certID certificate ID details
		 * @param nextUpdate date when next update should be requested
		 * @param certStatus status of the certificate - null if okay
		 * @param singleExtensions optional extensions
		 */
		public void AddResponse(
			CertificateID		certID,
			CertificateStatus	certStatus,
			DateTime?			nextUpdate,
			X509Extensions		singleExtensions)
		{
			list.Add(new ResponseObject(certID, certStatus, DateTime.UtcNow, nextUpdate, singleExtensions));
		}

		/**
		 * Add a response for a particular Certificate ID.
		 *
		 * @param certID certificate ID details
		 * @param thisUpdate date this response was valid on
		 * @param nextUpdate date when next update should be requested
		 * @param certStatus status of the certificate - null if okay
		 * @param singleExtensions optional extensions
		 */
		public void AddResponse(
			CertificateID		certID,
			CertificateStatus	certStatus,
			DateTime			thisUpdate,
			DateTime?			nextUpdate,
			X509Extensions		singleExtensions)
		{
			list.Add(new ResponseObject(certID, certStatus, thisUpdate, nextUpdate, singleExtensions));
		}

		/**
		 * Set the extensions for the response.
		 *
		 * @param responseExtensions the extension object to carry.
		 */
		public void SetResponseExtensions(
			X509Extensions responseExtensions)
		{
			this.responseExtensions = responseExtensions;
		}

		private BasicOcspResp GenerateResponse(
			ISignatureFactory    signatureCalculator,
			X509Certificate[]		chain,
			DateTime				producedAt)
		{
            AlgorithmIdentifier signingAlgID = (AlgorithmIdentifier)signatureCalculator.AlgorithmDetails;
            DerObjectIdentifier signingAlgorithm = signingAlgID.Algorithm;

			Asn1EncodableVector responses = new Asn1EncodableVector();

			foreach (ResponseObject respObj in list)
			{
				try
				{
					responses.Add(respObj.ToResponse());
				}
				catch (Exception e)
				{
					throw new OcspException("exception creating Request", e);
				}
			}

			ResponseData tbsResp = new ResponseData(responderID.ToAsn1Object(), new DerGeneralizedTime(producedAt),
				new DerSequence(responses), responseExtensions);
			DerBitString bitSig;

			try
			{
                IStreamCalculator streamCalculator = signatureCalculator.CreateCalculator();
				using (Stream sigStream = streamCalculator.Stream)
				{
					tbsResp.EncodeTo(sigStream, Asn1Encodable.Der);
				}

				bitSig = new DerBitString(((IBlockResult)streamCalculator.GetResult()).Collect());
			}
			catch (Exception e)
			{
				throw new OcspException("exception processing TBSRequest: " + e, e);
			}

			AlgorithmIdentifier sigAlgId = OcspUtilities.GetSigAlgID(signingAlgorithm);

			DerSequence chainSeq = null;
			if (chain != null && chain.Length > 0)
			{
				Asn1EncodableVector v = new Asn1EncodableVector(chain.Length);
				try
				{
					for (int i = 0; i != chain.Length; i++)
					{
						v.Add(chain[i].CertificateStructure);
					}
				}
				catch (IOException e)
				{
					throw new OcspException("error processing certs", e);
				}
				catch (CertificateEncodingException e)
				{
					throw new OcspException("error encoding certs", e);
				}

				chainSeq = new DerSequence(v);
			}

			return new BasicOcspResp(new BasicOcspResponse(tbsResp, sigAlgId, bitSig, chainSeq));
		}

		public BasicOcspResp Generate(
			string					signingAlgorithm,
			AsymmetricKeyParameter	privateKey,
			X509Certificate[]		chain,
			DateTime				thisUpdate)
		{
			return Generate(signingAlgorithm, privateKey, chain, thisUpdate, null);
		}

		public BasicOcspResp Generate(
			string					signingAlgorithm,
			AsymmetricKeyParameter	privateKey,
			X509Certificate[]		chain,
			DateTime				producedAt,
			SecureRandom			random)
		{
			if (signingAlgorithm == null)
			{
				throw new ArgumentException("no signing algorithm specified");
			}

			return GenerateResponse(new Asn1SignatureFactory(signingAlgorithm, privateKey, random), chain, producedAt);
		}

        /// <summary>
        /// Generate the signed response using the passed in signature calculator.
        /// </summary>
        /// <param name="signatureCalculatorFactory">Implementation of signing calculator factory.</param>
        /// <param name="chain">The certificate chain associated with the response signer.</param>
        /// <param name="producedAt">"produced at" date.</param>
        /// <returns></returns>
        public BasicOcspResp Generate(
            ISignatureFactory signatureCalculatorFactory,
            X509Certificate[] chain,
            DateTime producedAt)
        {
            if (signatureCalculatorFactory == null)
            {
                throw new ArgumentException("no signature calculator specified");
            }

            return GenerateResponse(signatureCalculatorFactory, chain, producedAt);
        }

        /**
		 * Return an IEnumerable of the signature names supported by the generator.
		 *
		 * @return an IEnumerable containing recognised names.
		 */
        public IEnumerable<string> SignatureAlgNames
		{
			get { return OcspUtilities.AlgNames; }
		}
	}
}
