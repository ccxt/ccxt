using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 6066</summary>
    public abstract class IdentifierType
    {
        public const short pre_agreed = 0;
        public const short key_sha1_hash = 1;
        public const short x509_name = 2;
        public const short cert_sha1_hash = 3;

        public static string GetName(short identifierType)
        {
            switch (identifierType)
            {
            case pre_agreed:
                return "pre_agreed";
            case key_sha1_hash:
                return "key_sha1_hash";
            case x509_name:
                return "x509_name";
            case cert_sha1_hash:
                return "cert_sha1_hash";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short identifierType)
        {
            return GetName(identifierType) + "(" + identifierType + ")";
        }
    }
}
