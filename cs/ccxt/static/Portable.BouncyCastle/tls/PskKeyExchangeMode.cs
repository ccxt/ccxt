using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class PskKeyExchangeMode
    {
        /*
         * RFC 8446
         */

        public const short psk_ke = 0;
        public const short psk_dhe_ke = 1;

        public static string GetName(short pskKeyExchangeMode)
        {
            switch (pskKeyExchangeMode)
            {
            case psk_ke:
                return "psk_ke";
            case psk_dhe_ke:
                return "psk_dhe_ke";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short pskKeyExchangeMode)
        {
            return GetName(pskKeyExchangeMode) + "(" + pskKeyExchangeMode + ")";
        }
    }
}
