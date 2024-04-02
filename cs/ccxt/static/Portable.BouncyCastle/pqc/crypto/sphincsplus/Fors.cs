using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    class Fors
    {
        SPHINCSPlusEngine engine;

        public Fors(SPHINCSPlusEngine engine)
        {
            this.engine = engine;
        }

        // Input: Secret seed SK.seed, start index s, target node height z, public seed PK.seed, address Adrs
        // Output: n-byte root node - top node on Stack
        byte[] TreeHash(byte[] skSeed, uint s, int z, byte[] pkSeed, Adrs adrsParam)
        {
            var stack = new List<NodeEntry>();

            if (s % (1 << z) != 0)
            {
                return null;
            }

            Adrs adrs = new Adrs(adrsParam);

            for (uint idx = 0; idx < (1 << z); idx++)
            {
                adrs.SetType(Adrs.FORS_PRF);
                adrs.SetKeyPairAddress(adrsParam.GetKeyPairAddress());
                adrs.SetTreeHeight(0);
                adrs.SetTreeIndex(s + idx);

                byte[] sk = engine.PRF(pkSeed, skSeed, adrs);
                
                adrs.ChangeType(Adrs.FORS_TREE);

                byte[] node = engine.F(pkSeed, adrs, sk);
                
                adrs.SetTreeHeight(1);

                // while ( Top node on Stack has same height as node )
                while (stack.Count != 0
                       && ((NodeEntry) stack[0]).nodeHeight == adrs.GetTreeHeight())
                {
                    adrs.SetTreeIndex((adrs.GetTreeIndex() - 1) / 2);
                    NodeEntry current = (NodeEntry) stack[0];
                    stack.RemoveAt(0);

                    node = engine.H(pkSeed, adrs, current.nodeValue, node);
                    //topmost node is now one layer higher
                    adrs.SetTreeHeight(adrs.GetTreeHeight() + 1);
                }

                stack.Insert(0, new NodeEntry(node, adrs.GetTreeHeight()));
            }

            return ((NodeEntry) stack[0]).nodeValue;
        }

        public SIG_FORS[] Sign(byte[] md, byte[] skSeed, byte[] pkSeed, Adrs paramAdrs)
        {
            Adrs adrs = new Adrs(paramAdrs);
            uint[] idxs = MessageToIdxs(md, engine.K, engine.A);
            SIG_FORS[] sig_fors = new SIG_FORS[engine.K];
            // compute signature elements
            uint t = engine.T;
            for (uint i = 0; i < engine.K; i++)
            {
                // get next index
                uint idx = idxs[i];
                // pick private key element
                
                adrs.SetType(Adrs.FORS_PRF);
                adrs.SetKeyPairAddress(paramAdrs.GetKeyPairAddress());
                adrs.SetTreeHeight(0);
                adrs.SetTreeIndex((uint) (i * t + idx));
                
                byte[] sk = engine.PRF(pkSeed, skSeed, adrs);
                
                adrs.ChangeType(Adrs.FORS_TREE);
                
                byte[][] authPath = new byte[engine.A][];
                // compute auth path
                for (int j = 0; j < engine.A; j++)
                {
                    uint s = (uint) (idx / (1 << j)) ^ 1;
                    authPath[j] = TreeHash(skSeed, (uint) (i * t + s * (1 << j)), j, pkSeed, adrs);
                }

                sig_fors[i] = new SIG_FORS(sk, authPath);
            }

            return sig_fors;
        }

        public byte[] PKFromSig(SIG_FORS[] sig_fors, byte[] message, byte[] pkSeed, Adrs adrs)
        {
            byte[][] node = new byte[2][];
            byte[][] root = new byte[engine.K][];
            uint t = engine.T;

            uint[] idxs = MessageToIdxs(message, engine.K, engine.A);
            // compute roots
            for (uint i = 0; i < engine.K; i++)
            {
                // get next index
                uint idx = idxs[i];
                // compute leaf
                byte[] sk = sig_fors[i].SK;
                adrs.SetTreeHeight(0);
                adrs.SetTreeIndex(i * t + idx);
                node[0] = engine.F(pkSeed, adrs, sk);
                // compute root from leaf and AUTH
                byte[][] authPath = sig_fors[i].AuthPath;

                adrs.SetTreeIndex(i * t + idx);
                for (int j = 0; j < engine.A; j++)
                {
                    adrs.SetTreeHeight((uint)j + 1);
                    if (((idx / (1 << j)) % 2) == 0)
                    {
                        adrs.SetTreeIndex(adrs.GetTreeIndex() / 2);
                        node[1] = engine.H(pkSeed, adrs, node[0], authPath[j]);
                    }
                    else
                    {
                        adrs.SetTreeIndex((adrs.GetTreeIndex() - 1) / 2);
                        node[1] = engine.H(pkSeed, adrs, authPath[j], node[0]);
                    }

                    node[0] = node[1];
                }

                root[i] = node[0];
            }

            Adrs forspkAdrs = new Adrs(adrs); // copy address to create FTS public key address
            forspkAdrs.SetType(Adrs.FORS_PK);
            forspkAdrs.SetKeyPairAddress(adrs.GetKeyPairAddress());
            return engine.T_l(pkSeed, forspkAdrs, Arrays.ConcatenateAll(root));
        }

        /**
         * Interprets m as SPX_FORS_HEIGHT-bit unsigned integers.
         * Assumes m contains at least SPX_FORS_HEIGHT * SPX_FORS_TREES bits.
         * Assumes indices has space for SPX_FORS_TREES integers.
         */
        static uint[] MessageToIdxs(byte[] msg, int fors_trees, int fors_height)
        {
            uint offset = 0;
            uint[] idxs = new uint[fors_trees];
            for (int i = 0; i < fors_trees; i++)
            {
                idxs[i] = 0;
                for (int j = 0; j < fors_height; j++)
                {
                    idxs[i] ^= (uint) (((msg[offset >> 3] >> (int)(offset & 0x7)) & 0x1) << j);
                    offset++;
                }
            }

            return idxs;
        }
    }
}