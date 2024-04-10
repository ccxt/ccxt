using System;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * Generator for Version 3 TbsCertificateStructures.
     * <pre>
     * TbsCertificate ::= Sequence {
     *      version          [ 0 ]  Version DEFAULT v1(0),
     *      serialNumber            CertificateSerialNumber,
     *      signature               AlgorithmIdentifier,
     *      issuer                  Name,
     *      validity                Validity,
     *      subject                 Name,
     *      subjectPublicKeyInfo    SubjectPublicKeyInfo,
     *      issuerUniqueID    [ 1 ] IMPLICIT UniqueIdentifier OPTIONAL,
     *      subjectUniqueID   [ 2 ] IMPLICIT UniqueIdentifier OPTIONAL,
     *      extensions        [ 3 ] Extensions OPTIONAL
     *      }
     * </pre>
     *
     */
    public class V3TbsCertificateGenerator
    {
        internal DerTaggedObject         version = new DerTaggedObject(0, new DerInteger(2));
        internal DerInteger              serialNumber;
        internal AlgorithmIdentifier     signature;
        internal X509Name                issuer;
        internal Time                    startDate, endDate;
        internal X509Name                subject;
        internal SubjectPublicKeyInfo    subjectPublicKeyInfo;
        internal X509Extensions          extensions;

		private bool altNamePresentAndCritical;
		private DerBitString issuerUniqueID;
		private DerBitString subjectUniqueID;

		public V3TbsCertificateGenerator()
        {
        }

		public void SetSerialNumber(
            DerInteger serialNumber)
        {
            this.serialNumber = serialNumber;
        }

		public void SetSignature(
            AlgorithmIdentifier signature)
        {
            this.signature = signature;
        }

		public void SetIssuer(
            X509Name issuer)
        {
            this.issuer = issuer;
        }

		public void SetStartDate(
            DerUtcTime startDate)
        {
            this.startDate = new Time(startDate);
        }

		public void SetStartDate(
            Time startDate)
        {
            this.startDate = startDate;
        }

		public void SetEndDate(
            DerUtcTime endDate)
        {
            this.endDate = new Time(endDate);
        }

		public void SetEndDate(
            Time endDate)
        {
            this.endDate = endDate;
        }

		public void SetSubject(
            X509Name subject)
        {
            this.subject = subject;
        }

		public void SetIssuerUniqueID(
			DerBitString uniqueID)
		{
			this.issuerUniqueID = uniqueID;
		}

		public void SetSubjectUniqueID(
			DerBitString uniqueID)
		{
			this.subjectUniqueID = uniqueID;
		}

		public void SetSubjectPublicKeyInfo(
            SubjectPublicKeyInfo pubKeyInfo)
        {
            this.subjectPublicKeyInfo = pubKeyInfo;
        }

		public void SetExtensions(
            X509Extensions extensions)
        {
            this.extensions = extensions;

			if (extensions != null)
			{
				X509Extension altName = extensions.GetExtension(X509Extensions.SubjectAlternativeName);

				if (altName != null && altName.IsCritical)
				{
					altNamePresentAndCritical = true;
				}
			}
		}

		public TbsCertificateStructure GenerateTbsCertificate()
        {
            if ((serialNumber == null) || (signature == null)
                || (issuer == null) || (startDate == null) || (endDate == null)
				|| (subject == null && !altNamePresentAndCritical)
				|| (subjectPublicKeyInfo == null))
            {
                throw new InvalidOperationException("not all mandatory fields set in V3 TBScertificate generator");
            }

			DerSequence validity = new DerSequence(startDate, endDate); // before and after dates

			Asn1EncodableVector v = new Asn1EncodableVector(
				version, serialNumber, signature, issuer, validity);

			if (subject != null)
			{
				v.Add(subject);
			}
			else
			{
				v.Add(DerSequence.Empty);
			}

			v.Add(subjectPublicKeyInfo);

			if (issuerUniqueID != null)
			{
				v.Add(new DerTaggedObject(false, 1, issuerUniqueID));
			}

			if (subjectUniqueID != null)
			{
				v.Add(new DerTaggedObject(false, 2, subjectUniqueID));
			}

			if (extensions != null)
            {
                v.Add(new DerTaggedObject(3, extensions));
            }

			return new TbsCertificateStructure(new DerSequence(v));
        }
    }
}
