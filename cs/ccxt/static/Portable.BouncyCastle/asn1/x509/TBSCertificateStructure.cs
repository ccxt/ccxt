using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The TbsCertificate object.
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
     * <p>
     * Note: issuerUniqueID and subjectUniqueID are both deprecated by the IETF. This class
     * will parse them, but you really shouldn't be creating new ones.</p>
     */
	public class TbsCertificateStructure
		: Asn1Encodable
	{
		internal Asn1Sequence            seq;
		internal DerInteger              version;
		internal DerInteger              serialNumber;
		internal AlgorithmIdentifier     signature;
		internal X509Name                issuer;
		internal Time                    startDate, endDate;
		internal X509Name                subject;
		internal SubjectPublicKeyInfo    subjectPublicKeyInfo;
		internal DerBitString            issuerUniqueID;
		internal DerBitString            subjectUniqueID;
		internal X509Extensions          extensions;

		public static TbsCertificateStructure GetInstance(
			Asn1TaggedObject	obj,
			bool				explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

		public static TbsCertificateStructure GetInstance(
			object obj)
		{
			if (obj is TbsCertificateStructure)
				return (TbsCertificateStructure) obj;

			if (obj != null)
				return new TbsCertificateStructure(Asn1Sequence.GetInstance(obj));

			return null;
		}

		internal TbsCertificateStructure(
			Asn1Sequence seq)
		{
			int seqStart = 0;

			this.seq = seq;

			//
			// some certficates don't include a version number - we assume v1
			//
			if (seq[0] is Asn1TaggedObject)
			{
				version = DerInteger.GetInstance((Asn1TaggedObject)seq[0], true);
			}
			else
			{
				seqStart = -1;          // field 0 is missing!
				version = new DerInteger(0);
			}

            bool isV1 = false;
            bool isV2 = false;

            if (version.HasValue(0))
            {
                isV1 = true;
            }
            else if (version.HasValue(1))
            {
                isV2 = true;
            }
            else if (!version.HasValue(2))
            {
                throw new ArgumentException("version number not recognised");
            }

			serialNumber = DerInteger.GetInstance(seq[seqStart + 1]);

			signature = AlgorithmIdentifier.GetInstance(seq[seqStart + 2]);
			issuer = X509Name.GetInstance(seq[seqStart + 3]);

			//
			// before and after dates
			//
			Asn1Sequence  dates = (Asn1Sequence)seq[seqStart + 4];

			startDate = Time.GetInstance(dates[0]);
			endDate = Time.GetInstance(dates[1]);

			subject = X509Name.GetInstance(seq[seqStart + 5]);

			//
			// public key info.
			//
			subjectPublicKeyInfo = SubjectPublicKeyInfo.GetInstance(seq[seqStart + 6]);

            int extras = seq.Count - (seqStart + 6) - 1;
            if (extras != 0 && isV1)
                throw new ArgumentException("version 1 certificate contains extra data");

            while (extras > 0)
			{
                Asn1TaggedObject extra = Asn1TaggedObject.GetInstance(seq[seqStart + 6 + extras]);
				switch (extra.TagNo)
				{
				case 1:
                {
					issuerUniqueID = DerBitString.GetInstance(extra, false);
					break;
                }
                case 2:
                {
                    subjectUniqueID = DerBitString.GetInstance(extra, false);
                    break;
                }
				case 3:
                {
                    if (isV2)
                        throw new ArgumentException("version 2 certificate cannot contain extensions");

                    extensions = X509Extensions.GetInstance(Asn1Sequence.GetInstance(extra, true));
					break;
                }
                default:
                {
                    throw new ArgumentException("Unknown tag encountered in structure: " + extra.TagNo);
                }
                }
                extras--;
			}
		}

		public int Version
		{
            get { return version.IntValueExact + 1; }
		}

		public DerInteger VersionNumber
		{
			get { return version; }
		}

		public DerInteger SerialNumber
		{
			get { return serialNumber; }
		}

		public AlgorithmIdentifier Signature
		{
			get { return signature; }
		}

		public X509Name Issuer
		{
			get { return issuer; }
		}

		public Time StartDate
		{
			get { return startDate; }
		}

		public Time EndDate
		{
			get { return endDate; }
		}

		public X509Name Subject
		{
			get { return subject; }
		}

		public SubjectPublicKeyInfo SubjectPublicKeyInfo
		{
			get { return subjectPublicKeyInfo; }
		}

		public DerBitString IssuerUniqueID
		{
			get { return issuerUniqueID; }
        }

		public DerBitString SubjectUniqueID
        {
			get { return subjectUniqueID; }
        }

		public X509Extensions Extensions
        {
			get { return extensions; }
        }

		public override Asn1Object ToAsn1Object()
        {
            string property = Platform.GetEnvironmentVariable("Org.BouncyCastle.X509.Allow_Non-DER_TBSCert");
            if (null == property || Platform.EqualsIgnoreCase("true", property))
                return seq;

            Asn1EncodableVector v = new Asn1EncodableVector();

            // DEFAULT Zero
            if (!version.HasValue(0))
            {
                v.Add(new DerTaggedObject(true, 0, version));
            }

            v.Add(serialNumber, signature, issuer);

			//
			// before and after dates
			//
			v.Add(new DerSequence(startDate, endDate));

            if (subject != null)
            {
                v.Add(subject);
            }
            else
            {
                v.Add(DerSequence.Empty);
            }

            v.Add(subjectPublicKeyInfo);

            // Note: implicit tag
			v.AddOptionalTagged(false, 1, issuerUniqueID);

			// Note: implicit tag
			v.AddOptionalTagged(false, 2, subjectUniqueID);

			v.AddOptionalTagged(true, 3, extensions);

            return new DerSequence(v);
        }
    }
}
