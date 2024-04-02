using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class KeyShareEntry
    {
        private static bool CheckKeyExchangeLength(int length)
        {
            return 0 < length && length < (1 << 16);
        }

        private readonly int m_namedGroup;
        private readonly byte[] m_keyExchange;

        /// <param name="namedGroup"><see cref="NamedGroup"/></param>
        /// <param name="keyExchange"></param>
        public KeyShareEntry(int namedGroup, byte[] keyExchange)
        {
            if (!TlsUtilities.IsValidUint16(namedGroup))
                throw new ArgumentException("should be a uint16", "namedGroup");
            if (null == keyExchange)
                throw new ArgumentNullException("keyExchange");
            if (!CheckKeyExchangeLength(keyExchange.Length))
                throw new ArgumentException("must have length from 1 to (2^16 - 1)", "keyExchange");

            this.m_namedGroup = namedGroup;
            this.m_keyExchange = keyExchange;
        }

        /// <returns><see cref="NamedGroup"/></returns>
        public int NamedGroup
        {
            get { return m_namedGroup; }
        }

        public byte[] KeyExchange
        {
            get { return m_keyExchange; }
        }

        /// <summary>Encode this <see cref="KeyShareEntry"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint16(NamedGroup, output);
            TlsUtilities.WriteOpaque16(KeyExchange, output);
        }

        /// <summary>Parse a <see cref="KeyShareEntry"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="KeyShareEntry"/> object.</returns>
        /// <exception cref="IOException"/>
        public static KeyShareEntry Parse(Stream input)
        {
            int namedGroup = TlsUtilities.ReadUint16(input);
            byte[] keyExchange = TlsUtilities.ReadOpaque16(input, 1);
            return new KeyShareEntry(namedGroup, keyExchange);
        }
    }
}
