using System;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class CertReqMsg
        : Asn1Encodable
    {
        private readonly CertRequest certReq;
        private readonly ProofOfPossession popo;
        private readonly Asn1Sequence regInfo;

        private CertReqMsg(Asn1Sequence seq)
        {
            certReq = CertRequest.GetInstance(seq[0]);

            for (int pos = 1; pos < seq.Count; ++pos)
            {
                object o = seq[pos];

                if (o is Asn1TaggedObject || o is ProofOfPossession)
                {
                    popo = ProofOfPossession.GetInstance(o);
                }
                else
                {
                    regInfo = Asn1Sequence.GetInstance(o);
                }
            }
        }

        public static CertReqMsg GetInstance(object obj)
        {
            if (obj is CertReqMsg)
                return (CertReqMsg)obj;

            if (obj != null)
                return new CertReqMsg(Asn1Sequence.GetInstance(obj));

            return null;
        }

        public static CertReqMsg GetInstance(
            Asn1TaggedObject obj,
            bool isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

        /**
         * Creates a new CertReqMsg.
         * @param certReq CertRequest
         * @param popo may be null
         * @param regInfo may be null
         */
        public CertReqMsg(
            CertRequest				certReq,
            ProofOfPossession		popo,
            AttributeTypeAndValue[]	regInfo)
        {
            if (certReq == null)
                throw new ArgumentNullException("certReq");

            this.certReq = certReq;
            this.popo = popo;

            if (regInfo != null)
            {
                this.regInfo = new DerSequence(regInfo);
            }
        }

        public virtual CertRequest CertReq
        {
            get { return certReq; }
        }

        public virtual ProofOfPossession Popo
        {
            get { return popo; }
        }

        public virtual AttributeTypeAndValue[] GetRegInfo()
        {
            if (regInfo == null)
                return null;

            AttributeTypeAndValue[] results = new AttributeTypeAndValue[regInfo.Count];
            for (int i = 0; i != results.Length; ++i)
            {
                results[i] = AttributeTypeAndValue.GetInstance(regInfo[i]);
            }
            return results;
        }

        /**
         * <pre>
         * CertReqMsg ::= SEQUENCE {
         *                    certReq   CertRequest,
         *                    pop       ProofOfPossession  OPTIONAL,
         *                    -- content depends upon key type
         *                    regInfo   SEQUENCE SIZE(1..MAX) OF AttributeTypeAndValue OPTIONAL }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(certReq);
            v.AddOptional(popo, regInfo);
            return new DerSequence(v);
        }
    }
}
