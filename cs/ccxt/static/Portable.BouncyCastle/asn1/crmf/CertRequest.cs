using System;
using Org.BouncyCastle.Crmf;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class CertRequest
        : Asn1Encodable
    {
        private readonly DerInteger certReqId;
        private readonly CertTemplate certTemplate;
        private readonly Controls controls;

        private CertRequest(Asn1Sequence seq)
        {
            certReqId = DerInteger.GetInstance(seq[0]);
            certTemplate = CertTemplate.GetInstance(seq[1]);
            if (seq.Count > 2)
            {
                controls = Controls.GetInstance(seq[2]);
            }
        }

        public static CertRequest GetInstance(object obj)
        {
            if (obj is CertRequest)
                return (CertRequest)obj;

            if (obj != null)
                return new CertRequest(Asn1Sequence.GetInstance(obj));

            return null;
        }

        public CertRequest(
            int certReqId,
            CertTemplate certTemplate,
            Controls controls)
            : this(new DerInteger(certReqId), certTemplate, controls)
        {
        }

        public CertRequest(
            DerInteger certReqId,
            CertTemplate certTemplate,
            Controls controls)
        {
            this.certReqId = certReqId;
            this.certTemplate = certTemplate;
            this.controls = controls;
        }

        public virtual DerInteger CertReqID
        {
            get { return certReqId; }
        }

        public virtual CertTemplate CertTemplate
        {
            get { return certTemplate; }
        }

        public virtual Controls Controls
        {
            get { return controls; }
        }

        /**
         * <pre>
         * CertRequest ::= SEQUENCE {
         *                      certReqId     INTEGER,          -- ID for matching request and reply
         *                      certTemplate  CertTemplate,  -- Selected fields of cert to be issued
         *                      controls      Controls OPTIONAL }   -- Attributes affecting issuance
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(certReqId, certTemplate);
            v.AddOptional(controls);
            return new DerSequence(v);
        }
    }
}
