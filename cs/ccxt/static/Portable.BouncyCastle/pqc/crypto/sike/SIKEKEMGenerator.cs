using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto.Utilities;
using Org.BouncyCastle.Security;
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
public class SIKEKEMGenerator
    : IEncapsulatedSecretGenerator
{
    // the source of randomness
    private SecureRandom sr;


    public SIKEKEMGenerator(SecureRandom random)
    {
        this.sr = random;
    }

    public ISecretWithEncapsulation GenerateEncapsulated(AsymmetricKeyParameter recipientKey)
    {
        SIKEPublicKeyParameters key = (SIKEPublicKeyParameters)recipientKey;
        SIKEEngine engine = key.GetParameters().GetEngine();

        return GenerateEncapsulated(recipientKey, engine.GetDefaultSessionKeySize());
    }

    public ISecretWithEncapsulation GenerateEncapsulated(AsymmetricKeyParameter recipientKey, uint sessionKeySizeInBits)
    {
            Console.Error.WriteLine("WARNING: the SIKE algorithm is only for research purposes, insecure");
        SIKEPublicKeyParameters key = (SIKEPublicKeyParameters)recipientKey;
        SIKEEngine engine = key.GetParameters().GetEngine();
        byte[] cipher_text = new byte[engine.GetCipherTextSize()];
        byte[] sessionKey = new byte[sessionKeySizeInBits / 8];
        engine.crypto_kem_enc(cipher_text, sessionKey, key.GetPublicKey(), sr);
        return new SecretWithEncapsulationImpl(sessionKey, cipher_text);
    }
}

}