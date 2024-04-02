using System;
using System.IO;
using System.Text;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Tsp;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tsp
{
	/**
	 * Base class for an RFC 3161 Time Stamp Response object.
	 */
	public class TimeStampResponse
	{
		private TimeStampResp	resp;
		private TimeStampToken	timeStampToken;

		public TimeStampResponse(
			TimeStampResp resp)
		{
			this.resp = resp;

			if (resp.TimeStampToken != null)
			{
				timeStampToken = new TimeStampToken(resp.TimeStampToken);
			}
		}

		/**
		* Create a TimeStampResponse from a byte array containing an ASN.1 encoding.
		*
		* @param resp the byte array containing the encoded response.
		* @throws TspException if the response is malformed.
		* @throws IOException if the byte array doesn't represent an ASN.1 encoding.
		*/
		public TimeStampResponse(
			byte[] resp)
			: this(readTimeStampResp(new Asn1InputStream(resp)))
		{
		}

		/**
		 * Create a TimeStampResponse from an input stream containing an ASN.1 encoding.
		 *
		 * @param input the input stream containing the encoded response.
		 * @throws TspException if the response is malformed.
		 * @throws IOException if the stream doesn't represent an ASN.1 encoding.
		 */
		public TimeStampResponse(
			Stream input)
			: this(readTimeStampResp(new Asn1InputStream(input)))
		{
		}

		private static TimeStampResp readTimeStampResp(
			Asn1InputStream input)
		{
			try
			{
				return TimeStampResp.GetInstance(input.ReadObject());
			}
			catch (ArgumentException e)
			{
				throw new TspException("malformed timestamp response: " + e, e);
			}
			catch (InvalidCastException e)
			{
				throw new TspException("malformed timestamp response: " + e, e);
			}
		}

		public int Status
		{
			get { return resp.Status.Status.IntValue; }
		}

		public string GetStatusString()
		{
			if (resp.Status.StatusString == null)
			{
				return null;
			}

			StringBuilder statusStringBuf = new StringBuilder();
			PkiFreeText text = resp.Status.StatusString;
			for (int i = 0; i != text.Count; i++)
			{
				statusStringBuf.Append(text[i].GetString());
			}

			return statusStringBuf.ToString();
		}

		public PkiFailureInfo GetFailInfo()
		{
			if (resp.Status.FailInfo == null)
			{
				return null;
			}

			return new PkiFailureInfo(resp.Status.FailInfo);
		}

		public TimeStampToken TimeStampToken
		{
			get { return timeStampToken; }
		}

		/**
		 * Check this response against to see if it a well formed response for
		 * the passed in request. Validation will include checking the time stamp
		 * token if the response status is GRANTED or GRANTED_WITH_MODS.
		 *
		 * @param request the request to be checked against
		 * @throws TspException if the request can not match this response.
		 */
		public void Validate(
			TimeStampRequest request)
		{
			TimeStampToken tok = this.TimeStampToken;

			if (tok != null)
			{
				TimeStampTokenInfo tstInfo = tok.TimeStampInfo;

				if (request.Nonce != null && !request.Nonce.Equals(tstInfo.Nonce))
				{
					throw new TspValidationException("response contains wrong nonce value.");
				}

				if (this.Status != (int) PkiStatus.Granted && this.Status != (int) PkiStatus.GrantedWithMods)
				{
					throw new TspValidationException("time stamp token found in failed request.");
				}

				if (!Arrays.ConstantTimeAreEqual(request.GetMessageImprintDigest(), tstInfo.GetMessageImprintDigest()))
				{
					throw new TspValidationException("response for different message imprint digest.");
				}

				if (!tstInfo.MessageImprintAlgOid.Equals(request.MessageImprintAlgOid))
				{
					throw new TspValidationException("response for different message imprint algorithm.");
				}

				Asn1.Cms.Attribute scV1 = tok.SignedAttributes[PkcsObjectIdentifiers.IdAASigningCertificate];
				Asn1.Cms.Attribute scV2 = tok.SignedAttributes[PkcsObjectIdentifiers.IdAASigningCertificateV2];

				if (scV1 == null && scV2 == null)
				{
					throw new TspValidationException("no signing certificate attribute present.");
				}

				if (scV1 != null && scV2 != null)
				{
					/*
					 * RFC 5035 5.4. If both attributes exist in a single message,
					 * they are independently evaluated. 
					 */
				}

				if (request.ReqPolicy != null && !request.ReqPolicy.Equals(tstInfo.Policy))
				{
					throw new TspValidationException("TSA policy wrong for request.");
				}
			}
			else if (this.Status == (int) PkiStatus.Granted || this.Status == (int) PkiStatus.GrantedWithMods)
			{
				throw new TspValidationException("no time stamp token found and one expected.");
			}
		}

		/**
		 * return the ASN.1 encoded representation of this object.
		 */
		public byte[] GetEncoded()
		{
			return resp.GetEncoded();
		}
	}
}
