using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class SinglePubInfo
        : Asn1Encodable
    {
        private readonly DerInteger pubMethod;
        private readonly GeneralName pubLocation;

        private SinglePubInfo(Asn1Sequence seq)
        {
            pubMethod = DerInteger.GetInstance(seq[0]);

            if (seq.Count == 2)
            {
                pubLocation = GeneralName.GetInstance(seq[1]);
            }
        }

        public static SinglePubInfo GetInstance(object obj)
        {
            if (obj is SinglePubInfo)
                return (SinglePubInfo)obj;

            if (obj is Asn1Sequence)
                return new SinglePubInfo((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public virtual GeneralName PubLocation
        {
            get { return pubLocation; }
        }

        /**
         * <pre>
         * SinglePubInfo ::= SEQUENCE {
         *        pubMethod    INTEGER {
         *           dontCare    (0),
         *           x500        (1),
         *           web         (2),
         *           ldap        (3) },
         *       pubLocation  GeneralName OPTIONAL }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(pubMethod);
            v.AddOptional(pubLocation);
            return new DerSequence(v);
        }
    }
}
