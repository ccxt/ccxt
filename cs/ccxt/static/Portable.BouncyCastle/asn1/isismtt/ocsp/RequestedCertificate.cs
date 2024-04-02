using System;
using System.IO;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.Ocsp
{
	/**
	* ISIS-MTT-Optional: The certificate requested by the client by inserting the
	* RetrieveIfAllowed extension in the request, will be returned in this
	* extension.
	* <p/>
	* ISIS-MTT-SigG: The signature act allows publishing certificates only then,
	* when the certificate owner gives his isExplicit permission. Accordingly, there
	* may be �nondownloadable� certificates, about which the responder must provide
	* status information, but MUST NOT include them in the response. Clients may
	* get therefore the following three kind of answers on a single request
	* including the RetrieveIfAllowed extension:
	* <ul>
	* <li> a) the responder supports the extension and is allowed to publish the
	* certificate: RequestedCertificate returned including the requested
	* certificate</li>
	* <li>b) the responder supports the extension but is NOT allowed to publish
	* the certificate: RequestedCertificate returned including an empty OCTET
	* STRING</li>
	* <li>c) the responder does not support the extension: RequestedCertificate is
	* not included in the response</li>
	* </ul>
	* Clients requesting RetrieveIfAllowed MUST be able to handle these cases. If
	* any of the OCTET STRING options is used, it MUST contain the DER encoding of
	* the requested certificate.
	* <p/>
	* <pre>
	*            RequestedCertificate ::= CHOICE {
	*              Certificate Certificate,
	*              publicKeyCertificate [0] EXPLICIT OCTET STRING,
	*              attributeCertificate [1] EXPLICIT OCTET STRING
	*            }
	* </pre>
	*/
	public class RequestedCertificate
		: Asn1Encodable, IAsn1Choice
	{
		public enum Choice
		{
			Certificate = -1,
			PublicKeyCertificate = 0,
			AttributeCertificate = 1
		}

		private readonly X509CertificateStructure	cert;
		private readonly byte[]						publicKeyCert;
		private readonly byte[]						attributeCert;

		public static RequestedCertificate GetInstance(
			object obj)
		{
			if (obj == null || obj is RequestedCertificate)
			{
				return (RequestedCertificate) obj;
			}

			if (obj is Asn1Sequence)
			{
				return new RequestedCertificate(X509CertificateStructure.GetInstance(obj));
			}

			if (obj is Asn1TaggedObject)
			{
				return new RequestedCertificate((Asn1TaggedObject) obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public static RequestedCertificate GetInstance(
			Asn1TaggedObject	obj,
			bool				isExplicit)
		{
			if (!isExplicit)
				throw new ArgumentException("choice item must be explicitly tagged");

			return GetInstance(obj.GetObject());
		}

		private RequestedCertificate(
			Asn1TaggedObject tagged)
		{
			switch ((Choice) tagged.TagNo)
			{
				case Choice.AttributeCertificate:
					this.attributeCert = Asn1OctetString.GetInstance(tagged, true).GetOctets();
					break;
				case Choice.PublicKeyCertificate:
					this.publicKeyCert = Asn1OctetString.GetInstance(tagged, true).GetOctets();
					break;
				default:
					throw new ArgumentException("unknown tag number: " + tagged.TagNo);
			}
		}

		/**
		* Constructor from a given details.
		* <p/>
		* Only one parameter can be given. All other must be <code>null</code>.
		*
		* @param certificate Given as Certificate
		*/
		public RequestedCertificate(
			X509CertificateStructure certificate)
		{
			this.cert = certificate;
		}

		public RequestedCertificate(
			Choice	type,
			byte[]	certificateOctets)
			: this(new DerTaggedObject((int) type, new DerOctetString(certificateOctets)))
		{
		}

		public Choice Type
		{
			get
			{
				if (cert != null)
					return Choice.Certificate;

				if (publicKeyCert != null)
					return Choice.PublicKeyCertificate;

				return Choice.AttributeCertificate;
			}
		}

		public byte[] GetCertificateBytes()
		{
			if (cert != null)
			{
				try
				{
					return cert.GetEncoded();
				}
				catch (IOException e)
				{
					throw new InvalidOperationException("can't decode certificate: " + e);
				}
			}

			if (publicKeyCert != null)
				return publicKeyCert;

			return attributeCert;
		}
    

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*            RequestedCertificate ::= CHOICE {
		*              Certificate Certificate,
		*              publicKeyCertificate [0] EXPLICIT OCTET STRING,
		*              attributeCertificate [1] EXPLICIT OCTET STRING
		*            }
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			if (publicKeyCert != null)
			{
				return new DerTaggedObject(0, new DerOctetString(publicKeyCert));
			}

			if (attributeCert != null)
			{
				return new DerTaggedObject(1, new DerOctetString(attributeCert));
			}

			return cert.ToAsn1Object();
		}
	}
}
