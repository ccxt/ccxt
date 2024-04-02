using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    class HT
    {
        private byte[] skSeed;
        private byte[] pkSeed;
        SPHINCSPlusEngine engine;
        WotsPlus wots;

        internal byte[] HTPubKey;

        public HT(SPHINCSPlusEngine engine, byte[] skSeed, byte[] pkSeed)
        {
            this.skSeed = skSeed;
            this.pkSeed = pkSeed;

            this.engine = engine;
            this.wots = new WotsPlus(engine);

            Adrs adrs = new Adrs();
            adrs.SetLayerAddress(engine.D - 1);
            adrs.SetTreeAddress(0);

            if (skSeed != null)
            {
                HTPubKey = xmss_PKgen(skSeed, pkSeed, adrs);
            }
            else
            {
                HTPubKey = null;
            }
        }

        internal byte[] Sign(byte[] M, ulong idx_tree, uint idx_leaf)
        {
            // init
            Adrs adrs = new Adrs();
            // sign
            adrs.SetLayerAddress(0);
            adrs.SetTreeAddress(idx_tree);
            SIG_XMSS SIG_tmp = xmss_sign(M, skSeed, idx_leaf, pkSeed, adrs);
            SIG_XMSS[] SIG_HT = new SIG_XMSS[engine.D];
            SIG_HT[0] = SIG_tmp;

            adrs.SetLayerAddress(0);
            adrs.SetTreeAddress(idx_tree);

            byte[] root = xmss_pkFromSig(idx_leaf, SIG_tmp, M, pkSeed, adrs);

            for (uint j = 1; j < engine.D; j++)
            {
                idx_leaf = (uint) (idx_tree & (ulong)((1 << (int)engine.H_PRIME) - 1)); // least significant bits of idx_tree; //todo might be not working as inteded
                idx_tree >>= (int)engine.H_PRIME; // most significant bits of idx_tree;
                adrs.SetLayerAddress(j);
                adrs.SetTreeAddress(idx_tree);
                SIG_tmp = xmss_sign(root, skSeed, idx_leaf, pkSeed, adrs);
                SIG_HT[j] = SIG_tmp;
                if (j < engine.D - 1)
                {
                    root = xmss_pkFromSig(idx_leaf, SIG_tmp, root, pkSeed, adrs);
                }
            }

            byte[][] totSigs = new byte[SIG_HT.Length][];
            for (int i = 0; i != totSigs.Length; i++)
            {
                totSigs[i] = Arrays.Concatenate(SIG_HT[i].sig, Arrays.ConcatenateAll(SIG_HT[i].auth));
            }

            return Arrays.ConcatenateAll(totSigs);
        }

        byte[] xmss_PKgen(byte[] skSeed, byte[] pkSeed, Adrs adrs)
        {
            return TreeHash(skSeed, 0, engine.H_PRIME, pkSeed, adrs);
        }

        // Input: index idx, XMSS signature SIG_XMSS = (sig || AUTH), n-byte message M, public seed PK.seed, address Adrs
        // Output: n-byte root value node[0]
        byte[] xmss_pkFromSig(uint idx, SIG_XMSS sig_xmss, byte[] M, byte[] pkSeed, Adrs paramAdrs)
        {
            Adrs adrs = new Adrs(paramAdrs);

            // compute WOTS+ pk from WOTS+ sig
            adrs.SetType(Adrs.WOTS_HASH);
            adrs.SetKeyPairAddress(idx);
            byte[] sig = sig_xmss.GetWOTSSig();
            byte[][] AUTH = sig_xmss.GetXMSSAUTH();

            byte[] node0 = wots.PKFromSig(sig, M, pkSeed, adrs);
            byte[] node1 = null;

            // compute root from WOTS+ pk and AUTH
            adrs.SetType(Adrs.TREE);
            adrs.SetTreeIndex(idx);
            for (uint k = 0; k < engine.H_PRIME; k++)
            {
                adrs.SetTreeHeight(k + 1);
                if (((idx / (1 << (int)k)) % 2) == 0)
                {
                    adrs.SetTreeIndex(adrs.GetTreeIndex() / 2);
                    node1 = engine.H(pkSeed, adrs, node0, AUTH[k]);
                }
                else
                {
                    adrs.SetTreeIndex((adrs.GetTreeIndex() - 1) / 2);
                    node1 = engine.H(pkSeed, adrs, AUTH[k], node0);
                }

                node0 = node1;
            }

            return node0;
        }

        //    # Input: n-byte message M, secret seed SK.seed, index idx, public seed PK.seed,
        //    address Adrs
        //    # Output: XMSS signature SIG_XMSS = (sig || AUTH)
        SIG_XMSS xmss_sign(byte[] M, byte[] skSeed, uint idx, byte[] pkSeed, Adrs paramAdrs)
        {
            byte[][] AUTH = new byte[engine.H_PRIME][];
            
            Adrs adrs = new Adrs(paramAdrs);

            adrs.SetType(Adrs.TREE);
            adrs.SetLayerAddress(paramAdrs.GetLayerAddress());
            adrs.SetTreeAddress(paramAdrs.GetTreeAddress());


            // build authentication path
            for (int j = 0; j < engine.H_PRIME; j++)
            {
                uint k = (uint) (idx / (1 << j)) ^ 1;
                AUTH[j] = TreeHash(skSeed, k * (uint) (1 << j), (uint)j, pkSeed, adrs);
            }

            adrs = new Adrs(paramAdrs);
            adrs.SetType(Adrs.WOTS_PK);
            adrs.SetKeyPairAddress(idx);

            byte[] sig = wots.Sign(M, skSeed, pkSeed, adrs);
            return new SIG_XMSS(sig, AUTH);
        }

        //
        // Input: Secret seed SK.seed, start index s, target node height z, public seed
        //PK.seed, address Adrs
        // Output: n-byte root node - top node on Stack
        byte[] TreeHash(byte[] skSeed, uint s, uint z, byte[] pkSeed, Adrs adrsParam)
        {
            Adrs adrs = new Adrs(adrsParam);

            var stack = new List<NodeEntry>();

            if (s % (1 << (int)z) != 0)
            {
                return null;
            }

            for (uint idx = 0; idx < (1 << (int)z); idx++)
            {
                adrs.SetType(Adrs.WOTS_HASH);
                adrs.SetKeyPairAddress(s + idx);
                byte[] node = wots.PKGen(skSeed, pkSeed, adrs);

                adrs.SetType(Adrs.TREE);
                adrs.SetTreeHeight(1);
                adrs.SetTreeIndex(s + idx);

                // while ( Top node on Stack has same height as node )
                while (stack.Count != 0
                       && ((NodeEntry) stack[0]).nodeHeight == adrs.GetTreeHeight())
                {
                    adrs.SetTreeIndex((adrs.GetTreeIndex() - 1) / 2);
                    NodeEntry current = ((NodeEntry) stack[0]);
                    stack.RemoveAt(0);
                    node = engine.H(pkSeed, adrs, current.nodeValue, node);
                    //topmost node is now one layer higher
                    adrs.SetTreeHeight(adrs.GetTreeHeight() + 1);
                }

                stack.Insert(0, new NodeEntry(node, adrs.GetTreeHeight()));
            }

            return ((NodeEntry) stack[0]).nodeValue;
        }

        //    # Input: Message M, signature SIG_HT, public seed PK.seed, tree index idx_tree,
        //    leaf index idx_leaf, HT public key PK_HT.
        //    # Output: bool
        public bool Verify(byte[] M, SIG_XMSS[] sig_ht, byte[] pkSeed, ulong idx_tree, uint idx_leaf, byte[] PK_HT)
        {
            // init
            Adrs adrs = new Adrs();
            // verify
            SIG_XMSS SIG_tmp = sig_ht[0];
            adrs.SetLayerAddress(0);
            adrs.SetTreeAddress(idx_tree);
            byte[] node = xmss_pkFromSig(idx_leaf, SIG_tmp, M, pkSeed, adrs);
            for (uint j = 1; j < engine.D; j++)
            {
                idx_leaf = (uint) (idx_tree & (ulong)((1 << (int) engine.H_PRIME) - 1)); // least significant bits of idx_tree;
                idx_tree >>= (int) engine.H_PRIME; // most significant bits of idx_tree;
                SIG_tmp = sig_ht[j];
                adrs.SetLayerAddress(j);
                adrs.SetTreeAddress(idx_tree);
                node = xmss_pkFromSig(idx_leaf, SIG_tmp, node, pkSeed, adrs);
            }

            return Arrays.AreEqual(PK_HT, node);
        }
    }
}