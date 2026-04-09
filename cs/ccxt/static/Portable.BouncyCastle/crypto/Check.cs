using System;

namespace Org.BouncyCastle.Crypto
{
    internal class Check
    {
        internal static void DataLength(bool condition, string msg)
        {
            if (condition)
                throw new DataLengthException(msg);
        }

        internal static void DataLength(byte[] buf, int off, int len, string msg)
        {
            if (off > (buf.Length - len))
                throw new DataLengthException(msg);
        }

        internal static void OutputLength(byte[] buf, int off, int len, string msg)
        {
            if (off > (buf.Length - len))
                throw new OutputLengthException(msg);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal static void DataLength(ReadOnlySpan<byte> input, int len, string msg)
        {
            if (input.Length < len)
                throw new DataLengthException(msg);
        }

        internal static void OutputLength(Span<byte> output, int len, string msg)
        {
            if (output.Length < len)
                throw new OutputLengthException(msg);
        }
#endif
    }
}
