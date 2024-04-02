using System;
using System.IO;

using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSSigner
        : IMessageSigner
    {
        private LMSPrivateKeyParameters privKey;
        private LMSPublicKeyParameters pubKey;

        public void Init(bool forSigning, ICipherParameters param)
        {
            if (forSigning)
            {
                privKey = (LMSPrivateKeyParameters)param;
            }
            else
            {
                pubKey = (LMSPublicKeyParameters)param;
            }
        }

        public byte[] GenerateSignature(byte[] message)
        {
            try
            {
                return LMS.GenerateSign(privKey, message).GetEncoded();
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
                return LMS.VerifySignature(pubKey, LMSSignature.GetInstance(signature), message);
            }
            catch (IOException e)
            {
                throw new Exception($"unable to decode signature: {e.Message}");
            }
        }
    }
}