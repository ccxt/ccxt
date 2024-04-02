using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
    public class PkiHeader
        : Asn1Encodable
    {
        /**
         * Value for a "null" recipient or sender.
         */
        public static readonly GeneralName NULL_NAME = new GeneralName(X509Name.GetInstance(new DerSequence()));

        public static readonly int CMP_1999 = 1;
        public static readonly int CMP_2000 = 2;

        private readonly DerInteger pvno;
        private readonly GeneralName sender;
        private readonly GeneralName recipient;
        private readonly DerGeneralizedTime messageTime;
        private readonly AlgorithmIdentifier protectionAlg;
        private readonly Asn1OctetString senderKID;       // KeyIdentifier
        private readonly Asn1OctetString recipKID;        // KeyIdentifier
        private readonly Asn1OctetString transactionID;
        private readonly Asn1OctetString senderNonce;
        private readonly Asn1OctetString recipNonce;
        private readonly PkiFreeText freeText;
        private readonly Asn1Sequence generalInfo;

        private PkiHeader(Asn1Sequence seq)
        {
            pvno = DerInteger.GetInstance(seq[0]);
            sender = GeneralName.GetInstance(seq[1]);
            recipient = GeneralName.GetInstance(seq[2]);

            for (int pos = 3; pos < seq.Count; ++pos)
            {
                Asn1TaggedObject tObj = (Asn1TaggedObject)seq[pos];

                switch (tObj.TagNo)
                {
                    case 0:
                        messageTime = DerGeneralizedTime.GetInstance(tObj, true);
                        break;
                    case 1:
                        protectionAlg = AlgorithmIdentifier.GetInstance(tObj, true);
                        break;
                    case 2:
                        senderKID = Asn1OctetString.GetInstance(tObj, true);
                        break;
                    case 3:
                        recipKID = Asn1OctetString.GetInstance(tObj, true);
                        break;
                    case 4:
                        transactionID = Asn1OctetString.GetInstance(tObj, true);
                        break;
                    case 5:
                        senderNonce = Asn1OctetString.GetInstance(tObj, true);
                        break;
                    case 6:
                        recipNonce = Asn1OctetString.GetInstance(tObj, true);
                        break;
                    case 7:
                        freeText = PkiFreeText.GetInstance(tObj, true);
                        break;
                    case 8:
                        generalInfo = Asn1Sequence.GetInstance(tObj, true);
                        break;
                    default:
                        throw new ArgumentException("unknown tag number: " + tObj.TagNo, "seq");
                }
            }
        }

        public static PkiHeader GetInstance(object obj)
        {
            if (obj is PkiHeader)
                return (PkiHeader)obj;

            if (obj is Asn1Sequence)
                return new PkiHeader((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public PkiHeader(
            int pvno,
            GeneralName sender,
            GeneralName recipient)
            : this(new DerInteger(pvno), sender, recipient)
        {
        }

        private PkiHeader(
            DerInteger pvno,
            GeneralName sender,
            GeneralName recipient)
        {
            this.pvno = pvno;
            this.sender = sender;
            this.recipient = recipient;
        }

        public virtual DerInteger Pvno
        {
            get { return pvno; }
        }

        public virtual GeneralName Sender
        {
            get { return sender; }
        }

        public virtual GeneralName Recipient
        {
            get { return recipient; }
        }

        public virtual DerGeneralizedTime MessageTime
        {
            get { return messageTime; }
        }

        public virtual AlgorithmIdentifier ProtectionAlg
        {
            get { return protectionAlg; }
        }

        public virtual Asn1OctetString SenderKID
        {   
            get { return senderKID; }
        }

        public virtual Asn1OctetString RecipKID
        {   
            get { return recipKID; }
        }

        public virtual Asn1OctetString TransactionID
        {   
            get { return transactionID; }
        }

        public virtual Asn1OctetString SenderNonce
        {   
            get { return senderNonce; }
        }

        public virtual Asn1OctetString RecipNonce
        {   
            get { return recipNonce; }
        }

        public virtual PkiFreeText FreeText
        {
            get { return freeText; }
        }

        public virtual InfoTypeAndValue[] GetGeneralInfo()
        {
            if (generalInfo == null)
            {
                return null;
            }
            InfoTypeAndValue[] results = new InfoTypeAndValue[generalInfo.Count];
            for (int i = 0; i < results.Length; i++)
            {
                results[i] = InfoTypeAndValue.GetInstance(generalInfo[i]);
            }
            return results;
        }

        /**
         * <pre>
         *  PkiHeader ::= SEQUENCE {
         *            pvno                INTEGER     { cmp1999(1), cmp2000(2) },
         *            sender              GeneralName,
         *            -- identifies the sender
         *            recipient           GeneralName,
         *            -- identifies the intended recipient
         *            messageTime     [0] GeneralizedTime         OPTIONAL,
         *            -- time of production of this message (used when sender
         *            -- believes that the transport will be "suitable"; i.e.,
         *            -- that the time will still be meaningful upon receipt)
         *            protectionAlg   [1] AlgorithmIdentifier     OPTIONAL,
         *            -- algorithm used for calculation of protection bits
         *            senderKID       [2] KeyIdentifier           OPTIONAL,
         *            recipKID        [3] KeyIdentifier           OPTIONAL,
         *            -- to identify specific keys used for protection
         *            transactionID   [4] OCTET STRING            OPTIONAL,
         *            -- identifies the transaction; i.e., this will be the same in
         *            -- corresponding request, response, certConf, and PKIConf
         *            -- messages
         *            senderNonce     [5] OCTET STRING            OPTIONAL,
         *            recipNonce      [6] OCTET STRING            OPTIONAL,
         *            -- nonces used to provide replay protection, senderNonce
         *            -- is inserted by the creator of this message; recipNonce
         *            -- is a nonce previously inserted in a related message by
         *            -- the intended recipient of this message
         *            freeText        [7] PKIFreeText             OPTIONAL,
         *            -- this may be used to indicate context-specific instructions
         *            -- (this field is intended for human consumption)
         *            generalInfo     [8] SEQUENCE SIZE (1..MAX) OF
         *                                 InfoTypeAndValue     OPTIONAL
         *            -- this may be used to convey context-specific information
         *            -- (this field not primarily intended for human consumption)
         * }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(pvno, sender, recipient);
            v.AddOptionalTagged(true, 0, messageTime);
            v.AddOptionalTagged(true, 1, protectionAlg);
            v.AddOptionalTagged(true, 2, senderKID);
            v.AddOptionalTagged(true, 3, recipKID);
            v.AddOptionalTagged(true, 4, transactionID);
            v.AddOptionalTagged(true, 5, senderNonce);
            v.AddOptionalTagged(true, 6, recipNonce);
            v.AddOptionalTagged(true, 7, freeText);
            v.AddOptionalTagged(true, 8, generalInfo);
            return new DerSequence(v);
        }
    }
}
