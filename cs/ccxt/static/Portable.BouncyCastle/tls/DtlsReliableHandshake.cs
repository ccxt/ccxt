using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Date;

namespace Org.BouncyCastle.Tls
{
    internal class DtlsReliableHandshake
    {
        private const int MAX_RECEIVE_AHEAD = 16;
        private const int MESSAGE_HEADER_LENGTH = 12;

        internal const int INITIAL_RESEND_MILLIS = 1000;
        private const int MAX_RESEND_MILLIS = 60000;

        /// <exception cref="IOException"/>
        internal static DtlsRequest ReadClientRequest(byte[] data, int dataOff, int dataLen, Stream dtlsOutput)
        {
            // TODO Support the possibility of a fragmented ClientHello datagram

            byte[] message = DtlsRecordLayer.ReceiveClientHelloRecord(data, dataOff, dataLen);
            if (null == message || message.Length < MESSAGE_HEADER_LENGTH)
                return null;

            long recordSeq = TlsUtilities.ReadUint48(data, dataOff + 5);

            short msgType = TlsUtilities.ReadUint8(message, 0);
            if (HandshakeType.client_hello != msgType)
                return null;

            int length = TlsUtilities.ReadUint24(message, 1);
            if (message.Length != MESSAGE_HEADER_LENGTH + length)
                return null;

            // TODO Consider stricter HelloVerifyRequest-related checks
            //int messageSeq = TlsUtilities.ReadUint16(message, 4);
            //if (messageSeq > 1)
            //    return null;

            int fragmentOffset = TlsUtilities.ReadUint24(message, 6);
            if (0 != fragmentOffset)
                return null;

            int fragmentLength = TlsUtilities.ReadUint24(message, 9);
            if (length != fragmentLength)
                return null;

            ClientHello clientHello = ClientHello.Parse(
                new MemoryStream(message, MESSAGE_HEADER_LENGTH, length, false), dtlsOutput);

            return new DtlsRequest(recordSeq, message, clientHello);
        }

        /// <exception cref="IOException"/>
        internal static void SendHelloVerifyRequest(DatagramSender sender, long recordSeq, byte[] cookie)
        {
            TlsUtilities.CheckUint8(cookie.Length);

            int length = 3 + cookie.Length;

            byte[] message = new byte[MESSAGE_HEADER_LENGTH + length];
            TlsUtilities.WriteUint8(HandshakeType.hello_verify_request, message, 0);
            TlsUtilities.WriteUint24(length, message, 1);
            //TlsUtilities.WriteUint16(0, message, 4);
            //TlsUtilities.WriteUint24(0, message, 6);
            TlsUtilities.WriteUint24(length, message, 9);

            // HelloVerifyRequest fields
            TlsUtilities.WriteVersion(ProtocolVersion.DTLSv10, message, MESSAGE_HEADER_LENGTH + 0);
            TlsUtilities.WriteOpaque8(cookie, message, MESSAGE_HEADER_LENGTH + 2);

            DtlsRecordLayer.SendHelloVerifyRequestRecord(sender, recordSeq, message);
        }

        /*
         * No 'final' modifiers so that it works in earlier JDKs
         */
        private DtlsRecordLayer m_recordLayer;
        private Timeout m_handshakeTimeout;

        private TlsHandshakeHash m_handshakeHash;

        private IDictionary<int, DtlsReassembler> m_currentInboundFlight = new Dictionary<int, DtlsReassembler>();
        private IDictionary<int, DtlsReassembler> m_previousInboundFlight = null;
        private IList<Message> m_outboundFlight = new List<Message>();

        private int m_resendMillis = -1;
        private Timeout m_resendTimeout = null;

        private int m_next_send_seq = 0, m_next_receive_seq = 0;

        internal DtlsReliableHandshake(TlsContext context, DtlsRecordLayer transport, int timeoutMillis,
            DtlsRequest request)
        {
            this.m_recordLayer = transport;
            this.m_handshakeHash = new DeferredHash(context);
            this.m_handshakeTimeout = Timeout.ForWaitMillis(timeoutMillis);

            if (null != request)
            {
                this.m_resendMillis = INITIAL_RESEND_MILLIS;
                this.m_resendTimeout = new Timeout(m_resendMillis);

                long recordSeq = request.RecordSeq;
                int messageSeq = request.MessageSeq;
                byte[] message = request.Message;

                m_recordLayer.ResetAfterHelloVerifyRequestServer(recordSeq);

                // Simulate a previous flight consisting of the request ClientHello
                DtlsReassembler reassembler = new DtlsReassembler(HandshakeType.client_hello,
                    message.Length - MESSAGE_HEADER_LENGTH);
                m_currentInboundFlight[messageSeq] = reassembler;

                // We sent HelloVerifyRequest with (message) sequence number 0
                this.m_next_send_seq = 1;
                this.m_next_receive_seq = messageSeq + 1;

                m_handshakeHash.Update(message, 0, message.Length);
            }
        }

