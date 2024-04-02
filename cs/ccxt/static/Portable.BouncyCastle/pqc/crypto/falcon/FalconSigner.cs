using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    public class FalconSigner
        : IMessageSigner
    {
        private byte[] encodedkey;
        private FalconNIST nist;

        public void Init(bool forSigning, ICipherParameters param)
        {
            if (forSigning)
            {
                if (param is ParametersWithRandom)
                {
                    FalconPrivateKeyParameters skparam = ((FalconPrivateKeyParameters)((ParametersWithRandom)param).Parameters);
                    encodedkey = skparam.GetEncoded();
                    nist = new FalconNIST(
                        ((ParametersWithRandom)param).Random, 
                        skparam.Parameters.LogN,
                        skparam.Parameters.NonceLength);
                }
                else
                {
                    FalconPrivateKeyParameters skparam = (FalconPrivateKeyParameters)param;
                    encodedkey = ((FalconPrivateKeyParameters)param).GetEncoded();
                    nist = new FalconNIST(
                        new SecureRandom(),
                        // CryptoServicesRegistrar.GetSecureRandom(),
                        skparam.Parameters.LogN,
                        skparam.Parameters.NonceLength
                        ); 
                        // TODO when CryptoServicesRegistrar has been implemented, use that instead

                }
            }
            else
            {
                FalconPublicKeyParameters pkparam = (FalconPublicKeyParameters)param;
                encodedkey = pkparam.GetEncoded();
                nist = new FalconNIST(
                    new SecureRandom(),
                    // CryptoServicesRegistrar.GetSecureRandom()
                    pkparam.Parameters.LogN,
                    pkparam.Parameters.NonceLength);
            }
        }

        public byte[] GenerateSignature(byte[] message)
        {
            byte[] sm = new byte[nist.GetCryptoBytes()];

            return nist.crypto_sign(sm, message, 0, (uint)message.Length, encodedkey, 0);
        }

        public bool VerifySignature(byte[] message, byte[] signature)
        {
            if (signature[0] != (byte)(0x30 + nist.GetLogn()))
            {
                return false;
            }
            byte[] nonce = new byte[nist.GetNonceLength()];
            byte[] sig = new byte[signature.Length - nist.GetNonceLength() - 1];
            Array.Copy(signature, 1, nonce, 0, nist.GetNonceLength());
            Array.Copy(signature, nist.GetNonceLength() + 1, sig, 0, signature.Length - nist.GetNonceLength() - 1);
            bool res = nist.crypto_sign_open(sig,nonce,message,encodedkey,0) == 0;
            return res;
        }
    }
}
