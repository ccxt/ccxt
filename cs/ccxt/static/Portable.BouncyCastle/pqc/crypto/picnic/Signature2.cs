
namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class Signature2
    {
        internal byte[] salt;
        internal byte[] iSeedInfo; // Info required to recompute the tree of all initial seeds
        internal int iSeedInfoLen;
        internal byte[] cvInfo; // Info required to check commitments to views (reconstruct Merkle tree)
        internal int cvInfoLen;
        internal byte[] challengeHash;
        internal uint[] challengeC;
        internal uint[] challengeP;
        internal Proof2[] proofs; // One proof for each online execution the verifier checks

        //todo initialize in engine!
        public Signature2(PicnicEngine engine)
        {
            challengeHash = new byte[engine.digestSizeBytes];
            salt = new byte[PicnicEngine.saltSizeBytes];
            challengeC = new uint[engine.numOpenedRounds];
            challengeP = new uint[engine.numOpenedRounds];
            proofs = new Proof2[engine.numMPCRounds];
        }

        public class Proof2
        {
            internal byte[] seedInfo; // Information required to compute the tree with seeds of of all opened parties
            internal int seedInfoLen; // Length of seedInfo buffer
            internal byte[] aux; // Last party's correction bits; NULL if P[t] == N-1
            internal byte[] C; // Commitment to preprocessing step of unopened party
            internal byte[] input; // Masked input used in online execution
            internal byte[] msgs; // Broadcast messages of unopened party P[t]

            public Proof2(PicnicEngine engine)
            {
                seedInfo = null;
                seedInfoLen = 0;
                C = new byte[engine.digestSizeBytes];
                input = new byte[engine.stateSizeBytes];
                aux = new byte[engine.andSizeBytes];
                msgs = new byte[engine.andSizeBytes];

            }
        }
    }
}



