using System;

namespace Org.BouncyCastle.Tls
{
    /**
     * RFC 4347 4.1.2.5 Anti-replay
     * <p>
     * Support fast rejection of duplicate records by maintaining a sliding receive window
     * </p>
     */
    internal sealed class DtlsReplayWindow
    {
        private const long ValidSeqMask = 0x0000FFFFFFFFFFFFL;

        private const long WindowSize = 64L;

        private long m_latestConfirmedSeq = -1;
        private ulong m_bitmap = 0;

        /// <summary>Check whether a received record with the given sequence number should be rejected as a duplicate.
        /// </summary>
        /// <param name="seq">the 48-bit DTLSPlainText.sequence_number field of a received record.</param>
        /// <returns>true if the record should be discarded without further processing.</returns>
        internal bool ShouldDiscard(long seq)
        {
            if ((seq & ValidSeqMask) != seq)
                return true;

            if (seq <= m_latestConfirmedSeq)
            {
                long diff = m_latestConfirmedSeq - seq;
                if (diff >= WindowSize)
                    return true;

                if ((m_bitmap & (1UL << (int)diff)) != 0)
                    return true;
            }

            return false;
        }

        /// <summary>Report that a received record with the given sequence number passed authentication checks.
        /// </summary>
        /// <param name="seq">the 48-bit DTLSPlainText.sequence_number field of an authenticated record.</param>
        internal void ReportAuthenticated(long seq)
        {
            if ((seq & ValidSeqMask) != seq)
                throw new ArgumentException("out of range", "seq");

            if (seq <= m_latestConfirmedSeq)
            {
                long diff = m_latestConfirmedSeq - seq;
                if (diff < WindowSize)
                {
                    m_bitmap |= (1UL << (int)diff);
                }
            }
            else
            {
                long diff = seq - m_latestConfirmedSeq;
                if (diff >= WindowSize)
                {
                    m_bitmap = 1;
                }
                else
                {
                    m_bitmap <<= (int)diff;        // for earlier JDKs
                    m_bitmap |= 1UL;
                }
                m_latestConfirmedSeq = seq;
            }
        }

        internal void Reset(long seq)
        {
            if ((seq & ValidSeqMask) != seq)
                throw new ArgumentException("out of range", "seq");

            // Discard future records unless sequence number > 'seq'
            m_latestConfirmedSeq = seq;
            m_bitmap = ulong.MaxValue >> (int)System.Math.Max(0, 63 - seq);
        }
    }
}
