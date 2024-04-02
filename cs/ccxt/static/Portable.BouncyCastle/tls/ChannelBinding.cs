using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 5056</summary>
    /// <remarks>
    /// Note that the values here are implementation-specific and arbitrary. It is recommended not to depend on the
    /// particular values (e.g.serialization).
    /// </remarks>
    public abstract class ChannelBinding
    {
        /*
         * RFC 5929
         */
        public const int tls_server_end_point = 0;
        public const int tls_unique = 1;
        public const int tls_unique_for_telnet = 2;

        /*
         * RFC 9266
         */
        public const int tls_exporter = 3;
    }
}