        internal void ResetAfterHelloVerifyRequestClient()
        {
            this.m_currentInboundFlight = new Dictionary<int, DtlsReassembler>();
            this.m_previousInboundFlight = null;
            this.m_outboundFlight = new List<Message>();

            this.m_resendMillis = -1;
            this.m_resendTimeout = null;

            // We're waiting for ServerHello, always with (message) sequence number 1
            this.m_next_receive_seq = 1;

            m_handshakeHash.Reset();
        }

        internal TlsHandshakeHash HandshakeHash
        {
            get { return m_handshakeHash; }
        }

        internal void PrepareToFinish()
        {
            m_handshakeHash.StopTracking();
        }

        /// <exception cref="IOException"/>
        internal void SendMessage(short msg_type, byte[] body)
        {
            TlsUtilities.CheckUint24(body.Length);

            if (null != m_resendTimeout)
            {
                CheckInboundFlight();

                this.m_resendMillis = -1;
                this.m_resendTimeout = null;

                m_outboundFlight.Clear();
            }

            Message message = new Message(m_next_send_seq++, msg_type, body);

            m_outboundFlight.Add(message);

            WriteMessage(message);
            UpdateHandshakeMessagesDigest(message);
        }

        /// <exception cref="IOException"/>
        internal Message ReceiveMessage()
        {
            Message message = ImplReceiveMessage();
            UpdateHandshakeMessagesDigest(message);
            return message;
        }

        /// <exception cref="IOException"/>
        internal byte[] ReceiveMessageBody(short msg_type)
        {
            Message message = ImplReceiveMessage();
            if (message.Type != msg_type)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            UpdateHandshakeMessagesDigest(message);
            return message.Body;
        }

        /// <exception cref="IOException"/>
        internal Message ReceiveMessageDelayedDigest(short msg_type)
        {
            Message message = ImplReceiveMessage();
            if (message.Type != msg_type)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            return message;
        }

        /// <exception cref="IOException"/>
        internal void UpdateHandshakeMessagesDigest(Message message)
        {
            short msg_type = message.Type;
            switch (msg_type)
            {
            case HandshakeType.hello_request:
            case HandshakeType.hello_verify_request:
            case HandshakeType.key_update:
                break;

            // TODO[dtls13] Not included in the transcript for (D)TLS 1.3+
            case HandshakeType.new_session_ticket:
            default:
            {
                byte[] body = message.Body;
                byte[] buf = new byte[MESSAGE_HEADER_LENGTH];
                TlsUtilities.WriteUint8(msg_type, buf, 0);
                TlsUtilities.WriteUint24(body.Length, buf, 1);
                TlsUtilities.WriteUint16(message.Seq, buf, 4);
                TlsUtilities.WriteUint24(0, buf, 6);
                TlsUtilities.WriteUint24(body.Length, buf, 9);
                m_handshakeHash.Update(buf, 0, buf.Length);
                m_handshakeHash.Update(body, 0, body.Length);
                break;
            }
            }
        }

        internal void Finish()
        {
            DtlsHandshakeRetransmit retransmit = null;
            if (null != m_resendTimeout)
            {
                CheckInboundFlight();
            }
            else
            {
                PrepareInboundFlight(null);

                if (m_previousInboundFlight != null)
                {
                    /*
                     * RFC 6347 4.2.4. In addition, for at least twice the default MSL defined for [TCP],
                     * when in the FINISHED state, the node that transmits the last flight (the server in an
                     * ordinary handshake or the client in a resumed handshake) MUST respond to a retransmit
                     * of the peer's last flight with a retransmit of the last flight.
                     */
                    retransmit = new Retransmit(this);
                }
            }

            m_recordLayer.HandshakeSuccessful(retransmit);
        }

        internal static int BackOff(int timeoutMillis)
        {
            /*
             * TODO[DTLS] implementations SHOULD back off handshake packet size during the
             * retransmit backoff.
             */
            return System.Math.Min(timeoutMillis * 2, MAX_RESEND_MILLIS);
        }

