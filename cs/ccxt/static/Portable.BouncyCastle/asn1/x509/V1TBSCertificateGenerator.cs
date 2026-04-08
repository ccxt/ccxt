using System;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * Generator for Version 1 TbsCertificateStructures.
     * <pre>
     * TbsCertificate ::= Sequence {
     *      version          [ 0 ]  Version DEFAULT v1(0),
     *      serialNumber            CertificateSerialNumber,
     *      signature               AlgorithmIdentifier,
     *      issuer                  Name,
     *      validity                Validity,
     *      subject                 Name,
     *      subjectPublicKeyInfo    SubjectPublicKeyInfo,
     *      }
     * </pre>
     *
     */
    public class V1TbsCertificateGenerator
    {
        internal DerTaggedObject		version = new DerTaggedObject(0, new DerInteger(0));
        internal DerInteger				serialNumber;
        internal AlgorithmIdentifier	signature;
        internal X509Name				issuer;
        internal Time					startDate, endDate;
        internal X509Name				subject;
        internal SubjectPublicKeyInfo	subjectPublicKeyInfo;

		public V1TbsCertificateGenerator()
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
            Time startDate)
        {
            this.startDate = startDate;
        }

		public void SetStartDate(
            DerUtcTime startDate)
        {
            this.startDate = new Time(startDate);
        }

		public void SetEndDate(
            Time endDate)
        {
            this.endDate = endDate;
        }

		public void SetEndDate(
            DerUtcTime endDate)
        {
            this.endDate = new Time(endDate);
        }

		public void SetSubject(
            X509Name subject)
        {
            this.subject = subject;
        }

		public void SetSubjectPublicKeyInfo(
            SubjectPublicKeyInfo pubKeyInfo)
        {
            this.subjectPublicKeyInfo = pubKeyInfo;
        }

		public TbsCertificateStructure GenerateTbsCertificate()
        {
            if ((serialNumber == null) || (signature == null)
                || (issuer == null) || (startDate == null) || (endDate == null)
                || (subject == null) || (subjectPublicKeyInfo == null))
            {
                throw new InvalidOperationException("not all mandatory fields set in V1 TBScertificate generator");
            }

			return new TbsCertificateStructure(
				new DerSequence(
					//version, - not required as default value
					serialNumber,
					signature,
					issuer,
					new DerSequence(startDate, endDate), // before and after dates
					subject,
					subjectPublicKeyInfo));
        }
    }
}
