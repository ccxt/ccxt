namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSParameters
    {
        private LMSigParameters lmSigParam;
        private LMOtsParameters lmOTSParam;

        public LMSParameters(LMSigParameters lmSigParam, LMOtsParameters lmOTSParam)
        {
            this.lmSigParam = lmSigParam;
            this.lmOTSParam = lmOTSParam;
        }

        public LMSigParameters GetLmSigParam()
        {
            return lmSigParam;
        }

        public LMOtsParameters GetLmotsParam()
        {
            return lmOTSParam;
        }
    }
}