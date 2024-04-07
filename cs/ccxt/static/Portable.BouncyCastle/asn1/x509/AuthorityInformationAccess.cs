using System;
using System.Text;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The AuthorityInformationAccess object.
     * <pre>
     * id-pe-authorityInfoAccess OBJECT IDENTIFIER ::= { id-pe 1 }
     *
     * AuthorityInfoAccessSyntax  ::=
     *      Sequence SIZE (1..MAX) OF AccessDescription
     * AccessDescription  ::=  Sequence {
     *       accessMethod          OBJECT IDENTIFIER,
     *       accessLocation        GeneralName  }
     *
     * id-ad OBJECT IDENTIFIER ::= { id-pkix 48 }
     * id-ad-caIssuers OBJECT IDENTIFIER ::= { id-ad 2 }
     * id-ad-ocsp OBJECT IDENTIFIER ::= { id-ad 1 }
     * </pre>
     */
    public class AuthorityInformationAccess
        : Asn1Encodable
    {
        private static AccessDescription[] Copy(AccessDescription[] descriptions)
        {
            return (AccessDescription[])descriptions.Clone();
        }

        public static AuthorityInformationAccess GetInstance(object obj)
        {
            if (obj is AuthorityInformationAccess)
                return (AuthorityInformationAccess)obj;
            if (obj == null)
                return null;
            return new AuthorityInformationAccess(Asn1Sequence.GetInstance(obj));
        }

        public static AuthorityInformationAccess FromExtensions(X509Extensions extensions)
        {
            return GetInstance(X509Extensions.GetExtensionParsedValue(extensions, X509Extensions.AuthorityInfoAccess));
        }

        private readonly AccessDescription[] descriptions;

        private AuthorityInformationAccess(
            Asn1Sequence seq)
        {
            if (seq.Count < 1)
                throw new ArgumentException("sequence may not be empty");

            this.descriptions = new AccessDescription[seq.Count];

            for (int i = 0; i < seq.Count; ++i)
            {
                descriptions[i] = AccessDescription.GetInstance(seq[i]);
            }
        }

        public AuthorityInformationAccess(
            AccessDescription description)
        {
            this.descriptions = new AccessDescription[]{ description };
        }

        public AuthorityInformationAccess(
            AccessDescription[] descriptions)
        {
            this.descriptions = Copy(descriptions);
        }

        /**
         * create an AuthorityInformationAccess with the oid and location provided.
         */
        public AuthorityInformationAccess(DerObjectIdentifier oid, GeneralName location)
            : this(new AccessDescription(oid, location))
        {
        }

        public AccessDescription[] GetAccessDescriptions()
        {
            return Copy(descriptions);
        }

        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(descriptions);
        }

        public override string ToString()
        {
            //return "AuthorityInformationAccess: Oid(" + this.descriptions[0].AccessMethod.Id + ")";

            StringBuilder buf = new StringBuilder();
            buf.AppendLine("AuthorityInformationAccess:");
            foreach (AccessDescription description in descriptions)
            {
                buf.Append("    ")
                   .Append(description)
                   .AppendLine();
            }
            return buf.ToString();
        }
    }
}
