using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class HeartbeatExtension
    {
        private readonly short m_mode;

        public HeartbeatExtension(short mode)
        {
            if (!HeartbeatMode.IsValid(mode))
                throw new ArgumentException("not a valid HeartbeatMode value", "mode");

            this.m_mode = mode;
        }

        public short Mode
        {
            get { return m_mode; }
        }

        /// <summary>Encode this <see cref="HeartbeatExtension"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(m_mode, output);
        }

        /// <summary>Parse a <see cref="HeartbeatExtension"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="HeartbeatExtension"/> object.</returns>
        /// <exception cref="IOException"/>
        public static HeartbeatExtension Parse(Stream input)
        {
            short mode = TlsUtilities.ReadUint8(input);
            if (!HeartbeatMode.IsValid(mode))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            return new HeartbeatExtension(mode);
        }
    }
}
