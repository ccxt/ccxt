using System;
using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 5764 DTLS Extension to Establish Keys for SRTP.</summary>
    public abstract class TlsSrtpUtilities
{
        /// <exception cref="IOException"/>
        public static void AddUseSrtpExtension(IDictionary<int, byte[]> extensions, UseSrtpData useSrtpData)
        {
            extensions[ExtensionType.use_srtp] = CreateUseSrtpExtension(useSrtpData);
        }

        /// <exception cref="IOException"/>
        public static UseSrtpData GetUseSrtpExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.use_srtp);
            return extensionData == null ? null : ReadUseSrtpExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateUseSrtpExtension(UseSrtpData useSrtpData)
        {
            if (useSrtpData == null)
                throw new ArgumentNullException("useSrtpData");

            MemoryStream buf = new MemoryStream();

            // SRTPProtectionProfiles
            TlsUtilities.WriteUint16ArrayWithUint16Length(useSrtpData.ProtectionProfiles, buf);

            // srtp_mki
            TlsUtilities.WriteOpaque8(useSrtpData.Mki, buf);

            return buf.ToArray();
        }

        /// <exception cref="IOException"/>
        public static UseSrtpData ReadUseSrtpExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            MemoryStream buf = new MemoryStream(extensionData, false);

            // SRTPProtectionProfiles
            int length = TlsUtilities.ReadUint16(buf);
            if (length < 2 || (length & 1) != 0)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int[] protectionProfiles = TlsUtilities.ReadUint16Array(length / 2, buf);

            // srtp_mki
            byte[] mki = TlsUtilities.ReadOpaque8(buf);

            TlsProtocol.AssertEmpty(buf);

            return new UseSrtpData(protectionProfiles, mki);
        }
    }
}
