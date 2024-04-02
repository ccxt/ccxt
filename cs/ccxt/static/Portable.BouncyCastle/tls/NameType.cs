using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class NameType
    {
        /*
         * RFC 3546 3.1.
         */
        public const short host_name = 0;

        public static string GetName(short nameType)
        {
            switch (nameType)
            {
            case host_name:
                return "host_name";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short nameType)
        {
            return GetName(nameType) + "(" + nameType + ")";
        }

        public static bool IsRecognized(short nameType)
        {
            return host_name == nameType;
        }

        public static bool IsValid(short nameType)
        {
            return TlsUtilities.IsValidUint8(nameType);
        }
    }
}
