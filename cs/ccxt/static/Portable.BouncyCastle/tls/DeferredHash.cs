using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Buffers input until the hash algorithm is determined.</summary>
    internal sealed class DeferredHash
        : TlsHandshakeHash
    {
        private const int BufferingHashLimit = 4;

        private readonly TlsContext m_context;

        private DigestInputBuffer m_buf;
        private IDictionary<int, TlsHash> m_hashes;
        private bool m_forceBuffering;
        private bool m_sealed;

        internal DeferredHash(TlsContext context)
        {
            this.m_context = context;
            this.m_buf = new DigestInputBuffer();
            this.m_hashes = new Dictionary<int, TlsHash>();
            this.m_forceBuffering = false;
            this.m_sealed = false;
        }

        /// <exception cref="IOException"/>
        public void CopyBufferTo(Stream output)
        {
            if (m_buf == null)
            {
                // If you see this, you need to call ForceBuffering() before SealHashAlgorithms()
                throw new InvalidOperationException("Not buffering");
            }

            m_buf.CopyInputTo(output);
        }

        public void ForceBuffering()
        {
            if (m_sealed)
                throw new InvalidOperationException("Too late to force buffering");

            this.m_forceBuffering = true;
        }

        public void NotifyPrfDetermined()
        {
            SecurityParameters securityParameters = m_context.SecurityParameters;

            switch (securityParameters.PrfAlgorithm)
            {
            case PrfAlgorithm.ssl_prf_legacy:
            case PrfAlgorithm.tls_prf_legacy:
            {
                CheckTrackingHash(CryptoHashAlgorithm.md5);
                CheckTrackingHash(CryptoHashAlgorithm.sha1);
                break;
            }
            default:
            {
                CheckTrackingHash(securityParameters.PrfCryptoHashAlgorithm);
                break;
            }
            }
        }

        public void TrackHashAlgorithm(int cryptoHashAlgorithm)
        {
            if (m_sealed)
                throw new InvalidOperationException("Too late to track more hash algorithms");

            CheckTrackingHash(cryptoHashAlgorithm);
        }

        public void SealHashAlgorithms()
        {
            if (m_sealed)
                throw new InvalidOperationException("Already sealed");

            this.m_sealed = true;
            CheckStopBuffering();
        }

        public void StopTracking()
        {
            SecurityParameters securityParameters = m_context.SecurityParameters;

            IDictionary<int, TlsHash> newHashes = new Dictionary<int, TlsHash>();
            switch (securityParameters.PrfAlgorithm)
            {
            case PrfAlgorithm.ssl_prf_legacy:
            case PrfAlgorithm.tls_prf_legacy:
            {
                CloneHash(newHashes, CryptoHashAlgorithm.md5);
                CloneHash(newHashes, CryptoHashAlgorithm.sha1);
                break;
            }
            default:
            {
                CloneHash(newHashes, securityParameters.PrfCryptoHashAlgorithm);
                break;
            }
            }

            this.m_buf = null;
            this.m_hashes = newHashes;
            this.m_forceBuffering = false;
            this.m_sealed = true;
        }

        public TlsHash ForkPrfHash()
        {
            CheckStopBuffering();

            SecurityParameters securityParameters = m_context.SecurityParameters;

            TlsHash prfHash;
            switch (securityParameters.PrfAlgorithm)
            {
            case PrfAlgorithm.ssl_prf_legacy:
            case PrfAlgorithm.tls_prf_legacy:
            {
                TlsHash md5Hash = CloneHash(CryptoHashAlgorithm.md5);
                TlsHash sha1Hash = CloneHash(CryptoHashAlgorithm.sha1);
                prfHash = new CombinedHash(m_context, md5Hash, sha1Hash);
                break;
            }
            default:
            {
                prfHash = CloneHash(securityParameters.PrfCryptoHashAlgorithm);
                break;
            }
            }

            if (m_buf != null)
            {
                m_buf.UpdateDigest(prfHash);
            }

            return prfHash;
        }

        public byte[] GetFinalHash(int cryptoHashAlgorithm)
        {
            if (!m_hashes.TryGetValue(cryptoHashAlgorithm, out var hash))
                throw new InvalidOperationException("CryptoHashAlgorithm." + cryptoHashAlgorithm
                    + " is not being tracked");

            CheckStopBuffering();

            hash = hash.CloneHash();
            if (m_buf != null)
            {
                m_buf.UpdateDigest(hash);
            }

            return hash.CalculateHash();
        }

        public void Update(byte[] input, int inOff, int len)
        {
            if (m_buf != null)
            {
                m_buf.Write(input, inOff, len);
                return;
            }

            foreach (TlsHash hash in m_hashes.Values)
            {
                hash.Update(input, inOff, len);
            }
        }

        public byte[] CalculateHash()
        {
            throw new InvalidOperationException("Use 'ForkPrfHash' to get a definite hash");
        }

        public TlsHash CloneHash()
        {
            throw new InvalidOperationException("attempt to clone a DeferredHash");
        }

        public void Reset()
        {
            if (m_buf != null)
            {
                m_buf.SetLength(0);
                return;
            }

            foreach (TlsHash hash in m_hashes.Values)
            {
                hash.Reset();
            }
        }

        private void CheckStopBuffering()
        {
            if (!m_forceBuffering && m_sealed && m_buf != null && m_hashes.Count <= BufferingHashLimit)
            {
                foreach (TlsHash hash in m_hashes.Values)
                {
                    m_buf.UpdateDigest(hash);
                }

                this.m_buf = null;
            }
        }

        private void CheckTrackingHash(int cryptoHashAlgorithm)
        {
            if (!m_hashes.ContainsKey(cryptoHashAlgorithm))
            {
                TlsHash hash = m_context.Crypto.CreateHash(cryptoHashAlgorithm);
                m_hashes[cryptoHashAlgorithm] = hash;
            }
        }

        private TlsHash CloneHash(int cryptoHashAlgorithm)
        {
            return m_hashes[cryptoHashAlgorithm].CloneHash();
        }

        private void CloneHash(IDictionary<int, TlsHash> newHashes, int cryptoHashAlgorithm)
        {
            TlsHash hash = CloneHash(cryptoHashAlgorithm);
            if (m_buf != null)
            {
                m_buf.UpdateDigest(hash);
            }
            newHashes[cryptoHashAlgorithm] = hash;
        }
    }
}
