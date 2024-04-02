using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
    /**
     * Example InfoTypeAndValue contents include, but are not limited
     * to, the following (un-comment in this ASN.1 module and use as
     * appropriate for a given environment):
     * <pre>
     *   id-it-caProtEncCert    OBJECT IDENTIFIER ::= {id-it 1}
     *      CAProtEncCertValue      ::= CMPCertificate
     *   id-it-signKeyPairTypes OBJECT IDENTIFIER ::= {id-it 2}
     *     SignKeyPairTypesValue   ::= SEQUENCE OF AlgorithmIdentifier
     *   id-it-encKeyPairTypes  OBJECT IDENTIFIER ::= {id-it 3}
     *     EncKeyPairTypesValue    ::= SEQUENCE OF AlgorithmIdentifier
     *   id-it-preferredSymmAlg OBJECT IDENTIFIER ::= {id-it 4}
     *      PreferredSymmAlgValue   ::= AlgorithmIdentifier
     *   id-it-caKeyUpdateInfo  OBJECT IDENTIFIER ::= {id-it 5}
     *      CAKeyUpdateInfoValue    ::= CAKeyUpdAnnContent
     *   id-it-currentCRL       OBJECT IDENTIFIER ::= {id-it 6}
     *      CurrentCRLValue         ::= CertificateList
     *   id-it-unsupportedOIDs  OBJECT IDENTIFIER ::= {id-it 7}
     *      UnsupportedOIDsValue    ::= SEQUENCE OF OBJECT IDENTIFIER
     *   id-it-keyPairParamReq  OBJECT IDENTIFIER ::= {id-it 10}
     *      KeyPairParamReqValue    ::= OBJECT IDENTIFIER
     *   id-it-keyPairParamRep  OBJECT IDENTIFIER ::= {id-it 11}
     *      KeyPairParamRepValue    ::= AlgorithmIdentifer
     *   id-it-revPassphrase    OBJECT IDENTIFIER ::= {id-it 12}
     *      RevPassphraseValue      ::= EncryptedValue
     *   id-it-implicitConfirm  OBJECT IDENTIFIER ::= {id-it 13}
     *      ImplicitConfirmValue    ::= NULL
     *   id-it-confirmWaitTime  OBJECT IDENTIFIER ::= {id-it 14}
     *      ConfirmWaitTimeValue    ::= GeneralizedTime
     *   id-it-origPKIMessage   OBJECT IDENTIFIER ::= {id-it 15}
     *      OrigPKIMessageValue     ::= PKIMessages
     *   id-it-suppLangTags     OBJECT IDENTIFIER ::= {id-it 16}
     *      SuppLangTagsValue       ::= SEQUENCE OF UTF8String
     *
     * where
     *
     *   id-pkix OBJECT IDENTIFIER ::= {
     *      iso(1) identified-organization(3)
     *      dod(6) internet(1) security(5) mechanisms(5) pkix(7)}
     * and
     *      id-it   OBJECT IDENTIFIER ::= {id-pkix 4}
     * </pre>
     */
    public class InfoTypeAndValue
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier infoType;
        private readonly Asn1Encodable infoValue;

        private InfoTypeAndValue(Asn1Sequence seq)
        {
            infoType = DerObjectIdentifier.GetInstance(seq[0]);

            if (seq.Count > 1)
            {
                infoValue = (Asn1Encodable)seq[1];
            }
        }

        public static InfoTypeAndValue GetInstance(object obj)
        {
            if (obj is InfoTypeAndValue)
                return (InfoTypeAndValue)obj;

            if (obj is Asn1Sequence)
                return new InfoTypeAndValue((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public InfoTypeAndValue(
            DerObjectIdentifier infoType)
        {
            this.infoType = infoType;
            this.infoValue = null;
        }

        public InfoTypeAndValue(
            DerObjectIdentifier infoType,
            Asn1Encodable       optionalValue)
        {
            this.infoType = infoType;
            this.infoValue = optionalValue;
        }

        public virtual DerObjectIdentifier InfoType
        {
            get { return infoType; }
        }

        public virtual Asn1Encodable InfoValue
        {
            get { return infoValue; }
        }

        /**
         * <pre>
         * InfoTypeAndValue ::= SEQUENCE {
         *                         infoType               OBJECT IDENTIFIER,
         *                         infoValue              ANY DEFINED BY infoType  OPTIONAL
         * }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(infoType);
            v.AddOptional(infoValue);
            return new DerSequence(v);
        }
    }
}
