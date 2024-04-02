namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    class IndexedDigest
    {
        internal ulong idx_tree;
        internal uint idx_leaf;
        internal byte[] digest;

        internal IndexedDigest(ulong idx_tree, uint idx_leaf, byte[] digest)
        {
            this.idx_tree = idx_tree;
            this.idx_leaf = idx_leaf;
            this.digest = digest;
        }
    }
}