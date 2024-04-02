using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 2246 6.2.1</summary>
    public abstract class ContentType
    {
        public const short change_cipher_spec = 20;
        public const short alert = 21;
        public const short handshake = 22;
        public const short application_data = 23;
        public const short heartbeat = 24;

        public static string GetName(short contentType)
        {
            switch (contentType)
            {
            case alert:
                return "alert";
            case application_data:
                return "application_data";
            case change_cipher_spec:
                return "change_cipher_spec";
            case handshake:
                return "handshake";
            case heartbeat:
                return "heartbeat";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short contentType)
        {
            return GetName(contentType) + "(" + contentType + ")";
        }
    }
}