        /**
         * Check that there are no "extra" messages left in the current inbound flight
         */
        private void CheckInboundFlight()
        {
            foreach (int key in m_currentInboundFlight.Keys)
            {
                if (key >= m_next_receive_seq)
                {
                    // TODO Should this be considered an error?
                }
            }
        }

        /// <exception cref="IOException"/>
        private Message GetPendingMessage()
        {
            if (m_currentInboundFlight.TryGetValue(m_next_receive_seq, out var next))
            {
                byte[] body = next.GetBodyIfComplete();
                if (body != null)
                {
                    m_previousInboundFlight = null;
                    return new Message(m_next_receive_seq++, next.MsgType, body);
                }
            }
            return null;
        }

        /// <exception cref="IOException"/>
        private Message ImplReceiveMessage()
        {
            long currentTimeMillis = DateTimeUtilities.CurrentUnixMs();

            if (null == m_resendTimeout)
            {
                m_resendMillis = INITIAL_RESEND_MILLIS;
                m_resendTimeout = new Timeout(m_resendMillis, currentTimeMillis);

                PrepareInboundFlight(new Dictionary<int, DtlsReassembler>());
            }

            byte[] buf = null;

            for (;;)
            {
                if (m_recordLayer.IsClosed)
                    throw new TlsFatalAlert(AlertDescription.user_canceled);

                Message pending = GetPendingMessage();
                if (pending != null)
                    return pending;

                if (Timeout.HasExpired(m_handshakeTimeout, currentTimeMillis))
                    throw new TlsTimeoutException("Handshake timed out");

                int waitMillis = Timeout.GetWaitMillis(m_handshakeTimeout, currentTimeMillis);
                waitMillis = Timeout.ConstrainWaitMillis(waitMillis, m_resendTimeout, currentTimeMillis);

                // NOTE: Ensure a finite wait, of at least 1ms
                if (waitMillis < 1)
                {
                    waitMillis = 1;
                }

                int receiveLimit = m_recordLayer.GetReceiveLimit();
                if (buf == null || buf.Length < receiveLimit)
                {
                    buf = new byte[receiveLimit];
                }

                int received = m_recordLayer.Receive(buf, 0, receiveLimit, waitMillis);
                if (received < 0)
                {
                    ResendOutboundFlight();
                }
                else
                {
                    ProcessRecord(MAX_RECEIVE_AHEAD, m_recordLayer.ReadEpoch, buf, 0, received);
                }

                currentTimeMillis = DateTimeUtilities.CurrentUnixMs();
            }
        }

        private void PrepareInboundFlight(IDictionary<int, DtlsReassembler> nextFlight)
        {
            ResetAll(m_currentInboundFlight);
            m_previousInboundFlight = m_currentInboundFlight;
            m_currentInboundFlight = nextFlight;
        }

        /// <exception cref="IOException"/>
        private void ProcessRecord(int windowSize, int epoch, byte[] buf, int off, int len)
        {
            bool checkPreviousFlight = false;

            while (len >= MESSAGE_HEADER_LENGTH)
            {
                int fragment_length = TlsUtilities.ReadUint24(buf, off + 9);
                int message_length = fragment_length + MESSAGE_HEADER_LENGTH;
                if (len < message_length)
                {
                    // NOTE: Truncated message - ignore it
                    break;
                }

                int length = TlsUtilities.ReadUint24(buf, off + 1);
                int fragment_offset = TlsUtilities.ReadUint24(buf, off + 6);
                if (fragment_offset + fragment_length > length)
                {
                    // NOTE: Malformed fragment - ignore it and the rest of the record
                    break;
                }

                /*
                 * NOTE: This very simple epoch check will only work until we want to support
                 * renegotiation (and we're not likely to do that anyway).
                 */
                short msg_type = TlsUtilities.ReadUint8(buf, off + 0);
                int expectedEpoch = msg_type == HandshakeType.finished ? 1 : 0;
                if (epoch != expectedEpoch)
                    break;

                int message_seq = TlsUtilities.ReadUint16(buf, off + 4);
                if (message_seq >= (m_next_receive_seq + windowSize))
                {
                    // NOTE: Too far ahead - ignore
                }
                else if (message_seq >= m_next_receive_seq)
                {
                    if (!m_currentInboundFlight.TryGetValue(message_seq, out var reassembler))
                    {
                        reassembler = new DtlsReassembler(msg_type, length);
                        m_currentInboundFlight[message_seq] = reassembler;
                    }

                    reassembler.ContributeFragment(msg_type, length, buf, off + MESSAGE_HEADER_LENGTH, fragment_offset,
                        fragment_length);
                }
                else if (m_previousInboundFlight != null)
                {
                    /*
                     * NOTE: If we receive the previous flight of incoming messages in full again,
                     * retransmit our last flight
                     */

                    if (m_previousInboundFlight.TryGetValue(message_seq, out var reassembler))
                    {
                        reassembler.ContributeFragment(msg_type, length, buf, off + MESSAGE_HEADER_LENGTH,
                            fragment_offset, fragment_length);
                        checkPreviousFlight = true;
                    }
                }

                off += message_length;
                len -= message_length;
            }

            if (checkPreviousFlight && CheckAll(m_previousInboundFlight))
            {
                ResendOutboundFlight();
                ResetAll(m_previousInboundFlight);
            }
        }

