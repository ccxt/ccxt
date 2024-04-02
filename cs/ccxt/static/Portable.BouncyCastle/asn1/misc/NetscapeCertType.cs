using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.Misc
{
    /**
     * The NetscapeCertType object.
     * <pre>
     *    NetscapeCertType ::= BIT STRING {
     *         SSLClient               (0),
     *         SSLServer               (1),
     *         S/MIME                  (2),
     *         Object Signing          (3),
     *         Reserved                (4),
     *         SSL CA                  (5),
     *         S/MIME CA               (6),
     *         Object Signing CA       (7) }
     * </pre>
     */
    public class NetscapeCertType
        : DerBitString
    {
        public const int SslClient        = (1 << 7);
        public const int SslServer        = (1 << 6);
        public const int Smime            = (1 << 5);
        public const int ObjectSigning    = (1 << 4);
        public const int Reserved         = (1 << 3);
        public const int SslCA            = (1 << 2);
        public const int SmimeCA          = (1 << 1);
        public const int ObjectSigningCA  = (1 << 0);

		/**
         * Basic constructor.
         *
         * @param usage - the bitwise OR of the Key Usage flags giving the
         * allowed uses for the key.
         * e.g. (X509NetscapeCertType.sslCA | X509NetscapeCertType.smimeCA)
         */
        public NetscapeCertType(int usage)
			: base(usage)
        {
        }

		public NetscapeCertType(DerBitString usage)
			: base(usage.GetBytes(), usage.PadBits)
        {
        }

		public override string ToString()
        {
			byte[] data = GetBytes();
			return "NetscapeCertType: 0x" + (data[0] & 0xff).ToString("X");
        }
    }
}
