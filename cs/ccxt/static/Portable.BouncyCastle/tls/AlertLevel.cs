using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 5246 7.2</summary>
    public abstract class AlertLevel
    {
        public const short warning = 1;
        public const short fatal = 2;

        public static string GetName(short alertDescription)
        {
            switch (alertDescription)
            {
            case warning:
                return "warning";
            case fatal:
                return "fatal";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short alertDescription)
        {
            return GetName(alertDescription) + "(" + alertDescription + ")";
        }
    }
}
