using System;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>A combined hash, which implements md5(m) || sha1(m).</summary>
    public class CombinedHash
        : TlsHash
    {
        protected readonly TlsContext m_context;
        protected readonly TlsCrypto m_crypto;
        protected readonly TlsHash m_md5;
        protected readonly TlsHash m_sha1;

        internal CombinedHash(TlsContext context, TlsHash md5, TlsHash sha1)
        {
            this.m_context = context;
            this.m_crypto = context.Crypto;
            this.m_md5 = md5;
            this.m_sha1 = sha1;
        }

        public CombinedHash(TlsCrypto crypto)
        {
            this.m_crypto = crypto;
            this.m_md5 = crypto.CreateHash(CryptoHashAlgorithm.md5);
            this.m_sha1 = crypto.CreateHash(CryptoHashAlgorithm.sha1);
        }

        public CombinedHash(CombinedHash t)
        {
            this.m_context = t.m_context;
            this.m_crypto = t.m_crypto;
            this.m_md5 = t.m_md5.CloneHash();
            this.m_sha1 = t.m_sha1.CloneHash();
        }

        public virtual void Update(byte[] input, int inOff, int len)
        {
            m_md5.Update(input, inOff, len);
            m_sha1.Update(input, inOff, len);
        }

        public virtual byte[] CalculateHash()
        {
            if (null != m_context && TlsUtilities.IsSsl(m_context))
            {
                Ssl3Utilities.CompleteCombinedHash(m_context, m_md5, m_sha1);
            }

            return Arrays.Concatenate(m_md5.CalculateHash(), m_sha1.CalculateHash());
        }

        public virtual TlsHash CloneHash()
        {
            return new CombinedHash(this);
        }

        public virtual void Reset()
        {
            m_md5.Reset();
            m_sha1.Reset();
        }
    }
}
