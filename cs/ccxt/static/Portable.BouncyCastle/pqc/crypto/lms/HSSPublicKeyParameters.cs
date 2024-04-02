using System;
using System.IO;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class HSSPublicKeyParameters
        : LMSKeyParameters, ILMSContextBasedVerifier
    {
        private int l;
        private LMSPublicKeyParameters lmsPublicKey;

        public HSSPublicKeyParameters(int l, LMSPublicKeyParameters lmsPublicKey)
    	    :base(false)
        {

            this.l = l;
            this.lmsPublicKey = lmsPublicKey;
        }

        public static HSSPublicKeyParameters GetInstance(Object src)
        {
            if (src is HSSPublicKeyParameters)
            {
                return (HSSPublicKeyParameters)src;
            }
            else if (src is BinaryReader)
            {
                byte[] data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int L = BitConverter.ToInt32(data, 0);
                LMSPublicKeyParameters lmsPublicKey = LMSPublicKeyParameters.GetInstance(src);// todo check endianness
                return new HSSPublicKeyParameters(L, lmsPublicKey);
            }
            else if (src is byte[])
            {
                BinaryReader input = null;
                try // 1.5 / 1.6 compatibility
                {
                    input = new BinaryReader(new MemoryStream((byte[])src));
                    return GetInstance(input);
                }
                finally
                {
                    if (input != null) input.Close();
                }
            }
            else if (src is MemoryStream)
            {
                return GetInstance(Streams.ReadAll((Stream)src));
            }

            throw new ArgumentException($"cannot parse {src}");
        }

        public int GetL()
        {
            return l;
        }

        public LMSPublicKeyParameters GetLmsPublicKey()
        {
            return lmsPublicKey;
        }
        
        public override bool Equals(Object o)
        {
            if (this == o)
            {
                return true;
            }
            if (o == null || GetType() != o.GetType())
            {
                return false;
            }

            HSSPublicKeyParameters publicKey = (HSSPublicKeyParameters)o;

            if (l != publicKey.l)
            {
                return false;
            }
            return lmsPublicKey.Equals(publicKey.lmsPublicKey);
        }

        public override int GetHashCode()
        {
            int result = l;
            result = 31 * result + lmsPublicKey.GetHashCode();
            return result;
        }

        public override byte[] GetEncoded()
        {
            return Composer.Compose().U32Str(l)
                .Bytes(lmsPublicKey.GetEncoded())
                .Build();
        }

        public LMSContext GenerateLmsContext(byte[] sigEnc)
        {
            HSSSignature signature;
            try
            {
                signature = HSSSignature.GetInstance(sigEnc, GetL());
            }
            catch (IOException e)
            {
                throw new Exception($"cannot parse signature: {e.Message}");
            }

            LMSSignedPubKey[] signedPubKeys = signature.GetSignedPubKey();
            LMSPublicKeyParameters key = signedPubKeys[signedPubKeys.Length - 1].GetPublicKey();

            return key.GenerateOtsContext(signature.GetSignature()).WithSignedPublicKeys(signedPubKeys);
        }

        public bool Verify(LMSContext context)
        {
            bool failed = false;

            LMSSignedPubKey[] sigKeys = context.GetSignedPubKeys();

            if (sigKeys.Length != GetL() - 1)
            {
                return false;
            }

            LMSPublicKeyParameters key = GetLmsPublicKey();

            for (int i = 0; i < sigKeys.Length; i++)
            {
                LMSSignature sig = sigKeys[i].GetSignature();
                byte[] msg = sigKeys[i].GetPublicKey().ToByteArray();
                if (!LMS.VerifySignature(key, sig, msg))
                {
                    failed = true;
                }
                key = sigKeys[i].GetPublicKey();
            }

            return !failed & key.Verify(context);
        }
    }
}