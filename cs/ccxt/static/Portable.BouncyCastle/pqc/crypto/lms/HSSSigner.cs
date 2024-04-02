using System;
using System.IO;

using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class HSSSigner 
        : IMessageSigner
    {
        private HSSPrivateKeyParameters privKey;
        private HSSPublicKeyParameters pubKey;

        public void Init(bool forSigning, ICipherParameters param)
        {
            if (forSigning)
            {
                this.privKey = (HSSPrivateKeyParameters) param;
            }
            else
            {
                this.pubKey = (HSSPublicKeyParameters) param;
            }
        }

        public byte[] GenerateSignature(byte[] message)
        {
            try
            {
                return HSS.GenerateSignature(privKey, message).GetEncoded();
            }
            catch (IOException e)
            {
                throw new Exception($"unable to encode signature: {e.Message}");
            }
        }

        public bool VerifySignature(byte[] message, byte[] signature)
        {
            try
            {
                return HSS.VerifySignature(pubKey, HSSSignature.GetInstance(signature, pubKey.GetL()), message);
            }
            catch (IOException e)
            {
                throw new Exception($"unable to decode signature: {e.Message}");
            }
        }
    }
}
