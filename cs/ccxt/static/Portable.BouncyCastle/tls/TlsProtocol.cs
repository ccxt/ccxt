using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    public abstract class TlsProtocol
        : TlsCloseable
    {
        /*
         * Connection States.
         * 
         * NOTE: Redirection of handshake messages to TLS 1.3 handlers assumes CS_START, CS_CLIENT_HELLO
         * are lower than any of the other values.
         */
        protected const short CS_START = 0;
        protected const short CS_CLIENT_HELLO = 1;
        protected const short CS_SERVER_HELLO_RETRY_REQUEST = 2;
        protected const short CS_CLIENT_HELLO_RETRY = 3;
        protected const short CS_SERVER_HELLO = 4;
        protected const short CS_SERVER_ENCRYPTED_EXTENSIONS = 5;
        protected const short CS_SERVER_SUPPLEMENTAL_DATA = 6;
        protected const short CS_SERVER_CERTIFICATE = 7;
        protected const short CS_SERVER_CERTIFICATE_STATUS = 8;
        protected const short CS_SERVER_CERTIFICATE_VERIFY = 9;
        protected const short CS_SERVER_KEY_EXCHANGE = 10;
        protected const short CS_SERVER_CERTIFICATE_REQUEST = 11;
        protected const short CS_SERVER_HELLO_DONE = 12;
        protected const short CS_CLIENT_END_OF_EARLY_DATA = 13;
        protected const short CS_CLIENT_SUPPLEMENTAL_DATA = 14;
        protected const short CS_CLIENT_CERTIFICATE = 15;
        protected const short CS_CLIENT_KEY_EXCHANGE = 16;
        protected const short CS_CLIENT_CERTIFICATE_VERIFY = 17;
        protected const short CS_CLIENT_FINISHED = 18;
        protected const short CS_SERVER_SESSION_TICKET = 19;
        protected const short CS_SERVER_FINISHED = 20;
        protected const short CS_END = 21;

        protected bool IsLegacyConnectionState()
        {
            switch (m_connectionState)
            {
            case CS_START:
            case CS_CLIENT_HELLO:
            case CS_SERVER_HELLO:
            case CS_SERVER_SUPPLEMENTAL_DATA:
            case CS_SERVER_CERTIFICATE:
            case CS_SERVER_CERTIFICATE_STATUS:
            case CS_SERVER_KEY_EXCHANGE:
            case CS_SERVER_CERTIFICATE_REQUEST:
            case CS_SERVER_HELLO_DONE:
            case CS_CLIENT_SUPPLEMENTAL_DATA:
            case CS_CLIENT_CERTIFICATE:
            case CS_CLIENT_KEY_EXCHANGE:
            case CS_CLIENT_CERTIFICATE_VERIFY:
            case CS_CLIENT_FINISHED:
            case CS_SERVER_SESSION_TICKET:
            case CS_SERVER_FINISHED:
            case CS_END:
                return true;

            case CS_SERVER_HELLO_RETRY_REQUEST:
            case CS_CLIENT_HELLO_RETRY:
            case CS_SERVER_ENCRYPTED_EXTENSIONS:
            case CS_SERVER_CERTIFICATE_VERIFY:
            case CS_CLIENT_END_OF_EARLY_DATA:
            default:
                return false;
            }
        }

        protected bool IsTlsV13ConnectionState()
        {
            switch (m_connectionState)
            {
            case CS_START:
            case CS_CLIENT_HELLO:
            case CS_SERVER_HELLO_RETRY_REQUEST:
            case CS_CLIENT_HELLO_RETRY:
            case CS_SERVER_HELLO:
            case CS_SERVER_ENCRYPTED_EXTENSIONS:
            case CS_SERVER_CERTIFICATE_REQUEST:
            case CS_SERVER_CERTIFICATE:
            case CS_SERVER_CERTIFICATE_VERIFY:
            case CS_SERVER_FINISHED:
            case CS_CLIENT_END_OF_EARLY_DATA:
            case CS_CLIENT_CERTIFICATE:
            case CS_CLIENT_CERTIFICATE_VERIFY:
            case CS_CLIENT_FINISHED:
            case CS_END:
                return true;

            case CS_SERVER_SUPPLEMENTAL_DATA:
            case CS_SERVER_CERTIFICATE_STATUS:
            case CS_SERVER_KEY_EXCHANGE:
            case CS_SERVER_HELLO_DONE:
            case CS_CLIENT_SUPPLEMENTAL_DATA:
            case CS_CLIENT_KEY_EXCHANGE:
            case CS_SERVER_SESSION_TICKET:
            default:
                return false;
            }
        }

        /*
         * Different modes to handle the known IV weakness
         */
        protected const short ADS_MODE_1_Nsub1 = 0; // 1/n-1 record splitting
        protected const short ADS_MODE_0_N = 1; // 0/n record splitting
        protected const short ADS_MODE_0_N_FIRSTONLY = 2; // 0/n record splitting on first data fragment only

        /*
         * Queues for data from some protocols.
         */
        private readonly ByteQueue m_applicationDataQueue = new ByteQueue(0);
        private readonly ByteQueue m_alertQueue = new ByteQueue(2);
        private readonly ByteQueue m_handshakeQueue = new ByteQueue(0);
        //private readonly ByteQueue m_heartbeatQueue = new ByteQueue(0);

        internal readonly RecordStream m_recordStream;
        internal readonly object m_recordWriteLock = new object();

        private int m_maxHandshakeMessageSize = -1;

        internal TlsHandshakeHash m_handshakeHash;

        private TlsStream m_tlsStream = null;

        private volatile bool m_closed = false;
        private volatile bool m_failedWithError = false;
        private volatile bool m_appDataReady = false;
        private volatile bool m_appDataSplitEnabled = true;
        private volatile bool m_keyUpdateEnabled = false;
        //private volatile bool m_keyUpdatePendingReceive = false;
        private volatile bool m_keyUpdatePendingSend = false;
        private volatile bool m_resumableHandshake = false;
        private volatile int m_appDataSplitMode = ADS_MODE_1_Nsub1;

        protected TlsSession m_tlsSession = null;
        protected SessionParameters m_sessionParameters = null;
        protected TlsSecret m_sessionMasterSecret = null;

        protected byte[] m_retryCookie = null;
        protected int m_retryGroup = -1;
        protected IDictionary<int, byte[]> m_clientExtensions = null;
        protected IDictionary<int, byte[]> m_serverExtensions = null;

        protected short m_connectionState = CS_START;
        protected bool m_selectedPsk13 = false;
        protected bool m_receivedChangeCipherSpec = false;
        protected bool m_expectSessionTicket = false;

        protected readonly bool m_blocking;
        protected readonly ByteQueueInputStream m_inputBuffers;
        protected readonly ByteQueueOutputStream m_outputBuffer;

        protected TlsProtocol()
        {
            this.m_blocking = false;
            this.m_inputBuffers = new ByteQueueInputStream();
            this.m_outputBuffer = new ByteQueueOutputStream();
            this.m_recordStream = new RecordStream(this, m_inputBuffers, m_outputBuffer);
        }

        public TlsProtocol(Stream stream)
            : this(stream, stream)
        {
        }

        public TlsProtocol(Stream input, Stream output)
        {
            this.m_blocking = true;
            this.m_inputBuffers = null;
            this.m_outputBuffer = null;
            this.m_recordStream = new RecordStream(this, input, output);
        }

        /// <exception cref="IOException"/>
        public virtual void ResumeHandshake()
        {
            if (!m_blocking)
                throw new InvalidOperationException("Cannot use ResumeHandshake() in non-blocking mode!");
            if (!IsHandshaking)
                throw new InvalidOperationException("No handshake in progress");

            BlockForHandshake();
        }

        /// <exception cref="IOException"/>
        protected virtual void CloseConnection()
        {
            m_recordStream.Close();
        }

        protected abstract TlsContext Context { get; }

        internal abstract AbstractTlsContext ContextAdmin { get; }

        protected abstract TlsPeer Peer { get; }

        /// <exception cref="IOException"/>
        protected virtual void HandleAlertMessage(short alertLevel, short alertDescription)
        {
            Peer.NotifyAlertReceived(alertLevel, alertDescription);

            if (alertLevel == AlertLevel.warning)
            {
                HandleAlertWarningMessage(alertDescription);
            }
            else
            {
                HandleFailure();

                throw new TlsFatalAlertReceived(alertDescription);
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void HandleAlertWarningMessage(short alertDescription)
        {
            switch (alertDescription)
            {
            /*
             * RFC 5246 7.2.1. The other party MUST respond with a close_notify alert of its own
             * and close down the connection immediately, discarding any pending writes.
             */
            case AlertDescription.close_notify:
            {
                if (!m_appDataReady)
                    throw new TlsFatalAlert(AlertDescription.handshake_failure);

                HandleClose(false);
                break;
            }
            case AlertDescription.no_certificate:
            {
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }
            case AlertDescription.no_renegotiation:
            {
                // TODO[reneg] Give peer the option to tolerate this
                throw new TlsFatalAlert(AlertDescription.handshake_failure);
            }
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void HandleChangeCipherSpecMessage()
        {
        }

        /// <exception cref="IOException"/>
        protected virtual void HandleClose(bool user_canceled)
        {
            if (!m_closed)
            {
                this.m_closed = true;

                if (!m_appDataReady)
                {
                    CleanupHandshake();

                    if (user_canceled)
                    {
                        RaiseAlertWarning(AlertDescription.user_canceled, "User canceled handshake");
                    }
                }

                RaiseAlertWarning(AlertDescription.close_notify, "Connection closed");

                CloseConnection();
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void HandleException(short alertDescription, string message, Exception e)
        {
            // TODO[tls-port] Can we support interrupted IO on .NET?
            //if ((m_appDataReady || IsResumableHandshake()) && (e is InterruptedIOException))
            //    return;

            if (!m_closed)
            {
                RaiseAlertFatal(alertDescription, message, e);

                HandleFailure();
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void HandleFailure()
        {
            this.m_closed = true;
            this.m_failedWithError = true;

            /*
             * RFC 2246 7.2.1. The session becomes unresumable if any connection is terminated
             * without proper close_notify messages with level equal to warning.
             */
            // TODO This isn't quite in the right place. Also, as of TLS 1.1 the above is obsolete.
            InvalidateSession();

            if (!m_appDataReady)
            {
                CleanupHandshake();
            }

            CloseConnection();
        }

        /// <exception cref="IOException"/>
        protected abstract void HandleHandshakeMessage(short type, HandshakeMessageInput buf);

        /// <exception cref="IOException"/>
        protected virtual void ApplyMaxFragmentLengthExtension(short maxFragmentLength)
        {
            if (maxFragmentLength >= 0)
            {
                if (!MaxFragmentLength.IsValid(maxFragmentLength))
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                int plainTextLimit = 1 << (8 + maxFragmentLength);
                m_recordStream.SetPlaintextLimit(plainTextLimit);
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void CheckReceivedChangeCipherSpec(bool expected)
        {
            if (expected != m_receivedChangeCipherSpec)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        /// <exception cref="IOException"/>
        protected virtual void BlockForHandshake()
        {
            while (m_connectionState != CS_END)
            {
                if (IsClosed)
                {
                    // NOTE: Any close during the handshake should have raised an exception.
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }

                SafeReadRecord();
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void BeginHandshake()
        {
            AbstractTlsContext context = ContextAdmin;
            TlsPeer peer = Peer;

            this.m_maxHandshakeMessageSize = System.Math.Max(1024, peer.GetMaxHandshakeMessageSize());

            this.m_handshakeHash = new DeferredHash(context);
            this.m_connectionState = CS_START;
            this.m_selectedPsk13 = false;

            context.HandshakeBeginning(peer);

            SecurityParameters securityParameters = context.SecurityParameters;

            securityParameters.m_extendedPadding = peer.ShouldUseExtendedPadding();
        }

        protected virtual void CleanupHandshake()
        {
            TlsContext context = Context;
            if (null != context)
            {
                SecurityParameters securityParameters = context.SecurityParameters;
                if (null != securityParameters)
                {
                    securityParameters.Clear();
                }
            }

            this.m_tlsSession = null;
            this.m_sessionParameters = null;
            this.m_sessionMasterSecret = null;

            this.m_retryCookie = null;
            this.m_retryGroup = -1;
            this.m_clientExtensions = null;
            this.m_serverExtensions = null;

            this.m_selectedPsk13 = false;
            this.m_receivedChangeCipherSpec = false;
            this.m_expectSessionTicket = false;
        }

        /// <exception cref="IOException"/>
        protected virtual void CompleteHandshake()
        {
            try
            {
                AbstractTlsContext context = ContextAdmin;
                SecurityParameters securityParameters = context.SecurityParameters;

                if (!context.IsHandshaking ||
                    null == securityParameters.LocalVerifyData ||
                    null == securityParameters.PeerVerifyData)
                {
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }

                m_recordStream.FinaliseHandshake();
                this.m_connectionState = CS_END;

                // TODO Prefer to set to null, but would need guards elsewhere
                this.m_handshakeHash = new DeferredHash(context);

                m_alertQueue.Shrink();
                m_handshakeQueue.Shrink();

                ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

                this.m_appDataSplitEnabled = !TlsUtilities.IsTlsV11(negotiatedVersion);
                this.m_appDataReady = true;

                this.m_keyUpdateEnabled = TlsUtilities.IsTlsV13(negotiatedVersion);

                if (m_blocking)
                {
                    this.m_tlsStream = new TlsStream(this);
                }

                if (m_sessionParameters == null)
                {
                    this.m_sessionMasterSecret = securityParameters.MasterSecret;

                    this.m_sessionParameters = new SessionParameters.Builder()
                        .SetCipherSuite(securityParameters.CipherSuite)
                        .SetExtendedMasterSecret(securityParameters.IsExtendedMasterSecret)
                        .SetLocalCertificate(securityParameters.LocalCertificate)
                        .SetMasterSecret(context.Crypto.AdoptSecret(m_sessionMasterSecret))
                        .SetNegotiatedVersion(securityParameters.NegotiatedVersion)
                        .SetPeerCertificate(securityParameters.PeerCertificate)
                        .SetPskIdentity(securityParameters.PskIdentity)
                        .SetSrpIdentity(securityParameters.SrpIdentity)
                        // TODO Consider filtering extensions that aren't relevant to resumed sessions
                        .SetServerExtensions(m_serverExtensions)
                        .Build();

                    this.m_tlsSession = TlsUtilities.ImportSession(securityParameters.SessionID, m_sessionParameters);
                }
                else
                {
                    securityParameters.m_localCertificate = m_sessionParameters.LocalCertificate;
                    securityParameters.m_peerCertificate = m_sessionParameters.PeerCertificate;
                    securityParameters.m_pskIdentity = m_sessionParameters.PskIdentity;
                    securityParameters.m_srpIdentity = m_sessionParameters.SrpIdentity;
                }

                context.HandshakeComplete(Peer, m_tlsSession);
            }
            finally
            {
                CleanupHandshake();
            }
        }

        /// <exception cref="IOException"/>
        internal void ProcessRecord(short protocol, byte[] buf, int off, int len)
        {
            /*
             * Have a look at the protocol type, and add it to the correct queue.
             */
            switch (protocol)
            {
            case ContentType.alert:
            {
                m_alertQueue.AddData(buf, off, len);
                ProcessAlertQueue();
                break;
            }
            case ContentType.application_data:
            {
                if (!m_appDataReady)
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);

                m_applicationDataQueue.AddData(buf, off, len);
                ProcessApplicationDataQueue();
                break;
            }
            case ContentType.change_cipher_spec:
            {
                ProcessChangeCipherSpec(buf, off, len);
                break;
            }
            case ContentType.handshake:
            {
                if (m_handshakeQueue.Available > 0)
                {
                    m_handshakeQueue.AddData(buf, off, len);
                    ProcessHandshakeQueue(m_handshakeQueue);
                }
                else
                {
                    ByteQueue tmpQueue = new ByteQueue(buf, off, len);
                    ProcessHandshakeQueue(tmpQueue);
                    int remaining = tmpQueue.Available;
                    if (remaining > 0)
                    {
                        m_handshakeQueue.AddData(buf, off + len - remaining, remaining);
                    }
                }
                break;
            }
            //case ContentType.heartbeat:
            //{
            //    if (!m_appDataReady)
            //        throw new TlsFatalAlert(AlertDescription.unexpected_message);

            //    // TODO[RFC 6520]
            //    m_heartbeatQueue.addData(buf, off, len);
            //    ProcessHeartbeatQueue();
            //    break;
            //}
            default:
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }
        }

        /// <exception cref="IOException"/>
        private void ProcessHandshakeQueue(ByteQueue queue)
        {
            /*
             * We need the first 4 bytes, they contain type and length of the message.
             */
            while (queue.Available >= 4)
            {
                int header = queue.ReadInt32();

                short type = (short)((uint)header >> 24);
                if (!HandshakeType.IsRecognized(type))
                {
                    throw new TlsFatalAlert(AlertDescription.unexpected_message,
                        "Handshake message of unrecognized type: " + type);
                }

                int length = header & 0x00FFFFFF;
                if (length > m_maxHandshakeMessageSize)
                {
                    throw new TlsFatalAlert(AlertDescription.internal_error,
                        "Handshake message length exceeds the maximum: " + HandshakeType.GetText(type) + ", " + length
                            + " > " + m_maxHandshakeMessageSize);
                }

                int totalLength = 4 + length;
                if (queue.Available < totalLength)
                {
                    // Not enough bytes in the buffer to read the full message.
                    break;
                }

                /*
                 * Check ChangeCipherSpec status
                 */
                switch (type)
                {
                case HandshakeType.hello_request:
                    break;

                default:
                {
                    ProtocolVersion negotiatedVersion = Context.ServerVersion;
                    if (null != negotiatedVersion && TlsUtilities.IsTlsV13(negotiatedVersion))
                        break;

                    CheckReceivedChangeCipherSpec(HandshakeType.finished == type);
                    break;
                }
                }

                HandshakeMessageInput buf = queue.ReadHandshakeMessage(totalLength);

                switch (type)
                {
                /*
                 * These message types aren't included in the transcript.
                 */
                case HandshakeType.hello_request:
                case HandshakeType.key_update:
                    break;

                /*
                 * Not included in the transcript for (D)TLS 1.3+
                 */
                case HandshakeType.new_session_ticket:
                {
                    ProtocolVersion negotiatedVersion = Context.ServerVersion;
                    if (null != negotiatedVersion && !TlsUtilities.IsTlsV13(negotiatedVersion))
                    {
                        buf.UpdateHash(m_handshakeHash);
                    }

                    break;
                }

                /*
                 * These message types are deferred to the handler to explicitly update the transcript.
                 */
                case HandshakeType.certificate_verify:
                case HandshakeType.client_hello:
                case HandshakeType.finished:
                case HandshakeType.server_hello:
                    break;

                /*
                 * For all others we automatically update the transcript immediately. 
                 */
                default:
                {
                    buf.UpdateHash(m_handshakeHash);
                    break;
                }
                }

                buf.Seek(4L, SeekOrigin.Current);

                HandleHandshakeMessage(type, buf);
            }
        }

        private void ProcessApplicationDataQueue()
        {
            /*
             * There is nothing we need to do here.
             * 
             * This function could be used for callbacks when application data arrives in the future.
             */
        }

        /// <exception cref="IOException"/>
        private void ProcessAlertQueue()
        {
            while (m_alertQueue.Available >= 2)
            {
                /*
                 * An alert is always 2 bytes. Read the alert.
                 */
                byte[] alert = m_alertQueue.RemoveData(2, 0);
                short alertLevel = alert[0];
                short alertDescription = alert[1];

                HandleAlertMessage(alertLevel, alertDescription);
            }
        }

        /// <summary>This method is called, when a change cipher spec message is received.</summary>
        /// <exception cref="IOException">If the message has an invalid content or the handshake is not in the correct
        /// state.</exception>
        private void ProcessChangeCipherSpec(byte[] buf, int off, int len)
        {
            ProtocolVersion negotiatedVersion = Context.ServerVersion;
            if (null == negotiatedVersion || TlsUtilities.IsTlsV13(negotiatedVersion))
            {
                // See RFC 8446 D.4.
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }

            for (int i = 0; i < len; ++i)
            {
                short message = TlsUtilities.ReadUint8(buf, off + i);

                if (message != ChangeCipherSpec.change_cipher_spec)
                    throw new TlsFatalAlert(AlertDescription.decode_error);

                if (this.m_receivedChangeCipherSpec
                    || m_alertQueue.Available > 0
                    || m_handshakeQueue.Available > 0)
                {
                    throw new TlsFatalAlert(AlertDescription.unexpected_message);
                }

                m_recordStream.NotifyChangeCipherSpecReceived();

                this.m_receivedChangeCipherSpec = true;

                HandleChangeCipherSpecMessage();
            }
        }

        public virtual int ApplicationDataAvailable
        {
            get { return m_applicationDataQueue.Available; }
        }

        /// <summary>Read data from the network.</summary>
        /// <remarks>
        /// The method will return immediately, if there is still some data left in the buffer, or block until some
        /// application data has been read from the network.
        /// </remarks>
        /// <param name="buffer">The buffer where the data will be copied to.</param>
        /// <param name="offset">The position where the data will be placed in the buffer.</param>
        /// <param name="count">The maximum number of bytes to read.</param>
        /// <returns>The number of bytes read.</returns>
        /// <exception cref="IOException">If something goes wrong during reading data.</exception>
        public virtual int ReadApplicationData(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            if (!m_appDataReady)
                throw new InvalidOperationException("Cannot read application data until initial handshake completed.");

            while (m_applicationDataQueue.Available < 1)
            {
                if (this.m_closed)
                {
                    if (this.m_failedWithError)
                        throw new IOException("Cannot read application data on failed TLS connection");

                    return 0;
                }

                /*
                 * NOTE: Only called more than once when empty records are received, so no special
                 * InterruptedIOException handling is necessary.
                 */
                SafeReadRecord();
            }

            if (count > 0)
            {
                count = System.Math.Min(count, m_applicationDataQueue.Available);
                m_applicationDataQueue.RemoveData(buffer, offset, count, 0);
            }
            return count;
        }

        /// <exception cref="IOException"/>
        protected virtual RecordPreview SafePreviewRecordHeader(byte[] recordHeader)
        {
            try
            {
                return m_recordStream.PreviewRecordHeader(recordHeader);
            }
            catch (TlsFatalAlert e)
            {
                HandleException(e.AlertDescription, "Failed to read record", e);
                throw e;
            }
            catch (IOException e)
            {
                HandleException(AlertDescription.internal_error, "Failed to read record", e);
                throw e;
            }
            catch (Exception e)
            {
                HandleException(AlertDescription.internal_error, "Failed to read record", e);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void SafeReadRecord()
        {
            try
            {
                if (m_recordStream.ReadRecord())
                    return;

                if (!m_appDataReady)
                    throw new TlsFatalAlert(AlertDescription.handshake_failure);

                if (!Peer.RequiresCloseNotify())
                {
                    HandleClose(false);
                    return;
                }
            }
            catch (TlsFatalAlertReceived e)
            {
                // Connection failure already handled at source
                throw e;
            }
            catch (TlsFatalAlert e)
            {
                HandleException(e.AlertDescription, "Failed to read record", e);
                throw e;
            }
            catch (IOException e)
            {
                HandleException(AlertDescription.internal_error, "Failed to read record", e);
                throw e;
            }
            catch (Exception e)
            {
                HandleException(AlertDescription.internal_error, "Failed to read record", e);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }

            HandleFailure();

            throw new TlsNoCloseNotifyException();
        }

        /// <exception cref="IOException"/>
        protected virtual bool SafeReadFullRecord(byte[] input, int inputOff, int inputLen)
        {
            try
            {
                return m_recordStream.ReadFullRecord(input, inputOff, inputLen);
            }
            catch (TlsFatalAlert e)
            {
                HandleException(e.AlertDescription, "Failed to process record", e);
                throw e;
            }
            catch (IOException e)
            {
                HandleException(AlertDescription.internal_error, "Failed to process record", e);
                throw e;
            }
            catch (Exception e)
            {
                HandleException(AlertDescription.internal_error, "Failed to process record", e);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void SafeWriteRecord(short type, byte[] buf, int offset, int len)
        {
            try
            {
                m_recordStream.WriteRecord(type, buf, offset, len);
            }
            catch (TlsFatalAlert e)
            {
                HandleException(e.AlertDescription, "Failed to write record", e);
                throw e;
            }
            catch (IOException e)
            {
                HandleException(AlertDescription.internal_error, "Failed to write record", e);
                throw e;
            }
            catch (Exception e)
            {
                HandleException(AlertDescription.internal_error, "Failed to write record", e);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
        }

        /// <summary>Write some application data.</summary>
        /// <remarks>
        /// Fragmentation is handled internally. Usable in both blocking/non-blocking modes.<br/><br/>
        /// In blocking mode, the output will be automatically sent via the underlying transport. In non-blocking mode,
        /// call <see cref="ReadOutput(byte[], int, int)"/> to get the output bytes to send to the peer.<br/><br/>
        /// This method must not be called until after the initial handshake is complete. Attempting to call it earlier
        /// will result in an <see cref="InvalidOperationException"/>.
        /// </remarks>
        /// <param name="buffer">The buffer containing application data to send.</param>
        /// <param name="offset">The offset at which the application data begins</param>
        /// <param name="count">The number of bytes of application data.</param>
        /// <exception cref="InvalidOperationException">If called before the initial handshake has completed.
        /// </exception>
        /// <exception cref="IOException">If connection is already closed, or for encryption or transport errors.
        /// </exception>
        public virtual void WriteApplicationData(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            if (!m_appDataReady)
                throw new InvalidOperationException(
                    "Cannot write application data until initial handshake completed.");

            lock (m_recordWriteLock)
            {
                while (count > 0)
                {
                    if (m_closed)
                        throw new IOException("Cannot write application data on closed/failed TLS connection");

                    /*
                     * RFC 5246 6.2.1. Zero-length fragments of Application data MAY be sent as they are
                     * potentially useful as a traffic analysis countermeasure.
                     * 
                     * NOTE: Actually, implementations appear to have settled on 1/n-1 record splitting.
                     */
                    if (m_appDataSplitEnabled)
                    {
                        /*
                         * Protect against known IV attack!
                         * 
                         * DO NOT REMOVE THIS CODE, EXCEPT YOU KNOW EXACTLY WHAT YOU ARE DOING HERE.
                         */
                        switch (m_appDataSplitMode)
                        {
                        case ADS_MODE_0_N_FIRSTONLY:
                        {
                            this.m_appDataSplitEnabled = false;
                            SafeWriteRecord(ContentType.application_data, TlsUtilities.EmptyBytes, 0, 0);
                            break;
                        }
                        case ADS_MODE_0_N:
                        {
                            SafeWriteRecord(ContentType.application_data, TlsUtilities.EmptyBytes, 0, 0);
                            break;
                        }
                        case ADS_MODE_1_Nsub1:
                        default:
                        {
                            if (count > 1)
                            {
                                SafeWriteRecord(ContentType.application_data, buffer, offset, 1);
                                ++offset;
                                --count;
                            }
                            break;
                        }
                        }
                    }
                    else if (m_keyUpdateEnabled)
                    {
                        if (m_keyUpdatePendingSend)
                        {
                            Send13KeyUpdate(false);
                        }
                        else if (m_recordStream.NeedsKeyUpdate())
                        {
                            Send13KeyUpdate(true);
                        }
                    }

                    // Fragment data according to the current fragment limit.
                    int toWrite = System.Math.Min(count, m_recordStream.PlaintextLimit);
                    SafeWriteRecord(ContentType.application_data, buffer, offset, toWrite);
                    offset += toWrite;
                    count -= toWrite;
                }
            }
        }

        public virtual int AppDataSplitMode
        {
            get { return m_appDataSplitMode; }
            set
            {
                if (value < ADS_MODE_1_Nsub1 || value > ADS_MODE_0_N_FIRSTONLY)
                    throw new InvalidOperationException("Illegal appDataSplitMode mode: " + value);

                this.m_appDataSplitMode = value;
            }
        }

        public virtual bool IsResumableHandshake
        {
            get { return m_resumableHandshake; }
            set { this.m_resumableHandshake = value; }
        }

        /// <exception cref="IOException"/>
        internal void WriteHandshakeMessage(byte[] buf, int off, int len)
        {
            if (len < 4)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            short type = TlsUtilities.ReadUint8(buf, off);
            switch (type)
            {
            /*
             * These message types aren't included in the transcript.
             */
            case HandshakeType.hello_request:
            case HandshakeType.key_update:
                break;

            /*
             * Not included in the transcript for (D)TLS 1.3+
             */
            case HandshakeType.new_session_ticket:
            {
                ProtocolVersion negotiatedVersion = Context.ServerVersion;
                if (null != negotiatedVersion && !TlsUtilities.IsTlsV13(negotiatedVersion))
                {
                    m_handshakeHash.Update(buf, off, len);
                }

                break;
            }

            /*
             * These message types are deferred to the writer to explicitly update the transcript.
             */
            case HandshakeType.client_hello:
                break;

            /*
             * For all others we automatically update the transcript. 
             */
            default:
            {
                m_handshakeHash.Update(buf, off, len);
                break;
            }
            }

            int total = 0;
            do
            {
                // Fragment data according to the current fragment limit.
                int toWrite = System.Math.Min(len - total, m_recordStream.PlaintextLimit);
                SafeWriteRecord(ContentType.handshake, buf, off + total, toWrite);
                total += toWrite;
            }
            while (total < len);
        }

        /// <summary>The secure bidirectional stream for this connection</summary>
        /// <remarks>Only allowed in blocking mode.</remarks>
        public virtual Stream Stream
        {
            get
            {
                if (!m_blocking)
                    throw new InvalidOperationException(
                        "Cannot use Stream in non-blocking mode! Use OfferInput()/OfferOutput() instead.");

                return this.m_tlsStream;
            }
        }

        /// <summary>Should be called in non-blocking mode when the input data reaches EOF.</summary>
        /// <exception cref="IOException"/>
        public virtual void CloseInput()
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use CloseInput() in blocking mode!");

            if (m_closed)
                return;

            if (m_inputBuffers.Available > 0)
                throw new EndOfStreamException();

            if (!m_appDataReady)
                throw new TlsFatalAlert(AlertDescription.handshake_failure);

            if (!Peer.RequiresCloseNotify())
            {
                HandleClose(false);
                return;
            }

            HandleFailure();

            throw new TlsNoCloseNotifyException();
        }

        /// <exception cref="IOException"/>
        public virtual RecordPreview PreviewInputRecord(byte[] recordHeader)
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use PreviewInputRecord() in blocking mode!");
            if (m_inputBuffers.Available != 0)
                throw new InvalidOperationException("Can only use PreviewInputRecord() for record-aligned input.");
            if (m_closed)
                throw new IOException("Connection is closed, cannot accept any more input");

            return SafePreviewRecordHeader(recordHeader);
        }

        public virtual int PreviewOutputRecord()
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use PreviewOutputRecord() in blocking mode!");

            ByteQueue buffer = m_outputBuffer.Buffer;
            int available = buffer.Available;
            if (available < 1)
                return 0;

            if (available >= RecordFormat.FragmentOffset)
            {
                int length = buffer.ReadUint16(RecordFormat.LengthOffset);
                int recordSize = RecordFormat.FragmentOffset + length;

                if (available >= recordSize)
                    return recordSize;
            }

            throw new InvalidOperationException("Can only use PreviewOutputRecord() for record-aligned output.");
        }

        /// <exception cref="IOException"/>
        public virtual RecordPreview PreviewOutputRecord(int applicationDataSize)
        {
            if (!m_appDataReady)
                throw new InvalidOperationException(
                    "Cannot use PreviewOutputRecord() until initial handshake completed.");
            if (m_blocking)
                throw new InvalidOperationException("Cannot use PreviewOutputRecord() in blocking mode!");
            if (m_outputBuffer.Buffer.Available != 0)
                throw new InvalidOperationException("Can only use PreviewOutputRecord() for record-aligned output.");
            if (m_closed)
                throw new IOException("Connection is closed, cannot produce any more output");

            if (applicationDataSize < 1)
                return new RecordPreview(0, 0);

            if (m_appDataSplitEnabled)
            {
                switch (m_appDataSplitMode)
                {
                case ADS_MODE_0_N_FIRSTONLY:
                case ADS_MODE_0_N:
                {
                    RecordPreview a = m_recordStream.PreviewOutputRecord(0);
                    RecordPreview b = m_recordStream.PreviewOutputRecord(applicationDataSize);
                    return RecordPreview.CombineAppData(a, b);
                }
                case ADS_MODE_1_Nsub1:
                default:
                {
                    RecordPreview a = m_recordStream.PreviewOutputRecord(1);
                    if (applicationDataSize > 1)
                    {
                        RecordPreview b = m_recordStream.PreviewOutputRecord(applicationDataSize - 1);
                        a = RecordPreview.CombineAppData(a, b);
                    }
                    return a;
                }
                }
            }
            else
            {
                RecordPreview a = m_recordStream.PreviewOutputRecord(applicationDataSize);
                if (m_keyUpdateEnabled && (m_keyUpdatePendingSend || m_recordStream.NeedsKeyUpdate()))
                {
                    int keyUpdateLength = HandshakeMessageOutput.GetLength(1);
                    int recordSize = m_recordStream.PreviewOutputRecordSize(keyUpdateLength);
                    a = RecordPreview.ExtendRecordSize(a, recordSize);
                }
                return a;
            }
        }

        /// <summary>Equivalent to <code>OfferInput(input, 0, input.Length)</code>.</summary>
        /// <param name="input">The input buffer to offer.</param>
        /// <exception cref="IOException"/>
        /// <seealso cref="OfferInput(byte[], int, int)"/>
        public virtual void OfferInput(byte[] input)
        {
            OfferInput(input, 0, input.Length);
        }

        /// <summary>Offer input from an arbitrary source.</summary>
        /// <remarks>Only allowed in non-blocking mode.<br/><br/>
        /// This method will decrypt and process all records that are fully available. If only part of a record is
        /// available, the buffer will be retained until the remainder of the record is offered.<br/><br/>
        /// If any records containing application data were processed, the decrypted data can be obtained using
        /// <see cref="ReadInput(byte[], int, int)"/>. If any records containing protocol data were processed, a
        /// response may have been generated. You should always check to see if there is any available output after
        /// calling this method by calling <see cref="GetAvailableOutputBytes"/>.
        /// </remarks>
        /// <param name="input">The input buffer to offer.</param>
        /// <param name="inputOff">The offset within the input buffer that input begins.</param>
        /// <param name="inputLen">The number of bytes of input being offered.</param>
        /// <exception cref="IOException">If an error occurs while decrypting or processing a record.</exception>
        public virtual void OfferInput(byte[] input, int inputOff, int inputLen)
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use OfferInput() in blocking mode! Use Stream instead.");
            if (m_closed)
                throw new IOException("Connection is closed, cannot accept any more input");

            // Fast path if the input is arriving one record at a time
            if (m_inputBuffers.Available == 0 && SafeReadFullRecord(input, inputOff, inputLen))
            {
                if (m_closed)
                {
                    if (!m_appDataReady)
                    {
                        // NOTE: Any close during the handshake should have raised an exception.
                        throw new TlsFatalAlert(AlertDescription.internal_error);
                    }
                }
                return;
            }

            m_inputBuffers.AddBytes(input, inputOff, inputLen);

            // loop while there are enough bytes to read the length of the next record
            while (m_inputBuffers.Available >= RecordFormat.FragmentOffset)
            {
                byte[] recordHeader = new byte[RecordFormat.FragmentOffset];
                if (RecordFormat.FragmentOffset != m_inputBuffers.Peek(recordHeader))
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                RecordPreview preview = SafePreviewRecordHeader(recordHeader);
                if (m_inputBuffers.Available < preview.RecordSize)
                {
                    // not enough bytes to read a whole record
                    break;
                }

                // NOTE: This is actually reading from inputBuffers, so InterruptedIOException shouldn't be possible
                SafeReadRecord();

                if (m_closed)
                {
                    if (!m_appDataReady)
                    {
                        // NOTE: Any close during the handshake should have raised an exception.
                        throw new TlsFatalAlert(AlertDescription.internal_error);
                    }
                    break;
                }
            }
        }

        public virtual int ApplicationDataLimit
        {
            get { return m_recordStream.PlaintextLimit; }
        }

        /// <summary>Gets the amount of received application data.</summary>
        /// <remarks>A call to <see cref="ReadInput(byte[], int, int)"/> is guaranteed to be able to return at least
        /// this much data.<br/><br/>
        /// Only allowed in non-blocking mode.
        /// </remarks>
        /// <returns>The number of bytes of available application data.</returns>
        public virtual int GetAvailableInputBytes()
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use GetAvailableInputBytes() in blocking mode!");

            return ApplicationDataAvailable;
        }

        /// <summary>Retrieves received application data.</summary>
        /// <remarks>
        /// Use <see cref="GetAvailableInputBytes"/> to check how much application data is currently available. This
        /// method functions similarly to <see cref="Stream.Read(byte[], int, int)"/>, except that it never blocks. If
        /// no data is available, nothing will be copied and zero will be returned.<br/><br/>
        /// Only allowed in non-blocking mode.
        /// </remarks>
        /// <param name="buf">The buffer to hold the application data.</param>
        /// <param name="off">The start offset in the buffer at which the data is written.</param>
        /// <param name="len">The maximum number of bytes to read.</param>
        /// <returns>The total number of bytes copied to the buffer. May be less than the length specified if the
        /// length was greater than the amount of available data.</returns>
        public virtual int ReadInput(byte[] buf, int off, int len)
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use ReadInput() in blocking mode! Use Stream instead.");

            len = System.Math.Min(len, ApplicationDataAvailable);
            if (len < 1)
                return 0;

            m_applicationDataQueue.RemoveData(buf, off, len, 0);
            return len;
        }

        /// <summary>Gets the amount of encrypted data available to be sent.</summary>
        /// <remarks>
        /// A call to <see cref="ReadOutput(byte[], int, int)"/> is guaranteed to be able to return at least this much
        /// data. Only allowed in non-blocking mode.
        /// </remarks>
        /// <returns>The number of bytes of available encrypted data.</returns>
        public virtual int GetAvailableOutputBytes()
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use GetAvailableOutputBytes() in blocking mode! Use Stream instead.");

            return m_outputBuffer.Buffer.Available;
        }

        /// <summary>Retrieves encrypted data to be sent.</summary>
        /// <remarks>
        /// Use <see cref="GetAvailableOutputBytes"/> to check how much encrypted data is currently available. This
        /// method functions similarly to <see cref="Stream.Read(byte[], int, int)"/>, except that it never blocks. If
        /// no data is available, nothing will be copied and zero will be returned. Only allowed in non-blocking mode.
        /// </remarks>
        /// <param name="buffer">The buffer to hold the encrypted data.</param>
        /// <param name="offset">The start offset in the buffer at which the data is written.</param>
        /// <param name="length">The maximum number of bytes to read.</param>
        /// <returns>The total number of bytes copied to the buffer. May be less than the length specified if the
        /// length was greater than the amount of available data.</returns>
        public virtual int ReadOutput(byte[] buffer, int offset, int length)
        {
            if (m_blocking)
                throw new InvalidOperationException("Cannot use ReadOutput() in blocking mode! Use 'Stream() instead.");

            int bytesToRead = System.Math.Min(GetAvailableOutputBytes(), length);
            m_outputBuffer.Buffer.RemoveData(buffer, offset, bytesToRead, 0);
            return bytesToRead;
        }

        protected virtual bool EstablishSession(TlsSession sessionToResume)
        {
            this.m_tlsSession = null;
            this.m_sessionParameters = null;
            this.m_sessionMasterSecret = null;

            if (null == sessionToResume || !sessionToResume.IsResumable)
                return false;

            SessionParameters sessionParameters = sessionToResume.ExportSessionParameters();
            if (null == sessionParameters)
                return false;

            if (!sessionParameters.IsExtendedMasterSecret)
            {
                TlsPeer peer = Peer;
                if (!peer.AllowLegacyResumption() || peer.RequiresExtendedMasterSecret())
                    return false;

                /*
                 * NOTE: For session resumption without extended_master_secret, renegotiation MUST be disabled
                 * (see RFC 7627 5.4).
                 */
            }

            TlsSecret sessionMasterSecret = TlsUtilities.GetSessionMasterSecret(Context.Crypto,
                sessionParameters.MasterSecret);
            if (null == sessionMasterSecret)
                return false;

            this.m_tlsSession = sessionToResume;
            this.m_sessionParameters = sessionParameters;
            this.m_sessionMasterSecret = sessionMasterSecret;

            return true;
        }

        protected virtual void InvalidateSession()
        {
            if (m_sessionMasterSecret != null)
            {
                m_sessionMasterSecret.Destroy();
                this.m_sessionMasterSecret = null;
            }

            if (m_sessionParameters != null)
            {
                m_sessionParameters.Clear();
                this.m_sessionParameters = null;
            }

            if (m_tlsSession != null)
            {
                m_tlsSession.Invalidate();
                this.m_tlsSession = null;
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void ProcessFinishedMessage(MemoryStream buf)
        {
            TlsContext context = Context;
            SecurityParameters securityParameters = context.SecurityParameters;
            bool isServerContext = context.IsServer;

            byte[] verify_data = TlsUtilities.ReadFully(securityParameters.VerifyDataLength, buf);

            AssertEmpty(buf);

            byte[] expected_verify_data = TlsUtilities.CalculateVerifyData(context, m_handshakeHash, !isServerContext);

            /*
             * Compare both checksums.
             */
            if (!Arrays.ConstantTimeAreEqual(expected_verify_data, verify_data))
            {
                /*
                 * Wrong checksum in the finished message.
                 */
                throw new TlsFatalAlert(AlertDescription.decrypt_error);
            }

            securityParameters.m_peerVerifyData = expected_verify_data;

            if (!securityParameters.IsResumedSession || securityParameters.IsExtendedMasterSecret)
            {
                if (null == securityParameters.LocalVerifyData)
                {
                    securityParameters.m_tlsUnique = expected_verify_data;
                }
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void Process13FinishedMessage(MemoryStream buf)
        {
            TlsContext context = Context;
            SecurityParameters securityParameters = context.SecurityParameters;
            bool isServerContext = context.IsServer;

            byte[] verify_data = TlsUtilities.ReadFully(securityParameters.VerifyDataLength, buf);

            AssertEmpty(buf);

            byte[] expected_verify_data = TlsUtilities.CalculateVerifyData(context, m_handshakeHash, !isServerContext);

            /*
             * Compare both checksums.
             */
            if (!Arrays.ConstantTimeAreEqual(expected_verify_data, verify_data))
            {
                /*
                 * Wrong checksum in the finished message.
                 */
                throw new TlsFatalAlert(AlertDescription.decrypt_error);
            }

            securityParameters.m_peerVerifyData = expected_verify_data;
            securityParameters.m_tlsUnique = null;
        }

        /// <exception cref="IOException"/>
        protected virtual void RaiseAlertFatal(short alertDescription, string message, Exception cause)
        {
            Peer.NotifyAlertRaised(AlertLevel.fatal, alertDescription, message, cause);

            byte[] alert = new byte[]{ (byte)AlertLevel.fatal, (byte)alertDescription };

            try
            {
                m_recordStream.WriteRecord(ContentType.alert, alert, 0, 2);
            }
            catch (Exception)
            {
                // We are already processing an exception, so just ignore this
            }
        }

        /// <exception cref="IOException"/>
        protected virtual void RaiseAlertWarning(short alertDescription, string message)
        {
            Peer.NotifyAlertRaised(AlertLevel.warning, alertDescription, message, null);

            byte[] alert = new byte[]{ (byte)AlertLevel.warning, (byte)alertDescription };

            SafeWriteRecord(ContentType.alert, alert, 0, 2);
        }


        /// <exception cref="IOException"/>
        protected virtual void Receive13KeyUpdate(MemoryStream buf)
        {
            // TODO[tls13] This is interesting enough to notify the TlsPeer for possible logging/vetting

            if (!(m_appDataReady && m_keyUpdateEnabled))
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            short requestUpdate = TlsUtilities.ReadUint8(buf);

            AssertEmpty(buf);

            if (!KeyUpdateRequest.IsValid(requestUpdate))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            bool updateRequested = (KeyUpdateRequest.update_requested == requestUpdate);

            TlsUtilities.Update13TrafficSecretPeer(Context);
            m_recordStream.NotifyKeyUpdateReceived();

            //this.m_keyUpdatePendingReceive &= updateRequested;
            this.m_keyUpdatePendingSend |= updateRequested;
        }

        /// <exception cref="IOException"/>
        protected virtual void SendCertificateMessage(Certificate certificate, Stream endPointHash)
        {
            TlsContext context = Context;
            SecurityParameters securityParameters = context.SecurityParameters;
            if (null != securityParameters.LocalCertificate)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            if (null == certificate)
            {
                certificate = Certificate.EmptyChain;
            }

            if (certificate.IsEmpty && !context.IsServer && securityParameters.NegotiatedVersion.IsSsl)
            {
                string message = "SSLv3 client didn't provide credentials";
                RaiseAlertWarning(AlertDescription.no_certificate, message);
            }
            else
            {
                HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.certificate);
                certificate.Encode(context, message, endPointHash);
                message.Send(this);
            }

            securityParameters.m_localCertificate = certificate;
        }

        /// <exception cref="IOException"/>
        protected virtual void Send13CertificateMessage(Certificate certificate)
        {
            if (null == certificate)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            TlsContext context = Context;
            SecurityParameters securityParameters = context.SecurityParameters;
            if (null != securityParameters.LocalCertificate)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.certificate);
            certificate.Encode(context, message, null);
            message.Send(this);

            securityParameters.m_localCertificate = certificate;
        }

        /// <exception cref="IOException"/>
        protected virtual void Send13CertificateVerifyMessage(DigitallySigned certificateVerify)
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.certificate_verify);
            certificateVerify.Encode(message);
            message.Send(this);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendChangeCipherSpec()
        {
            SendChangeCipherSpecMessage();
            m_recordStream.EnablePendingCipherWrite();
        }

        /// <exception cref="IOException"/>
        protected virtual void SendChangeCipherSpecMessage()
        {
            byte[] message = new byte[]{ 1 };
            SafeWriteRecord(ContentType.change_cipher_spec, message, 0, message.Length);
        }

        /// <exception cref="IOException"/>
        protected virtual void SendFinishedMessage()
        {
            TlsContext context = Context;
            SecurityParameters securityParameters = context.SecurityParameters;
            bool isServerContext = context.IsServer;

            byte[] verify_data = TlsUtilities.CalculateVerifyData(context, m_handshakeHash, isServerContext);

            securityParameters.m_localVerifyData = verify_data;

            if (!securityParameters.IsResumedSession || securityParameters.IsExtendedMasterSecret)
            {
                if (null == securityParameters.PeerVerifyData)
                {
                    securityParameters.m_tlsUnique = verify_data;
                }
            }

            HandshakeMessageOutput.Send(this, HandshakeType.finished, verify_data);
        }

        /// <exception cref="IOException"/>
        protected virtual void Send13FinishedMessage()
        {
            TlsContext context = Context;
            SecurityParameters securityParameters = context.SecurityParameters;
            bool isServerContext = context.IsServer;

            byte[] verify_data = TlsUtilities.CalculateVerifyData(context, m_handshakeHash, isServerContext);

            securityParameters.m_localVerifyData = verify_data;
            securityParameters.m_tlsUnique = null;

            HandshakeMessageOutput.Send(this, HandshakeType.finished, verify_data);
        }

        /// <exception cref="IOException"/>
        protected virtual void Send13KeyUpdate(bool updateRequested)
        {
            // TODO[tls13] This is interesting enough to notify the TlsPeer for possible logging/vetting

            if (!(m_appDataReady && m_keyUpdateEnabled))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            short requestUpdate = updateRequested
                ? KeyUpdateRequest.update_requested
                : KeyUpdateRequest.update_not_requested;

            HandshakeMessageOutput.Send(this, HandshakeType.key_update, TlsUtilities.EncodeUint8(requestUpdate));

            TlsUtilities.Update13TrafficSecretLocal(Context);
            m_recordStream.NotifyKeyUpdateSent();

            //this.m_keyUpdatePendingReceive |= updateRequested;
            this.m_keyUpdatePendingSend &= updateRequested;
        }

        /// <exception cref="IOException"/>
        protected virtual void SendSupplementalDataMessage(IList<SupplementalDataEntry> supplementalData)
        {
            HandshakeMessageOutput message = new HandshakeMessageOutput(HandshakeType.supplemental_data);
            WriteSupplementalData(message, supplementalData);
            message.Send(this);
        }

        public virtual void Close()
        {
            HandleClose(true);
        }

        public virtual void Flush()
        {
        }

        internal bool IsApplicationDataReady
        {
            get { return m_appDataReady; }
        }

        public virtual bool IsClosed
        {
            get { return m_closed; }
        }

        public virtual bool IsConnected
        {
            get
            {
                if (m_closed)
                    return false;

                AbstractTlsContext context = ContextAdmin;

                return null != context && context.IsConnected;
            }
        }

        public virtual bool IsHandshaking
        {
            get
            {
                if (m_closed)
                    return false;

                AbstractTlsContext context = ContextAdmin;

                return null != context && context.IsHandshaking;
            }
        }

        /// <exception cref="IOException"/>
        protected virtual short ProcessMaxFragmentLengthExtension(IDictionary<int, byte[]> clientExtensions,
            IDictionary<int, byte[]> serverExtensions, short alertDescription)
        {
            short maxFragmentLength = TlsExtensionsUtilities.GetMaxFragmentLengthExtension(serverExtensions);
            if (maxFragmentLength >= 0)
            {
                if (!MaxFragmentLength.IsValid(maxFragmentLength) ||
                (clientExtensions != null &&
                    maxFragmentLength != TlsExtensionsUtilities.GetMaxFragmentLengthExtension(clientExtensions)))
                {
                    throw new TlsFatalAlert(alertDescription);
                }
            }
            return maxFragmentLength;
        }

        /// <exception cref="IOException"/>
        protected virtual void RefuseRenegotiation()
        {
            /*
             * RFC 5746 4.5 SSLv3 clients [..] SHOULD use a fatal handshake_failure alert.
             */
            if (TlsUtilities.IsSsl(Context))
                throw new TlsFatalAlert(AlertDescription.handshake_failure);

            RaiseAlertWarning(AlertDescription.no_renegotiation, "Renegotiation not supported");
        }

        /// <summary>Make sure the <see cref="Stream"/> 'buf' is now empty. Fail otherwise.</summary>
        /// <param name="buf">The <see cref="Stream"/> to check.</param>
        /// <exception cref="IOException"/>
        internal static void AssertEmpty(MemoryStream buf)
        {
            if (buf.Position < buf.Length)
                throw new TlsFatalAlert(AlertDescription.decode_error);
        }

        internal static byte[] CreateRandomBlock(bool useGmtUnixTime, TlsContext context)
        {
            byte[] result = context.NonceGenerator.GenerateNonce(32);

            if (useGmtUnixTime)
            {
                TlsUtilities.WriteGmtUnixTime(result, 0);
            }

            return result;
        }

        /// <exception cref="IOException"/>
        internal static byte[] CreateRenegotiationInfo(byte[] renegotiated_connection)
        {
            return TlsUtilities.EncodeOpaque8(renegotiated_connection);
        }

        /// <exception cref="IOException"/>
        internal static void EstablishMasterSecret(TlsContext context, TlsKeyExchange keyExchange)
        {
            TlsSecret preMasterSecret = keyExchange.GeneratePreMasterSecret();
            if (preMasterSecret == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            try
            {
                context.SecurityParameters.m_masterSecret = TlsUtilities.CalculateMasterSecret(context,
                    preMasterSecret);
            }
            finally
            {
                /*
                 * RFC 2246 8.1. The pre_master_secret should be deleted from memory once the
                 * master_secret has been computed.
                 */
                preMasterSecret.Destroy();
            }
        }

        /// <exception cref="IOException"/>
        internal static IDictionary<int, byte[]> ReadExtensions(MemoryStream input)
        {
            if (input.Position >= input.Length)
                return null;

            byte[] extBytes = TlsUtilities.ReadOpaque16(input);

            AssertEmpty(input);

            return ReadExtensionsData(extBytes);
        }

        /// <exception cref="IOException"/>
        internal static IDictionary<int, byte[]> ReadExtensionsData(byte[] extBytes)
        {
            // Int32 -> byte[]
            var extensions = new Dictionary<int, byte[]>();

            if (extBytes.Length > 0)
            {
                MemoryStream buf = new MemoryStream(extBytes, false);

                do
                {
                    int extension_type = TlsUtilities.ReadUint16(buf);
                    byte[] extension_data = TlsUtilities.ReadOpaque16(buf);

                    /*
                     * RFC 3546 2.3 There MUST NOT be more than one extension of the same type.
                     */
                    if (extensions.ContainsKey(extension_type))
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter,
                            "Repeated extension: " + ExtensionType.GetText(extension_type));

                    extensions.Add(extension_type, extension_data);
                }
                while (buf.Position < buf.Length);
            }

            return extensions;
        }

        /// <exception cref="IOException"/>
        internal static IDictionary<int, byte[]> ReadExtensionsData13(int handshakeType, byte[] extBytes)
        {
            // Int32 -> byte[]
            var extensions = new Dictionary<int, byte[]>();

            if (extBytes.Length > 0)
            {
                MemoryStream buf = new MemoryStream(extBytes, false);

                do
                {
                    int extension_type = TlsUtilities.ReadUint16(buf);

                    if (!TlsUtilities.IsPermittedExtensionType13(handshakeType, extension_type))
                    {
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter,
                            "Invalid extension: " + ExtensionType.GetText(extension_type));
                    }

                    byte[] extension_data = TlsUtilities.ReadOpaque16(buf);

                    /*
                     * RFC 3546 2.3 There MUST NOT be more than one extension of the same type.
                     */
                    if (extensions.ContainsKey(extension_type))
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter,
                            "Repeated extension: " + ExtensionType.GetText(extension_type));

                    extensions.Add(extension_type, extension_data);
                }
                while (buf.Position < buf.Length);
            }

            return extensions;
        }

        /// <exception cref="IOException"/>
        internal static IDictionary<int, byte[]> ReadExtensionsDataClientHello(byte[] extBytes)
        {
            /*
             * TODO[tls13] We are currently allowing any extensions to appear in ClientHello. It is
             * somewhat complicated to restrict what can appear based on the specific set of versions
             * the client is offering, and anyway could be fragile since clients may take a
             * "kitchen sink" approach to adding extensions independently of the offered versions.
             */

            // Int32 -> byte[]
            var extensions = new Dictionary<int, byte[]>();

            if (extBytes.Length > 0)
            {
                MemoryStream buf = new MemoryStream(extBytes, false);

                int extension_type;
                bool pre_shared_key_found = false;

                do
                {
                    extension_type = TlsUtilities.ReadUint16(buf);
                    byte[] extension_data = TlsUtilities.ReadOpaque16(buf);

                    /*
                     * RFC 3546 2.3 There MUST NOT be more than one extension of the same type.
                     */
                    if (extensions.ContainsKey(extension_type))
                        throw new TlsFatalAlert(AlertDescription.illegal_parameter,
                            "Repeated extension: " + ExtensionType.GetText(extension_type));

                    extensions.Add(extension_type, extension_data);

                    pre_shared_key_found |= (ExtensionType.pre_shared_key == extension_type);
                }
                while (buf.Position < buf.Length);

                if (pre_shared_key_found && (ExtensionType.pre_shared_key != extension_type))
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter,
                        "'pre_shared_key' MUST be last in ClientHello");
            }

            return extensions;
        }

        /// <exception cref="IOException"/>
        internal static IList<SupplementalDataEntry> ReadSupplementalDataMessage(MemoryStream input)
        {
            byte[] supp_data = TlsUtilities.ReadOpaque24(input, 1);

            AssertEmpty(input);

            MemoryStream buf = new MemoryStream(supp_data, false);

            var supplementalData = new List<SupplementalDataEntry>();

            while (buf.Position < buf.Length)
            {
                int supp_data_type = TlsUtilities.ReadUint16(buf);
                byte[] data = TlsUtilities.ReadOpaque16(buf);

                supplementalData.Add(new SupplementalDataEntry(supp_data_type, data));
            }

            return supplementalData;
        }

        /// <exception cref="IOException"/>
        internal static void WriteExtensions(Stream output, IDictionary<int, byte[]> extensions)
        {
            WriteExtensions(output, extensions, 0);
        }

        /// <exception cref="IOException"/>
        internal static void WriteExtensions(Stream output, IDictionary<int, byte[]> extensions, int bindersSize)
        {
            if (null == extensions || extensions.Count < 1)
                return;

            byte[] extBytes = WriteExtensionsData(extensions, bindersSize);

            int lengthWithBinders = extBytes.Length + bindersSize;
            TlsUtilities.CheckUint16(lengthWithBinders);
            TlsUtilities.WriteUint16(lengthWithBinders, output);
            output.Write(extBytes, 0, extBytes.Length);
        }

        /// <exception cref="IOException"/>
        internal static byte[] WriteExtensionsData(IDictionary<int, byte[]> extensions)
        {
            return WriteExtensionsData(extensions, 0);
        }

        /// <exception cref="IOException"/>
        internal static byte[] WriteExtensionsData(IDictionary<int, byte[]> extensions, int bindersSize)
        {
            MemoryStream buf = new MemoryStream();
            WriteExtensionsData(extensions, buf, bindersSize);
            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        internal static void WriteExtensionsData(IDictionary<int, byte[]> extensions, MemoryStream buf)
        {
            WriteExtensionsData(extensions, buf, 0);
        }

        /// <exception cref="IOException"/>
        internal static void WriteExtensionsData(IDictionary<int, byte[]> extensions, MemoryStream buf, int bindersSize)
        {
            /*
             * NOTE: There are reports of servers that don't accept a zero-length extension as the last
             * one, so we write out any zero-length ones first as a best-effort workaround.
             */
            WriteSelectedExtensions(buf, extensions, true);
            WriteSelectedExtensions(buf, extensions, false);
            WritePreSharedKeyExtension(buf, extensions, bindersSize);
        }

        /// <exception cref="IOException"/>
        internal static void WritePreSharedKeyExtension(MemoryStream buf, IDictionary<int, byte[]> extensions,
            int bindersSize)
        {
            if (extensions.TryGetValue(ExtensionType.pre_shared_key, out var extension_data))
            {
                TlsUtilities.CheckUint16(ExtensionType.pre_shared_key);
                TlsUtilities.WriteUint16(ExtensionType.pre_shared_key, buf);

                int lengthWithBinders = extension_data.Length + bindersSize;
                TlsUtilities.CheckUint16(lengthWithBinders);
                TlsUtilities.WriteUint16(lengthWithBinders, buf);
                buf.Write(extension_data, 0, extension_data.Length);
            }
        }

        /// <exception cref="IOException"/>
        internal static void WriteSelectedExtensions(Stream output, IDictionary<int, byte[]> extensions,
            bool selectEmpty)
        {
            foreach (var extension in extensions)
            {
                int extension_type = extension.Key;

                // NOTE: Must be last; handled by 'WritePreSharedKeyExtension'
                if (ExtensionType.pre_shared_key == extension_type)
                    continue;

                byte[] extension_data = extension.Value;

                if (selectEmpty == (extension_data.Length == 0))
                {
                    TlsUtilities.CheckUint16(extension_type);
                    TlsUtilities.WriteUint16(extension_type, output);
                    TlsUtilities.WriteOpaque16(extension_data, output);
                }
            }
        }

        /// <exception cref="IOException"/>
        internal static void WriteSupplementalData(Stream output, IList<SupplementalDataEntry> supplementalData)
        {
            MemoryStream buf = new MemoryStream();

            foreach (SupplementalDataEntry entry in supplementalData)
            {
                int supp_data_type = entry.DataType;
                TlsUtilities.CheckUint16(supp_data_type);
                TlsUtilities.WriteUint16(supp_data_type, buf);
                TlsUtilities.WriteOpaque16(entry.Data, buf);
            }

            byte[] supp_data = buf.ToArray();

            TlsUtilities.WriteOpaque24(supp_data, output);
        }
    }
}
