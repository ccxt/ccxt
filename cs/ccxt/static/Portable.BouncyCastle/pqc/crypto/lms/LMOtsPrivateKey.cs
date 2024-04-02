using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

using static Org.BouncyCastle.Pqc.Crypto.Lms.LM_OTS;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMOtsPrivateKey
    {
        private LMOtsParameters parameter;
        private byte[] I;
        private int q;
        private byte[] masterSecret;

        public LMOtsPrivateKey(LMOtsParameters parameter, byte[] i, int q, byte[] masterSecret)
        {
            this.parameter = parameter;
            I = i;
            this.q = q;
            this.masterSecret = masterSecret;
        }

        public LMSContext GetSignatureContext(LMSigParameters sigParams, byte[][] path)
        {
            byte[] C = new byte[SEED_LEN];

            SeedDerive derive = GetDerivationFunction();
            derive.SetJ(SEED_RANDOMISER_INDEX); // This value from reference impl.
            derive.deriveSeed(C, false);

            IDigest ctx = DigestUtilities.GetDigest(parameter.GetDigestOid());

            LmsUtils.ByteArray(this.GetI(), ctx);
            LmsUtils.U32Str(this.GetQ(), ctx);
            LmsUtils.U16Str(D_MESG, ctx);
            LmsUtils.ByteArray(C, ctx);

            return new LMSContext(this, sigParams, ctx, C, path);
        }

        internal SeedDerive GetDerivationFunction()
        {
            SeedDerive derive = new SeedDerive(I, masterSecret, DigestUtilities.GetDigest(parameter.GetDigestOid()));
            derive.SetQ(q);
            return derive;
        }


        public LMOtsParameters GetParameter()
        {
            return parameter;
        }

        public byte[] GetI()
        {
            return I;
        }

        public int GetQ()
        {
            return q;
        }

        public byte[] GetMasterSecret()
        {
            return masterSecret;
        }
    }
}