namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    class NodeEntry
    {
        internal byte[] nodeValue;
        internal uint nodeHeight;

        internal NodeEntry(byte[] nodeValue, uint nodeHeight)
        {
            this.nodeValue = nodeValue;
            this.nodeHeight = nodeHeight;
        }
    }
}