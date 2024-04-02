using System;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
    /// <remarks>Padding functions.</remarks>
    public sealed class PgpPad
    {
        private PgpPad()
        {
        }

        public static byte[] PadSessionData(byte[] sessionInfo)
        {
            return PadSessionData(sessionInfo, true);
        }

        public static byte[] PadSessionData(byte[] sessionInfo, bool obfuscate)
        {
            int length = sessionInfo.Length;
            int paddedLength = ((length >> 3) + 1) << 3;

            if (obfuscate)
            {
                paddedLength = System.Math.Max(40, paddedLength);
            }

            int padCount = paddedLength - length;
            byte padByte = (byte)padCount;

            byte[] result = new byte[paddedLength];
            Array.Copy(sessionInfo, 0, result, 0, length);
            for (int i = length; i < paddedLength; ++i)
            {
                result[i] = padByte;
            }
            return result;
        }

        public static byte[] UnpadSessionData(byte[] encoded)
        {
            int paddedLength = encoded.Length;
            byte padByte = encoded[paddedLength - 1];
            int padCount = padByte;
            int length = paddedLength - padCount;
            int last = length - 1;

            int diff = 0;
            for (int i = 0; i < paddedLength; ++i)
            {
                int mask = (last - i) >> 31;
                diff |= (padByte ^ encoded[i]) & mask;
            }

            diff |= paddedLength & 7;
            diff |= (40 - paddedLength) >> 31;

            if (diff != 0)
                throw new PgpException("bad padding found in session data");

            byte[] result = new byte[length];
            Array.Copy(encoded, 0, result, 0, length);
            return result;
        }
    }
}
