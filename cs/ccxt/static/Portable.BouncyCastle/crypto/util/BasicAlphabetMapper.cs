using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Crypto.Utilities
{
    /**
     * A basic alphabet mapper that just creates a mapper based on the
     * passed in array of characters.
     */
    public class BasicAlphabetMapper
       : IAlphabetMapper
    {
        private readonly IDictionary<char, int> m_indexMap = new Dictionary<char, int>();
        private readonly IList<char> m_charMap = new List<char>();

        /**
         * Base constructor.
         *
         * @param alphabet a string of characters making up the alphabet.
         */
        public BasicAlphabetMapper(string alphabet) :
            this(alphabet.ToCharArray())
        {
        }

        /**
         * Base constructor.
         *
         * @param alphabet an array of characters making up the alphabet.
         */
        public BasicAlphabetMapper(char[] alphabet)
        {
            for (int i = 0; i != alphabet.Length; i++)
            {
                if (m_indexMap.ContainsKey(alphabet[i]))
                    throw new ArgumentException("duplicate key detected in alphabet: " + alphabet[i]);

                m_indexMap.Add(alphabet[i], i);
                m_charMap.Add(alphabet[i]);
            }
        }

        public int Radix
        {
            get { return m_charMap.Count; }
        }

        public byte[] ConvertToIndexes(char[] input)
        {
            byte[] outBuf;

            if (m_charMap.Count <= 256)
            {
                outBuf = new byte[input.Length];
                for (int i = 0; i != input.Length; i++)
                {
                    if (!m_indexMap.TryGetValue(input[i], out var idx))
                        throw new InvalidOperationException();

                    outBuf[i] = (byte)idx;
                }
            }
            else
            {
                outBuf = new byte[input.Length * 2];
                for (int i = 0; i != input.Length; i++)
                {
                    if (!m_indexMap.TryGetValue(input[i], out var idx))
                        throw new InvalidOperationException();

                    outBuf[i * 2 + 0] = (byte)(idx >> 8);
                    outBuf[i * 2 + 1] = (byte)idx;
                }
            }

            return outBuf;
        }

        public char[] ConvertToChars(byte[] input)
        {
            char[] outBuf;

            if (m_charMap.Count <= 256)
            {
                outBuf = new char[input.Length];
                for (int i = 0; i != input.Length; i++)
                {
                    outBuf[i] = m_charMap[input[i]];
                }
            }
            else
            {
                if ((input.Length & 0x1) != 0)
                {
                    throw new ArgumentException("two byte radix and input string odd.Length");
                }

                outBuf = new char[input.Length / 2];
                for (int i = 0; i != input.Length; i += 2)
                {
                    outBuf[i / 2] = m_charMap[(input[i] << 8) | input[i + 1]];
                }
            }

            return outBuf;
        }
    }
}
