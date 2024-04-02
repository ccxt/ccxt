using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 5764 4.1.1</summary>
    public sealed class UseSrtpData
    {
        private readonly int[] m_protectionProfiles;
        private readonly byte[] m_mki;

        /// <param name="protectionProfiles">see <see cref="SrtpProtectionProfile"/> for valid constants.</param>
        /// <param name="mki">valid lengths from 0 to 255.</param>
        public UseSrtpData(int[] protectionProfiles, byte[] mki)
        {
            if (TlsUtilities.IsNullOrEmpty(protectionProfiles) || protectionProfiles.Length >= (1 << 15))
                throw new ArgumentException("must have length from 1 to (2^15 - 1)", "protectionProfiles");

            if (mki == null)
            {
                mki = TlsUtilities.EmptyBytes;
            }
            else if (mki.Length > 255)
            {
                throw new ArgumentException("cannot be longer than 255 bytes", "mki");
            }

            this.m_protectionProfiles = protectionProfiles;
            this.m_mki = mki;
        }

        /// <returns>see <see cref="SrtpProtectionProfile"/> for valid constants.</returns>
        public int[] ProtectionProfiles
        {
            get { return m_protectionProfiles; }
        }

        /// <returns>valid lengths from 0 to 255.</returns>
        public byte[] Mki
        {
            get { return m_mki; }
        }
    }
}
