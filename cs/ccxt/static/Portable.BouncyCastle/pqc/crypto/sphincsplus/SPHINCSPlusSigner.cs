using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{

    /**
     * SPHINCS+ signer.
     * <p>
     *     This version is based on the 3rd submission with deference to the updated reference
     *     implementation on github as at November 9th 2021. This version includes the changes
     *     for the countermeasure for the long-message second preimage attack - see
     *     "https://github.com/sphincs/sphincsplus/commit/61cd2695c6f984b4f4d6ed675378ed9a486cbede"
     *     for further details.
     * </p>
     */
    public class SPHINCSPlusSigner
        : IMessageSigner
    {
        private SPHINCSPlusPrivateKeyParameters privKey;
        private SPHINCSPlusPublicKeyParameters pubKey;

        private SecureRandom random;

        /**
         * Base constructor.
         */
        public SPHINCSPlusSigner()
        {
        }

        public void Init(bool forSigning, ICipherParameters param)
        {
            if (forSigning)
            {
                if (param is ParametersWithRandom)
                {
                    privKey = ((SPHINCSPlusPrivateKeyParameters)((ParametersWithRandom)param).Parameters);
                    this.random = ((ParametersWithRandom)param).Random;
                }
                else
                {
                    privKey = (SPHINCSPlusPrivateKeyParameters)param;
                }
            }
            else
            {
                pubKey = (SPHINCSPlusPublicKeyParameters)param;
            }
        }

        public byte[] GenerateSignature(byte[] message)
        {
            // # Input: Message M, private key SK = (SK.seed, SK.prf, PK.seed, PK.root)
            // # Output: SPHINCS+ signature SIG
            // init

            SPHINCSPlusEngine engine = privKey.GetParameters().GetEngine();
            engine.Init(privKey.GetPublicSeed());
            // generate randomizer
            byte[] optRand = new byte[engine.N];
            if (random != null)
            {
                random.NextBytes(optRand);
            }
            else
            {
                Array.Copy(privKey.pk.seed, 0, optRand, 0, optRand.Length);
            }

            Fors fors = new Fors(engine);
            byte[] R = engine.PRF_msg(privKey.sk.prf, optRand, message);
            // compute message digest and index
            IndexedDigest idxDigest = engine.H_msg(R, privKey.pk.seed, privKey.pk.root, message);
            byte[] mHash = idxDigest.digest;
            ulong idx_tree = idxDigest.idx_tree;
            uint idx_leaf = idxDigest.idx_leaf;
            // FORS sign
            Adrs adrs = new Adrs();
            adrs.SetType(Adrs.FORS_TREE);
            adrs.SetTreeAddress(idx_tree);
            adrs.SetKeyPairAddress(idx_leaf);
            SIG_FORS[] sig_fors = fors.Sign(mHash, privKey.sk.seed, privKey.pk.seed, adrs);
            // get FORS public key - spec shows M?
            adrs = new Adrs();
            adrs.SetType(Adrs.FORS_TREE);
            adrs.SetTreeAddress(idx_tree);
            adrs.SetKeyPairAddress(idx_leaf);

            byte[] PK_FORS = fors.PKFromSig(sig_fors, mHash, privKey.pk.seed, adrs);

            // sign FORS public key with HT
            Adrs treeAdrs = new Adrs();
            treeAdrs.SetType(Adrs.TREE);

            HT ht = new HT(engine, privKey.GetSeed(), privKey.GetPublicSeed());
            byte[] SIG_HT = ht.Sign(PK_FORS, idx_tree, idx_leaf);
            byte[][] sigComponents = new byte[sig_fors.Length + 2][];
            sigComponents[0] = R;

            for (int i = 0; i != sig_fors.Length; i++)
            {
                sigComponents[1 + i] = Arrays.Concatenate(sig_fors[i].sk, Arrays.ConcatenateAll(sig_fors[i].authPath));
            }

            sigComponents[sigComponents.Length - 1] = SIG_HT;

            return Arrays.ConcatenateAll(sigComponents);
        }

        public bool VerifySignature(byte[] message, byte[] signature)
        {
            //# Input: Message M, signature SIG, public key PK
            //# Output: bool

            // init
            SPHINCSPlusEngine engine = pubKey.GetParameters().GetEngine();
            engine.Init(pubKey.GetSeed());

            Adrs adrs = new Adrs();
            SIG sig = new SIG(engine.N, engine.K, engine.A, engine.D, engine.H_PRIME, engine.WOTS_LEN, signature);

            byte[] R = sig.R;
            SIG_FORS[] sig_fors = sig.SIG_FORS;
            SIG_XMSS[] SIG_HT = sig.SIG_HT;

            // compute message digest and index
            IndexedDigest idxDigest = engine.H_msg(R, pubKey.GetSeed(), pubKey.GetRoot(), message);
            byte[] mHash = idxDigest.digest;
            ulong idx_tree = idxDigest.idx_tree;
            uint idx_leaf = idxDigest.idx_leaf;

            // compute FORS public key
            adrs.SetType(Adrs.FORS_TREE);
            adrs.SetLayerAddress(0);
            adrs.SetTreeAddress(idx_tree);
            adrs.SetKeyPairAddress(idx_leaf);
            byte[] PK_FORS = new Fors(engine).PKFromSig(sig_fors, mHash, pubKey.GetSeed(), adrs);
            // verify HT signature
            adrs.SetType(Adrs.TREE);
            adrs.SetLayerAddress(0);
            adrs.SetTreeAddress(idx_tree);
            adrs.SetKeyPairAddress(idx_leaf);
            HT ht = new HT(engine, null, pubKey.GetSeed());
            return ht.Verify(PK_FORS, SIG_HT, pubKey.GetSeed(), idx_tree, idx_leaf, pubKey.GetRoot());
        }
    }
}