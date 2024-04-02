using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Tls
{
    internal sealed class DtlsReassembler
    {
        private readonly short m_msg_type;
        private readonly byte[] m_body;

        private readonly List<Range> m_missing = new List<Range>();

        internal DtlsReassembler(short msg_type, int length)
        {
            this.m_msg_type = msg_type;
            this.m_body = new byte[length];
            this.m_missing.Add(new Range(0, length));
        }

        internal short MsgType
        {
            get { return m_msg_type; }
        }

        internal byte[] GetBodyIfComplete()
        {
            return m_missing.Count > 0 ? null : m_body;
        }

        internal void ContributeFragment(short msg_type, int length, byte[] buf, int off, int fragment_offset,
            int fragment_length)
        {
            int fragment_end = fragment_offset + fragment_length;

            if (m_msg_type != msg_type || m_body.Length != length || fragment_end > length)
                return;

            if (fragment_length == 0)
            {
                // NOTE: Empty messages still require an empty fragment to complete it
                if (fragment_offset == 0 && m_missing.Count > 0)
                {
                    Range firstRange = (Range)m_missing[0];
                    if (firstRange.End == 0)
                    {
                        m_missing.RemoveAt(0);
                    }
                }
                return;
            }

            for (int i = 0; i < m_missing.Count; ++i)
            {
                Range range = (Range)m_missing[i];
                if (range.Start >= fragment_end)
                    break;

                if (range.End > fragment_offset)
                {
                    int copyStart = System.Math.Max(range.Start, fragment_offset);
                    int copyEnd = System.Math.Min(range.End, fragment_end);
                    int copyLength = copyEnd - copyStart;

                    Array.Copy(buf, off + copyStart - fragment_offset, m_body, copyStart, copyLength);

                    if (copyStart == range.Start)
                    {
                        if (copyEnd == range.End)
                        {
                            m_missing.RemoveAt(i--);
                        }
                        else
                        {
                            range.Start = copyEnd;
                        }
                    }
                    else
                    {
                        if (copyEnd != range.End)
                        {
                            m_missing.Insert(++i, new Range(copyEnd, range.End));
                        }
                        range.End = copyStart;
                    }
                }
            }
        }

        internal void Reset()
        {
            m_missing.Clear();
            m_missing.Add(new Range(0, m_body.Length));
        }

        private sealed class Range
        {
            private int m_start, m_end;

            internal Range(int start, int end)
            {
                this.m_start = start;
                this.m_end = end;
            }

            public int Start
            {
                get { return m_start; }
                set { this.m_start = value; }
            }

            public int End
            {
                get { return m_end; }
                set { this.m_end = value; }
            }
        }
    }
}
