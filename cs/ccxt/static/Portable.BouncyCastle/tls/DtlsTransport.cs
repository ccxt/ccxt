using System;
using System.IO;
#if !PORTABLE || DOTNET
using System.Net.Sockets;
#endif

namespace Org.BouncyCastle.Tls
{
    public class DtlsTransport
        : DatagramTransport
    {
        private readonly DtlsRecordLayer m_recordLayer;

        internal DtlsTransport(DtlsRecordLayer recordLayer)
        {
            this.m_recordLayer = recordLayer;
        }

        /// <exception cref="IOException"/>
        public virtual int GetReceiveLimit()
        {
            return m_recordLayer.GetReceiveLimit();
        }

        /// <exception cref="IOException"/>
        public virtual int GetSendLimit()
        {
            return m_recordLayer.GetSendLimit();
        }

        /// <exception cref="IOException"/>
        public virtual int Receive(byte[] buf, int off, int len, int waitMillis)
        {
            if (null == buf)
                throw new ArgumentNullException("buf");
            if (off < 0 || off >= buf.Length)
                throw new ArgumentException("invalid offset: " + off, "off");
            if (len < 0 || len > buf.Length - off)
                throw new ArgumentException("invalid length: " + len, "len");
            if (waitMillis < 0)
                throw new ArgumentException("cannot be negative", "waitMillis");

            try
            {
                return m_recordLayer.Receive(buf, off, len, waitMillis);
            }
            catch (TlsFatalAlert fatalAlert)
            {
                m_recordLayer.Fail(fatalAlert.AlertDescription);
                throw fatalAlert;
            }
            catch (TlsTimeoutException e)
            {
                throw e;
            }
#if !PORTABLE || DOTNET
            catch (SocketException e)
            {
                if (TlsUtilities.IsTimeout(e))
                    throw e;

                m_recordLayer.Fail(AlertDescription.internal_error);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
#endif
            // TODO[tls-port] Can we support interrupted IO on .NET?
            //catch (InterruptedIOException e)
            //{
            //    throw e;
            //}
            catch (IOException e)
            {
                m_recordLayer.Fail(AlertDescription.internal_error);
                throw e;
            }
            catch (Exception e)
            {
                m_recordLayer.Fail(AlertDescription.internal_error);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
        }

        /// <exception cref="IOException"/>
        public virtual void Send(byte[] buf, int off, int len)
        {
            if (null == buf)
                throw new ArgumentNullException("buf");
            if (off < 0 || off >= buf.Length)
                throw new ArgumentException("invalid offset: " + off, "off");
            if (len < 0 || len > buf.Length - off)
                throw new ArgumentException("invalid length: " + len, "len");

            try
            {
                m_recordLayer.Send(buf, off, len);
            }
            catch (TlsFatalAlert fatalAlert)
            {
                m_recordLayer.Fail(fatalAlert.AlertDescription);
                throw fatalAlert;
            }
            catch (TlsTimeoutException e)
            {
                throw e;
            }
#if !PORTABLE || DOTNET
            catch (SocketException e)
            {
                if (TlsUtilities.IsTimeout(e))
                    throw e;

                m_recordLayer.Fail(AlertDescription.internal_error);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
#endif
            // TODO[tls-port] Can we support interrupted IO on .NET?
            //catch (InterruptedIOException e)
            //{
            //    throw e;
            //}
            catch (IOException e)
            {
                m_recordLayer.Fail(AlertDescription.internal_error);
                throw e;
            }
            catch (Exception e)
            {
                m_recordLayer.Fail(AlertDescription.internal_error);
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }
        }

        /// <exception cref="IOException"/>
        public virtual void Close()
        {
            m_recordLayer.Close();
        }
    }
}
