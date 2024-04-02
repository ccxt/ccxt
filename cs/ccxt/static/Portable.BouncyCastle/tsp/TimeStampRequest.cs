using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.Tsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Tsp
{
	/**
	 * Base class for an RFC 3161 Time Stamp Request.
	 */
	public class TimeStampRequest
		: X509ExtensionBase
	{
		private TimeStampReq req;
		private X509Extensions extensions;

		public TimeStampRequest(
			TimeStampReq req)
		{
			this.req = req;
			this.extensions = req.Extensions;
		}

		/**
		* Create a TimeStampRequest from the past in byte array.
		*
		* @param req byte array containing the request.
		* @throws IOException if the request is malformed.
		*/
		public TimeStampRequest(
			byte[] req)
			: this(new Asn1InputStream(req))
		{
		}

		/**
		* Create a TimeStampRequest from the past in input stream.
		*
		* @param in input stream containing the request.
		* @throws IOException if the request is malformed.
		*/
		public TimeStampRequest(
			Stream input)
			: this(new Asn1InputStream(input))
		{
		}

		private TimeStampRequest(
			Asn1InputStream str)
		{
			try
			{
				this.req = TimeStampReq.GetInstance(str.ReadObject());
			}
			catch (InvalidCastException e)
			{
				throw new IOException("malformed request: " + e);
			}
			catch (ArgumentException e)
			{
				throw new IOException("malformed request: " + e);
			}
		}

		public int Version
		{
            get { return req.Version.IntValueExact; }
		}

		public string MessageImprintAlgOid
		{
            get { return req.MessageImprint.HashAlgorithm.Algorithm.Id; }
		}

		public byte[] GetMessageImprintDigest()
		{
			return req.MessageImprint.GetHashedMessage();
		}

		public string ReqPolicy
		{
			get
			{
				return req.ReqPolicy == null
					?	null
					:	req.ReqPolicy.Id;
			}
		}

		public BigInteger Nonce
		{
			get
			{
				return req.Nonce == null
					?	null
					:	req.Nonce.Value;
			}
		}

		public bool CertReq
		{
			get
			{
				return req.CertReq == null
					?	false
					:	req.CertReq.IsTrue;
			}
		}

		/**
		* Validate the timestamp request, checking the digest to see if it is of an
		* accepted type and whether it is of the correct length for the algorithm specified.
		*
		* @param algorithms a set of string OIDS giving accepted algorithms.
		* @param policies if non-null a set of policies we are willing to sign under.
		* @param extensions if non-null a set of extensions we are willing to accept.
		* @throws TspException if the request is invalid, or processing fails.
		*/
		public void Validate(IList<string> algorithms, IList<string> policies, IList<string> extensions)
		{
			if (!algorithms.Contains(this.MessageImprintAlgOid))
				throw new TspValidationException("request contains unknown algorithm", PkiFailureInfo.BadAlg);

            if (policies != null && this.ReqPolicy != null && !policies.Contains(this.ReqPolicy))
				throw new TspValidationException("request contains unknown policy", PkiFailureInfo.UnacceptedPolicy);

            if (this.Extensions != null && extensions != null)
			{
				foreach (DerObjectIdentifier oid in this.Extensions.ExtensionOids)
				{
					if (!extensions.Contains(oid.Id))
						throw new TspValidationException("request contains unknown extension", PkiFailureInfo.UnacceptedExtension);
				}
			}

			int digestLength = TspUtil.GetDigestLength(this.MessageImprintAlgOid);

			if (digestLength != this.GetMessageImprintDigest().Length)
				throw new TspValidationException("imprint digest the wrong length", PkiFailureInfo.BadDataFormat);
		}

		/**
		 * return the ASN.1 encoded representation of this object.
		 */
		public byte[] GetEncoded()
		{
			return req.GetEncoded();
		}

		internal X509Extensions Extensions
		{
			get { return req.Extensions; }
		}
		
		public virtual bool HasExtensions
		{
			get { return extensions != null; }
		}

		public virtual X509Extension GetExtension(DerObjectIdentifier oid)
		{
			return extensions == null ? null : extensions.GetExtension(oid);
		}

		public virtual IList<DerObjectIdentifier> GetExtensionOids()
		{
			return TspUtil.GetExtensionOids(extensions);
		}

		protected override X509Extensions GetX509Extensions()
		{
			return Extensions;
		}
	}
}
