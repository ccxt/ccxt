using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.IsisMtt.Ocsp
{
	/**
	* ISIS-MTT PROFILE: The responder may include this extension in a response to
	* send the hash of the requested certificate to the responder. This hash is
	* cryptographically bound to the certificate and serves as evidence that the
	* certificate is known to the responder (i.e. it has been issued and is present
	* in the directory). Hence, this extension is a means to provide a positive
	* statement of availability as described in T8.[8]. As explained in T13.[1],
	* clients may rely on this information to be able to validate signatures after
	* the expiry of the corresponding certificate. Hence, clients MUST support this
	* extension. If a positive statement of availability is to be delivered, this
	* extension syntax and OID MUST be used.
	* <p/>
	* <p/>
	* <pre>
	*     CertHash ::= SEQUENCE {
	*       hashAlgorithm AlgorithmIdentifier,
	*       certificateHash OCTET STRING
	*     }
	* </pre>
	*/
	public class CertHash
		: Asn1Encodable
	{
		private readonly AlgorithmIdentifier	hashAlgorithm;
		private readonly byte[]					certificateHash;

		public static CertHash GetInstance(
			object obj)
		{
			if (obj == null || obj is CertHash)
			{
				return (CertHash) obj;
			}

			if (obj is Asn1Sequence)
			{
				return new CertHash((Asn1Sequence) obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		* Constructor from Asn1Sequence.
		* <p/>
		* The sequence is of type CertHash:
		* <p/>
		* <pre>
		*     CertHash ::= SEQUENCE {
		*       hashAlgorithm AlgorithmIdentifier,
		*       certificateHash OCTET STRING
		*     }
		* </pre>
		*
		* @param seq The ASN.1 sequence.
		*/
		private CertHash(
			Asn1Sequence seq)
		{
			if (seq.Count != 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			this.hashAlgorithm = AlgorithmIdentifier.GetInstance(seq[0]);
			this.certificateHash = DerOctetString.GetInstance(seq[1]).GetOctets();
		}

		/**
		* Constructor from a given details.
		*
		* @param hashAlgorithm   The hash algorithm identifier.
		* @param certificateHash The hash of the whole DER encoding of the certificate.
		*/
		public CertHash(
			AlgorithmIdentifier	hashAlgorithm,
			byte[]				certificateHash)
		{
			if (hashAlgorithm == null)
				throw new ArgumentNullException("hashAlgorithm");
			if (certificateHash == null)
				throw new ArgumentNullException("certificateHash");

			this.hashAlgorithm = hashAlgorithm;
			this.certificateHash = (byte[]) certificateHash.Clone();
		}

		public AlgorithmIdentifier HashAlgorithm
		{
			get { return hashAlgorithm; }
		}

		public byte[] CertificateHash
		{
			get { return (byte[]) certificateHash.Clone(); }
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <p/>
		* Returns:
		* <p/>
		* <pre>
		*     CertHash ::= SEQUENCE {
		*       hashAlgorithm AlgorithmIdentifier,
		*       certificateHash OCTET STRING
		*     }
		* </pre>
		*
		* @return an Asn1Object
		*/
		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(hashAlgorithm, new DerOctetString(certificateHash));
		}
	}
}
