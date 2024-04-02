using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    public class DilithiumSigner 
        : IMessageSigner
    {
        private DilithiumPrivateKeyParameters privKey;
        private DilithiumPublicKeyParameters pubKey;

        private SecureRandom random;

        public DilithiumSigner(SecureRandom random)
        {
            this.random = random;
        }

        public void Init(bool forSigning, ICipherParameters param)
        {
            if (forSigning)
            {
                if (param is ParametersWithRandom)
            {
                    privKey = (DilithiumPrivateKeyParameters)((ParametersWithRandom)param).Parameters;
                    random = ((ParametersWithRandom)param).Random;
                }
                else
                    {
                        privKey = (DilithiumPrivateKeyParameters)param;
                        random = new SecureRandom();
                    }
            }
            else
            {
                pubKey = (DilithiumPublicKeyParameters) param;
            }

        }

        public byte[] GenerateSignature(byte[] message)
        {
            DilithiumEngine engine = privKey.Parameters.GetEngine(random);
          
            return engine.Sign(engine, message, message.Length, privKey.GetEncoded());
         
        }

        public bool VerifySignature(byte[] message, byte[] signature)
        {
            DilithiumEngine engine = pubKey.Parameters.GetEngine(random);
            return engine.SignOpen(message, message.Length, signature, signature.Length, pubKey.GetEncoded());
        }
    }
}
