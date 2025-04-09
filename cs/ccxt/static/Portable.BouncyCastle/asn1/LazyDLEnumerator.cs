using System;
using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
    internal class LazyDLEnumerator
        : IEnumerator<Asn1Encodable>
    {
        private readonly byte[] m_contents;

        private Asn1InputStream m_input;
        private Asn1Object m_current;

        internal LazyDLEnumerator(byte[] contents)
        {
            this.m_contents = contents;

            Reset();
        }

        object System.Collections.IEnumerator.Current
        {
            get { return Current; }
        }

        public Asn1Encodable Current
        {
            get
            {
                if (null == m_current)
                    throw new InvalidOperationException();

                return m_current;
            }
        }

        public virtual void Dispose()
        {
        }

        public bool MoveNext()
        {
            return null != (this.m_current = ReadObject());
        }

        public void Reset()
        {
            this.m_input = new LazyAsn1InputStream(m_contents);
            this.m_current = null;
        }

        private Asn1Object ReadObject()
        {
            try
            {
                return m_input.ReadObject();
            }
            catch (IOException e)
            {
                throw new Asn1ParsingException("malformed ASN.1: " + e.Message, e);
            }
        }
    }
}
