using System;

using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
    public class PkiBody
        : Asn1Encodable, IAsn1Choice
    {
        public const int TYPE_INIT_REQ = 0;
        public const int TYPE_INIT_REP = 1;
        public const int TYPE_CERT_REQ = 2;
        public const int TYPE_CERT_REP = 3;
        public const int TYPE_P10_CERT_REQ = 4;
        public const int TYPE_POPO_CHALL = 5;
        public const int TYPE_POPO_REP = 6;
        public const int TYPE_KEY_UPDATE_REQ = 7;
        public const int TYPE_KEY_UPDATE_REP = 8;
        public const int TYPE_KEY_RECOVERY_REQ = 9;
        public const int TYPE_KEY_RECOVERY_REP = 10;
        public const int TYPE_REVOCATION_REQ = 11;
        public const int TYPE_REVOCATION_REP = 12;
        public const int TYPE_CROSS_CERT_REQ = 13;
        public const int TYPE_CROSS_CERT_REP = 14;
        public const int TYPE_CA_KEY_UPDATE_ANN = 15;
        public const int TYPE_CERT_ANN = 16;
        public const int TYPE_REVOCATION_ANN = 17;
        public const int TYPE_CRL_ANN = 18;
        public const int TYPE_CONFIRM = 19;
        public const int TYPE_NESTED = 20;
        public const int TYPE_GEN_MSG = 21;
        public const int TYPE_GEN_REP = 22;
        public const int TYPE_ERROR = 23;
        public const int TYPE_CERT_CONFIRM = 24;
        public const int TYPE_POLL_REQ = 25;
        public const int TYPE_POLL_REP = 26;

        private int tagNo;
        private Asn1Encodable body;

        public static PkiBody GetInstance(object obj)
        {
            if (obj is PkiBody)
                return (PkiBody)obj;

            if (obj is Asn1TaggedObject)
                return new PkiBody((Asn1TaggedObject)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        private PkiBody(Asn1TaggedObject tagged)
        {
            tagNo = tagged.TagNo;
            body = GetBodyForType(tagNo, tagged.GetObject());
        }

        /**
         * Creates a new PkiBody.
         * @param type one of the TYPE_* constants
         * @param content message content
         */
        public PkiBody(
            int type,
            Asn1Encodable content)
        {
            tagNo = type;
            body = GetBodyForType(type, content);
        }

        private static Asn1Encodable GetBodyForType(
            int type,
            Asn1Encodable o)
        {
            switch (type)
            {
                case TYPE_INIT_REQ:
                    return CertReqMessages.GetInstance(o);
	            case TYPE_INIT_REP:
	                return CertRepMessage.GetInstance(o);
                case TYPE_CERT_REQ:
                    return CertReqMessages.GetInstance(o);
	            case TYPE_CERT_REP:
	                return CertRepMessage.GetInstance(o);
	            case TYPE_P10_CERT_REQ:
	                return CertificationRequest.GetInstance(o);
	            case TYPE_POPO_CHALL:
	                return PopoDecKeyChallContent.GetInstance(o);
	            case TYPE_POPO_REP:
	                return PopoDecKeyRespContent.GetInstance(o);
                case TYPE_KEY_UPDATE_REQ:
                    return CertReqMessages.GetInstance(o);
	            case TYPE_KEY_UPDATE_REP:
	                return CertRepMessage.GetInstance(o);
                case TYPE_KEY_RECOVERY_REQ:
                    return CertReqMessages.GetInstance(o);
	            case TYPE_KEY_RECOVERY_REP:
	                return KeyRecRepContent.GetInstance(o);
	            case TYPE_REVOCATION_REQ:
	                return RevReqContent.GetInstance(o);
	            case TYPE_REVOCATION_REP:
	                return RevRepContent.GetInstance(o);
                case TYPE_CROSS_CERT_REQ:
                    return CertReqMessages.GetInstance(o);
	            case TYPE_CROSS_CERT_REP:
	                return CertRepMessage.GetInstance(o);
	            case TYPE_CA_KEY_UPDATE_ANN:
	                return CAKeyUpdAnnContent.GetInstance(o);
	            case TYPE_CERT_ANN:
	                return CmpCertificate.GetInstance(o);
	            case TYPE_REVOCATION_ANN:
	                return RevAnnContent.GetInstance(o);
	            case TYPE_CRL_ANN:
	                return CrlAnnContent.GetInstance(o);
	            case TYPE_CONFIRM:
	                return PkiConfirmContent.GetInstance(o);
                case TYPE_NESTED:
                    return PkiMessages.GetInstance(o);
	            case TYPE_GEN_MSG:
	                return GenMsgContent.GetInstance(o);
	            case TYPE_GEN_REP:
	                return GenRepContent.GetInstance(o);
	            case TYPE_ERROR:
	                return ErrorMsgContent.GetInstance(o);
	            case TYPE_CERT_CONFIRM:
	                return CertConfirmContent.GetInstance(o);
	            case TYPE_POLL_REQ:
	                return PollReqContent.GetInstance(o);
	            case TYPE_POLL_REP:
	                return PollRepContent.GetInstance(o);
	            default:
	                throw new ArgumentException("unknown tag number: " + type, "type");
            }
        }

        public virtual int Type
        {
            get { return tagNo; }
        }

        public virtual Asn1Encodable Content
        {
            get { return body; }
        }

        /**
         * <pre>
         * PkiBody ::= CHOICE {       -- message-specific body elements
         *        ir       [0]  CertReqMessages,        --Initialization Request
         *        ip       [1]  CertRepMessage,         --Initialization Response
         *        cr       [2]  CertReqMessages,        --Certification Request
         *        cp       [3]  CertRepMessage,         --Certification Response
         *        p10cr    [4]  CertificationRequest,   --imported from [PKCS10]
         *        popdecc  [5]  POPODecKeyChallContent, --pop Challenge
         *        popdecr  [6]  POPODecKeyRespContent,  --pop Response
         *        kur      [7]  CertReqMessages,        --Key Update Request
         *        kup      [8]  CertRepMessage,         --Key Update Response
         *        krr      [9]  CertReqMessages,        --Key Recovery Request
         *        krp      [10] KeyRecRepContent,       --Key Recovery Response
         *        rr       [11] RevReqContent,          --Revocation Request
         *        rp       [12] RevRepContent,          --Revocation Response
         *        ccr      [13] CertReqMessages,        --Cross-Cert. Request
         *        ccp      [14] CertRepMessage,         --Cross-Cert. Response
         *        ckuann   [15] CAKeyUpdAnnContent,     --CA Key Update Ann.
         *        cann     [16] CertAnnContent,         --Certificate Ann.
         *        rann     [17] RevAnnContent,          --Revocation Ann.
         *        crlann   [18] CRLAnnContent,          --CRL Announcement
         *        pkiconf  [19] PKIConfirmContent,      --Confirmation
         *        nested   [20] NestedMessageContent,   --Nested Message
         *        genm     [21] GenMsgContent,          --General Message
         *        genp     [22] GenRepContent,          --General Response
         *        error    [23] ErrorMsgContent,        --Error Message
         *        certConf [24] CertConfirmContent,     --Certificate confirm
         *        pollReq  [25] PollReqContent,         --Polling request
         *        pollRep  [26] PollRepContent          --Polling response
         * }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerTaggedObject(true, tagNo, body);
        }
    }
}
