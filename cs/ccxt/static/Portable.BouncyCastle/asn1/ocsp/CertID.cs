using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class CertID
        : Asn1Encodable
    {
        private readonly AlgorithmIdentifier    hashAlgorithm;
        private readonly Asn1OctetString        issuerNameHash;
        private readonly Asn1OctetString        issuerKeyHash;
        private readonly DerInteger             serialNumber;

		public static CertID GetInstance(
			Asn1TaggedObject	obj,
			bool				explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

		public static CertID GetInstance(
			object obj)
		{
			if (obj == null || obj is CertID)
			{
				return (CertID)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new CertID((Asn1Sequence)obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public CertID(
            AlgorithmIdentifier hashAlgorithm,
            Asn1OctetString     issuerNameHash,
            Asn1OctetString     issuerKeyHash,
            DerInteger          serialNumber)
        {
            this.hashAlgorithm = hashAlgorithm;
            this.issuerNameHash = issuerNameHash;
            this.issuerKeyHash = issuerKeyHash;
            this.serialNumber = serialNumber;
        }

		private CertID(
            Asn1Sequence seq)
        {
			if (seq.Count != 4)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			this.hashAlgorithm = AlgorithmIdentifier.GetInstance(seq[0]);
            this.issuerNameHash = Asn1OctetString.GetInstance(seq[1]);
            this.issuerKeyHash = Asn1OctetString.GetInstance(seq[2]);
            this.serialNumber = DerInteger.GetInstance(seq[3]);
        }

		public AlgorithmIdentifier HashAlgorithm
		{
			get { return hashAlgorithm; }
		}

		public Asn1OctetString IssuerNameHash
		{
			get { return issuerNameHash; }
		}

		public Asn1OctetString IssuerKeyHash
		{
			get { return issuerKeyHash; }
		}

		public DerInteger SerialNumber
		{
			get { return serialNumber; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * CertID          ::=     Sequence {
         *     hashAlgorithm       AlgorithmIdentifier,
         *     issuerNameHash      OCTET STRING, -- Hash of Issuer's DN
         *     issuerKeyHash       OCTET STRING, -- Hash of Issuers public key
         *     serialNumber        CertificateSerialNumber }
         * </pre>
         */
		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(hashAlgorithm, issuerNameHash, issuerKeyHash, serialNumber);
		}
	}
}
