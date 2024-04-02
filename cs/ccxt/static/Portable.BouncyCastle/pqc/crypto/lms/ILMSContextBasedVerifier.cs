namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public interface ILMSContextBasedVerifier
    {
        LMSContext GenerateLmsContext(byte[] signature);

        bool Verify(LMSContext context);
    }
}