using System;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Pqc.Crypto.Picnic;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{

    public class Tree
    {
        private static int MAX_SEED_SIZE_BYTES = 32;
        private uint MAX_AUX_BYTES;


        private uint depth; /* The depth of the tree */
        internal byte[][] nodes; /* The data for each node */
        private int dataSize; /* The size data at each node, in bytes */
        private bool[] haveNode; /* If we have the data (seed or hash) for node i, haveSeed[i] is 1 */
        private byte[] exists; /* Since the tree is not always complete, nodes marked 0 don't exist */
        private uint numNodes; /* The total number of nodes in the tree */
        private uint numLeaves; /* The total number of leaves in the tree */

        private PicnicEngine engine;

        protected internal byte[][] GetLeaves()
        {
            return this.nodes;
        }

        protected internal uint GetLeavesOffset()
        {
            return this.numNodes - this.numLeaves;
        }

        public Tree(PicnicEngine engine, uint numLeaves, int dataSize)
        {
            this.engine = engine;
            MAX_AUX_BYTES = ((PicnicEngine.LOWMC_MAX_AND_GATES + PicnicEngine.LOWMC_MAX_KEY_BITS) / 8 + 1);

            this.depth = Utils.ceil_log2(numLeaves) + 1;
            this.numNodes = (uint)(
                ((1 << ((int)this.depth)) - 1) -
                ((1 << ((int)this.depth - 1)) - numLeaves)); /* Num nodes in complete - number of missing leaves */
            this.numLeaves = numLeaves;
            this.dataSize = dataSize;
            this.nodes = new byte[this.numNodes][]; // dataSize

            for (int i = 0; i < this.numNodes; i++)
            {
                this.nodes[i] = new byte[dataSize];
            }

            this.haveNode = new bool[this.numNodes];
            /* Depending on the number of leaves, the tree may not be complete */
            this.exists = new byte[this.numNodes];

            /* Set leaves */
            Arrays.Fill(this.exists, (int) (this.numNodes - this.numLeaves), (int)this.numNodes, 1);
            for (uint i = this.numNodes - this.numLeaves; i > 0; i--)
            {
                if (Exists(2 * i + 1) || Exists(2 * i + 2))
                {
                    this.exists[i] = 1;
                }
            }

            this.exists[0] = 1;
        }

        /* Create a Merkle tree by hashing up all nodes.
         * leafData must have Length this.numNodes, but some may be NULL. */
        protected internal void BuildMerkleTree(byte[][] leafData, byte[] salt)
        {
            uint firstLeaf = this.numNodes - this.numLeaves;

            /* Copy data to the leaves. The actual data being committed to has already been
             * hashed, according to the spec. */
            for (int i = 0; i < this.numLeaves; i++)
            {
                if (leafData[i] != null)
                {
                    System.Array.Copy(leafData[i], 0, this.nodes[firstLeaf + i], 0, this.dataSize);
                    this.haveNode[firstLeaf + i] = true;
                }
            }

            /* Starting at the leaves, work up the tree, computing the hashes for intermediate nodes */
            for (uint i = this.numNodes; i > 0; i--)
            {
                ComputeParentHash(i, salt);
            }
        }

        /* verifyMerkleTree: verify for each leaf that is set */
        protected internal int VerifyMerkleTree(byte[][] leafData, byte[] salt)
        {
            uint firstLeaf = this.numNodes - this.numLeaves;

            /* Copy the leaf data, where we have it. The actual data being committed to has already been
             * hashed, according to the spec. */
            for (int i = 0; i < this.numLeaves; i++)
            {
                if (leafData[i] != null)
                {
                    if (this.haveNode[firstLeaf + i])
                    {
                        return -1; /* A leaf was assigned from the prover for a node we've recomputed */
                    }

                    if (leafData[i] != null)
                    {
                        System.Array.Copy(leafData[i], 0, this.nodes[firstLeaf + i], 0, this.dataSize);
                        this.haveNode[firstLeaf + i] = true;
                    }
                }
            }

            /* At this point the tree has some of the leaves, and some intermediate nodes
             * Work up the tree, computing all nodes we don't have that are missing. */
            for (uint i = this.numNodes; i > 0; i--)
            {
                ComputeParentHash(i, salt);
            }

            /* Fail if the root was not computed. */
            if (!this.haveNode[0])
            {
                return -1;
            }

            return 0;
        }

        protected internal int ReconstructSeeds(uint[] hideList, uint hideListSize,
            byte[] input, uint inputLen, byte[] salt, uint repIndex)
        {
            int ret = 0;

//        if (inputLen > INT_MAX) {
//            return -1;
//        }

            uint inLen = inputLen;

            uint[] revealedSize = new uint[1];
            revealedSize[0] = 0;
            uint[] revealed = this.GetRevealedNodes(hideList, hideListSize, revealedSize);
            for (int i = 0; i < revealedSize[0]; i++)
            {
                inLen -= (uint)engine.seedSizeBytes;
                if (inLen < 0)
                {
                    return -1;
                }

                System.Array.Copy(input, i * engine.seedSizeBytes, this.nodes[revealed[i]], 0, engine.seedSizeBytes);
                this.haveNode[revealed[i]] = true;
            }

            ExpandSeeds(salt, repIndex);

            return ret;
        }

        /* Serialze the missing nodes that the verifier will require to check commitments for non-missing leaves */
        protected internal byte[] OpenMerkleTree(uint[] missingLeaves, uint missingLeavesSize, int[] outputSizeBytes)
        {
            uint[] revealedSize = new uint[1];
            uint[] revealed = this.GetRevealedMerkleNodes(missingLeaves, missingLeavesSize, revealedSize);

            /* Serialize output */
            outputSizeBytes[0] = (int)revealedSize[0] * this.dataSize;
            byte[] output = new byte[outputSizeBytes[0]];
            byte[] outputBase = output;

            for (int i = 0; i < revealedSize[0]; i++)
            {
                System.Array.Copy(this.nodes[revealed[i]], 0, output, i * this.dataSize, this.dataSize);
            }

            return outputBase;
        }

        /* Returns the number of bytes written to output */
        private uint[] GetRevealedNodes(uint[] hideList, uint hideListSize, uint[] outputSize)
        {
            /* Compute paths up from hideList to root, store as sets of nodes */
            uint pathLen = this.depth - 1;

            /* pathSets[i][0...hideListSize] stores the nodes in the path at depth i
             * for each of the leaf nodes in hideListSize */
            uint[][] pathSets = new uint[pathLen][]; // hideListSize
            for (int i = 0; i < pathLen; i++)
            {
                pathSets[i] = new uint[hideListSize];
            }

            /* Compute the paths back to the root */
            for (int i = 0; i < hideListSize; i++)
            {
                uint pos = 0;
                uint node = hideList[i] + (this.numNodes - this.numLeaves); /* input lists leaf indexes, translate to nodes */
                pathSets[pos][i] = node;
                pos++;
                while ((node = GetParent(node)) != 0)
                {
                    pathSets[pos][i] = node;
                    pos++;
                }
            }

            /* Determine seeds to reveal */
            uint[] revealed = new uint[this.numLeaves];
            uint revealedPos = 0;
            for (int d = 0; d < pathLen; d++)
            {
                for (int i = 0; i < hideListSize; i++)
                {
                    if (!HasSibling(pathSets[d][i]))
                    {
                        continue;
                    }

                    uint sibling = GetSibling(pathSets[d][i]);
                    if (!Contains(pathSets[d], hideListSize, sibling))
                    {
                        // Determine the seed to reveal 
                        while (!HasRightChild(sibling) && !IsLeafNode(sibling))
                        {
                            sibling = 2 * sibling + 1; // sibling = leftChild(sibling)
                        }

                        // Only reveal if we haven't already 
                        if (!Contains(revealed, revealedPos, sibling))
                        {
                            revealed[revealedPos] = sibling;
                            revealedPos++;
                        }
                    }
                }
            }

//        free(pathSets[0]);
//        free(pathSets);

            outputSize[0] = revealedPos;
            return revealed;
        }

        private uint GetSibling(uint node)
        {
//        assert(node < this.numNodes);
//        assert(node != 0);
//        assert(hasSibling(tree, node));

            if (IsLeftChild(node))
            {
                if (node + 1 < this.numNodes)
                {
                    return node + 1;
                }
                else
                {
                    Console.Error.Write("getSibling: request for node with not sibling");
                    return 0;
                }
            }
            else
            {
                return node - 1;
            }
        }

        private bool IsLeafNode(uint node)
        {
            return (2 * node + 1 >= this.numNodes);
        }


        private bool HasSibling(uint node)
        {
            if (!Exists(node))
            {
                return false;
            }

            if (IsLeftChild(node) && !Exists(node + 1))
            {
                return false;
            }

            return true;
        }


        protected internal uint RevealSeedsSize(uint[] hideList, uint hideListSize)
        {
            uint[] numNodesRevealed = new uint[1];
            numNodesRevealed[0] = 0;
            uint[] revealed = GetRevealedNodes(hideList, hideListSize, numNodesRevealed);
            return numNodesRevealed[0] * (uint)engine.seedSizeBytes;
        }

        protected internal int RevealSeeds(uint[] hideList, uint hideListSize, byte[] output, int outputSize)
        {
//        byte[] outputBase = Arrays.clone(output);
            uint[] revealedSize = new uint[1];
            revealedSize[0] = 0;

//        if (outputSize > Integer.MAX_VALUE)
//        {
//            return -1;
//        }
            int outLen = outputSize;


            uint[] revealed = GetRevealedNodes(hideList, hideListSize, revealedSize);
            for (int i = 0; i < revealedSize[0]; i++)
            {
                outLen -= engine.seedSizeBytes;
                if (outLen < 0)
                {
                    Console.Error.Write("Insufficient sized buffer provided to revealSeeds");
                    return 0;
                }

                System.Array.Copy(this.nodes[revealed[i]], 0, output, i * engine.seedSizeBytes, engine.seedSizeBytes);
            }

            return output.Length - outLen;
        }

        protected internal uint OpenMerkleTreeSize(uint[] missingLeaves, uint missingLeavesSize)
        {
            uint[] revealedSize = new uint[1];
            uint[] revealed = this.GetRevealedMerkleNodes(missingLeaves, missingLeavesSize, revealedSize);
            return revealedSize[0] * (uint) engine.digestSizeBytes;
        }

        /* Note that we never output the root node */
        private uint[] GetRevealedMerkleNodes(uint[] missingLeaves, uint missingLeavesSize, uint[] outputSize)
        {
            uint firstLeaf = this.numNodes - this.numLeaves;
            bool[] missingNodes = new bool[this.numNodes];

            /* Mark leaves that are missing */
            for (int i = 0; i < missingLeavesSize; i++)
            {
                missingNodes[firstLeaf + missingLeaves[i]] = true;
            }

            /* For the nonleaf nodes, if both leaves are missing, mark it as missing too */
            uint lastNonLeaf = GetParent(this.numNodes - 1);
            for (uint i = lastNonLeaf; i > 0; i--)
            {
                if (!Exists(i))
                {
                    continue;
                }

                if (Exists(2 * i + 2))
                {
                    if (missingNodes[2 * i + 1] && missingNodes[2 * i + 2])
                    {
                        missingNodes[i] = true;
                    }
                }
                else
                {
                    if (missingNodes[2 * i + 1])
                    {
                        missingNodes[i] = true;
                    }
                }
            }

            /* For each missing leaf node, add the highest missing node on the path
             * back to the root to the set to be revealed */
            uint[] revealed = new uint[this.numLeaves];
            uint pos = 0;
            for (int i = 0; i < missingLeavesSize; i++)
            {
                uint node = missingLeaves[i] + firstLeaf; /* input is leaf indexes, translate to nodes */
                do
                {
                    if (!missingNodes[GetParent(node)])
                    {
                        if (!Contains(revealed, pos, node))
                        {
                            revealed[pos] = node;
                            pos++;
                        }

                        break;
                    }
                } while ((node = GetParent(node)) != 0);
            }

            // free(missingNodes);
            outputSize[0] = pos;
            return revealed;
        }

        private bool Contains(uint[] list, uint len, uint value)
        {
            for (int i = 0; i < len; i++)
            {
                if (list[i] == value)
                {
                    return true;
                }
            }

            return false;
        }

        private void ComputeParentHash(uint child, byte[] salt)
        {
            if (!Exists(child))
            {
                return;
            }

            uint parent = GetParent(child);

            if (this.haveNode[parent])
            {
                return;
            }

            /* Compute the hash for parent, if we have everything */
            if (!this.haveNode[2 * parent + 1])
            {
                return;
            }

            if (Exists(2 * parent + 2) && !this.haveNode[2 * parent + 2])
            {
                return;
            }

            /* Compute parent data = H(left child data || [right child data] || salt || parent idx) */
            engine.digest.Update((byte) 3);
            engine.digest.BlockUpdate(this.nodes[2 * parent + 1], 0, engine.digestSizeBytes);
            if (HasRightChild(parent))
            {
                /* One node may not have a right child when there's an odd number of leaves */
                engine.digest.BlockUpdate(this.nodes[2 * parent + 2], 0, engine.digestSizeBytes);
            }

            engine.digest.BlockUpdate(salt, 0, PicnicEngine.saltSizeBytes);
            engine.digest.BlockUpdate(Pack.UInt32_To_LE(parent), 0, 2);
            engine.digest.DoFinal(this.nodes[parent], 0, engine.digestSizeBytes);
            this.haveNode[parent] = true;
        }


        protected internal byte[] GetLeaf(uint leafIndex)
        {
            uint firstLeaf = this.numNodes - this.numLeaves;
            return this.nodes[firstLeaf + leafIndex];
        }

        /* addMerkleNodes: deserialize and add the data for nodes provided by the committer */
        protected internal int AddMerkleNodes(uint[] missingLeaves, uint missingLeavesSize, byte[] input, uint inputSize)
        {
//        if (inputSize > INT_MAX) {
//            return -1;
//        }

            int intLen = (int)inputSize;

            uint[] revealedSize = new uint[1];
            revealedSize[0] = 0;
            uint[] revealed = GetRevealedMerkleNodes(missingLeaves, missingLeavesSize, revealedSize);

            /* Deserialize input */
            for (int i = 0; i < revealedSize[0]; i++)
            {
                intLen -= this.dataSize;
                if (intLen < 0)
                {
                    return -1;
                }

                System.Array.Copy(input, i * this.dataSize, this.nodes[revealed[i]], 0, this.dataSize);
                this.haveNode[revealed[i]] = true;
            }

            if (intLen != 0)
            {
                return -1;
            }

            return 0;
        }

        protected internal void GenerateSeeds(byte[] rootSeed, byte[] salt, uint repIndex)
        {
            this.nodes[0] = rootSeed;
            this.haveNode[0] = true;
            this.ExpandSeeds(salt, repIndex);
        }

        private void ExpandSeeds(byte[] salt, uint repIndex)
        {
            byte[] tmp = new byte[2 * MAX_SEED_SIZE_BYTES];

            /* Walk the tree, expanding seeds where possible. Compute children of
             * non-leaf nodes. */
            uint lastNonLeaf = GetParent(this.numNodes - 1);

            for (uint i = 0; i <= lastNonLeaf; i++)
            {
                if (!this.haveNode[i])
                {
                    continue;
                }

                HashSeed(tmp, this.nodes[i], salt, (byte) 1, repIndex, i);

                if (!this.haveNode[2 * i + 1])
                {
                    /* left child = H_left(seed_i || salt || t || i) */
                    System.Array.Copy(tmp, 0, this.nodes[2 * i + 1], 0, engine.seedSizeBytes);
                    this.haveNode[2 * i + 1] = true;
                }

                /* The last non-leaf node will only have a left child when there are an odd number of leaves */
                if (Exists(2 * i + 2) && !this.haveNode[2 * i + 2])
                {
                    /* right child = H_right(seed_i || salt || t || i)  */
                    System.Array.Copy(tmp, engine.seedSizeBytes, this.nodes[2 * i + 2], 0, engine.seedSizeBytes);
                    this.haveNode[2 * i + 2] = true;
                }

            }
        }

        private void HashSeed(byte[] digest_arr, byte[] inputSeed, byte[] salt, byte hashPrefix, uint repIndex, uint nodeIndex)
        {

            engine.digest.Update(hashPrefix);
            engine.digest.BlockUpdate(inputSeed, 0, engine.seedSizeBytes);
            engine.digest.BlockUpdate(salt, 0, PicnicEngine.saltSizeBytes);
            engine.digest.BlockUpdate(Pack.UInt16_To_LE((ushort) (repIndex & 0xffff)), 0, 2); //todo check endianness
            engine.digest.BlockUpdate(Pack.UInt16_To_LE((ushort) (nodeIndex & 0xffff)), 0, 2); //todo check endianness
            engine.digest.DoFinal(digest_arr, 0, 2 * engine.seedSizeBytes);
//        System.out.println("hash: " + Hex.toHexString(digest_arr));
        }

        private bool IsLeftChild(uint node)
        {
            return (node % 2 == 1);
        }

        private bool HasRightChild(uint node)
        {
            return (2 * node + 2 < this.numNodes && (Exists(node)));
        }

        private uint GetParent(uint node)
        {
            if (IsLeftChild(node))
            {
                return (node - 1) / 2;
            }

            return (node - 2) / 2;
        }

        private bool Exists(uint i)
        {
            if (i >= this.numNodes)
            {
                return false;
            }

            return this.exists[i] == 1;
        }

    }
}