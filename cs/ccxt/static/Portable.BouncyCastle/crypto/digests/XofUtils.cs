using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    internal class XofUtilities
    {
        internal static byte[] LeftEncode(long strLen)
        {
            byte n = 1;

            long v = strLen;
            while ((v >>= 8) != 0)
            {
                n++;
            }

            byte[] b = new byte[n + 1];

            b[0] = n;

            for (int i = 1; i <= n; i++)
            {
                b[i] = (byte)(strLen >> (8 * (n - i)));
            }

            return b;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal static int LeftEncode(long length, Span<byte> lengthEncoding)
        {
            byte n = 1;

            long v = length;
            while ((v >>= 8) != 0)
            {
                n++;
            }

            lengthEncoding[0] = n;
            for (int i = 1; i <= n; i++)
            {
                lengthEncoding[i] = (byte)(length >> (8 * (n - i)));
            }
            return 1 + n;
        }
#endif

        internal static byte[] RightEncode(long strLen)
        {
            byte n = 1;

            long v = strLen;
            while ((v >>= 8) != 0)
            {
                n++;
            }

            byte[] b = new byte[n + 1];

            b[n] = n;

            for (int i = 0; i < n; i++)
            {
                b[i] = (byte)(strLen >> (8 * (n - i - 1)));
            }

            return b;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal static int RightEncode(long length, Span<byte> lengthEncoding)
        {
            byte n = 1;

            long v = length;
            while ((v >>= 8) != 0)
            {
                n++;
            }

            lengthEncoding[n] = n;
            for (int i = 0; i < n; i++)
            {
                lengthEncoding[i] = (byte)(length >> (8 * (n - i - 1)));
            }
            return n + 1;
        }
#endif

        internal static byte[] Encode(byte X)
        {
            return Arrays.Concatenate(LeftEncode(8), new byte[] { X });
        }

        internal static byte[] Encode(byte[] inBuf, int inOff, int len)
        {
            if (inBuf.Length == len)
            {
                return Arrays.Concatenate(LeftEncode(len * 8), inBuf);
            }
            return Arrays.Concatenate(LeftEncode(len * 8), Arrays.CopyOfRange(inBuf, inOff, inOff + len));
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal static void EncodeTo(IDigest digest, ReadOnlySpan<byte> buf)
        {
            Span<byte> lengthEncoding = stackalloc byte[9];
            int count = LeftEncode(buf.Length * 8, lengthEncoding);
            digest.BlockUpdate(lengthEncoding[..count]);
            digest.BlockUpdate(buf);
        }
#endif
    }
}
