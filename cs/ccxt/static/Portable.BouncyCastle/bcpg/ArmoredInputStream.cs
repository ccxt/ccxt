using System.Collections.Generic;
using System.IO;
using System.Text;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg
{
    /**
     * reader for Base64 armored objects - read the headers and then start returning
     * bytes when the data is reached. An IOException is thrown if the CRC check
     * is detected and fails.
     * <p>
     * By default a missing CRC will not cause an exception. To force CRC detection use:
     * <pre>
     *     ArmoredInputStream aIn = ...
     *
     *     aIn.setDetectMissingCRC(true);
     * </pre>
     * </p>
     */
    public class ArmoredInputStream
        : BaseInputStream
    {
        /*
        * set up the decoding table.
        */
        private readonly static byte[] decodingTable;
        static ArmoredInputStream()
        {
            decodingTable = new byte[128];
            Arrays.Fill(decodingTable, 0xff);
            for (int i = 'A'; i <= 'Z'; i++)
            {
                decodingTable[i] = (byte)(i - 'A');
            }
            for (int i = 'a'; i <= 'z'; i++)
            {
                decodingTable[i] = (byte)(i - 'a' + 26);
            }
            for (int i = '0'; i <= '9'; i++)
            {
                decodingTable[i] = (byte)(i - '0' + 52);
            }
            decodingTable['+'] = 62;
            decodingTable['/'] = 63;
        }

        /**
        * decode the base 64 encoded input data.
        *
        * @return the offset the data starts in out.
        */
        private static int Decode(int in0, int in1, int in2, int in3, int[] result)
        {
            if (in3 < 0)
                throw new EndOfStreamException("unexpected end of file in armored stream.");

            int b1, b2, b3, b4;
            if (in2 == '=')
            {
                b1 = decodingTable[in0];
                b2 = decodingTable[in1];
                if ((b1 | b2) >= 128)
                    throw new IOException("invalid armor");

                result[2] = ((b1 << 2) | (b2 >> 4)) & 0xff;
                return 2;
            }
            else if (in3 == '=')
            {
                b1 = decodingTable[in0];
                b2 = decodingTable[in1];
                b3 = decodingTable[in2];
                if ((b1 | b2 | b3) >= 128)
                    throw new IOException("invalid armor");

                result[1] = ((b1 << 2) | (b2 >> 4)) & 0xff;
                result[2] = ((b2 << 4) | (b3 >> 2)) & 0xff;
                return 1;
            }
            else
            {
                b1 = decodingTable[in0];
                b2 = decodingTable[in1];
                b3 = decodingTable[in2];
                b4 = decodingTable[in3];
                if ((b1 | b2 | b3 | b4) >= 128)
                    throw new IOException("invalid armor");

                result[0] = ((b1 << 2) | (b2 >> 4)) & 0xff;
                result[1] = ((b2 << 4) | (b3 >> 2)) & 0xff;
                result[2] = ((b3 << 6) | b4) & 0xff;
                return 0;
            }
        }

        /*
         * Ignore missing CRC checksums.
         * https://tests.sequoia-pgp.org/#ASCII_Armor suggests that missing CRC sums do not invalidate the message.
         */
        private bool detectMissingChecksum = false;

        Stream      input;
        bool        start = true;
        int[]       outBuf = new int[3];
        int         bufPtr = 3;
        Crc24       crc = new Crc24();
        bool        crcFound = false;
        bool        hasHeaders = true;
        string      header = null;
        bool        newLineFound = false;
        bool        clearText = false;
        bool        restart = false;
        IList<string> headerList = new List<string>();
        int         lastC = 0;
		bool		isEndOfStream;

        /**
        * Create a stream for reading a PGP armoured message, parsing up to a header
        * and then reading the data that follows.
        *
        * @param input
        */
        public ArmoredInputStream(Stream input)
			: this(input, true)
        {
        }

		/**
        * Create an armoured input stream which will assume the data starts
        * straight away, or parse for headers first depending on the value of
        * hasHeaders.
        *
        * @param input
        * @param hasHeaders true if headers are to be looked for, false otherwise.
        */
        public ArmoredInputStream(Stream input, bool hasHeaders)
        {
            this.input = input;
            this.hasHeaders = hasHeaders;

			if (hasHeaders)
            {
                ParseHeaders();
            }

			start = false;
        }

		private bool ParseHeaders()
        {
            header = null;

			int		c;
            int		last = 0;
            bool	headerFound = false;

            headerList = new List<string>();

			//
            // if restart we already have a header
            //
            if (restart)
            {
                headerFound = true;
            }
            else
            {
                while ((c = input.ReadByte()) >= 0)
                {
                    if (c == '-' && (last == 0 || last == '\n' || last == '\r'))
                    {
                        headerFound = true;
                        break;
                    }

					last = c;
                }
            }

			if (headerFound)
            {
                StringBuilder    buf = new StringBuilder("-");
                bool             eolReached = false;
                bool             crLf = false;

				if (restart)    // we've had to look ahead two '-'
                {
                    buf.Append('-');
                }

				while ((c = input.ReadByte()) >= 0)
                {
                    if (last == '\r' && c == '\n')
                    {
                        crLf = true;
                    }
                    if (eolReached && (last != '\r' && c == '\n'))
                    {
                        break;
                    }
                    if (eolReached && c == '\r')
                    {
                        break;
                    }
                    if (c == '\r' || (last != '\r' && c == '\n'))
                    {
						string line = buf.ToString();
						if (line.Trim().Length < 1)
							break;

                        if (headerList.Count > 0 && line.IndexOf(':') < 0)
                            throw new IOException("invalid armor header");

                        headerList.Add(line);
                        buf.Length = 0;
                    }

                    if (c != '\n' && c != '\r')
                    {
                        buf.Append((char)c);
                        eolReached = false;
                    }
                    else
                    {
                        if (c == '\r' || (last != '\r' && c == '\n'))
                        {
                            eolReached = true;
                        }
                    }

					last = c;
                }

				if (crLf)
                {
                    input.ReadByte(); // skip last \n
                }
            }

			if (headerList.Count > 0)
            {
                header = (string)headerList[0];
            }

			clearText = "-----BEGIN PGP SIGNED MESSAGE-----".Equals(header);
            newLineFound = true;

			return headerFound;
        }

		/**
        * @return true if we are inside the clear text section of a PGP
        * signed message.
        */
        public bool IsClearText()
        {
            return clearText;
        }

		/**
		 * @return true if the stream is actually at end of file.
		 */
		public bool IsEndOfStream()
		{
			return isEndOfStream;
		}

		/**
        * Return the armor header line (if there is one)
        * @return the armor header line, null if none present.
        */
        public string GetArmorHeaderLine()
        {
            return header;
        }

		/**
        * Return the armor headers (the lines after the armor header line),
        * @return an array of armor headers, null if there aren't any.
        */
        public string[] GetArmorHeaders()
        {
            if (headerList.Count <= 1)
                return null;

			string[] hdrs = new string[headerList.Count - 1];
            for (int i = 0; i != hdrs.Length; i++)
            {
                hdrs[i] = (string)headerList[i + 1];
            }

			return hdrs;
        }

		private int ReadIgnoreSpace()
        {
            int c;
            do
            {
                c = input.ReadByte();
            }
            while (c == ' ' || c == '\t' || c == '\f' || c == '\u000B') ; // \u000B ~ \v

            if (c >= 128)
                throw new IOException("invalid armor");

            return c;
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            /*
             * TODO Currently can't return partial data when exception thrown (breaking test case), so we don't inherit
             * the base class implementation. Probably the reason is that throws don't mark this instance as 'failed'.
             */
            int pos = 0;
            while (pos < count)
            {
                int b = ReadByte();
                if (b < 0)
                    break;

                buffer[offset + pos++] = (byte)b;
            }
            return pos;
        }

        public override int ReadByte()
        {
            if (start)
            {
                if (hasHeaders)
                {
                    ParseHeaders();
                }

                crc.Reset();
                start = false;
            }

            int c;

            if (clearText)
            {
                c = input.ReadByte();

                if (c == '\r' || (c == '\n' && lastC != '\r'))
                {
                    newLineFound = true;
                }
                else if (newLineFound && c == '-')
                {
                    c = input.ReadByte();
                    if (c == '-')            // a header, not dash escaped
                    {
                        clearText = false;
                        start = true;
                        restart = true;
                    }
                    else                   // a space - must be a dash escape
                    {
                        c = input.ReadByte();
                    }
                    newLineFound = false;
                }
                else
                {
                    if (c != '\n' && lastC != '\r')
                    {
                        newLineFound = false;
                    }
                }
            
                lastC = c;

                if (c < 0)
                {
                    isEndOfStream = true;
                }
            
                return c;
            }

            if (bufPtr > 2 || crcFound)
            {
                c = ReadIgnoreSpace();
            
                if (c == '\r' || c == '\n')
                {
                    c = ReadIgnoreSpace();
                
                    while (c == '\n' || c == '\r')
                    {
                        c = ReadIgnoreSpace();
                    }

                    if (c < 0)                // EOF
                    {
                        isEndOfStream = true;
                        return -1;
                    }

                    if (c == '=')            // crc reached
                    {
                        bufPtr = Decode(ReadIgnoreSpace(), ReadIgnoreSpace(), ReadIgnoreSpace(), ReadIgnoreSpace(), outBuf);
                        if (bufPtr == 0)
                        {
                            int i = ((outBuf[0] & 0xff) << 16)
                                    | ((outBuf[1] & 0xff) << 8)
                                    | (outBuf[2] & 0xff);

                            crcFound = true;

                            if (i != crc.Value)
                            {
                                throw new IOException("crc check failed in armored message.");
                            }
                            return ReadByte();
                        }
                        else
                        {
                            if (detectMissingChecksum)
                            {
                                throw new IOException("no crc found in armored message");
                            }
                        }
                    }
                    else if (c == '-')        // end of record reached
                    {
                        while ((c = input.ReadByte()) >= 0)
                        {
                            if (c == '\n' || c == '\r')
                            {
                                break;
                            }
                        }

                        if (!crcFound && detectMissingChecksum)
                        {
                            throw new IOException("crc check not found");
                        }

                        crcFound = false;
                        start = true;
                        bufPtr = 3;

                        if (c < 0)
                        {
                            isEndOfStream = true;
                        }

                        return -1;
                    }
                    else                   // data
                    {
                        bufPtr = Decode(c, ReadIgnoreSpace(), ReadIgnoreSpace(), ReadIgnoreSpace(), outBuf);
                    }
                }
                else
                {
                    if (c >= 0)
                    {
                        bufPtr = Decode(c, ReadIgnoreSpace(), ReadIgnoreSpace(), ReadIgnoreSpace(), outBuf);
                    }
                    else
                    {
                        isEndOfStream = true;
                        return -1;
                    }
                }
            }

            c = outBuf[bufPtr++];

            crc.Update(c);

            return c;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Platform.Dispose(input);
            }
            base.Dispose(disposing);
        }

        /**
         * Change how the stream should react if it encounters missing CRC checksum.
         * The default value is false (ignore missing CRC checksums). If the behavior is set to true,
         * an {@link IOException} will be thrown if a missing CRC checksum is encountered.
         *
         * @param detectMissing ignore missing CRC sums
         */
        public virtual void SetDetectMissingCrc(bool detectMissing)
        {
            this.detectMissingChecksum = detectMissing;
        }
    }
}
