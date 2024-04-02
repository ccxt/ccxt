using System;

using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    /**
     * Password-based MAC value for use with POPOSigningKeyInput.
     */
    public class PKMacValue
        : Asn1Encodable
    {
        private readonly AlgorithmIdentifier  algID;
        private readonly DerBitString         macValue;

        private PKMacValue(Asn1Sequence seq)
        {
            this.algID = AlgorithmIdentifier.GetInstance(seq[0]);
            this.macValue = DerBitString.GetInstance(seq[1]);
        }

        public static PKMacValue GetInstance(object obj)
        {
            if (obj is PKMacValue)
                return (PKMacValue)obj;

            if (obj is Asn1Sequence)
                return new PKMacValue((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public static PKMacValue GetInstance(Asn1TaggedObject obj, bool isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

        /**
         * Creates a new PKMACValue.
         * @param params parameters for password-based MAC
         * @param value MAC of the DER-encoded SubjectPublicKeyInfo
         */
        public PKMacValue(
            PbmParameter pbmParams,
            DerBitString macValue)
            : this(new AlgorithmIdentifier(CmpObjectIdentifiers.passwordBasedMac, pbmParams), macValue)
        {
        }

        /**
         * Creates a new PKMACValue.
         * @param aid CMPObjectIdentifiers.passwordBasedMAC, with PBMParameter
         * @param value MAC of the DER-encoded SubjectPublicKeyInfo
         */
        public PKMacValue(
            AlgorithmIdentifier algID,
            DerBitString        macValue)
        {
            this.algID = algID;
            this.macValue = macValue;
        }

        public virtual AlgorithmIdentifier AlgID
        {
            get { return algID; }
        }

        public virtual DerBitString MacValue
        {
            get { return macValue; }
        }

        /**
         * <pre>
         * PKMACValue ::= SEQUENCE {
         *      algId  AlgorithmIdentifier,
         *      -- algorithm value shall be PasswordBasedMac 1.2.840.113533.7.66.13
         *      -- parameter value is PBMParameter
         *      value  BIT STRING }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(algID, macValue);
        }
    }
}
