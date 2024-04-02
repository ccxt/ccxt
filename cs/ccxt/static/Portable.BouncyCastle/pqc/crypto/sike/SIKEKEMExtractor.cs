using Org.BouncyCastle.Crypto;
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
    public class SIKEKEMExtractor
        : IEncapsulatedSecretExtractor
    {
    private SIKEEngine engine;

    private SIKEKeyParameters key;

    public SIKEKEMExtractor(SIKEPrivateKeyParameters privParams)
    {
        this.key = privParams;
        InitCipher(key.GetParameters());
    }

    private void InitCipher(SIKEParameters param)
    {
        engine = param.GetEngine();
        SIKEPrivateKeyParameters privateParams = (SIKEPrivateKeyParameters)key;
        //todo: add compression check
    }

    public byte[] ExtractSecret(byte[] encapsulation)
    {
        return ExtractSecret(encapsulation, engine.GetDefaultSessionKeySize());
    }

    public byte[] ExtractSecret(byte[] encapsulation, uint sessionKeySizeInBits)
    {
            Console.Error.WriteLine("WARNING: the SIKE algorithm is only for research purposes, insecure");
        byte[] session_key = new byte[sessionKeySizeInBits / 8];
        engine.crypto_kem_dec(session_key, encapsulation, ((SIKEPrivateKeyParameters)key).GetPrivateKey());
        return session_key;
    }

        public int EncapsulationLength => (int)engine.GetCipherTextSize();

    }

}