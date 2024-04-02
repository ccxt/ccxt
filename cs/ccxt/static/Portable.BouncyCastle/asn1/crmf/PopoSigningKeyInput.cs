using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class PopoSigningKeyInput
        : Asn1Encodable
    {
        private readonly GeneralName            sender;
        private readonly PKMacValue             publicKeyMac;
        private readonly SubjectPublicKeyInfo   publicKey;

        private PopoSigningKeyInput(Asn1Sequence seq)
        {
            Asn1Encodable authInfo = (Asn1Encodable)seq[0];

            if (authInfo is Asn1TaggedObject)
            {
                Asn1TaggedObject tagObj = (Asn1TaggedObject)authInfo;
                if (tagObj.TagNo != 0)
                {
                    throw new ArgumentException("Unknown authInfo tag: " + tagObj.TagNo, "seq");
                }
                sender = GeneralName.GetInstance(tagObj.GetObject());
            }
            else
            {
                publicKeyMac = PKMacValue.GetInstance(authInfo);
            }

            publicKey = SubjectPublicKeyInfo.GetInstance(seq[1]);
        }

        public static PopoSigningKeyInput GetInstance(object obj)
        {
            if (obj is PopoSigningKeyInput)
                return (PopoSigningKeyInput)obj;

            if (obj is Asn1Sequence)
                return new PopoSigningKeyInput((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        /** Creates a new PopoSigningKeyInput with sender name as authInfo. */
        public PopoSigningKeyInput(
            GeneralName sender,
            SubjectPublicKeyInfo spki)
        {
            this.sender = sender;
            this.publicKey = spki;
        }

        /** Creates a new PopoSigningKeyInput using password-based MAC. */
        public PopoSigningKeyInput(
            PKMacValue pkmac,
            SubjectPublicKeyInfo spki)
        {
            this.publicKeyMac = pkmac;
            this.publicKey = spki;
        }

        /** Returns the sender field, or null if authInfo is publicKeyMac */
        public virtual GeneralName Sender
        {
            get { return sender; }
        }

        /** Returns the publicKeyMac field, or null if authInfo is sender */
        public virtual PKMacValue PublicKeyMac
        {
            get { return publicKeyMac; }
        }

        public virtual SubjectPublicKeyInfo PublicKey
        {
            get { return publicKey; }
        }

        /**
         * <pre>
         * PopoSigningKeyInput ::= SEQUENCE {
         *        authInfo             CHOICE {
         *                                 sender              [0] GeneralName,
         *                                 -- used only if an authenticated identity has been
         *                                 -- established for the sender (e.g., a DN from a
         *                                 -- previously-issued and currently-valid certificate
         *                                 publicKeyMac        PKMacValue },
         *                                 -- used if no authenticated GeneralName currently exists for
         *                                 -- the sender; publicKeyMac contains a password-based MAC
         *                                 -- on the DER-encoded value of publicKey
         *        publicKey           SubjectPublicKeyInfo }  -- from CertTemplate
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();

            if (sender != null)
            {
                v.Add(new DerTaggedObject(false, 0, sender));
            }
            else
            {
                v.Add(publicKeyMac);
            }

            v.Add(publicKey);

            return new DerSequence(v);
        }
    }
}