        /// <exception cref="IOException"/>
        private void ResendOutboundFlight()
        {
            m_recordLayer.ResetWriteEpoch();
            foreach (Message message in m_outboundFlight)
            {
                WriteMessage(message);
            }

            m_resendMillis = BackOff(m_resendMillis);
            m_resendTimeout = new Timeout(m_resendMillis);
        }

        /// <exception cref="IOException"/>
        private void WriteMessage(Message message)
        {
            int sendLimit = m_recordLayer.GetSendLimit();
            int fragmentLimit = sendLimit - MESSAGE_HEADER_LENGTH;

            // TODO Support a higher minimum fragment size?
            if (fragmentLimit < 1)
            {
                // TODO Should we be throwing an exception here?
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            int length = message.Body.Length;

            // NOTE: Must still send a fragment if body is empty
            int fragment_offset = 0;
            do
            {
                int fragment_length = System.Math.Min(length - fragment_offset, fragmentLimit);
                WriteHandshakeFragment(message, fragment_offset, fragment_length);
                fragment_offset += fragment_length;
            }
            while (fragment_offset < length);
        }

        /// <exception cref="IOException"/>
        private void WriteHandshakeFragment(Message message, int fragment_offset, int fragment_length)
        {
            RecordLayerBuffer fragment = new RecordLayerBuffer(MESSAGE_HEADER_LENGTH + fragment_length);
            TlsUtilities.WriteUint8(message.Type, fragment);
            TlsUtilities.WriteUint24(message.Body.Length, fragment);
            TlsUtilities.WriteUint16(message.Seq, fragment);
            TlsUtilities.WriteUint24(fragment_offset, fragment);
            TlsUtilities.WriteUint24(fragment_length, fragment);
            fragment.Write(message.Body, fragment_offset, fragment_length);

            fragment.SendToRecordLayer(m_recordLayer);
        }

        private static bool CheckAll(IDictionary<int, DtlsReassembler> inboundFlight)
        {
            foreach (DtlsReassembler r in inboundFlight.Values)
            {
                if (r.GetBodyIfComplete() == null)
                    return false;
            }
            return true;
        }

        private static void ResetAll(IDictionary<int, DtlsReassembler> inboundFlight)
        {
            foreach (DtlsReassembler r in inboundFlight.Values)
            {
                r.Reset();
            }
        }

        internal class Message
        {
            private readonly int m_message_seq;
            private readonly short m_msg_type;
            private readonly byte[] m_body;

            internal Message(int message_seq, short msg_type, byte[] body)
            {
                this.m_message_seq = message_seq;
                this.m_msg_type = msg_type;
                this.m_body = body;
            }

            public int Seq
            {
                get { return m_message_seq; }
            }

            public short Type
            {
                get { return m_msg_type; }
            }

            public byte[] Body
            {
                get { return m_body; }
            }
        }

        internal class RecordLayerBuffer
            : MemoryStream
        {
            internal RecordLayerBuffer(int size)
                : base(size)
            {
            }

            internal void SendToRecordLayer(DtlsRecordLayer recordLayer)
            {
                byte[] buf = GetBuffer();
                int bufLen = Convert.ToInt32(Length);

                recordLayer.Send(buf, 0, bufLen);
                Dispose();
            }
        }

        internal class Retransmit
            : DtlsHandshakeRetransmit
        {
            private readonly DtlsReliableHandshake m_outer;

            internal Retransmit(DtlsReliableHandshake outer)
            {
                this.m_outer = outer;
            }

            public void ReceivedHandshakeRecord(int epoch, byte[] buf, int off, int len)
            {
                m_outer.ProcessRecord(0, epoch, buf, off, len);
            }
        }
    }
}
