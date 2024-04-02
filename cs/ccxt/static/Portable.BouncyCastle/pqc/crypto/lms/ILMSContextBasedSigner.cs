namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public interface ILMSContextBasedSigner
    {
        LMSContext GenerateLmsContext();

        byte[] GenerateSignature(LMSContext context);

        long GetUsagesRemaining();
    }
}