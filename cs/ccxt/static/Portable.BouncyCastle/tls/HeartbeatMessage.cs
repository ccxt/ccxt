using System;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class HeartbeatMessage
    {
        public static HeartbeatMessage Create(TlsContext context, short type, byte[] payload)
        {
            return Create(context, type, payload, 16);
        }

        public static HeartbeatMessage Create(TlsContext context, short type, byte[] payload, int paddingLength)
        {
            byte[] padding = context.NonceGenerator.GenerateNonce(paddingLength);

            return new HeartbeatMessage(type, payload, padding);
        }

        private readonly short m_type;
        private readonly byte[] m_payload;
        private readonly byte[] m_padding;

        public HeartbeatMessage(short type, byte[] payload, byte[] padding)
        {
            if (!HeartbeatMessageType.IsValid(type))
                throw new ArgumentException("not a valid HeartbeatMessageType value", "type");
            if (null == payload || payload.Length >= (1 << 16))
                throw new ArgumentException("must have length < 2^16", "payload");
            if (null == padding || padding.Length < 16)
                throw new ArgumentException("must have length >= 16", "padding");

            this.m_type = type;
            this.m_payload = payload;
            this.m_padding = padding;
        }

        public int PaddingLength
        {
            /*
             * RFC 6520 4. The padding of a received HeartbeatMessage message MUST be ignored
             */
            get { return m_padding.Length; }
        }

        public byte[] Payload
        {
            get { return m_payload; }
        }

        public short Type
        {
            get { return m_type; }
        }

        /// <summary>Encode this <see cref="HeartbeatMessage"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(m_type, output);

            TlsUtilities.CheckUint16(m_payload.Length);
            TlsUtilities.WriteUint16(m_payload.Length, output);
            output.Write(m_payload, 0, m_payload.Length);

            output.Write(m_padding, 0, m_padding.Length);
        }

        /// <summary>Parse a <see cref="HeartbeatMessage"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="HeartbeatMessage"/> object.</returns>
        /// <exception cref="IOException"/>
        public static HeartbeatMessage Parse(Stream input)
        {
            short type = TlsUtilities.ReadUint8(input);
            if (!HeartbeatMessageType.IsValid(type))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            int payload_length = TlsUtilities.ReadUint16(input);
            byte[] payloadBuffer = Streams.ReadAll(input);

            byte[] payload = GetPayload(payloadBuffer, payload_length);
            if (null == payload)
            {
                /*
                 * RFC 6520 4. If the payload_length of a received HeartbeatMessage is too large, the received
                 * HeartbeatMessage MUST be discarded silently.
                 */
                return null;
            }

            byte[] padding = GetPadding(payloadBuffer, payload_length);

            return new HeartbeatMessage(type, payload, padding);
        }

        private static byte[] GetPayload(byte[] payloadBuffer, int payloadLength)
        {
            /*
             * RFC 6520 4. The padding_length MUST be at least 16.
             */
            int maxPayloadLength = payloadBuffer.Length - 16;
            if (payloadLength > maxPayloadLength)
                return null;

            return Arrays.CopyOf(payloadBuffer, payloadLength);
        }

        private static byte[] GetPadding(byte[] payloadBuffer, int payloadLength)
        {
            return TlsUtilities.CopyOfRangeExact(payloadBuffer, payloadLength, payloadBuffer.Length);
        }
    }
}
