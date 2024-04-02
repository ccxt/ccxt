using System;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class OcspResponseStatus
        : DerEnumerated
    {
        public const int Successful = 0;
        public const int MalformedRequest = 1;
        public const int InternalError = 2;
        public const int TryLater = 3;
        public const int SignatureRequired = 5;
        public const int Unauthorized = 6;

		/**
         * The OcspResponseStatus enumeration.
         * <pre>
         * OcspResponseStatus ::= Enumerated {
         *     successful            (0),  --Response has valid confirmations
         *     malformedRequest      (1),  --Illegal confirmation request
         *     internalError         (2),  --Internal error in issuer
         *     tryLater              (3),  --Try again later
         *                                 --(4) is not used
         *     sigRequired           (5),  --Must sign the request
         *     unauthorized          (6)   --Request unauthorized
         * }
         * </pre>
         */
        public OcspResponseStatus(int value)
			: base(value)
        {
        }

		public OcspResponseStatus(DerEnumerated value)
            : base(value.IntValueExact)
        {
        }
    }
}
