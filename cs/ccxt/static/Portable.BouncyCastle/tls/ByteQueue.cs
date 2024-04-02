using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>A queue for bytes. This file could be more optimized.</summary>
    public sealed class ByteQueue
    {
        /// <returns>The smallest number which can be written as 2^x which is bigger than i.</returns>
        public static int NextTwoPow(int i)
        {
            /*
             * This code is based of a lot of code I found on the Internet which mostly
             * referenced a book called "Hacking delight".
             */
            i |= i >> 1;
            i |= i >> 2;
            i |= i >> 4;
            i |= i >> 8;
            i |= i >> 16;
            return i + 1;
        }

        /// <summary>The buffer where we store our data.</summary>
        private byte[] m_databuf;

        /// <summary>How many bytes at the beginning of the buffer are skipped.</summary>
        private int m_skipped = 0;

        /// <summary>How many bytes in the buffer are valid data.</summary>
        private int m_available = 0;

        private bool m_readOnlyBuf = false;

        public ByteQueue()
            : this(0)
        {
        }

        public ByteQueue(int capacity)
        {
            this.m_databuf = capacity == 0 ? TlsUtilities.EmptyBytes : new byte[capacity];
        }

        public ByteQueue(byte[] buf, int off, int len)
        {
            this.m_databuf = buf;
            this.m_skipped = off;
            this.m_available = len;
            this.m_readOnlyBuf = true;
        }

        /// <summary>Add some data to our buffer.</summary>
        /// <param name="buf">A byte-array to read data from.</param>
        /// <param name="off">How many bytes to skip at the beginning of the array.</param>
        /// <param name="len">How many bytes to read from the array.</param>
        public void AddData(byte[] buf, int off, int len)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            AddData(buf.AsSpan(off, len));
#else
            if (m_readOnlyBuf)
                throw new InvalidOperationException("Cannot add data to read-only buffer");

            if (m_available == 0)
            {
                if (len > m_databuf.Length)
                {
                    int desiredSize = NextTwoPow(len | 256);
                    m_databuf = new byte[desiredSize];
                }
                m_skipped = 0;
            }
            else if ((m_skipped + m_available + len) > m_databuf.Length)
            {
                int desiredSize = NextTwoPow(m_available + len);
                if (desiredSize > m_databuf.Length)
                {
                    byte[] tmp = new byte[desiredSize];
                    Array.Copy(m_databuf, m_skipped, tmp, 0, m_available);
                    m_databuf = tmp;
                }
                else
                {
                    Array.Copy(m_databuf, m_skipped, m_databuf, 0, m_available);
                }
                m_skipped = 0;
            }

            Array.Copy(buf, off, m_databuf, m_skipped + m_available, len);
            m_available += len;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void AddData(ReadOnlySpan<byte> buffer)
        {
            if (m_readOnlyBuf)
                throw new InvalidOperationException("Cannot add data to read-only buffer");

            int len = buffer.Length;
            if (m_available == 0)
            {
                if (len > m_databuf.Length)
                {
                    int desiredSize = NextTwoPow(len | 256);
                    m_databuf = new byte[desiredSize];
                }
                m_skipped = 0;
            }
            else if ((m_skipped + m_available + len) > m_databuf.Length)
            {
                int desiredSize = NextTwoPow(m_available + len);
                if (desiredSize > m_databuf.Length)
                {
                    byte[] tmp = new byte[desiredSize];
                    Array.Copy(m_databuf, m_skipped, tmp, 0, m_available);
                    m_databuf = tmp;
                }
                else
                {
                    Array.Copy(m_databuf, m_skipped, m_databuf, 0, m_available);
                }
                m_skipped = 0;
            }

            buffer.CopyTo(m_databuf.AsSpan(m_skipped + m_available));
            m_available += len;
        }
#endif

        /// <returns>The number of bytes which are available in this buffer.</returns>
        public int Available
        {
            get { return m_available; }
        }

        /// <summary>Copy some bytes from the beginning of the data to the provided <see cref="Stream"/>.</summary>
        /// <param name="output">The <see cref="Stream"/> to copy the bytes to.</param>
        /// <param name="length">How many bytes to copy.</param>
        public void CopyTo(Stream output, int length)
        {
            if (length > m_available)
                throw new InvalidOperationException("Cannot copy " + length + " bytes, only got " + m_available);

            output.Write(m_databuf, m_skipped, length);
        }

        /// <summary>Read data from the buffer.</summary>
        /// <param name="buf">The buffer where the read data will be copied to.</param>
        /// <param name="offset">How many bytes to skip at the beginning of buf.</param>
        /// <param name="len">How many bytes to read at all.</param>
        /// <param name="skip">How many bytes from our data to skip.</param>
        public void Read(byte[] buf, int offset, int len, int skip)
        {
            if ((buf.Length - offset) < len)
            {
                throw new ArgumentException("Buffer size of " + buf.Length
                    + " is too small for a read of " + len + " bytes");
            }
            if ((m_available - skip) < len)
            {
                throw new InvalidOperationException("Not enough data to read");
            }
            Array.Copy(m_databuf, m_skipped + skip, buf, offset, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void Read(Span<byte> buffer, int skip)
        {
            if ((m_available - skip) < buffer.Length)
                throw new InvalidOperationException("Not enough data to read");

            m_databuf.AsSpan(m_skipped + skip, buffer.Length).CopyTo(buffer);
        }
#endif

        /// <summary>Return a <see cref="HandshakeMessageInput"/> over some bytes at the beginning of the data.
        /// </summary>
        /// <param name="length">How many bytes will be readable.</param>
        /// <returns>A <see cref="HandshakeMessageInput"/> over the data.</returns>
        internal HandshakeMessageInput ReadHandshakeMessage(int length)
        {
            if (length > m_available)
                throw new InvalidOperationException("Cannot read " + length + " bytes, only got " + m_available);

            int position = m_skipped;

            m_available -= length;
            m_skipped += length;

            return new HandshakeMessageInput(m_databuf, position, length);
        }

        public int ReadInt32()
        {
            if (m_available < 4)
                throw new InvalidOperationException("Not enough data to read");

            return TlsUtilities.ReadInt32(m_databuf, m_skipped);
        }

        public int ReadUint16(int skip)
        {
            if (m_available < skip + 2)
                throw new InvalidOperationException("Not enough data to read");

            return TlsUtilities.ReadUint16(m_databuf, m_skipped + skip);
        }

        /// <summary>Remove some bytes from our data from the beginning.</summary>
        /// <param name="i">How many bytes to remove.</param>
        public void RemoveData(int i)
        {
            if (i > m_available)
                throw new InvalidOperationException("Cannot remove " + i + " bytes, only got " + m_available);

            /*
             * Skip the data.
             */
            m_available -= i;
            m_skipped += i;
        }

        /// <summary>Remove data from the buffer.</summary>
        /// <param name="buf">The buffer where the removed data will be copied to.</param>
        /// <param name="off">How many bytes to skip at the beginning of buf.</param>
        /// <param name="len">How many bytes to read at all.</param>
        /// <param name="skip">How many bytes from our data to skip.</param>
        public void RemoveData(byte[] buf, int off, int len, int skip)
        {
            Read(buf, off, len, skip);
            RemoveData(skip + len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void RemoveData(Span<byte> buffer, int skip)
        {
            Read(buffer, skip);
            RemoveData(skip + buffer.Length);
        }
#endif

        public byte[] RemoveData(int len, int skip)
        {
            byte[] buf = new byte[len];
            RemoveData(buf, 0, len, skip);
            return buf;
        }

        public void Shrink()
        {
            if (m_available == 0)
            {
                m_databuf = TlsUtilities.EmptyBytes;
                m_skipped = 0;
            }
            else
            {
                int desiredSize = NextTwoPow(m_available);
                if (desiredSize < m_databuf.Length)
                {
                    byte[] tmp = new byte[desiredSize];
                    Array.Copy(m_databuf, m_skipped, tmp, 0, m_available);
                    m_databuf = tmp;
                    m_skipped = 0;
                }
            }
        }
    }
}
