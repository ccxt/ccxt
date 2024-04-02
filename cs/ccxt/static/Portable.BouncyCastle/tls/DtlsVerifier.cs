using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public class DtlsVerifier
    {
        private static TlsMac CreateCookieMac(TlsCrypto crypto)
        {
            TlsMac mac = crypto.CreateHmac(MacAlgorithm.hmac_sha256);

            byte[] secret = new byte[mac.MacLength];
            crypto.SecureRandom.NextBytes(secret);

            mac.SetKey(secret, 0, secret.Length);

            return mac;
        }

        private readonly TlsMac m_cookieMac;
        private readonly TlsMacSink m_cookieMacSink;

        public DtlsVerifier(TlsCrypto crypto)
        {
            this.m_cookieMac = CreateCookieMac(crypto);
            this.m_cookieMacSink = new TlsMacSink(m_cookieMac);
        }

        public virtual DtlsRequest VerifyRequest(byte[] clientID, byte[] data, int dataOff, int dataLen,
            DatagramSender sender)
        {
            lock (this)
            {
                bool resetCookieMac = true;

                try
                {
                    m_cookieMac.Update(clientID, 0, clientID.Length);

                    DtlsRequest request = DtlsReliableHandshake.ReadClientRequest(data, dataOff, dataLen,
                        m_cookieMacSink);
                    if (null != request)
                    {
                        byte[] expectedCookie = m_cookieMac.CalculateMac();
                        resetCookieMac = false;

                        // TODO Consider stricter HelloVerifyRequest protocol
                        //switch (request.MessageSeq)
                        //{
                        //case 0:
                        //{
                        //    DtlsReliableHandshake.SendHelloVerifyRequest(sender, request.RecordSeq, expectedCookie);
                        //    break;
                        //}
                        //case 1:
                        //{
                        //    if (Arrays.ConstantTimeAreEqual(expectedCookie, request.ClientHello.Cookie))
                        //        return request;

                        //    break;
                        //}
                        //}

                        if (Arrays.ConstantTimeAreEqual(expectedCookie, request.ClientHello.Cookie))
                            return request;

                        DtlsReliableHandshake.SendHelloVerifyRequest(sender, request.RecordSeq, expectedCookie);
                    }
                }
                catch (IOException)
                {
                    // Ignore
                }
                finally
                {
                    if (resetCookieMac)
                    {
                        m_cookieMac.Reset();
                    }
                }

                return null;
            }
        }
    }
}
