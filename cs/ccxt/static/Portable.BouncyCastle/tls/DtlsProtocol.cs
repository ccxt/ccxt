using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public abstract class DtlsProtocol
    {
        internal DtlsProtocol()
        {
        }

        /// <exception cref="IOException"/>
        internal virtual void ProcessFinished(byte[] body, byte[] expected_verify_data)
        {
            MemoryStream buf = new MemoryStream(body, false);

            byte[] verify_data = TlsUtilities.ReadFully(expected_verify_data.Length, buf);

            TlsProtocol.AssertEmpty(buf);

            if (!Arrays.ConstantTimeAreEqual(expected_verify_data, verify_data))
                throw new TlsFatalAlert(AlertDescription.handshake_failure);
        }

        /// <exception cref="IOException"/>
        internal static void ApplyMaxFragmentLengthExtension(DtlsRecordLayer recordLayer, short maxFragmentLength)
        {
            if (maxFragmentLength >= 0)
            {
                if (!MaxFragmentLength.IsValid(maxFragmentLength))
                    throw new TlsFatalAlert(AlertDescription.internal_error); 

                int plainTextLimit = 1 << (8 + maxFragmentLength);
                recordLayer.SetPlaintextLimit(plainTextLimit);
            }
        }

        /// <exception cref="IOException"/>
        internal static short EvaluateMaxFragmentLengthExtension(bool resumedSession,
            IDictionary<int, byte[]> clientExtensions, IDictionary<int, byte[]> serverExtensions,
            short alertDescription)
        {
            short maxFragmentLength = TlsExtensionsUtilities.GetMaxFragmentLengthExtension(serverExtensions);
            if (maxFragmentLength >= 0)
            {
                if (!MaxFragmentLength.IsValid(maxFragmentLength)
                    || (!resumedSession && maxFragmentLength != TlsExtensionsUtilities
                        .GetMaxFragmentLengthExtension(clientExtensions)))
                {
                    throw new TlsFatalAlert(alertDescription);
                }
            }
            return maxFragmentLength;
        }

        /// <exception cref="IOException"/>
        internal static byte[] GenerateCertificate(TlsContext context, Certificate certificate, Stream endPointHash)
        {
            MemoryStream buf = new MemoryStream();
            certificate.Encode(context, buf, endPointHash);
            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        internal static byte[] GenerateSupplementalData(IList<SupplementalDataEntry> supplementalData)
        {
            MemoryStream buf = new MemoryStream();
            TlsProtocol.WriteSupplementalData(buf, supplementalData);
            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        internal static void SendCertificateMessage(TlsContext context, DtlsReliableHandshake handshake,
            Certificate certificate, Stream endPointHash)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            if (null != securityParameters.LocalCertificate)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            if (null == certificate)
            {
                certificate = Certificate.EmptyChain;
            }

            byte[] certificateBody = GenerateCertificate(context, certificate, endPointHash);
            handshake.SendMessage(HandshakeType.certificate, certificateBody);

            securityParameters.m_localCertificate = certificate;
        }

        /// <exception cref="IOException"/>
        internal static int ValidateSelectedCipherSuite(int selectedCipherSuite, short alertDescription)
        {
            switch (TlsUtilities.GetEncryptionAlgorithm(selectedCipherSuite))
            {
            case EncryptionAlgorithm.RC4_40:
            case EncryptionAlgorithm.RC4_128:
            case -1:
                throw new TlsFatalAlert(alertDescription);
            default:
                return selectedCipherSuite;
            }
        }
    }
}
