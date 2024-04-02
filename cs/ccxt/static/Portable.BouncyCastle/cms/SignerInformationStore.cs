using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Cms
{
    public class SignerInformationStore
    {
        private readonly IList<SignerInformation> all;
        private readonly IDictionary<SignerID, IList<SignerInformation>> m_table =
            new Dictionary<SignerID, IList<SignerInformation>>();

        /**
         * Create a store containing a single SignerInformation object.
         *
         * @param signerInfo the signer information to contain.
         */
        public SignerInformationStore(SignerInformation signerInfo)
        {
            this.all = new List<SignerInformation>(1);
            this.all.Add(signerInfo);

            SignerID sid = signerInfo.SignerID;

            m_table[sid] = all;
        }

        /**
         * Create a store containing a collection of SignerInformation objects.
         *
         * @param signerInfos a collection signer information objects to contain.
         */
        public SignerInformationStore(IEnumerable<SignerInformation> signerInfos)
        {
            foreach (SignerInformation signer in signerInfos)
            {
                SignerID sid = signer.SignerID;

                if (!m_table.TryGetValue(sid, out var list))
                {
                    m_table[sid] = list = new List<SignerInformation>(1);
                }

                list.Add(signer);
            }

            this.all = new List<SignerInformation>(signerInfos);
        }

        /**
        * Return the first SignerInformation object that matches the
        * passed in selector. Null if there are no matches.
        *
        * @param selector to identify a signer
        * @return a single SignerInformation object. Null if none matches.
        */
        public SignerInformation GetFirstSigner(SignerID selector)
        {
            if (m_table.TryGetValue(selector, out var list))
                return list[0];

            return null;
        }

        /// <summary>The number of signers in the collection.</summary>
        public int Count
        {
            get { return all.Count; }
        }

        /// <returns>An ICollection of all signers in the collection</returns>
        public IList<SignerInformation> GetSigners()
        {
            return new List<SignerInformation>(all);
        }

        /**
        * Return possible empty collection with signers matching the passed in SignerID
        *
        * @param selector a signer id to select against.
        * @return a collection of SignerInformation objects.
        */
        public IList<SignerInformation> GetSigners(SignerID selector)
        {
            if (m_table.TryGetValue(selector, out var list))
                return new List<SignerInformation>(list);

            return new List<SignerInformation>(0);
        }
    }
}
