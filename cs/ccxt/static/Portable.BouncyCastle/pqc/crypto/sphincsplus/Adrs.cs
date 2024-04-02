using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    internal class Adrs
    {
        public static uint WOTS_HASH = 0;
        public static uint WOTS_PK = 1;
        public static uint TREE = 2;
        public static uint FORS_TREE = 3;
        public static uint FORS_PK = 4;
        public static uint WOTS_PRF = 5;
        public static uint FORS_PRF = 6;

        internal static int OFFSET_LAYER = 0;
        internal static int OFFSET_TREE = 4;
        static int OFFSET_TREE_HGT = 24;
        static int OFFSET_TREE_INDEX = 28;
        internal static int OFFSET_TYPE = 16;
        static int OFFSET_KP_ADDR = 20;
        static int OFFSET_CHAIN_ADDR = 24;
        static int OFFSET_HASH_ADDR = 28;

        internal byte[] value = new byte[32];

        internal Adrs()
        {
        }

        internal Adrs(Adrs adrs)
        {
            Array.Copy(adrs.value, 0, this.value, 0, adrs.value.Length);
        }

        public void SetLayerAddress(uint layer)
        {
            Pack.UInt32_To_BE(layer, value, OFFSET_LAYER);
        }

        public uint GetLayerAddress()
        {
            return Pack.BE_To_UInt32(value, OFFSET_LAYER);
        }

        public void SetTreeAddress(ulong tree)
        {
            // tree address is 12 bytes
            Pack.UInt64_To_BE(tree, value, OFFSET_TREE + 4);
        }

        public ulong GetTreeAddress()
        {
            return Pack.BE_To_UInt64(value, OFFSET_TREE + 4);
        }

        public void SetTreeHeight(uint height)
        {
            Pack.UInt32_To_BE(height, value, OFFSET_TREE_HGT);
        }

        public uint GetTreeHeight()
        {
            return Pack.BE_To_UInt32(value, OFFSET_TREE_HGT);
        }

        public void SetTreeIndex(uint index)
        {
            Pack.UInt32_To_BE(index, value, OFFSET_TREE_INDEX);
        }

        public uint GetTreeIndex()
        {
            return Pack.BE_To_UInt32(value, OFFSET_TREE_INDEX);
        }

        // resets part of value to zero in line with 2.7.3
        public void SetType(uint type)
        {
            Pack.UInt32_To_BE(type, value, OFFSET_TYPE);

            Arrays.Fill(value, 20, value.Length, (byte) 0);
        }
        
        public void ChangeType(uint type)
        {
            Pack.UInt32_To_BE(type, value, OFFSET_TYPE);
        }

        public new uint GetType()
        {
            return Pack.BE_To_UInt32(value, OFFSET_TYPE);
        }

        public void SetKeyPairAddress(uint keyPairAddr)
        {
            Pack.UInt32_To_BE(keyPairAddr, value, OFFSET_KP_ADDR);
        }

        public uint GetKeyPairAddress()
        {
            return Pack.BE_To_UInt32(value, OFFSET_KP_ADDR);
        }

        public void SetHashAddress(uint hashAddr)
        {
            Pack.UInt32_To_BE(hashAddr, value, OFFSET_HASH_ADDR);
        }

        public void SetChainAddress(uint chainAddr)
        {
            Pack.UInt32_To_BE(chainAddr, value, OFFSET_CHAIN_ADDR);
        }
    }
}