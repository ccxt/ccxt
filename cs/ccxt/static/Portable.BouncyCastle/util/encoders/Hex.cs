using System;
using System.IO;

namespace Org.BouncyCastle.Utilities.Encoders
{
    /// <summary>
    /// Class to decode and encode Hex.
    /// </summary>
    public sealed class Hex
    {
        private static readonly HexEncoder encoder = new HexEncoder();

        private Hex()
        {
        }

        public static string ToHexString(
            byte[] data)
        {
            return ToHexString(data, 0, data.Length);
        }

        public static string ToHexString(
            byte[]	data,
            int		off,
            int		length)
        {
            byte[] hex = Encode(data, off, length);
            return Strings.FromAsciiByteArray(hex);
        }

        /**
         * encode the input data producing a Hex encoded byte array.
         *
         * @return a byte array containing the Hex encoded data.
         */
        public static byte[] Encode(
            byte[] data)
        {
            return Encode(data, 0, data.Length);
        }

        /**
         * encode the input data producing a Hex encoded byte array.
         *
         * @return a byte array containing the Hex encoded data.
         */
        public static byte[] Encode(
            byte[]	data,
            int		off,
            int		length)
        {
            MemoryStream bOut = new MemoryStream(length * 2);

            encoder.Encode(data, off, length, bOut);

            return bOut.ToArray();
        }

        /**
         * Hex encode the byte data writing it to the given output stream.
         *
         * @return the number of bytes produced.
         */
        public static int Encode(
            byte[]	data,
            Stream	outStream)
        {
            return encoder.Encode(data, 0, data.Length, outStream);
        }

        /**
         * Hex encode the byte data writing it to the given output stream.
         *
         * @return the number of bytes produced.
         */
        public static int Encode(
            byte[]	data,
            int		off,
            int		length,
            Stream	outStream)
        {
            return encoder.Encode(data, off, length, outStream);
        }

        /**
         * decode the Hex encoded input data. It is assumed the input data is valid.
         *
         * @return a byte array representing the decoded data.
         */
        public static byte[] Decode(
            byte[] data)
        {
            MemoryStream bOut = new MemoryStream((data.Length + 1) / 2);

            encoder.Decode(data, 0, data.Length, bOut);

            return bOut.ToArray();
        }

        /**
         * decode the Hex encoded string data - whitespace will be ignored.
         *
         * @return a byte array representing the decoded data.
         */
        public static byte[] Decode(
            string data)
        {
            MemoryStream bOut = new MemoryStream((data.Length + 1) / 2);

            encoder.DecodeString(data, bOut);

            return bOut.ToArray();
        }

        /**
         * decode the Hex encoded string data writing it to the given output stream,
         * whitespace characters will be ignored.
         *
         * @return the number of bytes produced.
         */
        public static int Decode(
            string	data,
            Stream	outStream)
        {
            return encoder.DecodeString(data, outStream);
        }

        /**
         * Decode the hexadecimal-encoded string strictly i.e. any non-hexadecimal characters will be
         * considered an error.
         *
         * @return a byte array representing the decoded data.
         */
        public static byte[] DecodeStrict(string str)
        {
            return encoder.DecodeStrict(str, 0, str.Length);
        }

        /**
         * Decode the hexadecimal-encoded string strictly i.e. any non-hexadecimal characters will be
         * considered an error.
         *
         * @return a byte array representing the decoded data.
         */
        public static byte[] DecodeStrict(string str, int off, int len)
        {
            return encoder.DecodeStrict(str, off, len);
        }
    }
}
