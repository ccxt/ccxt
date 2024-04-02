using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public sealed class OfferedPsks
    {
        internal class BindersConfig
        {
            internal readonly TlsPsk[] m_psks;
            internal readonly short[] m_pskKeyExchangeModes;
            internal readonly TlsSecret[] m_earlySecrets;
            internal int m_bindersSize;

            internal BindersConfig(TlsPsk[] psks, short[] pskKeyExchangeModes, TlsSecret[] earlySecrets,
                int bindersSize)
            {
                this.m_psks = psks;
                this.m_pskKeyExchangeModes = pskKeyExchangeModes;
                this.m_earlySecrets = earlySecrets;
                this.m_bindersSize = bindersSize;
            }
        }

        internal class SelectedConfig
        {
            internal readonly int m_index;
            internal readonly TlsPsk m_psk;
            internal readonly short[] m_pskKeyExchangeModes;
            internal readonly TlsSecret m_earlySecret;

            internal SelectedConfig(int index, TlsPsk psk, short[] pskKeyExchangeModes, TlsSecret earlySecret)
            {
                this.m_index = index;
                this.m_psk = psk;
                this.m_pskKeyExchangeModes = pskKeyExchangeModes;
                this.m_earlySecret = earlySecret;
            }
        }

        private readonly IList<PskIdentity> m_identities;
        private readonly IList<byte[]> m_binders;
        private readonly int m_bindersSize;

        public OfferedPsks(IList<PskIdentity> identities)
            : this(identities, null, -1)
        {
        }

        private OfferedPsks(IList<PskIdentity> identities, IList<byte[]> binders, int bindersSize)
        {
            if (null == identities || identities.Count < 1)
                throw new ArgumentException("cannot be null or empty", "identities");
            if (null != binders && identities.Count != binders.Count)
                throw new ArgumentException("must be the same length as 'identities' (or null)", "binders");
            if ((null != binders) != (bindersSize >= 0))
                throw new ArgumentException("must be >= 0 iff 'binders' are present", "bindersSize");

            this.m_identities = identities;
            this.m_binders = binders;
            this.m_bindersSize = bindersSize;
        }

        public IList<byte[]> Binders
        {
            get { return m_binders; }
        }

        public int BindersSize
        {
            get { return m_bindersSize; }
        }

        public IList<PskIdentity> Identities
        {
            get { return m_identities; }
        }

        public int GetIndexOfIdentity(PskIdentity pskIdentity)
        {
            for (int i = 0, count = m_identities.Count; i < count; ++i)
            {
                if (pskIdentity.Equals(m_identities[i]))
                    return i;
            }
            return -1;
        }

        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            // identities
            {
                int lengthOfIdentitiesList = 0;
                foreach (PskIdentity identity in m_identities)
                {
                    lengthOfIdentitiesList += identity.GetEncodedLength();
                }

                TlsUtilities.CheckUint16(lengthOfIdentitiesList);
                TlsUtilities.WriteUint16(lengthOfIdentitiesList, output);

                foreach (PskIdentity identity in m_identities)
                {
                    identity.Encode(output);
                }
            }

            // binders
            if (null != m_binders)
            {
                int lengthOfBindersList = 0;
                foreach (byte[] binder in m_binders)
                {
                    lengthOfBindersList += 1 + binder.Length;
                }

                TlsUtilities.CheckUint16(lengthOfBindersList);
                TlsUtilities.WriteUint16(lengthOfBindersList, output);

                foreach (byte[] binder in m_binders)
                {
                    TlsUtilities.WriteOpaque8(binder, output);
                }
            }
        }

        /// <exception cref="IOException"/>
        internal static void EncodeBinders(Stream output, TlsCrypto crypto, TlsHandshakeHash handshakeHash,
            BindersConfig bindersConfig)
        {
            TlsPsk[] psks = bindersConfig.m_psks;
            TlsSecret[] earlySecrets = bindersConfig.m_earlySecrets;
            int expectedLengthOfBindersList = bindersConfig.m_bindersSize - 2;

            TlsUtilities.CheckUint16(expectedLengthOfBindersList);
            TlsUtilities.WriteUint16(expectedLengthOfBindersList, output);

            int lengthOfBindersList = 0;
            for (int i = 0; i < psks.Length; ++i)
            {
                TlsPsk psk = psks[i];
                TlsSecret earlySecret = earlySecrets[i];

                // TODO[tls13-psk] Handle resumption PSKs
                bool isExternalPsk = true;
                int pskCryptoHashAlgorithm = TlsCryptoUtilities.GetHashForPrf(psk.PrfAlgorithm);

                // TODO[tls13-psk] Cache the transcript hashes per algorithm to avoid duplicates for multiple PSKs
                TlsHash hash = crypto.CreateHash(pskCryptoHashAlgorithm);
                handshakeHash.CopyBufferTo(new TlsHashSink(hash));
                byte[] transcriptHash = hash.CalculateHash();

                byte[] binder = TlsUtilities.CalculatePskBinder(crypto, isExternalPsk, pskCryptoHashAlgorithm,
                    earlySecret, transcriptHash);

                lengthOfBindersList += 1 + binder.Length;
                TlsUtilities.WriteOpaque8(binder, output);
            }

            if (expectedLengthOfBindersList != lengthOfBindersList)
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        /// <exception cref="IOException"/>
        internal static int GetBindersSize(TlsPsk[] psks)
        {
            int lengthOfBindersList = 0;
            for (int i = 0; i < psks.Length; ++i)
            {
                TlsPsk psk = psks[i];

                int prfAlgorithm = psk.PrfAlgorithm;
                int prfCryptoHashAlgorithm = TlsCryptoUtilities.GetHashForPrf(prfAlgorithm);

                lengthOfBindersList += 1 + TlsCryptoUtilities.GetHashOutputSize(prfCryptoHashAlgorithm);
            }
            TlsUtilities.CheckUint16(lengthOfBindersList);
            return 2 + lengthOfBindersList;
        }

        /// <exception cref="IOException"/>
        public static OfferedPsks Parse(Stream input)
        {
            var identities = new List<PskIdentity>();
            {
                int totalLengthIdentities = TlsUtilities.ReadUint16(input);
                if (totalLengthIdentities < 7)
                    throw new TlsFatalAlert(AlertDescription.decode_error);

                byte[] identitiesData = TlsUtilities.ReadFully(totalLengthIdentities, input);
                MemoryStream buf = new MemoryStream(identitiesData, false);
                do
                {
                    PskIdentity identity = PskIdentity.Parse(buf);
                    identities.Add(identity);
                }
                while (buf.Position < buf.Length);
            }

            var binders = new List<byte[]>();
            int totalLengthBinders = TlsUtilities.ReadUint16(input);
            {
                if (totalLengthBinders < 33)
                    throw new TlsFatalAlert(AlertDescription.decode_error);

                byte[] bindersData = TlsUtilities.ReadFully(totalLengthBinders, input);
                MemoryStream buf = new MemoryStream(bindersData, false);
                do
                {
                    byte[] binder = TlsUtilities.ReadOpaque8(buf, 32);
                    binders.Add(binder);
                }
                while (buf.Position < buf.Length);
            }

            return new OfferedPsks(identities, binders, 2 + totalLengthBinders);
        }
    }
}
