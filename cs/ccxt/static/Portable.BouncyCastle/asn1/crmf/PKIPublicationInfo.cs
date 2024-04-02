using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class PkiPublicationInfo
        : Asn1Encodable
    {
        private readonly DerInteger action;
        private readonly Asn1Sequence pubInfos;

        private PkiPublicationInfo(Asn1Sequence seq)
        {
            action = DerInteger.GetInstance(seq[0]);
            pubInfos = Asn1Sequence.GetInstance(seq[1]);
        }

        public static PkiPublicationInfo GetInstance(object obj)
        {
            if (obj is PkiPublicationInfo)
                return (PkiPublicationInfo)obj;

            if (obj is Asn1Sequence)
                return new PkiPublicationInfo((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public virtual DerInteger Action
        {
            get { return action; }
        }

        public virtual SinglePubInfo[] GetPubInfos()
        {
            if (pubInfos == null)
                return null;

            SinglePubInfo[] results = new SinglePubInfo[pubInfos.Count];
            for (int i = 0; i != results.Length; ++i)
            {
                results[i] = SinglePubInfo.GetInstance(pubInfos[i]);
            }
            return results;
        }

        /**
         * <pre>
         * PkiPublicationInfo ::= SEQUENCE {
         *                  action     INTEGER {
         *                                 dontPublish (0),
         *                                 pleasePublish (1) },
         *                  pubInfos  SEQUENCE SIZE (1..MAX) OF SinglePubInfo OPTIONAL }
         * -- pubInfos MUST NOT be present if action is "dontPublish"
         * -- (if action is "pleasePublish" and pubInfos is omitted,
         * -- "dontCare" is assumed)
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(action, pubInfos);
        }
    }
}
