using System;

namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * packet giving signature creation time.
    */
    public class Exportable
        : SignatureSubpacket
    {
        private static byte[] BooleanToByteArray(bool val)
        {
            byte[]    data = new byte[1];

            if (val)
            {
                data[0] = 1;
                return data;
            }
            else
            {
                return data;
            }
        }

        public Exportable(
            bool    critical,
            bool    isLongLength,
            byte[]  data)
            : base(SignatureSubpacketTag.Exportable, critical, isLongLength, data)
        {
        }

        public Exportable(
            bool    critical,
            bool    isExportable)
            : base(SignatureSubpacketTag.Exportable, critical, false, BooleanToByteArray(isExportable))
        {
        }

        public bool IsExportable()
        {
            return data[0] != 0;
        }
    }
}
