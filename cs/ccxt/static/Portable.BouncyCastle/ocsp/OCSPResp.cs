using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Ocsp;

namespace Org.BouncyCastle.Ocsp
{
	public class OcspResp
	{
		private OcspResponse resp;

		public OcspResp(
			OcspResponse resp)
		{
			this.resp = resp;
		}

		public OcspResp(
			byte[] resp)
			: this(new Asn1InputStream(resp))
		{
		}

		public OcspResp(
			Stream inStr)
			: this(new Asn1InputStream(inStr))
		{
		}

		private OcspResp(
			Asn1InputStream aIn)
		{
			try
			{
				this.resp = OcspResponse.GetInstance(aIn.ReadObject());
			}
			catch (Exception e)
			{
				throw new IOException("malformed response: " + e.Message, e);
			}
		}

		public int Status
		{
            get { return this.resp.ResponseStatus.IntValueExact; }
		}

		public object GetResponseObject()
		{
			ResponseBytes rb = this.resp.ResponseBytes;

			if (rb == null)
				return null;

			if (rb.ResponseType.Equals(OcspObjectIdentifiers.PkixOcspBasic))
			{
				try
				{
					return new BasicOcspResp(
						BasicOcspResponse.GetInstance(
							Asn1Object.FromByteArray(rb.Response.GetOctets())));
				}
				catch (Exception e)
				{
					throw new OcspException("problem decoding object: " + e, e);
				}
			}

			return rb.Response;
		}

		/**
		* return the ASN.1 encoded representation of this object.
		*/
		public byte[] GetEncoded()
		{
			return resp.GetEncoded();
		}

		public override bool Equals(
			object obj)
		{
			if (obj == this)
				return true;

			OcspResp other = obj as OcspResp;

			if (other == null)
				return false;

			return resp.Equals(other.resp);
		}

		public override int GetHashCode()
		{
			return resp.GetHashCode();
		}
	}
}
