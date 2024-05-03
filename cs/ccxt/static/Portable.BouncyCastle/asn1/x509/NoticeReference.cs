using System;
using System.Collections.Generic;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * <code>NoticeReference</code> class, used in
     * <code>CertificatePolicies</code> X509 V3 extensions
     * (in policy qualifiers).
     *
     * <pre>
     *  NoticeReference ::= Sequence {
     *      organization     DisplayText,
     *      noticeNumbers    Sequence OF Integer }
     *
     * </pre>
     *
     * @see PolicyQualifierInfo
     * @see PolicyInformation
     */
    public class NoticeReference
        : Asn1Encodable
    {
        private readonly DisplayText organization;
        private readonly Asn1Sequence noticeNumbers;

        private static Asn1EncodableVector ConvertVector(IList<object> numbers)
        {
            Asn1EncodableVector av = new Asn1EncodableVector();

            foreach (object o in numbers)
            {
                DerInteger di;

                if (o is BigInteger)
                {
                    di = new DerInteger((BigInteger)o);
                }
                else if (o is int)
                {
                    di = new DerInteger((int)o);
                }
                else
                {
                    throw new ArgumentException();
                }

                av.Add(di);
            }
            return av;
        }

        /**
         * Creates a new <code>NoticeReference</code> instance.
         *
         * @param organization a <code>String</code> value
         * @param numbers a <code>Vector</code> value
         */
        public NoticeReference(string organization, IList<object> numbers)
            : this(organization, ConvertVector(numbers))
        {
        }

        /**
        * Creates a new <code>NoticeReference</code> instance.
        *
        * @param organization a <code>String</code> value
        * @param noticeNumbers an <code>ASN1EncodableVector</code> value
        */
        public NoticeReference(string organization, Asn1EncodableVector noticeNumbers)
            : this(new DisplayText(organization), noticeNumbers)
        {
        }

        /**
         * Creates a new <code>NoticeReference</code> instance.
         *
         * @param organization displayText
         * @param noticeNumbers an <code>ASN1EncodableVector</code> value
         */
        public NoticeReference(DisplayText organization, Asn1EncodableVector noticeNumbers)
        {
            this.organization = organization;
            this.noticeNumbers = new DerSequence(noticeNumbers);
        }

        /**
         * Creates a new <code>NoticeReference</code> instance.
         * <p>Useful for reconstructing a <code>NoticeReference</code>
         * instance from its encodable/encoded form.</p>
         *
         * @param as an <code>Asn1Sequence</code> value obtained from either
         * calling @{link ToAsn1Object()} for a <code>NoticeReference</code>
         * instance or from parsing it from a Der-encoded stream.
         */
        private NoticeReference(Asn1Sequence seq)
        {
            if (seq.Count != 2)
                throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

            organization = DisplayText.GetInstance(seq[0]);
            noticeNumbers = Asn1Sequence.GetInstance(seq[1]);
        }

        public static NoticeReference GetInstance(object obj)
        {
            if (obj is NoticeReference)
                return (NoticeReference)obj;
            if (obj == null)
                return null;
            return new NoticeReference(Asn1Sequence.GetInstance(obj));
        }

        public virtual DisplayText Organization
        {
            get { return organization; }
        }

        public virtual DerInteger[] GetNoticeNumbers()
        {
            DerInteger[] tmp = new DerInteger[noticeNumbers.Count];

            for (int i = 0; i != noticeNumbers.Count; ++i)
            {
                tmp[i] = DerInteger.GetInstance(noticeNumbers[i]);
            }

            return tmp;
        }

        /**
         * Describe <code>ToAsn1Object</code> method here.
         *
         * @return a <code>Asn1Object</code> value
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(organization, noticeNumbers);
        }
    }
}
