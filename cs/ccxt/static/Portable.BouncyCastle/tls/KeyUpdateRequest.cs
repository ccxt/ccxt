using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 8446 4.6.3</summary>
    public abstract class KeyUpdateRequest
    {
        public const short update_not_requested = 0;
        public const short update_requested = 1;

        public static string GetName(short keyUpdateRequest)
        {
            switch (keyUpdateRequest)
            {
            case update_not_requested:
                return "update_not_requested";
            case update_requested:
                return "update_requested";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short keyUpdateRequest)
        {
            return GetName(keyUpdateRequest) + "(" + keyUpdateRequest + ")";
        }

        public static bool IsValid(short keyUpdateRequest)
        {
            return keyUpdateRequest >= update_not_requested && keyUpdateRequest <= update_requested;
        }
    }
}
