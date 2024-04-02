using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class PopoSigningKey
        : Asn1Encodable
    {
        private readonly PopoSigningKeyInput poposkInput;
        private readonly AlgorithmIdentifier algorithmIdentifier;
        private readonly DerBitString signature;

        private PopoSigningKey(Asn1Sequence seq)
        {
            int index = 0;

            if (seq[index] is Asn1TaggedObject)
            {
                Asn1TaggedObject tagObj
                    = (Asn1TaggedObject) seq[index++];
                if (tagObj.TagNo != 0)
                {
                    throw new ArgumentException( "Unknown PopoSigningKeyInput tag: " + tagObj.TagNo, "seq");
                }
                poposkInput = PopoSigningKeyInput.GetInstance(tagObj.GetObject());
            }
            algorithmIdentifier = AlgorithmIdentifier.GetInstance(seq[index++]);
            signature = DerBitString.GetInstance(seq[index]);
        }

        public static PopoSigningKey GetInstance(object obj)
        {
            if (obj is PopoSigningKey)
                return (PopoSigningKey)obj;

            if (obj is Asn1Sequence)
                return new PopoSigningKey((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public static PopoSigningKey GetInstance(Asn1TaggedObject obj, bool isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

        /**
         * Creates a new Proof of Possession object for a signing key.
         * @param poposkIn the PopoSigningKeyInput structure, or null if the
         *     CertTemplate includes both subject and publicKey values.
         * @param aid the AlgorithmIdentifier used to sign the proof of possession.
         * @param signature a signature over the DER-encoded value of poposkIn,
         *     or the DER-encoded value of certReq if poposkIn is null.
         */
        public PopoSigningKey(
            PopoSigningKeyInput poposkIn,
            AlgorithmIdentifier aid,
            DerBitString signature)
        {
            this.poposkInput = poposkIn;
            this.algorithmIdentifier = aid;
            this.signature = signature;
        }

        public virtual PopoSigningKeyInput PoposkInput
        {
            get { return poposkInput; }
        }

        public virtual AlgorithmIdentifier AlgorithmIdentifier
        {
            get { return algorithmIdentifier; }
        }

        public virtual DerBitString Signature
        {
            get { return signature; }
        }

        /**
         * <pre>
         * PopoSigningKey ::= SEQUENCE {
         *                      poposkInput           [0] PopoSigningKeyInput OPTIONAL,
         *                      algorithmIdentifier   AlgorithmIdentifier,
         *                      signature             BIT STRING }
         *  -- The signature (using "algorithmIdentifier") is on the
         *  -- DER-encoded value of poposkInput.  NOTE: If the CertReqMsg
         *  -- certReq CertTemplate contains the subject and publicKey values,
         *  -- then poposkInput MUST be omitted and the signature MUST be
         *  -- computed on the DER-encoded value of CertReqMsg certReq.  If
         *  -- the CertReqMsg certReq CertTemplate does not contain the public
         *  -- key and subject values, then poposkInput MUST be present and
         *  -- MUST be signed.  This strategy ensures that the public key is
         *  -- not present in both the poposkInput and CertReqMsg certReq
         *  -- CertTemplate fields.
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(false, 0, poposkInput);
            v.Add(algorithmIdentifier);
            v.Add(signature);
            return new DerSequence(v);
        }
    }
}
