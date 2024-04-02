using System;

namespace Org.BouncyCastle.Asn1.Cmp
{
    /**
     * <pre>
     * PKIFailureInfo ::= BIT STRING {
     * badAlg               (0),
     *   -- unrecognized or unsupported Algorithm Identifier
     * badMessageCheck      (1), -- integrity check failed (e.g., signature did not verify)
     * badRequest           (2),
     *   -- transaction not permitted or supported
     * badTime              (3), -- messageTime was not sufficiently close to the system time, as defined by local policy
     * badCertId            (4), -- no certificate could be found matching the provided criteria
     * badDataFormat        (5),
     *   -- the data submitted has the wrong format
     * wrongAuthority       (6), -- the authority indicated in the request is different from the one creating the response token
     * incorrectData        (7), -- the requester's data is incorrect (for notary services)
     * missingTimeStamp     (8), -- when the timestamp is missing but should be there (by policy)
     * badPOP               (9)  -- the proof-of-possession failed
     * certRevoked         (10),
     * certConfirmed       (11),
     * wrongIntegrity      (12),
     * badRecipientNonce   (13), 
     * timeNotAvailable    (14),
     *   -- the TSA's time source is not available
     * unacceptedPolicy    (15),
     *   -- the requested TSA policy is not supported by the TSA
     * unacceptedExtension (16),
     *   -- the requested extension is not supported by the TSA
     * addInfoNotAvailable (17)
     *   -- the additional information requested could not be understood
     *   -- or is not available
     * badSenderNonce      (18),
     * badCertTemplate     (19),
     * signerNotTrusted    (20),
     * transactionIdInUse  (21),
     * unsupportedVersion  (22),
     * notAuthorized       (23),
     * systemUnavail       (24),    
     * systemFailure       (25),
     *   -- the request cannot be handled due to system failure
     * duplicateCertReq    (26) 
     * </pre>
     */
	public class PkiFailureInfo
		: DerBitString
	{
        public const int BadAlg               = (1 << 7); // unrecognized or unsupported Algorithm Identifier
        public const int BadMessageCheck      = (1 << 6); // integrity check failed (e.g., signature did not verify)
        public const int BadRequest           = (1 << 5);
        public const int BadTime              = (1 << 4); // -- messageTime was not sufficiently close to the system time, as defined by local policy
        public const int BadCertId            = (1 << 3); // no certificate could be found matching the provided criteria
        public const int BadDataFormat        = (1 << 2);
        public const int WrongAuthority       = (1 << 1); // the authority indicated in the request is different from the one creating the response token
        public const int IncorrectData        = 1;        // the requester's data is incorrect (for notary services)
        public const int MissingTimeStamp     = (1 << 15); // when the timestamp is missing but should be there (by policy)
        public const int BadPop               = (1 << 14); // the proof-of-possession failed
        public const int CertRevoked          = (1 << 13);
        public const int CertConfirmed        = (1 << 12);
        public const int WrongIntegrity       = (1 << 11);
        public const int BadRecipientNonce    = (1 << 10);
        public const int TimeNotAvailable     = (1 << 9); // the TSA's time source is not available
        public const int UnacceptedPolicy     = (1 << 8); // the requested TSA policy is not supported by the TSA
        public const int UnacceptedExtension  = (1 << 23); //the requested extension is not supported by the TSA
        public const int AddInfoNotAvailable  = (1 << 22); //the additional information requested could not be understood or is not available
        public const int BadSenderNonce       = (1 << 21);
        public const int BadCertTemplate      = (1 << 20);
        public const int SignerNotTrusted     = (1 << 19);
        public const int TransactionIdInUse   = (1 << 18);
        public const int UnsupportedVersion   = (1 << 17);
        public const int NotAuthorized        = (1 << 16);
        public const int SystemUnavail        = (1 << 31);
        public const int SystemFailure        = (1 << 30); //the request cannot be handled due to system failure
        public const int DuplicateCertReq     = (1 << 29);

        /**
		 * Basic constructor.
		 */
		public PkiFailureInfo(int info)
			: base(info)
		{
		}

		public PkiFailureInfo(
			DerBitString info)
			: base(info.GetBytes(), info.PadBits)
		{
		}

		public override string ToString()
		{
			return "PkiFailureInfo: 0x" + this.IntValue.ToString("X");
		}
	}
}
